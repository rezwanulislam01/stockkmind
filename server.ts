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

    const explainModels = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
    let response: any = null;
    let successfulModel = "gemini-3.7-flash";

    for (const m of explainModels) {
      try {
        response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
        successfulModel = m;
        break;
      } catch (apiErr: any) {
        console.warn(`Explain model ${m} failed (likely 503), trying fallback...`, apiErr?.message || apiErr);
        continue;
      }
    }

    if (!response) {
      throw new Error("All Gemini models experiencing high demand (503). Using deterministic fallback.");
    }

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      source: successfulModel,
      analysis: parsed,
    });
  } catch (error: any) {
    console.error("AI Explain handled fallback due to high demand (503):", error?.message || error);
    return res.json({
      success: true,
      source: "deterministic_fallback (High Demand 503 Handled)",
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
    let roleDescription = "Industrial Inventory & Agro-Manufacturing Executive Intelligence Copilot for Rezwan Industrial Zone (SSR Group of Industry)";
    if (role === "financial_controller") {
      roleDescription = "Chief Financial Controller specializing in raw materials valuation, dead-stock cash recovery, and holding cost minimization in ৳ BDT across industrial silos";
    } else if (role === "risk_logistics") {
      roleDescription = "Supply Chain Risk & Port Logistics Director focusing on tanker vessel discharge, rail wagons, and industrial terminal routing across Chattogram Port, Narayanganj, Gazipur, Ishwardi, Dinajpur, and Rajshahi";
    }

    const systemInstruction = `You are StockMind BD's ${roleDescription}.
You advise plant managers, silo operators, procurement directors, and C-level industrial executives.
All currency values MUST be in Bangladeshi Taka (৳ BDT).
The industrial ecosystem includes:
1. **Rezwan Industrial Zone & Silo Network (Rajshahi / Godagari / Paba)**: Flour Mill Silo #01 (Imported Milling Wheat 420 MT, 3.5 days buffer), Grain Silo #03 (Yellow Feed Maize 860 MT), Amino Acid vaults, 50kg PP Sacks depot, Old Jute Sacks yard.
2. **Chattogram Port Industrial Belt & Patenga Tank Terminal**: Shore Tank Terminal #02 (Crude Degummed Soybean Oil CDSO 280 MT, 3.2 days buffer - Critical), Shore Tank #04 (Crude Palm Oil CPO 540 MT), Chemical Vault (Bleaching Earth 18 MT, Caustic Soda 45 MT). Marine lead time: 5-7 days.
3. **Ishwardi & Bogura Feed & Agro Complex**: Bulk Storage Bay B (Soybean Meal SBM 48% CP 1,450 MT - Healthy), Bogura Plant (Marine Fish Meal 62% CP 260 MT, 18 MT/day).
4. **Dinajpur & Rangpur Auto Rice Mill Silo Complex**: Ventilated Silo Complex (Northern Premium Paddy Miniket/Katari 2,100 MT, 110 MT/day auto parboiling).
5. **Narayanganj & Meghna Industrial Belt**: Chemical reagents, caustic soda flakes, packaging supplies.
6. **Gazipur & Manikganj Industrial Park**: Woven polypropylene bags, feed additives.

When answering inquiries about ANY industrial zone or area, provide:
- Operational status and plant runway in days
- Key raw materials and critical silo levels
- Stoppage risk and supplier transport lead time
- Specific actionable advice in clear, crisp language that is easy to speak and read.
Support both English and Bengali (বাংলা) fluently.

Current Real-Time Inventory Snapshot:
- Total SKUs: ${inventorySummary?.totalProducts || 12}
- Inventory Health Score: ${inventorySummary?.healthScore || 49}/100
- Total Silo Asset Valuation: ৳${(inventorySummary?.totalValuation || 398200000).toLocaleString()} BDT
- Dead Capital Trapped: ৳${(inventorySummary?.deadCapital || 4875000).toLocaleString()} BDT (65,000 obsolete jute bags in Godagari)
- Critical Silo Stockouts: ${inventorySummary?.criticalCount || 3} (Wheat Silo #01, CDSO Tank #02, Bleaching Earth)
- Attention Silo Alerts: ${inventorySummary?.attentionCount || 4}
- High Risk Raw Materials: ${JSON.stringify(inventorySummary?.topRiskItems || [])}
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

    // Try primary model with fallback models if 503 unavailable
    const modelsToTry = [selectedModel, "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
    let response: any = null;
    let successfulModel = selectedModel;

    for (const m of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: m,
          contents,
          config,
        });
        successfulModel = m;
        break;
      } catch (apiErr: any) {
        console.warn(`Model ${m} failed (likely 503/high demand), trying fallback...`, apiErr?.message || apiErr);
        continue;
      }
    }

    if (!response) {
      throw new Error("All Gemini models currently experiencing high demand (503). Using fallback engine.");
    }

    return res.json({
      success: true,
      source: `${successfulModel} (${role})`,
      model: successfulModel,
      reply: response.text || "I have analyzed your Bangladesh inventory state. All metrics evaluated.",
    });
  } catch (error: any) {
    console.error("AI Chat handled fallback due to high demand (503):", error?.message || error);
    return res.json({
      success: true,
      source: "deterministic_fallback (High Demand 503 Handled)",
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

  // Chattogram Port Silo Zone & Patenga Terminal
  if (q.includes("chattogram") || q.includes("chittagong") || q.includes("port") || q.includes("patenga") || q.includes("চট্টগ্রাম") || q.includes("পোর্ট")) {
    return `### 🚢 Chattogram Port Industrial Belt & Patenga Terminal Status
- **Operational Status**: 🚨 High Plant Stoppage Risk (CDSO & Bleaching Earth Depletion)
- **Crude Degummed Soybean Oil (CDSO)**: Tank #02 has only **280 MT** on-hand (3.2 days buffer remaining vs 6 days vessel transit lead time).
- **Bleaching Earth Reagent**: Chemical Vault #01 has **18 MT** remaining (5.1 days runway).
- **Crude Palm Oil (CPO)**: Shore Tank #04 is healthy with **540 MT** (9.0 days runway).
- **Action Required**: Authorize urgent vessel berth allocation from Louis Dreyfus & Bunge at Outer Anchorage to avert edible oil refinery shutdown.`;
  }

  // Rezwan Industrial Zone & Silo Complex (Rajshahi / Godagari / Paba)
  if (q.includes("rezwan") || q.includes("rajshahi") || q.includes("godagari") || q.includes("paba") || q.includes("রেজওয়ান") || q.includes("রাজশাহী") || q.includes("গো দাগাড়ী")) {
    return `### 🏭 Rezwan Industrial Zone & Silo Network Status (Rajshahi Hub)
- **Operational Status**: ⚠️ Critical Flour Mill Silo & Stable Maize Feed Compounding
- **Imported Milling Wheat (Russian Grade-1)**: Silo #01 has **420 MT** remaining. At 120 MT/day consumption, the plant runway is only **3.5 days** (Risk Score: 94/100).
- **Yellow Feed Maize**: Grain Silo #03 has **860 MT** on-hand (9.1 days buffer) with +28% feed demand surge.
- **Packaging Depot**: 185,000 woven PP bags in stock (Healthy 15.4 days).
- **Dead Capital**: ৳48.75 Lakhs locked in 65,000 obsolete jute bags in Godagari Yard #05.
- **Action Required**: Expedite 1,200 MT bulk wheat allocation from Chattogram Silo via rail wagon.`;
  }

  // Ishwardi & Bogura Feed Mill Complex
  if (q.includes("ishwardi") || q.includes("bogura") || q.includes("bogra") || q.includes("feed") || q.includes("ঈশ্বরদী") || q.includes("বগুড়া") || q.includes("ফিড")) {
    return `### 🌾 Ishwardi & Bogura Feed Mill Complex Status
- **Operational Status**: ✅ Healthy Soybean Meal with Moderate Fish Meal Lead-Time Risk
- **High-Protein Soybean Meal (SBM 48% CP)**: Bulk Storage Bay B holds **1,450 MT** (Healthy 20.7 days buffer).
- **Marine Fish Meal (62% Protein)**: Bogura Plant has **260 MT** remaining (14.4 days buffer, 18 MT/day velocity).
- **DL-Methionine Amino Acid**: Climate Vault holds **35 MT** (19.4 days coverage, 7 days cold-chain lead time).
- **Action Required**: Pre-book next month's marine fish meal batch from Cox's Bazar cooperatives to protect against monsoon transit bottlenecks.`;
  }

  // Dinajpur & Rangpur Auto Rice Mill Complex
  if (q.includes("dinajpur") || q.includes("rangpur") || q.includes("rice") || q.includes("paddy") || q.includes("দিনাজপুর") || q.includes("রংপুর") || q.includes("চাল") || q.includes("ধান")) {
    return `### 🌾 Dinajpur & Rangpur Auto Rice Mill Silo Complex
- **Operational Status**: 🟢 Optimal Healthy Runway (2,100 MT Paddy Reserve)
- **Northern Premium Paddy (Miniket & Katari)**: Ventilated Silo Complex contains **2,100 MT** on-hand.
- **Factory Run-Rate**: 110 MT/day auto parboiling & milling velocity (19.1 days unbroken runway).
- **Procurement Lead Time**: 3 days from local farmer mandis in Godagari and Paba.
- **Action Required**: Maintain existing 150 MT weekly purchase cadence; no immediate stockout risk.`;
  }

  // Narayanganj & Meghna Industrial Belt / Dhaka
  if (q.includes("narayanganj") || q.includes("meghna") || q.includes("dhaka") || q.includes("নারায়ণগঞ্জ") || q.includes("মেঘনা") || q.includes("ঢাকা")) {
    return `### 🧪 Narayanganj & Meghna Industrial Belt Status
- **Operational Status**: 🔵 Chemical & Packaging Replenishment Corridor
- **Caustic Soda Flakes (NaOH 99%)**: 45 MT in stock (20.5 days buffer from Meghna Petrochemicals).
- **Packaging Logistics**: Akij & Meghna Poly Sacks supply line operates on 3-day standard lead time.
- **Transit Note**: River barges via Shitalakshya and Meghna waterways operating at normal water draft.
- **Action Required**: Re-confirm chemical dosage schedule for Chattogram refinery neutralizer.`;
  }

  // Wheat or Grain specific
  if (q.includes("wheat") || q.includes("flour") || q.includes("গম") || q.includes("আটা")) {
    return `### 🚨 Urgent Silo Alert: Imported Milling Wheat (Russian Grade-1)
- **Current Silo Stock**: 420 MT (Silo #01, Rezwan Industrial Zone)
- **Daily Factory Consumption**: 120 MT/day (Only 3.5 days runway left!)
- **Risk Score**: 94/100 (Urgent Stoppage Threat)
- **Supplier**: Bunge & Cargill Global Agri (Chattogram Silo)
- **Recommendation**: Expedite rail allocation of **1,200 MT** immediately to protect ৳24.5 Lakhs in daily milling downtime losses.`;
  }

  // Stoppage / Risk / Health query
  if (q.includes("risk") || q.includes("stoppage") || q.includes("loss") || q.includes("ঝুঁকি") || q.includes("ক্ষতি")) {
    return `### 🛡️ Rezwan Industrial Zone Risk & Plant Stoppage Audit
- **Critical Silos at Immediate Risk**: 3 Silos (Russian Wheat 3.5 days, CDSO Oil 3.2 days, Bleaching Earth 5.1 days).
- **Estimated Daily Downtime Loss if Unaddressed**: ৳1.49 Crore BDT across flour and oil refining lines.
- **Avoided Loss via On-Time Reordering**: ৳2.16 Crore BDT protected milling and refining margins.
- **Silo Health Score**: 49/100 (Up +4.2% over past 7-day run).`;
  }

  // General fallback
  return `### 🏭 Rezwan Industrial Zone & Silo Decision Intelligence
I am monitoring **12 industrial raw material feedstocks** across Bangladesh:
- **Rezwan Industrial Zone (Rajshahi)**: Russian Wheat (420 MT - 🚨 Critical 3.5 days), Feed Maize (860 MT - Warning).
- **Chattogram Port Belt**: CDSO Crude Soybean Oil (280 MT - 🚨 Critical 3.2 days), Bleaching Earth (18 MT - Critical).
- **Ishwardi & Bogura Hub**: Soybean Meal SBM (1,450 MT - 🟢 Healthy), Fish Meal (260 MT).
- **Dinajpur Auto Rice Mill**: Premium Paddy (2,100 MT - 🟢 Healthy 19.1 days).
- **Dead Capital**: ৳48.75 Lakhs locked in 65,000 obsolete jute sacks in Godagari yard.

You can ask me by voice about any industrial area, silo level, or supplier transit lead time!`;
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
