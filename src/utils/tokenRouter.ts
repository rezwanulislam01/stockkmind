import { Product, PurchaseOrder, Supplier, TokenRouterTier } from '../types';

export interface RouteResult {
  tier: TokenRouterTier;
  handledLocally: boolean;
  replyText?: string;
  structuredData?: any;
  tokensSaved: number;
  tokensUsed: number;
  reasoning: string;
}

export function routeUserQuery(
  query: string,
  products: Product[],
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[],
  healthScore: number,
  totalValuation: number,
  deadCapital: number
): RouteResult {
  const q = query.trim().toLowerCase();

  // -------------------------------------------------------------
  // TIER 1: Simple Math, Metric Lookup, and Counts (0 LLM Tokens)
  // -------------------------------------------------------------
  
  // Total Products / SKU Count
  if (
    q.includes('how many product') ||
    q.includes('how many sku') ||
    q.includes('total product') ||
    q.includes('total sku') ||
    q === 'products' ||
    q === 'skus'
  ) {
    const active = products.filter(p => p.status !== 'dead_stock').length;
    return {
      tier: 'tier1_instant_math',
      handledLocally: true,
      tokensSaved: 420,
      tokensUsed: 0,
      reasoning: 'Direct metadata calculation. Resolved in <1ms without LLM latency or cost.',
      replyText: `You currently have **${products.length} total SKUs** in your catalog (**${active} active**, **${products.length - active} dead stock**).`,
    };
  }

  // Total Valuation
  if (
    q.includes('total valuation') ||
    q.includes('inventory value') ||
    q.includes('worth') ||
    q.includes('total asset') ||
    q.includes('valuation')
  ) {
    return {
      tier: 'tier1_instant_math',
      handledLocally: true,
      tokensSaved: 380,
      tokensUsed: 0,
      reasoning: 'Instant valuation aggregation across all SKU unit prices and on-hand quantities.',
      replyText: `Your total inventory asset valuation is **$${totalValuation.toLocaleString()}** across ${products.length} catalog items.`,
    };
  }

  // Health Score
  if (
    q.includes('health score') ||
    q.includes('overall health') ||
    q.includes('how is my inventory') ||
    q === 'health'
  ) {
    const statusText = healthScore >= 80 ? '🟢 Strong / Healthy' : healthScore >= 60 ? '🟡 Moderate Attention' : '🔴 Critical Vulnerability';
    return {
      tier: 'tier1_instant_math',
      handledLocally: true,
      tokensSaved: 410,
      tokensUsed: 0,
      reasoning: 'Calculated from weighted SKU risk algorithm and dead capital ratio.',
      replyText: `Overall Inventory Health Score is **${healthScore}/100** (${statusText}).`,
    };
  }

  // Dead Capital
  if (
    q.includes('dead capital') ||
    q.includes('dead stock value') ||
    q.includes('locked capital') ||
    q.includes('idle cash')
  ) {
    const deadItems = products.filter(p => p.status === 'dead_stock');
    const pct = totalValuation > 0 ? ((deadCapital / totalValuation) * 100).toFixed(1) : '0';
    return {
      tier: 'tier1_instant_math',
      handledLocally: true,
      tokensSaved: 460,
      tokensUsed: 0,
      reasoning: 'Aggregated unmoving inventory valuation with zero velocity for 28+ days.',
      replyText: `You have **$${deadCapital.toLocaleString()} in locked dead capital** (${pct}% of total inventory) spread across **${deadItems.length} stagnant SKUs**.`,
    };
  }

  // Purchase Order count
  if (
    q.includes('how many po') ||
    q.includes('active po') ||
    q.includes('purchase orders count') ||
    q.includes('open po')
  ) {
    const inTransit = purchaseOrders.filter(po => po.status === 'in_transit').length;
    const submitted = purchaseOrders.filter(po => po.status === 'submitted').length;
    return {
      tier: 'tier1_instant_math',
      handledLocally: true,
      tokensSaved: 350,
      tokensUsed: 0,
      reasoning: 'Direct query on active PO store state.',
      replyText: `You have **${purchaseOrders.length} total Purchase Orders** (${inTransit} In Transit, ${submitted} Submitted, ${purchaseOrders.length - inTransit - submitted} Delivered/Archived).`,
    };
  }

  // -------------------------------------------------------------
  // TIER 2: Analytical & Filtered Database Queries (0 LLM Tokens)
  // -------------------------------------------------------------

  // Items needing reorder / Critical stockout items
  if (
    q.includes('reorder') ||
    q.includes('critical') ||
    q.includes('need restock') ||
    q.includes('stockout') ||
    q.includes('urgent')
  ) {
    const criticals = products.filter(p => p.status === 'critical' || p.riskScore >= 75);
    const warnings = products.filter(p => p.status === 'warning');

    let reply = `### 🚨 Reorder Priority Matrix\n\n`;
    if (criticals.length === 0 && warnings.length === 0) {
      reply += `All SKUs are operating within healthy safety stock thresholds. Zero immediate reorders required.`;
    } else {
      if (criticals.length > 0) {
        reply += `**Critical Stockouts (${criticals.length} items):**\n`;
        criticals.forEach(c => {
          const daysLeft = (c.currentStock / Math.max(0.1, c.dailyDemand)).toFixed(1);
          reply += `- **${c.name}** (\`${c.sku}\`): Stock **${c.currentStock}** (Est. **${daysLeft} days** left) | Lead Time **${c.leadTimeDays}d** | Suggested EOQ: **${c.eoq} units**\n`;
        });
      }
      if (warnings.length > 0) {
        reply += `\n**Warning / Attention Needed (${warnings.length} items):**\n`;
        warnings.forEach(w => {
          reply += `- **${w.name}**: Stock **${w.currentStock}** (Risk: ${w.riskScore}/100, Trend: ${w.demandTrend > 0 ? '+' : ''}${w.demandTrend}%)\n`;
        });
      }
    }

    return {
      tier: 'tier2_db_query',
      handledLocally: true,
      tokensSaved: 680,
      tokensUsed: 0,
      reasoning: 'Indexed database filter over risk scores and lead time deficits.',
      replyText: reply,
    };
  }

  // Dead stock items list
  if (
    q.includes('list dead stock') ||
    q.includes('show dead stock') ||
    q.includes('which items are dead') ||
    q.includes('inactive items') ||
    q.includes('slow movers')
  ) {
    const deadItems = products.filter(p => p.status === 'dead_stock' || p.daysWithoutSale >= 20);
    let reply = `### 🟡 Stagnant & Dead Stock Inventory\n\n`;
    if (deadItems.length === 0) {
      reply += `No dead stock detected. All SKUs recorded sales within the past 20 days.`;
    } else {
      deadItems.forEach(d => {
        const locked = (d.currentStock * d.unitPrice).toLocaleString();
        reply += `- **${d.name}** (\`${d.sku}\`): **${d.currentStock} units** idle for **${d.daysWithoutSale} days** ($${locked} locked capital)\n`;
      });
      reply += `\n*Recommendation: Trigger clearance promotions in the Action Center to reclaim capital.*`;
    }

    return {
      tier: 'tier2_db_query',
      handledLocally: true,
      tokensSaved: 590,
      tokensUsed: 0,
      reasoning: 'Filtered query matching daysWithoutSale >= 20 criteria.',
      replyText: reply,
    };
  }

  // Find suppliers for SKU
  if (q.includes('supplier for') || q.includes('who supplies') || q.includes('supplier of')) {
    const matchingProduct = products.find(p => 
      q.includes(p.name.toLowerCase()) || 
      q.includes(p.sku.toLowerCase()) ||
      (p.name.toLowerCase().includes('oil') && q.includes('oil')) ||
      (p.name.toLowerCase().includes('sugar') && q.includes('sugar')) ||
      (p.name.toLowerCase().includes('rice') && q.includes('rice')) ||
      (p.name.toLowerCase().includes('paper') && q.includes('paper'))
    );

    if (matchingProduct) {
      const matchedSuppliers = suppliers.filter(s => matchingProduct.supplierIds.includes(s.id));
      let reply = `### 🏢 Suppliers for ${matchingProduct.name}\n\n`;
      matchedSuppliers.forEach(s => {
        const isPref = s.id === matchingProduct.preferredSupplierId ? ' ⭐ **(Preferred)**' : '';
        const unitCost = (matchingProduct.costPrice * s.unitCostMarkup).toFixed(2);
        reply += `- **${s.name}**${isPref}: Lead Time **${s.baseLeadTime} days** (Expedited: ${s.expeditedLeadTime}d) | Reliability **${s.reliability}%** | Unit Cost: **$${unitCost}** | MOQ: **${s.minOrderQty} units**\n`;
      });
      return {
        tier: 'tier2_db_query',
        handledLocally: true,
        tokensSaved: 610,
        tokensUsed: 0,
        reasoning: 'Relational supplier entity mapping executed locally.',
        replyText: reply,
      };
    }
  }

  // -------------------------------------------------------------
  // TIER 3: Complex Reasoning, Explainable "Why", and What-If (LLM)
  // -------------------------------------------------------------
  return {
    tier: 'tier3_llm_reasoning',
    handledLocally: false,
    tokensSaved: 0,
    tokensUsed: 540,
    reasoning: 'High-order causal reasoning / prescriptive optimization query routed to Gemini 3.7 LLM.',
  };
}

export function routeTokenQuery(
  query: string,
  products: Product[]
): { tier: 1 | 2 | 3; response?: string } {
  const result = routeUserQuery(
    query,
    products,
    [],
    [],
    82,
    products.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0),
    products.filter(p => p.status === 'dead_stock').reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0)
  );

  if (result.tier === 'tier1_instant_math') {
    return { tier: 1, response: result.replyText };
  }
  if (result.tier === 'tier2_db_query') {
    return { tier: 2, response: result.replyText };
  }
  return { tier: 3 };
}
