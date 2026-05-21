import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import {
  MessageCircle, X, ChevronDown, RefreshCw,
  TrendingUp, ShieldCheck, HelpCircle, Briefcase,
  BookOpen, BarChart2, Lightbulb, Mail, Copy
} from "lucide-react"

// ── Static Q&A Knowledge Base ─────────────────────────────────────────────────
const FLOWS = [
  {
    id: "investment",
    label: "Investment Guidance",
    icon: TrendingUp,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    questions: [
      {
        q: "Help me choose an SIP",
        a: "A Systematic Investment Plan (SIP) lets you invest a fixed amount monthly into mutual funds. For beginners, we recommend starting with ₹500–₹2,000/month in a diversified equity SIP. Key factors: your risk appetite, investment horizon, and financial goals. Use our Compare page to evaluate SIP options side-by-side."
      },
      {
        q: "Compare Mutual Funds",
        a: "Mutual funds pool money from investors and invest in diversified assets. Compare them by: (1) Category — Equity, Debt, Hybrid, (2) Risk level — Low to High, (3) Returns — 1yr, 3yr, 5yr CAGR, (4) Expense ratio — lower is better. Head to our Compare page for a real-time side-by-side view."
      },
      {
        q: "Retirement Planning",
        a: "Retirement planning works best when started early. Consider: NPS (National Pension System) for tax benefits, PPF for safe long-term growth, and diversified equity SIPs for wealth accumulation. A common rule: save 15% of your income for retirement. Explore our Retirement category in Investments."
      },
      {
        q: "Insurance Guidance",
        a: "Every investor needs a financial safety net. Term insurance provides pure life cover at low premiums. Health insurance covers medical emergencies. Consider: (1) Cover at least 10x your annual income, (2) Add critical illness riders, (3) Review coverage every 5 years. View insurance options under our Investments page."
      }
    ]
  },
  {
    id: "portfolio",
    label: "Portfolio Help",
    icon: Briefcase,
    color: "text-blue-700 bg-blue-50 border-blue-200",
    questions: [
      {
        q: "View portfolio tips",
        a: "A healthy portfolio is diversified across asset classes. Rule of thumb: allocate (100 - your age)% to equity. For example, at 30 years old, keep 70% in equity, 30% in debt/insurance. Rebalance your portfolio annually to maintain your target allocation."
      },
      {
        q: "Diversification advice",
        a: "Diversification reduces risk without sacrificing returns. Spread investments across: Equity (growth), Debt/Bonds (stability), Insurance (protection), and Gold (inflation hedge). Avoid putting more than 25% of your portfolio in a single fund or category."
      },
      {
        q: "Tax saving strategies",
        a: "Popular tax-saving investment instruments in India: (1) ELSS Mutual Funds — tax deduction up to ₹1.5L under Section 80C with highest returns, (2) PPF — safe, tax-free returns, (3) NPS — additional ₹50K deduction under Section 80CCD(1B), (4) Term Insurance premium — Section 80C deduction."
      }
    ]
  },
  {
    id: "platform",
    label: "Platform Support",
    icon: HelpCircle,
    color: "text-purple-700 bg-purple-50 border-purple-200",
    questions: [
      {
        q: "How does IntentEdge work?",
        a: "IntentEdge is an intelligent investment platform that tracks your financial behavior to provide personalized guidance. Browse investments, compare products, and build your portfolio. Our AI engine analyzes your activity to send timely nudges and recovery alerts — helping you make smarter financial decisions."
      },
      {
        q: "Contact support",
        a: "Our support team is available Monday–Friday, 9am–6pm IST.\n\nEmail: support@intentedge.ai\nResponse time: within 24 hours\n\nFor urgent issues, email with subject line: [URGENT] — Your Issue",
        isSupport: true
      },
      {
        q: "Investment FAQs",
        a: "Common questions:\n• Minimum investment: ₹500/month for SIPs\n• Withdrawal: Most funds allow withdrawal after lock-in period (ELSS: 3 years)\n• Safety: Investments are SEBI-regulated\n• Returns: Not guaranteed — depend on market performance\n• KYC: Required once for all investments"
      }
    ]
  },
  {
    id: "faq",
    label: "Popular Questions",
    icon: BookOpen,
    color: "text-amber-700 bg-amber-50 border-amber-200",
    questions: [
      {
        q: "Which SIP is best for beginners?",
        a: "For beginners, we recommend starting with a Large-Cap or Flexi-Cap equity SIP. These offer diversification and moderate risk. Popular choices include index funds (Nifty 50 / Sensex trackers) which have low expense ratios and consistent long-term returns. Start with ₹500–₹1,000/month and increase annually."
      },
      {
        q: "How much should I invest monthly?",
        a: "A popular rule is the 50-30-20 budget: 50% for needs, 30% for wants, and 20% for savings/investments. If your monthly income is ₹50,000, aim to invest ₹10,000. Break it down: ₹5,000 in SIP, ₹2,000 in PPF, ₹2,000 in NPS, ₹1,000 in insurance premium."
      },
      {
        q: "Difference between SIP and Mutual Funds?",
        a: "A Mutual Fund is the investment vehicle — a pool of money invested in stocks, bonds, etc.\n\nA SIP (Systematic Investment Plan) is the method of investing — contributing a fixed amount to a mutual fund at regular intervals (monthly).\n\nThink of it this way: Mutual Fund is the product, SIP is how you buy it."
      },
      {
        q: "Which insurance plan is safest?",
        a: "For pure protection, Term Insurance is safest and most affordable. It provides a large cover (e.g., ₹1 Crore) for a small premium (₹10,000–₹15,000/year for a 30-year-old). Avoid investment-linked insurance (ULIPs) if your goal is pure protection — they have higher costs."
      }
    ]
  }
]

// ── Helper ─────────────────────────────────────────────────────────────────────
const WELCOME = {
  id: "welcome",
  role: "assistant",
  type: "welcome",
  text: "👋 Welcome to IntentEdge Support Assistant\n\nHow can I assist you today? Choose a topic below or ask a popular question."
}

const AIAssistant = () => {
  const { user } = useAuth()

  // Admins never see the chatbot
  if (user?.role === "admin") return null

  return <ChatWidget user={user} />
}

// Separate component so hooks are not called conditionally
const ChatWidget = ({ user }) => {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState([WELCOME])
  const [isTyping,  setIsTyping]  = useState(false)
  const chatRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const resetChat = () => {
    setMessages([{
      ...WELCOME,
      id: Date.now().toString(),
      text: "Chat reset. How can I assist you today?"
    }])
  }

  const pushAssistantReply = (msg) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", ...msg }])
    }, 800)
  }

  const handleFlowSelect = (flow) => {
    setMessages(prev => [...prev,
      { id: Date.now().toString(), role: "user", text: flow.label, type: "text" }
    ])
    pushAssistantReply({
      type: "questions",
      text: `Here are some common questions about ${flow.label}:`,
      options: flow.questions,
      flowId: flow.id
    })
  }

  const handleQuestionSelect = (q) => {
    setMessages(prev => [...prev,
      { id: Date.now().toString(), role: "user", text: q.q, type: "text" }
    ])
    const isSupport = q.isSupport
    pushAssistantReply({
      type: isSupport ? "support" : "answer",
      text: q.a,
    })
    // Follow-up
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "_fu",
        role: "assistant",
        type: "flows",
        text: "Would you like to explore another topic?"
      }])
    }, 800 + 400)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end font-sans select-none">

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      <div
        className={`mb-4 w-[360px] md:w-[420px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 max-h-[600px]" : "scale-95 opacity-0 max-h-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#006044] px-5 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Lightbulb size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">IntentEdge Support</h3>
              <p className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · Guided Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetChat}
              title="New conversation"
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Minimize"
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <ChevronDown size={17} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="p-1.5 text-white/70 hover:text-white hover:bg-red-500/30 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 max-h-[460px]"
          style={{ scrollbarWidth: "none" }}
        >
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>

              {/* Bubble */}
              {msg.text && (
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#006044] text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* Welcome: flow cards */}
              {(msg.type === "welcome" || msg.type === "flows") && i === messages.length - 1 && (
                <div className="grid grid-cols-2 gap-2 mt-3 w-full">
                  {FLOWS.map(flow => {
                    const Icon = flow.icon
                    return (
                      <button
                        key={flow.id}
                        onClick={() => handleFlowSelect(flow)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-sm ${flow.color}`}
                      >
                        <Icon size={14} className="flex-shrink-0" />
                        <span className="leading-tight">{flow.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Questions list */}
              {msg.type === "questions" && i === messages.length - 1 && (
                <div className="flex flex-col gap-1.5 mt-3 w-full">
                  {msg.options.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestionSelect(q)}
                      className="text-left text-xs font-medium px-4 py-2.5 bg-white border border-gray-200 hover:border-[#006044]/40 hover:bg-[#006044]/5 text-gray-700 hover:text-[#006044] rounded-xl transition-all duration-200 shadow-sm hover:translate-x-0.5"
                    >
                      {q.q}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFlowSelect(FLOWS.find(f => f.id === msg.flowId) || FLOWS[0])}
                    className="text-[11px] text-gray-400 hover:text-[#006044] mt-1 text-right pr-1 transition"
                  >
                    ← Back to topics
                  </button>
                </div>
              )}

              {/* Support email actions */}
              {msg.type === "support" && i === messages.length - 1 && (
                <div className="flex gap-2 mt-3 w-full">
                  <a
                    href="mailto:support@intentedge.ai"
                    className="flex items-center justify-center gap-1.5 flex-1 bg-[#006044] hover:bg-[#004e36] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
                  >
                    <Mail size={13} /> Open Mail
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText("support@intentedge.ai")}
                    className="flex items-center justify-center gap-1.5 flex-1 bg-white border border-[#006044] text-[#006044] text-xs font-semibold px-4 py-2.5 rounded-lg transition hover:bg-[#006044]/5"
                  >
                    <Copy size={13} /> Copy Email
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start animate-in fade-in duration-300">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006044] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#006044] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#006044] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
          <p className="text-[10px] text-gray-400 text-center">IntentEdge Support · SEBI Registered Platform</p>
        </div>
      </div>

      {/* ── Floating Button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-14 h-14 bg-[#006044] hover:bg-[#004e36] rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 border border-[#004e36]/30 group relative"
        aria-label="Open support assistant"
      >
        <div className={`transition-transform duration-300 ${isOpen ? "rotate-180 scale-90" : "rotate-0 scale-100"}`}>
          {isOpen
            ? <ChevronDown size={24} className="text-white" />
            : <MessageCircle size={26} className="text-white" />
          }
        </div>
        {/* Ripple on hover */}
        <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Support Assistant
          </div>
        )}
      </button>
    </div>
  )
}

export default AIAssistant
