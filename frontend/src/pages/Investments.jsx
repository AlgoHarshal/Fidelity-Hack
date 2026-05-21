import { useState, useMemo } from "react"
import { useTracking } from "../context/TrackingContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ProductDetailModal from "../components/ProductDetailModal"
import CheckoutModal from "../components/CheckoutModal"
import { products } from "../data/products"
import { Search, Sparkles } from "lucide-react"

const CATEGORIES = ["All", "SIP", "Mutual Funds", "Retirement", "Insurance"]

const Investments = () => {
  const { trackEvent, persona } = useTracking()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [checkoutProduct, setCheckoutProduct] = useState(null)

  // AI Recommendation logic based on persona
  const recommendedProducts = useMemo(() => {
    if (persona.label.includes("Beginner")) return products.filter(p => p.tag === "Best for Beginners" || p.risk === "Low")
    if (persona.label.includes("Retirement")) return products.filter(p => p.category === "Retirement")
    if (persona.label.includes("High Intent")) return products.filter(p => p.tag === "High Growth" || p.returnRate > "15%")
    return products.filter(p => p.tag === "Popular Choice" || p.tag === "AI Recommended")
  }, [persona])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCat = activeCategory === "All" || p.category === activeCategory
      return matchSearch && matchCat
    })
  }, [searchTerm, activeCategory])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    if (cat !== "All") trackEvent("Category Explored", cat)
  }

  const handleOpenDetail = (product) => {
    trackEvent("Product Viewed", product.name)
    setSelectedProduct(product)
  }

  const handleCompare = (product, e) => {
    e.stopPropagation()
    trackEvent("Compare Clicked", product.name)
    setSelectedProduct(product)
  }

  const handleInvest = (product, e) => {
    if (e) e.stopPropagation()
    setSelectedProduct(null)
    setCheckoutProduct(product)
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />

      {/* Hero Header */}
      <section className="relative text-center py-16 px-4 bg-white border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#006044]">Investment Marketplace</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Discover highly curated, institutional-grade financial instruments tailored to your behavioral risk profile.
        </p>
      </section>

      {/* Recommended Section */}
      {recommendedProducts.length > 0 && (
        <section className="px-6 md:px-12 py-10 max-w-[1600px] mx-auto border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
            <Sparkles className="text-[#006044]"/> Recommended For You
            <span className="text-sm font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 ml-2">
              Based on your "{persona.label}" persona
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map(p => (
              <ProductCard 
                key={`rec-${p.id}`} 
                product={p} 
                onView={() => handleOpenDetail(p)}
                onCompare={(e) => handleCompare(p, e)}
                onInvest={(e) => handleInvest(p, e)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Marketplace */}
      <section className="px-6 md:px-12 py-12 max-w-[1600px] mx-auto">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded font-semibold text-sm transition border ${activeCategory === cat ? 'bg-[#006044] border-[#006044] text-white shadow-sm' : 'bg-white border-gray-300 text-gray-600 hover:text-[#006044] hover:border-[#006044] shadow-sm'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded pl-10 pr-4 py-2.5 text-gray-900 focus:border-[#006044] focus:outline-none transition text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onView={() => handleOpenDetail(p)}
              onCompare={(e) => handleCompare(p, e)}
              onInvest={(e) => handleInvest(p, e)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No products found matching your search.
            </div>
          )}
        </div>

      </section>

      <Footer />

      {/* Modals */}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onInvest={(p) => handleInvest(p)}
      />

      <CheckoutModal 
        product={checkoutProduct} 
        isOpen={!!checkoutProduct} 
        onClose={() => setCheckoutProduct(null)} 
      />

    </div>
  )
}

const ProductCard = ({ product, onView, onCompare, onInvest }) => {
  return (
    <div 
      onClick={onView}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group relative flex flex-col h-full"
    >
      {product.tag && (
        <span className="absolute -top-3 right-4 bg-[#006044] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-[#004e36]">
          {product.tag}
        </span>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1 block">{product.category}</span>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#006044] transition">{product.name}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded p-2.5 border border-gray-100">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Returns</p>
          <p className="font-bold text-green-700 text-sm">{product.returnRate}</p>
        </div>
        <div className="bg-gray-50 rounded p-2.5 border border-gray-100">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Risk</p>
          <p className={`font-bold text-sm ${product.risk.includes('High') ? 'text-red-600' : product.risk.includes('Moderate') ? 'text-orange-500' : 'text-[#006044]'}`}>{product.risk}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1 line-clamp-2">
        {product.description}
      </p>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={onInvest}
          className="flex-1 bg-[#006044] hover:bg-[#004e36] text-white transition duration-300 px-4 py-2.5 rounded font-semibold text-sm shadow-sm"
        >
          Invest
        </button>
        <button
          onClick={onCompare}
          className="flex-1 bg-white border border-[#006044] hover:bg-gray-50 text-[#006044] transition duration-300 px-4 py-2.5 rounded font-semibold text-sm"
        >
          Compare
        </button>
      </div>
    </div>
  )
}

export default Investments