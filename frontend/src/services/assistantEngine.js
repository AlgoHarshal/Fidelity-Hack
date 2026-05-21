export const generateAssistantContext = (events, score, persona, totalTimeSpent) => {
  if (!events || events.length === 0) return null;

  const recentEvents = events.slice(0, 10);
  const latestEvent = events[0];

  // 1. Checkout Abandonment
  const hasAbandonedCheckout = recentEvents.some(e => e.action === "Checkout Abandoned" && (Date.now() - new Date(e.timestamp).getTime() < 60000 || isNaN(new Date(e.timestamp).getTime())));
  if (latestEvent.action === "Checkout Abandoned") {
    return {
      id: "checkout_abandon",
      message: "You were very close to completing your investment. Would you like a simplified breakdown before deciding?",
      suggestions: ["Explain Risk", "Tax Benefits", "Expected Returns"]
    };
  }

  // 2. Multiple Compare Clicks
  const compareClicks = recentEvents.filter(e => e.action === "Compare Clicked").length;
  if (compareClicks > 1 && latestEvent.action === "Compare Clicked") {
    return {
      id: "compare_help",
      message: "You seem to be comparing several plans. Want help selecting the best balance between risk and returns?",
      suggestions: ["High Returns", "Balanced Funds", "Beginner Friendly"]
    };
  }

  // 3. Category Specific Rules (SIP)
  if (latestEvent.action === "Category Explored" && latestEvent.plan === "SIP" && totalTimeSpent > 45) {
    return {
      id: "sip_explore",
      message: "Still exploring SIP investments? SIPs are ideal for disciplined long-term wealth growth.",
      suggestions: ["Conservative SIPs", "Compare Returns", "Low Risk Plans"]
    };
  }

  // 4. Category Specific Rules (Retirement)
  if (latestEvent.action === "Category Explored" && latestEvent.plan === "Retirement") {
    return {
      id: "retirement_explore",
      message: "Retirement planning early can significantly improve long-term wealth accumulation.",
      suggestions: ["Safe Retirement Plans", "Long-Term Growth", "Retirement Calculator"]
    };
  }

  // 5. Category Specific Rules (Insurance)
  if (latestEvent.action === "Category Explored" && latestEvent.plan === "Insurance") {
    return {
      id: "insurance_explore",
      message: "Insurance helps secure your financial future against uncertainty.",
      suggestions: ["Health Insurance", "Life Coverage", "Family Plans"]
    };
  }

  // 6. High Intent
  if (score > 80 && latestEvent.action !== "Checkout Completed") {
    return {
      id: "high_intent",
      message: "Your activity suggests strong investment intent. Balanced mutual funds may fit your profile best.",
      suggestions: ["Recommended Funds", "Invest Now", "Compare Plans"]
    };
  }

  // 7. Confused Beginner
  if (persona.id === "confused_beginner" && events.length > 5) {
    return {
      id: "beginner_help",
      message: "You appear to be exploring multiple investment options. That’s completely normal for first-time investors.",
      suggestions: ["Beginner SIPs", "Safe Investments", "Learn Basics"]
    };
  }

  return null;
};
