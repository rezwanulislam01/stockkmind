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

// AI Explain SKU / Action Endpoint
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { product, actionType, customContext } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "deterministic_engine",
        analysis: generateFallbackAnalysis(product, actionType),
      });
    }

    const prompt = `You are StockMind BD's Principal Inventory Intelligence Analyst for Bangladesh SMEs.
Analyze the following inventory item and situation:
Product: ${product?.name} (SKU: ${product?.sku}, Category: ${product?.category})
Current Stock: ${product?.currentStock} units
Safety Stock: ${product?.safetyStock} units
Average Daily Demand: ${product?.dailyDemand} units/day
Demand Trend: ${product?.demandTrend > 0 ? '+' : ''}${product?.demandTrend}%
Lead Time: ${product?.leadTimeDays} days
Days to Stockout: ${(product?.currentStock / Math.max(0.1, product?.dailyDemand)).toFixed(1)} days
Unit Price: ৳${product?.unitPrice} BDT
Cost Price: ৳${product?.costPrice} BDT
Risk Score: ${product?.riskScore}/100
Action context: ${actionType || "Risk & Reorder assessment"}
Additional notes: ${customContext || "None"}

Provide a crisp, executive-grade explainable AI diagnosis formatted in Bangladeshi Taka (৳ BDT):
1. Root Cause (Why this risk / status occurred in Bangladesh retail supply chain)
2. Quantitative Trade-off (Cost of stockout vs cost of holding in ৳ BDT)
3. Specific Recommended Action with timeline
4. Bangladesh Supplier/Distributor routing note (e.g. Dhaka, Narayanganj, Gazipur, Chattogram hubs)

Format as valid JSON with fields:
- summary: string (2 sentences max)
- rootCauses: array of strings (2-3 items)
- financialImpact: string
- recommendedAction: string
- supplierTip: string`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      source: "gemini-3.7-flash",
      analysis: parsed,
    });
  } catch (error: any) {
    console.error("AI Explain error:", error);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      analysis: generateFallbackAnalysis(req.body.product, req.body.actionType),
    });
  }
});

// Multi-Turn AI Chatbot Endpoint supporting Models & Roles
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      inventorySummary, 
      recentActions, 
      model = "gemini-3.7-flash",
      role = "inventory_strategist"
    } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "deterministic_engine",
        model: "offline_deterministic",
        reply: generateFallbackChatReply(message, inventorySummary),
      });
    }

    // Dynamic System Instruction based on Role
    let roleDescription = "Principal Inventory Intelligence Specialist for Bangladesh SMEs";
    if (role === "financial_controller") {
      roleDescription = "Chief Financial Controller specializing in working capital, dead-stock cash recovery, and holding cost minimization in ৳ BDT";
    } else if (role === "risk_logistics") {
      roleDescription = "Supply Chain Risk & Logistics Specialist focusing on transit delays, supplier lead times, and distributor routing across Dhaka, Gazipur, and Chattogram";
    }

    const systemInstruction = `You are StockMind BD's ${roleDescription}.
You advise SME business owners, wholesalers, and retail operators in Bangladesh.
All currency values MUST be in Bangladeshi Taka (৳ BDT).
Keep responses structured, highly actionable, concise, and professional using Markdown (headers, bullet points, bold key terms).

Current Real-Time Inventory Snapshot:
- Total SKUs: ${inventorySummary?.totalProducts || 18}
- Inventory Health Score: ${inventorySummary?.healthScore || 82}/100
- Total Inventory Asset Valuation: ৳${(inventorySummary?.totalValuation || 284000).toLocaleString()} BDT
- Dead Stock Capital Locked: ৳${(inventorySummary?.deadCapital || 38500).toLocaleString()} BDT
- Critical Stockout SKUs: ${inventorySummary?.criticalCount || 2}
- Attention Alerts: ${inventorySummary?.attentionCount || 3}
- High Risk Products: ${JSON.stringify(inventorySummary?.topRiskItems || [])}
- Approved Recent Actions: ${JSON.stringify(recentActions || [])}`;

    // Select valid model based on request
    let selectedModel = "gemini-3.7-flash";
    let isThinking = false;
    if (model === "gemini-3.1-pro-preview" || model === "pro") {
      selectedModel = "gemini-3.1-pro-preview";
      isThinking = true;
    } else if (model === "gemini-3.1-flash-lite" || model === "lite") {
      selectedModel = "gemini-3.1-flash-lite";
    } else if (model === "gemini-3.5-flash") {
      selectedModel = "gemini-3.5-flash";
    }

    // Build multi-turn contents array
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        if (msg.role === "user" || msg.sender === "user") {
          contents.push({ role: "user", parts: [{ text: msg.text || msg.content }] });
        } else if (msg.role === "model" || msg.role === "assistant" || msg.sender === "assistant") {
          contents.push({ role: "model", parts: [{ text: msg.text || msg.content }] });
        }
      }
    }
    // Add current user message
    contents.push({ role: "user", parts: [{ text: message }] });

    const config: any = {
      systemInstruction,
      temperature: 0.3,
    };

    if (isThinking && selectedModel === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    return res.json({
      success: true,
      source: `${selectedModel} (${role})`,
      model: selectedModel,
      reply: response.text || "I have analyzed your Bangladesh inventory state. All metrics evaluated.",
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      model: "fallback",
      reply: generateFallbackChatReply(req.body.message, req.body.inventorySummary),
    });
  }
});

function generateFallbackAnalysis(product: any, actionType?: string) {
  if (!product) {
    return {
      summary: "Inventory state evaluated. Maintain standard weekly audit cycle.",
      rootCauses: ["Standard operational baseline"],
      financialImpact: "Low immediate risk",
      recommendedAction: "Review weekly inventory dashboard.",
      supplierTip: "Maintain standard ordering schedules with local distributors.",
    };
  }

  const daysToStockout = (product.currentStock / Math.max(0.1, product.dailyDemand)).toFixed(1);
  const isDeadStock = product.daysWithoutSale >= 28 || product.dailyDemand === 0;

  if (isDeadStock) {
    const lockedCapital = (product.currentStock * product.unitPrice).toLocaleString();
    return {
      summary: `${product.name} has recorded zero sales for ${product.daysWithoutSale || 28} consecutive days, locking ৳${lockedCapital} BDT in idle working capital.`,
      rootCauses: [
        `Zero demand velocity over the last month with ${product.currentStock} units unmoving.`,
        "Holding cost accumulation exceeding 15% annual inventory carry rate in Bangladesh warehouse.",
      ],
      financialImpact: `৳${lockedCapital} BDT in locked liquidity with ongoing storage depreciation.`,
      recommendedAction: "Launch an immediate 20% clearance promotion or bundle with grocery staples.",
      supplierTip: "Pause future purchase orders until on-hand stock is reduced below 20 units.",
    };
  }

  if (product.riskScore >= 75) {
    return {
      summary: `Critical stockout imminent for ${product.name} in ~${daysToStockout} days, well within the ${product.leadTimeDays}-day supplier lead time.`,
      rootCauses: [
        `Current on-hand inventory (${product.currentStock} units) is below safety threshold (${product.safetyStock} units).`,
        `Demand velocity of ${product.dailyDemand} units/day will deplete stock before regular replenishment arrives.`,
        `Supplier transit from distributor is ${product.leadTimeDays} days, leaving zero buffer.`,
      ],
      financialImpact: `Estimated immediate stockout revenue loss of ৳${(product.dailyDemand * product.unitPrice * 5).toLocaleString()} BDT plus customer churn.`,
      recommendedAction: `Approve expedited Purchase Order for 80 units immediately to avoid stockout by day ${Math.floor(Number(daysToStockout))}.`,
      supplierTip: "Select the nearest Dhaka/Narayanganj distributor for 1-2 day expedited dispatch.",
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
    supplierTip: "Notify primary distributor of 20% increased monthly forecasted run-rate.",
  };
}

function generateFallbackChatReply(query: string, summary: any) {
  const q = (query || "").toLowerCase();
  if (q.includes("oil") || q.includes("radhuni") || q.includes("mustard")) {
    return `### 🚨 Urgent Assessment: Radhuni Pure Mustard Oil 1L
- **Status**: Critical Stockout Risk (Score: 88/100)
- **Stock on Hand**: 35 units (~4.4 days remaining at 8.0 units/day)
- **Supplier Lead Time**: 3 days (Square Consumer Products)
- **Recommendation**: Place an expedited Reorder of **75 units** immediately. Selecting the Tejgaon depot (1 day lead time) prevents weekend stock depletion.`;
  }
  if (q.includes("rice") || q.includes("miniket")) {
    return `### 📈 Trend Alert: Premium Miniket Rice 25kg
- **Status**: Demand Surge (+20% velocity)
- **Stock on Hand**: 45 bags (~9.0 days coverage)
- **Recommendation**: Increase dynamic safety stock buffer from 15 to 25 bags to absorb weekend household demand.`;
  }
  if (q.includes("dead stock") || q.includes("capital") || q.includes("shampoo")) {
    return `### 🟡 Dead Capital Alert: Luxury Shampoo / LED Bulb
- **Status**: 0 sales in past 30 days
- **Locked Capital**: ৳38,500 BDT across stagnant SKUs
- **Recommendation**: Trigger a 20% clearance discount or combo-bundle with FMCG essentials to unlock liquidity.`;
  }
  if (q.includes("health") || q.includes("score")) {
    return `### 📊 Inventory Health Snapshot (Bangladesh SME)
- **Overall Health Score**: **${summary?.healthScore || 82}/100**
- **Total SKUs**: ${summary?.totalProducts || 18} active
- **Total Valuation**: ৳${(summary?.totalValuation || 284000).toLocaleString()} BDT
- **Dead Capital**: ৳${(summary?.deadCapital || 38500).toLocaleString()} BDT (13.5% of portfolio)
- **Immediate Action Queue**: 2 Critical Stockouts, 3 Attention Alerts.`;
  }
  return `### 💡 StockMind BD Decision Intelligence
I have analyzed your inventory across ${summary?.totalProducts || 18} active SKUs in Bangladesh.
- **Top Priority**: Reorder **Radhuni Mustard Oil** (4.4 days of stock left vs 3 days lead time).
- **Secondary**: Adjust safety buffer for **Miniket Rice** due to +20% festive run-rate.
- **Capital Recovery**: Liquidate stagnant inventory (৳38,500 BDT total dead stock) through targeted wholesale/retail clearance.

You can ask me to evaluate supplier trade-offs, run scenario simulations, or generate custom purchase order terms!`;
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
