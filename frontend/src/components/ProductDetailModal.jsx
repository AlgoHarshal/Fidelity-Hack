import { X, TrendingUp, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useTracking } from "../context/TrackingContext"

const generateMockData = (returnRate) => {
  const base = 10000;
  const rate = parseFloat(returnRate) || 8;
  const data = [];
  let current = base;
  for (let i = 2019; i <= 2024; i++) {
    data.push({ year: i.toString(), value: Math.round(current) });
    current += current * (rate / 100) + (Math.random() * 500 - 250);
  }
  return data;
}

const ProductDetailModal = ({ product, isOpen, onClose, onInvest }) => {
  const { trackEvent } = useTracking()

  if (!isOpen || !product) return null

  const chartData = generateMockData(product.returnRate)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-300 px-2 py-0.5 rounded bg-white">{product.category}</span>
              {product.tag && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#006044]/10 text-[#006044] px-2 py-0.5 rounded-full border border-[#006044]/20">
                  {product.tag}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-gray-600 text-sm mt-2">{product.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition bg-white hover:bg-gray-100 border border-gray-200 p-2 rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Expected Returns</p>
              <p className="text-xl font-bold text-green-700">{product.returnRate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Risk Level</p>
              <p className={`text-xl font-bold ${product.risk.includes('High') ? 'text-red-600' : product.risk.includes('Moderate') ? 'text-orange-500' : 'text-[#006044]'}`}>{product.risk}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Min Invest</p>
              <p className="text-xl font-bold text-gray-900">₹{product.minInvest}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Lock-in</p>
              <p className="text-xl font-bold text-gray-900">{product.lockIn}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <TrendingUp size={16} className="text-[#006044]"/> 5-Year Historical Performance Simulation
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006044" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#006044" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="year" stroke="#6B7280" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B7280" tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', borderRadius: '8px', color: '#1F2937', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#006044', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#006044" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#006044]/5 border border-[#006044]/20 p-4 rounded-lg">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#006044] mb-2"><Info size={16}/> Why Invest?</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[#006044] mt-0.5 shrink-0"/> Professionally managed portfolio for optimal growth.</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[#006044] mt-0.5 shrink-0"/> High liquidity {product.lockIn === "No Lock-in" ? "with zero exit barriers." : "after lock-in period."}</li>
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><AlertTriangle size={16}/> Risk Profile</h4>
              <p className="text-sm text-gray-600">
                This is a <strong className="text-gray-900">{product.risk}</strong> risk product. Investors should understand that their principal will be at {product.risk.toLowerCase()} risk. Performance is subject to market conditions.
              </p>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition shadow-sm"
          >
            Close
          </button>
          <button 
            onClick={() => {
              trackEvent("Investment Started", product.name, product.category)
              onInvest(product)
            }}
            className="px-8 py-2.5 bg-[#006044] hover:bg-[#004e36] rounded font-semibold text-white transition shadow-sm hover:-translate-y-0.5"
          >
            Invest Now
          </button>
        </div>

      </div>
    </div>
  )
}

export default ProductDetailModal
