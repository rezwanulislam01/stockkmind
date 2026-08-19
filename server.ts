import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Explain SKU / Action Endpoint using gemini-3.1-pro-preview with HIGH Thinking Mode
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { product, actionType, customContext } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // High-quality deterministic fallback if no API key is available
      return res.json({
        success: true,
        source: "deterministic_engine",
        analysis: generateFallbackAnalysis(product, actionType),
      });
    }

    const prompt = `You are StockMind's Principal Inventory Intelligence Analyst.
Analyze the following inventory item and situation:
Product: ${product?.name} (SKU: ${product?.sku}, Category: ${product?.category})
Current Stock: ${product?.currentStock} units
Safety Stock: ${product?.safetyStock} units
Average Daily Demand: ${product?.dailyDemand} units/day
Demand Trend: ${product?.demandTrend > 0 ? '+' : ''}${product?.demandTrend}%
Lead Time: ${product?.leadTimeDays} days
Days to Stockout: ${(product?.currentStock / Math.max(0.1, product?.dailyDemand)).toFixed(1)} days
Risk Score: ${product?.riskScore}/100
Action context: ${actionType || "Risk & Reorder assessment"}
Additional notes: ${customContext || "None"}

Provide a crisp, executive-grade explainable AI diagnosis with:
1. Root Cause (Why this risk / status occurred)
2. Quantitative Trade-off (Cost of stockout vs cost of holding)
3. Specific Recommended Action with timeline
4. Supplier strategy note

Format as clear, scannable JSON with fields:
- summary: string (2 sentences max)
- rootCauses: array of strings (2-3 items)
- financialImpact: string
- recommendedAction: string
- supplierTip: string`;

    // Using gemini-3.1-pro-preview with ThinkingLevel.HIGH
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      source: "gemini-3.1-pro-preview (High Thinking)",
      analysis: parsed,
    });
  } catch (error: any) {
    console.error("AI Explain error:", error);
    // Graceful fallback to deterministic analysis
    return res.json({
      success: true,
      source: "deterministic_fallback",
      analysis: generateFallbackAnalysis(req.body.product, req.body.actionType),
    });
  }
});

// AI Chat Endpoint with Context Injection & High Thinking Mode
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, inventorySummary, recentActions, useHighThinking = true } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "deterministic_engine",
        reply: generateFallbackChatReply(message, inventorySummary),
      });
    }

    const systemInstruction = `You are StockMind's AI Inventory Operations Manager and Decision Intelligence Specialist for SMEs.
You provide precise, data-driven, actionable recommendations.
Keep answers concise, structured, and practical. Use Markdown with bold key terms and bullet points.
Inventory Snapshot:
Total SKUs: ${inventorySummary?.totalProducts || 18}
Health Score: ${inventorySummary?.healthScore || 78}/100
Total Valuation: $${inventorySummary?.totalValuation || 42800}
Dead Capital: $${inventorySummary?.deadCapital || 6970}
Critical Stockout Items: ${inventorySummary?.criticalCount || 2}
Attention Items: ${inventorySummary?.attentionCount || 3}
Top Risk Items: ${JSON.stringify(inventorySummary?.topRiskItems || [])}
Recent Actions Taken: ${JSON.stringify(recentActions || [])}`;

    // Use gemini-3.1-pro-preview with ThinkingLevel.HIGH for deep reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: message,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      success: true,
      source: "gemini-3.1-pro-preview (High Thinking)",
      reply: response.text || "I have analyzed your inventory state. Everything looks operational.",
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      reply: generateFallbackChatReply(req.body.message, req.body.inventorySummary),
    });
  }
});

function generateFallbackAnalysis(product: any, actionType?: string) {
  if (!product) {
    return {
      summary: "Inventory state evaluated. Maintain regular cycle counting.",
      rootCauses: ["Standard operational baseline"],
      financialImpact: "Low immediate risk",
      recommendedAction: "Review weekly inventory dashboard.",
      supplierTip: "Maintain standard ordering schedules.",
    };
  }

  const daysToStockout = (product.currentStock / Math.max(0.1, product.dailyDemand)).toFixed(1);
  const isDeadStock = product.daysWithoutSale >= 28 || product.dailyDemand === 0;

  if (isDeadStock) {
    const lockedCapital = (product.currentStock * product.unitPrice).toLocaleString();
    return {
      summary: `${product.name} has recorded zero sales for ${product.daysWithoutSale || 28} consecutive days, locking $${lockedCapital} in idle working capital.`,
      rootCauses: [
        `Zero demand velocity over the last month with ${product.currentStock} units unmoving.`,
        "Holding cost accumulation exceeding 18% annual inventory carry rate.",
      ],
      financialImpact: `$${lockedCapital} in locked liquidity with ongoing warehouse storage depreciation.`,
      recommendedAction: "Launch an immediate 25% clearance promotion or bundle with high-velocity category complement.",
      supplierTip: "Pause future purchase orders until on-hand stock is reduced below 20 units.",
    };
  }

  if (product.riskScore >= 75) {
    return {
      summary: `Critical stockout imminent for ${product.name} in ~${daysToStockout} days, well within the ${product.leadTimeDays}-day supplier lead time.`,
      rootCauses: [
        `Current on-hand inventory (${product.currentStock} units) is below safety threshold (${product.safetyStock} units).`,
        `Demand velocity of ${product.dailyDemand} units/day will deplete stock before regular replenishment arrives.`,
        `Supplier lead time is ${product.leadTimeDays} days, leaving zero buffer.`,
      ],
      financialImpact: `Estimated immediate stockout revenue loss of $${(product.dailyDemand * product.unitPrice * 5).toFixed(0)} plus customer churn risk.`,
      recommendedAction: `Approve expedited Purchase Order for 80 units immediately to avoid stockout by day ${Math.floor(Number(daysToStockout))}.`,
      supplierTip: "Select the fastest reliable supplier with expedited 2-day transit option.",
    };
  }

  return {
    summary: `${product.name} demand has shifted by ${product.demandTrend > 0 ? '+' : ''}${product.demandTrend}%. Dynamic safety stock adjustment recommended.`,
    rootCauses: [
      `Upward demand acceleration (${product.demandTrend}%) outpaces previous baseline.`,
      `Buffer coverage ratio decreased to ${(product.currentStock / (product.safetyStock || 1)).toFixed(2)}x.`,
    ],
    financialImpact: "Moderate risk of temporary stockouts during peak ordering hours.",
    recommendedAction: `Increase dynamic safety stock from ${product.safetyStock} to ${Math.round(product.safetyStock * 1.35)} units.`,
    supplierTip: "Notify primary supplier of 20% increased monthly forecasted run-rate.",
  };
}

function generateFallbackChatReply(query: string, summary: any) {
  const q = (query || "").toLowerCase();
  if (q.includes("cooking oil") || q.includes("oil")) {
    return `### 🚨 Urgent Assessment: Cooking Oil
- **Status**: Critical Stockout Risk (Score: 88/100)
- **Stock on Hand**: 40 units (~4.7 days remaining at 8.5 units/day)
- **Supplier Lead Time**: 3 days
- **Recommendation**: Place an expedited Reorder of **80 units** right away. Choosing Supplier B (2 days lead time) prevents a 24-hour stockout gap.`;
  }
  if (q.includes("sugar")) {
    return `### 📈 Trend Alert: White Sugar
- **Status**: Demand Surge (+23% velocity)
- **Stock on Hand**: 85 units (~7.1 days coverage)
- **Recommendation**: Increase dynamic safety stock buffer from 30 to 45 units to absorb demand spikes.`;
  }
  if (q.includes("shampoo") || q.includes("dead stock")) {
    return `### 🟡 Dead Capital Alert: Luxury Shampoo
- **Status**: 0 sales in past 28 days
- **Locked Capital**: $2,160 (120 units at $18/unit)
- **Recommendation**: Trigger a 25% promotional discount or bundle with organic personal care items to recover cash flow.`;
  }
  if (q.includes("health") || q.includes("score")) {
    return `### 📊 Inventory Health Snapshot
- **Overall Health Score**: **${summary?.healthScore || 78}/100**
- **Total SKUs**: ${summary?.totalProducts || 18} active
- **Total Valuation**: $${(summary?.totalValuation || 42800).toLocaleString()}
- **Dead Capital**: $${(summary?.deadCapital || 6970).toLocaleString()} (16.2% of portfolio)
- **Immediate Action Queue**: 2 Critical Stockouts, 3 Attention Alerts.`;
  }
  return `### 💡 StockMind Decision Intelligence
I have analyzed your inventory across ${summary?.totalProducts || 18} active SKUs.
- **Top Priority**: Reorder **Cooking Oil** (4.7 days of stock left vs 3 days lead time).
- **Secondary**: Adjust safety buffer for **Sugar** due to a +23% demand surge.
- **Capital Recovery**: Liquidate **Luxury Shampoo** and **Ergonomic Mouse** ($4,880 total dead stock) through targeted clearance.

You can ask me to evaluate supplier trade-offs, run scenario simulations, or generate custom PO notes!`;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StockMind Server running on http://localhost:${PORT}`);
  });
}

startServer();
