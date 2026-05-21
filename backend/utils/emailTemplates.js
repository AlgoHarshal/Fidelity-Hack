const getEmailWrapper = (title, content, ctaText, ctaLink) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
  <div style="background-color: #006044; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">IntentEdge Wealth</h1>
  </div>
  <div style="padding: 32px; color: #374151; line-height: 1.6;">
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">${title}</h2>
    ${content}
    ${ctaText ? `
    <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
      <a href="${ctaLink}" style="background-color: #006044; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">${ctaText}</a>
    </div>
    ` : ''}
  </div>
  <div style="background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0;">IntentEdge Wealth Management. All rights reserved.</p>
    <p style="margin: 4px 0 0;">This is an automated behavioral alert from your intelligent portfolio engine.</p>
  </div>
</div>
`;

const templates = {
  compareAbandonment: (userName) => getEmailWrapper(
    "Still Exploring Your Options?",
    `<p>Hi ${userName},</p>
     <p>We noticed you were comparing investment plans but didn't complete your setup. Taking the first step in wealth creation is the most important one.</p>
     <p><strong>Here are 3 reasons investors choose SIPs:</strong></p>
     <ul style="padding-left: 20px; color: #4b5563;">
       <li>Disciplined, automated investing</li>
       <li>Lower entry barriers (start small)</li>
       <li>Long-term compound wealth growth</li>
     </ul>
     <p>Return now and continue your investment journey.</p>`,
    "Resume Your Investment",
    "http://localhost:5173/investments"
  ),

  checkoutReminder: (userName, productName) => getEmailWrapper(
    "Your Investment Setup is Almost Complete",
    `<p>Hi ${userName},</p>
     <p>We noticed you were setting up an investment in <strong>${productName}</strong> but didn't finalize it. Taking the final step today is the best way to secure tomorrow's compounding returns.</p>
     <p>Your portfolio strategy is aligned with this plan, and completing this setup now ensures you don't miss out on upcoming market cycles.</p>`,
    "Complete Your Investment",
    "http://localhost:5173/investments"
  ),

  insuranceRecommendation: (userName) => getEmailWrapper(
    "Protecting Wealth is as Important as Growing It",
    `<p>Hi ${userName},</p>
     <p>Our intelligent engine analyzed your portfolio and noticed a strong focus on growth, but a potential gap in capital protection.</p>
     <p>Consider diversifying into term insurance or capital protection plans to secure a comprehensive safety net for your family.</p>`,
    "Explore Protection Plans",
    "http://localhost:5173/investments"
  ),

  highRiskWarning: (userName) => getEmailWrapper(
    "Portfolio Risk Diversification Alert",
    `<p>Hi ${userName},</p>
     <p>Your portfolio currently carries a high-risk growth focus. While this can maximize long-term returns, balancing it with stable, low-risk assets provides market stability.</p>
     <p>We recommend exploring our curated low-risk mutual funds and government-backed retirement products.</p>`,
    "View Portfolio Health",
    "http://localhost:5173/portfolio"
  )
};

module.exports = templates;
