import React, { useState, useEffect } from 'react';
import Parse from 'parse/dist/parse.min.js';

export default function PricingDashboard() {
  // 1. Unified Application State
  const [businessType, setBusinessType] = useState('physical'); // physical, service, digital
  const [productName, setProductName] = useState('My Awesome Product');
  
  const [costs, setCosts] = useState({
    materials: 15.00,
    hoursSpent: 2,
    hourlyRate: 25.00,
    monthlyOverhead: 500,
    estimatedMonthlySales: 50,
    platformFeePercent: 5 // Default for digital products (Stripe/Gumroad)
  });
  
  const [targetMargin, setTargetMargin] = useState(35); // Percentage (0-99)
  const [competitorPrice, setCompetitorPrice] = useState(65.00);

  // 2. Calculated Metrics State
  const [metrics, setMetrics] = useState({
    baseCost: 0,
    suggestedPrice: 0,
    profitAmount: 0,
    monthlyProfitProjection: 0,
    marketPosition: 'Competitive'
  });

  // Database Core Save Action
  const handleSaveProduct = async () => {
    try {
      const Product = new Parse.Object("Product");

      // Set clean fields depending on business type architecture
      Product.set("name", productName);
      Product.set("businessType", businessType);
      Product.set("overhead", costs.monthlyOverhead);
      Product.set("monthlySales", costs.estimatedMonthlySales);
      Product.set("targetMargin", targetMargin);

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
      alert('Product details successfully saved to Back4App cloud database!');
    } catch (error) {
      console.error('Error saving data to Back4App:', error);
      alert('Failed to save product details: ' + error.message);
    }
  };

  // Handle nested cost input changes safely
  const handleCostChange = (key, value) => {
    setCosts(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  // 3. Core Pricing Engine Logic
  useEffect(() => {
    // Calculate Base Cost
    const materialTotal = businessType === 'digital' ? 0 : costs.materials;
    const laborTotal = businessType === 'digital' ? 0 : (costs.hoursSpent * costs.hourlyRate);
    const allocatedOverhead = costs.monthlyOverhead / (costs.estimatedMonthlySales || 1);
    
    const calculatedBaseCost = materialTotal + laborTotal + allocatedOverhead;

    // Calculate Suggested Price based on Business Type
    let calculatedPrice = 0;
    const marginDecimal = targetMargin / 100;

    if (businessType === 'physical') {
      calculatedPrice = calculatedBaseCost / (1 - marginDecimal);
    } else if (businessType === 'digital') {
      const feeDecimal = costs.platformFeePercent / 100;
      calculatedPrice = calculatedBaseCost / (1 - (marginDecimal + feeDecimal));
    } else if (businessType === 'service') {
      const baseWithBuffer = calculatedBaseCost * 1.20;
      calculatedPrice = baseWithBuffer / (1 - marginDecimal);
    }

    if (isNaN(calculatedPrice) || !isFinite(calculatedPrice)) {
      calculatedPrice = calculatedBaseCost;
    }

    const profit = calculatedPrice - calculatedBaseCost;
    const monthlyProjection = profit * costs.estimatedMonthlySales;

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

  }, [businessType, costs, targetMargin, competitorPrice]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PriceEngine Pro
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Universal Pricing Strategy Command Center</p>
        </div>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['physical', 'service', 'digital'].map((type) => (
            <button
              key={type}
              onClick={() => setBusinessType(type)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                businessType === type 
                  ? 'bg-emerald-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {type} Product
            </button>
          ))}
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input Configuration */}
        <section className="lg:col-span-5 bg-slate-800/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">1. Variable Configuration</h2>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Product / Project Name</label>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Platform Checkout Fee (%)</label>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Overhead ($)</label>
              <input 
                type="number" 
                value={costs.monthlyOverhead} 
                onChange={(e) => handleCostChange('monthlyOverhead', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Est. Monthly Sales</label>
              <input 
                type="number" 
                value={costs.estimatedMonthlySales} 
                onChange={(e) => handleCostChange('estimatedMonthlySales', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <span>Target Profit Margin</span>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Competitor Benchmark Price ($)</label>
              <input 
                type="number" 
                value={competitorPrice} 
                onChange={(e) => setCompetitorPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Calculations & Metrics */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-9xl font-black">$$</span>
            </div>
            
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Suggested Retail Price for: <span className="text-slate-200">{productName || 'Untitled'}</span>
            </span>
            <div className="text-5xl md:text-6xl font-black text-emerald-400 my-4 tracking-tight">
              ${metrics.suggestedPrice.toFixed(2)}
            </div>
            
            <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-4">
              {businessType === 'service' && "* Includes a standard 20% project safety net buffer to protect against unpaid scope creep."}
              {businessType === 'digital' && `* Dynamically protects against your specified ${costs.platformFeePercent}% checkout processing fees.`}
              {businessType === 'physical' && "* Calculates baseline Cost-Plus matching exact target corporate metrics."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Production Base Cost</span>
              <div className="text-2xl font-bold mt-1 text-slate-200">${metrics.baseCost.toFixed(2)}</div>
              <p className="text-xxs text-slate-500 mt-1">Total materials + labor + allocated overhead weight.</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Profit / Sale</span>
              <div className="text-2xl font-bold mt-1 text-cyan-400">${metrics.profitAmount.toFixed(2)}</div>
              <p className="text-xxs text-slate-500 mt-1">Pure cash retention value per customer transaction.</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Projected Monthly Profits</span>
              <div className="text-2xl font-bold mt-1 text-purple-400">${metrics.monthlyProfitProjection.toFixed(2)}</div>
              <p className="text-xxs text-slate-500 mt-1">Estimated monthly revenue minus operational costs.</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Strategy Positioning</span>
              <div className={`text-xl font-black mt-1 ${
                metrics.marketPosition.includes('Premium') ? 'text-amber-400' : 
                metrics.marketPosition.includes('Budget') ? 'text-cyan-400' : 'text-emerald-400'
              }`}>
                {metrics.marketPosition}
              </div>
              <p className="text-xxs text-slate-500 mt-1">Calculated evaluation matching competitor variables.</p>
            </div>
          </div>

          {targetMargin < 20 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 items-center">
              <div className="text-amber-500 text-xl font-bold font-mono">⚠️</div>
              <div>
                <h4 className="text-sm font-bold text-amber-400">Sub-Optimal Margin Risk Detected</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Operating below a 20% target profit margin exposes small business infrastructure to high risk if raw material prices experience inflation shifts.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-700">
              Clear Grid
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