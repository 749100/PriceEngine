import React, { useState, useEffect } from 'react';
import Parse from 'parse/dist/parse.min.js';

export default function PricingDashboard({ currentUser, onLogout }) {
  // ==========================================
  // 1. STATE CONFIGURATION
  // ==========================================
  const [businessType, setBusinessType] = useState('physical'); // physical, service, digital
  const [productName, setProductName] = useState('My Awesome Product');
  
  const [costs, setCosts] = useState({
    materials: 15.00,
    hoursSpent: 2,
    hourlyRate: 25.00,
    monthlyOverhead: 500,
    estimatedMonthlySales: 50,
    platformFeePercent: 5 // Applicable for digital products (e.g., Stripe/Gumroad)
  });

  // Macroeconomic Volatility Variables
  const [macroFactors, setMacroFactors] = useState({
    annualInflationPercent: 3.5,     // Baseline cost inflation offset
    supplyChainRisk: 'stable',       // stable, disrupted, severe
    tradeWarTariffPercent: 0         // Import/Export regulatory surcharges
  });
  
  const [targetMargin, setTargetMargin] = useState(35); // Target gross percentage margin (5-85)
  const [competitorPrice, setCompetitorPrice] = useState(65.00);

  // User's Secure Database Rows Storage Ledger
  const [savedProducts, setSavedProducts] = useState([]);

  // Automated Output Metric Engine Outputs
  const [metrics, setMetrics] = useState({
    baseCost: 0,
    suggestedPrice: 0,
    profitAmount: 0,
    monthlyProfitProjection: 0,
    marketPosition: 'Competitive'
  });

  // ==========================================
  // 2. PARSE DATA PERSISTENCE LAYER
  // ==========================================

  // Pull records securely tied to the current logged-in session token
  const fetchUserPortfolio = async () => {
    try {
      const activeUser = Parse.User.current();
      if (!activeUser) return;

      const query = new Parse.Query("Product");
      
      // Relational Ownership Scope Barrier
      query.equalTo("createdBy", activeUser);
      query.descending("createdAt"); // Always show the most recent configurations first
      
      const results = await query.find();
      setSavedProducts(results);
    } catch (error) {
      console.error("Failed to load user portfolio database mapping:", error);
    }
  };

  // Sync historical view rows upon dashboard mounting
  useEffect(() => {
    if (currentUser) {
      fetchUserPortfolio();
    }
  }, [currentUser]);

  // Core Document Serialization + Server-Overriding Lock Execution
  const handleSaveProduct = async () => {
    try {
      const activeUser = Parse.User.current();
      if (!activeUser) {
        alert('Authentication session missing. Please log back in.');
        return;
      }

      const Product = new Parse.Object("Product");

      // Set Metadata and Baseline Parameters
      Product.set("name", productName);
      Product.set("businessType", businessType);
      Product.set("overhead", costs.monthlyOverhead);
      Product.set("monthlySales", costs.estimatedMonthlySales);
      Product.set("targetMargin", targetMargin);
      
      // Set Macroeconomic Snapshots
      Product.set("inflationRateSnapshot", macroFactors.annualInflationPercent);
      Product.set("supplyChainRiskTier", macroFactors.supplyChainRisk);
      Product.set("appliedTariffPercent", macroFactors.tradeWarTariffPercent);
      
      // Set relational structural pointer
      Product.set("createdBy", activeUser);

      // 🔐 SERVER-OVERRIDING ACL ENFORCEMENT LOCKOUT
      // Disables fallback options and strictly locks item access to the owning user ID
      const productAcl = new Parse.ACL();
      productAcl.setPublicReadAccess(false);        // 🚫 Completely block general public reads
      productAcl.setPublicWriteAccess(false);       // 🚫 Completely block general public updates
      productAcl.setReadAccess(activeUser, true);    // ✅ Allow only this active user session to read
      productAcl.setWriteAccess(activeUser, true);   // ✅ Allow only this active user session to update
      Product.setACL(productAcl);

      // Class conditional sanitation mapping
      if (businessType === 'digital') {
        Product.set("materials", 0);
        Product.set("hoursSpent", 0);
        Product.set("hourlyRate", 0);
        Product.set("platformFeePercent", costs.platformFeePercent);
      } else {
        Product.set("materials", businessType === 'physical' ? costs.materials : 0);
        Product.set("hoursSpent", costs.hoursSpent);
        Product.set("hourlyRate", costs.hourlyRate);
        Product.set("platformFeePercent", 0);
      }

      await Product.save();
      alert('Pricing profile securely stored inside your cloud ledger container.');
      
      // Refresh local snapshot array database
      fetchUserPortfolio();
    } catch (error) {
      console.error('Error saving data to Back4App:', error);
      alert('Failed to execute save operations: ' + error.message);
    }
  };

  // Safe Record Erasure Method
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently erase this record from the cloud?")) return;
    
    try {
      const query = new Parse.Query("Product");
      const targetObj = await query.get(productId);
      await targetObj.destroy();
      
      // Refresh list update
      fetchUserPortfolio();
    } catch (error) {
      console.error("Deletion cycle failure:", error);
      alert("Failed to discard profile: " + error.message);
    }
  };

  // Reset inputs helper
  const handleClearGrid = () => {
    setProductName('');
    setCosts({
      materials: 0,
      hoursSpent: 0,
      hourlyRate: 0,
      monthlyOverhead: 0,
      estimatedMonthlySales: 1,
      platformFeePercent: 0
    });
    setMacroFactors({
      annualInflationPercent: 0,
      supplyChainRisk: 'stable',
      tradeWarTariffPercent: 0
    });
    setTargetMargin(20);
    setCompetitorPrice(0);
  };

  // Structured Corporate CSV Generator Output
  const handleExportCSV = () => {
    const csvRows = [
      ["Macro-Aware PriceEngine Pro - Executive Summary Report"],
      ["Generated On", new Date().toLocaleDateString()],
      [],
      ["1. Configuration Metadata"],
      ["Product Name", productName || "Untitled Product"],
      ["Business Asset Class", businessType.toUpperCase()],
      [],
      ["2. Cost Variables"],
      ["Material Cost ($)", businessType === 'digital' ? 0 : costs.materials],
      ["Labor Allocated (Hours)", businessType === 'digital' ? 0 : costs.hoursSpent],
      ["Hourly Surcharging Wage ($/hr)", businessType === 'digital' ? 0 : costs.hourlyRate],
      ["Corporate Monthly Overhead ($)", costs.monthlyOverhead],
      ["Target Profit Margin (%)", `${targetMargin}%`],
      ["Competitor Price Anchor ($)", competitorPrice],
      [],
      ["3. Macroeconomic Volatility Risk Parameters"],
      ["Annual Inflation Surge Rate (%)", `${macroFactors.annualInflationPercent}%`],
      ["Geopolitical Risk Matrix Tier", macroFactors.supplyChainRisk.toUpperCase()],
      ["Customs Import Tariff Surtax (%)", `${macroFactors.tradeWarTariffPercent}%`],
      [],
      ["4. Projections Output Summary"],
      ["Calculated Production Cost Floor ($)", metrics.baseCost.toFixed(2)],
      ["SUGGESTED RETAIL PRICE ($)", metrics.suggestedPrice.toFixed(2)],
      ["Net Cash Profit margin/Unit ($)", metrics.profitAmount.toFixed(2)],
      ["Projected Monthly Retention ($)", metrics.monthlyProfitProjection.toFixed(2)],
      ["Strategic Competitive Position", metrics.marketPosition]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    
    const sanitizedFilename = (productName || "pricing_matrix").toLowerCase().replace(/[^a-z0-9]/g, "_");
    downloadAnchor.setAttribute("download", `price_engine_report_${sanitizedFilename}.csv`);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleCostChange = (key, value) => {
    setCosts(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  // ==========================================
  // 3. CORE ANALYTICAL CALCULATION ENGINE
  // ==========================================
  useEffect(() => {
    // A. Apply Compound Inflation Factor to Materials Base
    const inflationMultiplier = 1 + (macroFactors.annualInflationPercent / 100);
    const materialTotal = businessType === 'digital' ? 0 : (costs.materials * inflationMultiplier);
    
    // B. Calculate Raw Labor Factor
    const laborTotal = businessType === 'digital' ? 0 : (costs.hoursSpent * costs.hourlyRate);
    
    // C. Amortize Overhead Across Estimated Sales Volumetric Capacity
    const allocatedOverhead = costs.monthlyOverhead / (costs.estimatedMonthlySales || 1);
    
    // Base Variable Microeconomic Floor Sum
    let calculatedBaseCost = materialTotal + laborTotal + allocatedOverhead;

    // D. Compute Geopolitical Supply Chain Risk Premiums
    let supplyChainMultiplier = 1.0;
    if (macroFactors.supplyChainRisk === 'disrupted') supplyChainMultiplier = 1.15; // 15% operations buffer
    if (macroFactors.supplyChainRisk === 'severe') supplyChainMultiplier = 1.30;    // 30% alternative route buffer
    
    calculatedBaseCost = calculatedBaseCost * supplyChainMultiplier;

    // E. Factor Regulatory Customs Import Tariff Surcharges
    const tariffMultiplier = 1 + (macroFactors.tradeWarTariffPercent / 100);
    calculatedBaseCost = calculatedBaseCost * tariffMultiplier;

    // F. Margin Markup Elasticity Calculations
    let calculatedPrice = 0;
    const marginDecimal = targetMargin / 100;

    if (businessType === 'physical') {
      calculatedPrice = calculatedBaseCost / (1 - marginDecimal);
    } else if (businessType === 'digital') {
      const feeDecimal = costs.platformFeePercent / 100;
      calculatedPrice = calculatedBaseCost / (1 - (marginDecimal + feeDecimal));
    } else if (businessType === 'service') {
      const baseWithBuffer = calculatedBaseCost * 1.20; // 20% protection against unpaid scope creep
      calculatedPrice = baseWithBuffer / (1 - marginDecimal);
    }

    if (isNaN(calculatedPrice) || !isFinite(calculatedPrice)) {
      calculatedPrice = calculatedBaseCost;
    }

    const profit = calculatedPrice - calculatedBaseCost;
    const monthlyProjection = profit * costs.estimatedMonthlySales;

    // Competitive Landscape Mapping Analysis
    let position = 'Competitive';
    const variance = ((calculatedPrice - competitorPrice) / competitorPrice) * 100;
    if (variance > 15) position = 'Premium / High-End';
    if (variance < -15) position = 'Budget / Low-Cost';

    setMetrics({
      baseCost: calculatedBaseCost,
      suggestedPrice: calculatedPrice,
      profitAmount: profit,
      monthlyProfitProjection: monthlyProjection,
      marketPosition: position
    });

  }, [businessType, costs, targetMargin, competitorPrice, macroFactors]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      
      {/* Upper Navigation and System Command Utility Strip */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PriceEngine Pro
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Universal Risk-Isolated Pricing Matrix Core</p>
        </div>
        
        <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
          <div className="text-right hidden sm:block">
            <span className="block text-xxs font-bold text-slate-500 uppercase tracking-wider">Secure Connection Established</span>
            <span className="text-xs text-emerald-400 font-medium">{currentUser?.get('username')}</span>
          </div>
          
          <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700 items-center">
            {['physical', 'service', 'digital'].map((type) => (
              <button
                key={type}
                onClick={() => setBusinessType(type)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  businessType === type 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {type}
              </button>
            ))}
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Grid Control Console Component */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT VARIABLES */}
        <section className="lg:col-span-5 bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">1. Variable Configuration</h2>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Product / Asset Identifier</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {businessType !== 'digital' && (
            <div className="grid grid-cols-2 gap-4">
              {businessType === 'physical' && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Material Cost ($ / unit)</label>
                  <input 
                    type="number" 
                    value={costs.materials} 
                    onChange={(e) => handleCostChange('materials', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Labor Time (Hours)</label>
                <input 
                  type="number" 
                  value={costs.hoursSpent} 
                  onChange={(e) => handleCostChange('hoursSpent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Hourly Wage ($/hr)</label>
                <input 
                  type="number" 
                  value={costs.hourlyRate} 
                  onChange={(e) => handleCostChange('hourlyRate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {businessType === 'digital' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Gateway / Checkout processing Fee (%)</label>
              <input 
                type="number" 
                value={costs.platformFeePercent} 
                onChange={(e) => handleCostChange('platformFeePercent', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Fixed Overhead ($)</label>
              <input 
                type="number" 
                value={costs.monthlyOverhead} 
                onChange={(e) => handleCostChange('monthlyOverhead', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Est. Monthly Sales Volume</label>
              <input 
                type="number" 
                value={costs.estimatedMonthlySales} 
                onChange={(e) => handleCostChange('estimatedMonthlySales', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* MACROENVIRONMENT LAYER */}
          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">2. Macroeconomic Environmental Risk Matrix</h3>
            
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Annualized Market Inflation Index</span>
                <span className="text-amber-400 font-mono font-bold">{macroFactors.annualInflationPercent}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="25" 
                step="0.5"
                value={macroFactors.annualInflationPercent} 
                onChange={(e) => setMacroFactors(prev => ({ ...prev, annualInflationPercent: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Logistics Corridor Surcharging Severity</label>
              <select
                value={macroFactors.supplyChainRisk}
                onChange={(e) => setMacroFactors(prev => ({ ...prev, supplyChainRisk: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="stable">Stable (Open Supply Trade Routing Lines)</option>
                <option value="disrupted">Disrupted Geopolitical Node (+15% Protection Layer)</option>
                <option value="severe">Severe Embargo / Blockade Threat (+30% Resource Realignment Premium)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Customs Tariffs / Trade War Surtax Burden (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={macroFactors.tradeWarTariffPercent} 
                onChange={(e) => setMacroFactors(prev => ({ ...prev, tradeWarTariffPercent: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <span>Target Net Profit Margin</span>
                <span className="text-emerald-400 font-bold text-sm">{targetMargin}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="85" 
                value={targetMargin} 
                onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Competitor Baseline Anchor Price ($)</label>
              <input 
                type="number" 
                value={competitorPrice} 
                onChange={(e) => setCompetitorPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* ANALYTICS OUTPUT DISPLAYS */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Optimized Target Retail Price: <span className="text-slate-200">{productName || 'Untitled'}</span>
            </span>
            <div className="text-5xl md:text-6xl font-black text-emerald-400 my-4 tracking-tight">
              ${metrics.suggestedPrice.toFixed(2)}
            </div>
            
            <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-4">
              {businessType === 'service' && "* Includes an advanced 20% security buffer to mitigate overhead and project scope creep liabilities dynamically."}
              {businessType === 'digital' && `* Calculates processing tolerances to ensure checkout gateway loops do not compress net profitability.`}
              {businessType === 'physical' && "* Computes compound microcost components against macro variable fluctuations."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Adjusted Cost Basis</span>
              <div className="text-2xl font-bold mt-1 text-slate-200">${metrics.baseCost.toFixed(2)}</div>
              <p className="text-xxs text-slate-500 mt-1">Sum of production costs, overhead distribution, and macroeconomic risk buffers.</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Profit Yield / Unit</span>
              <div className="text-2xl font-bold mt-1 text-cyan-400">${metrics.profitAmount.toFixed(2)}</div>
              <p className="text-xxs text-slate-500 mt-1">Retained cash liquidity per customer interaction.</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Projected Runrate Profitability</span>
              <div className="text-2xl font-bold mt-1 text-purple-400">${metrics.monthlyProfitProjection.toFixed(2)}</div>
              <p className="text-xxs text-slate-500 mt-1">Calculated monthly earnings projection matching the volume index parameters.</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Positioning Index</span>
              <div className={`text-xl font-black mt-1 ${
                metrics.marketPosition.includes('Premium') ? 'text-amber-400' : 
                metrics.marketPosition.includes('Budget') ? 'text-cyan-400' : 'text-emerald-400'
              }`}>
                {metrics.marketPosition}
              </div>
              <p className="text-xxs text-slate-500 mt-1">Competitive profile index relative to baseline anchor fields.</p>
            </div>
          </div>

          {/* LIVE PORTFOLIO SUITE LEDGER */}
          <div className="bg-slate-800/20 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Active Pricing Portfolios</h3>
                <p className="text-xxs text-slate-500 mt-0.5">Isolated records securely synced from your database account</p>
              </div>
              <span className="bg-slate-800 text-emerald-400 font-mono text-xs px-2.5 py-1 rounded-md font-bold border border-slate-700/50">
                {savedProducts.length} Saved Profiles
              </span>
            </div>

            {savedProducts.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No active records. Populate configuration variables and save to construct your portfolio array ledger.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40 divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                {savedProducts.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center p-3.5 hover:bg-slate-800/30 transition-colors gap-4">
                    <div className="truncate">
                      <span className="font-semibold text-slate-200 text-sm block truncate">{prod.get('name')}</span>
                      <div className="flex gap-2 items-center text-xxs font-mono text-slate-500 mt-0.5">
                        <span className="uppercase text-emerald-500 font-bold tracking-wider">{prod.get('businessType')}</span>
                        <span>•</span>
                        <span>Margin target: {prod.get('targetMargin')}%</span>
                        <span>•</span>
                        <span>Inflation base: {prod.get('inflationRateSnapshot')}%</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xxs uppercase tracking-wider font-bold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all shrink-0"
                    >
                      Delete Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={handleClearGrid}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-700"
            >
              Clear Workspace
            </button>

            <button 
              onClick={handleExportCSV}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 font-bold rounded-xl text-sm transition-colors border border-slate-700/80 text-slate-300 flex items-center justify-center gap-2"
            >
              <span>📊</span> Export Sheet Data
            </button>

            <button 
              onClick={handleSaveProduct}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold rounded-xl text-sm hover:opacity-90 shadow-lg shadow-emerald-500/10 transition-opacity"
            >
              Save Dynamic Pricing Array
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}