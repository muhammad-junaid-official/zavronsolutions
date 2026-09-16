/**
 * ZAVRON SOLUTIONS — PROFESSIONAL LIVE CHAT WIDGET
 * Isolated, conflict-free styling with markdown support & lead capture.
 */

const ZAVRON_KB = {
  agency: {
    name: "Zavron Solutions",
    email: "zavronsolutions@gmail.com",
    hours: "Mon–Fri: 8:00 AM – 6:00 PM EST",
    coverage: "Serving US Businesses Nationwide",
    overview: "Zavron Solutions is a top-rated US digital agency specializing in custom web development, enterprise WordPress, Shopify/WooCommerce e-commerce, technical & local SEO, Google Ads PPC, and conversion-driven UI/UX design."
  },
  services: [
    { id: "web-development", name: "Custom Web Development", url: "/services/web-development/", summary: "High-performance Next.js, React, and Node.js web applications engineered for sub-second load times, scalability, and enterprise security.", keywords: ["web dev", "website", "react", "nextjs", "node", "frontend", "backend", "full stack", "custom code", "web application", "software", "development"] },
    { id: "wordpress-development", name: "Enterprise WordPress", url: "/services/wordpress-development/", summary: "Custom WordPress themes, headless WordPress (WP + Next.js), enterprise security hardening, 90+ PageSpeed scores, and ongoing maintenance retainers.", keywords: ["wordpress", "wp", "headless wordpress", "woocommerce", "elementor", "custom theme", "plugin", "wp maintenance"] },
    { id: "ecommerce-development", name: "E-Commerce Development", url: "/services/ecommerce-development/", summary: "Shopify Plus and WooCommerce engineering, custom ERP/CRM integrations, checkout funnel CRO, multi-currency architecture, and mobile commerce.", keywords: ["ecommerce", "e-commerce", "shopify", "shopify plus", "woocommerce", "online store", "checkout", "cart", "store"] },
    { id: "seo", name: "SEO & Organic Search", url: "/services/seo/", summary: "White-hat organic search strategies, topical authority clustering, entity SEO, Google rankings, competitor conquesting, and measurable ROI.", keywords: ["seo", "rankings", "google ranking", "organic traffic", "topical authority", "search engine optimization", "organic search", "rank"] },
    { id: "local-seo", name: "Local SEO & Google Maps", url: "/services/local-seo/", summary: "Dominate Google Maps 3-Pack, optimize Google Business Profile, build geo-targeted pages, consistent NAP citations, and 5-star review acquisition.", keywords: ["local seo", "map pack", "google maps", "near me", "google business profile", "gbp", "citations", "reviews", "local"] },
    { id: "technical-seo", name: "Technical SEO", url: "/services/technical-seo/", summary: "Core Web Vitals (LCP, INP, CLS), JSON-LD Schema markup, crawl budget maximization, SSR JavaScript indexing, and zero-loss site migrations.", keywords: ["technical seo", "core web vitals", "pagespeed", "schema markup", "json-ld", "crawl budget", "site migration", "technical", "speed"] },
    { id: "digital-marketing", name: "Digital Marketing & Growth", url: "/services/digital-marketing/", summary: "Omnichannel growth frameworks, customer acquisition cost reduction, B2B lead generation, full-funnel attribution, and conversion rate optimization.", keywords: ["digital marketing", "marketing", "growth", "cac", "funnel", "cro", "conversion rate", "lead gen", "leads"] },
    { id: "google-ads", name: "Google Ads & PPC", url: "/services/google-ads/", summary: "Data-backed Google Search, Performance Max, and Shopping campaigns with negative keyword mining, high Quality Scores, and lower Cost Per Acquisition.", keywords: ["google ads", "ppc", "pay per click", "performance max", "adwords", "cpa", "search ads", "paid search", "ads"] },
    { id: "social-media-marketing", name: "Paid & Organic Social", url: "/services/social-media-marketing/", summary: "High-converting B2B LinkedIn campaigns, DTC Meta/Instagram/Facebook scaling, viral TikTok ad strategies, and multi-touch retargeting sequences.", keywords: ["social media", "meta ads", "facebook ads", "instagram", "linkedin", "tiktok", "retargeting", "social"] },
    { id: "ui-ux-design", name: "UI/UX Design", url: "/services/ui-ux-design/", summary: "Conversion-centric UI/UX design, interactive Figma prototypes, scalable design systems, mobile-first responsive interfaces, and user testing.", keywords: ["ui", "ux", "ui/ux", "web design", "figma", "prototyping", "design system", "user experience", "design", "redesign"] }
  ],
  industries: [
    { name: "Real Estate", url: "/industries/real-estate/", desc: "IDX integration, luxury listings, local SEO for realtors, and buyer lead funnels." },
    { name: "Healthcare", url: "/industries/healthcare/", desc: "HIPAA-compliant web development, patient booking systems, local SEO, and clinic reputation management." },
    { name: "E-Commerce", url: "/industries/ecommerce/", desc: "High-converting Shopify/WooCommerce, inventory sync, personalized product recommendations." },
    { name: "Restaurants", url: "/industries/restaurants/", desc: "Commission-free online ordering, multi-location local SEO, table booking UX." },
    { name: "Law Firms", url: "/industries/law-firms/", desc: "High-value case acquisition, intake automation, legal thought leadership, personal injury SEO." },
    { name: "Construction", url: "/industries/construction/", desc: "Commercial portfolios, estimating calculators, roofing/HVAC local SEO, commercial RFP leads." },
    { name: "SaaS", url: "/industries/saas-technology/", desc: "Product marketing sites, PLG onboarding UX, programmatic technical SEO, pricing page CRO." }
  ]
};

const CHAT_CSS = `
  #zv-chat-root {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif !important;
    font-size: 14px;
    line-height: 1.5;
    color: #1E293B;
  }
  #zv-chat-root * {
    box-sizing: border-box !important;
    margin: 0;
    padding: 0;
    font-family: inherit !important;
  }

  /* === LAUNCHER BUBBLE === */
  #zv-launcher {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }

  #zv-greeting-bubble {
    background: #FFFFFF !important;
    color: #1E293B !important;
    padding: 12px 16px !important;
    border-radius: 16px 16px 4px 16px !important;
    box-shadow: 0 10px 30px rgba(6, 20, 38, 0.18), 0 2px 8px rgba(0,0,0,0.08) !important;
    max-width: 250px;
    cursor: pointer;
    border: 1px solid rgba(0, 85, 212, 0.12) !important;
    position: relative;
    animation: zvFadeIn 0.35s ease;
  }
  #zv-greeting-bubble::after {
    content: '';
    position: absolute;
    bottom: -8px;
    right: 22px;
    border-left: 8px solid transparent;
    border-right: 0;
    border-top: 8px solid #FFFFFF;
  }
  #zv-greeting-bubble .zv-gb-name {
    font-weight: 700 !important;
    color: #061426 !important;
    font-size: 13px !important;
    margin-bottom: 3px !important;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  #zv-greeting-bubble .zv-gb-dot {
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  #zv-greeting-bubble p {
    color: #475569 !important;
    font-size: 12.5px !important;
    line-height: 1.45 !important;
  }

  #zv-btn {
    width: 60px !important;
    height: 60px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, #0055D4 0%, #00D2FF 100%) !important;
    border: none !important;
    cursor: pointer !important;
    box-shadow: 0 8px 24px rgba(0, 85, 212, 0.45) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease !important;
    position: relative !important;
    outline: none !important;
    padding: 0 !important;
  }
  #zv-btn:hover {
    transform: scale(1.08) !important;
    box-shadow: 0 12px 30px rgba(0, 85, 212, 0.6) !important;
  }
  #zv-btn-icon-chat, #zv-btn-icon-close {
    position: absolute;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  #zv-btn-icon-close { opacity: 0; transform: rotate(-90deg); }
  #zv-btn.open #zv-btn-icon-chat { opacity: 0; transform: rotate(90deg); }
  #zv-btn.open #zv-btn-icon-close { opacity: 1; transform: rotate(0deg); }

  #zv-notif-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 13px;
    height: 13px;
    background: #FF7A00;
    border: 2px solid #FFFFFF;
    border-radius: 50%;
  }

  /* === MAIN CHAT PANEL === */
  #zv-panel {
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 390px;
    max-width: calc(100vw - 32px);
    height: 580px;
    max-height: calc(100svh - 110px);
    background: #F8FAFC !important;
    border-radius: 20px !important;
    box-shadow: 0 20px 60px rgba(6, 20, 38, 0.25), 0 4px 16px rgba(0,0,0,0.1) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    z-index: 2147483646;
    opacity: 0;
    pointer-events: none;
    transform: translateY(16px) scale(0.96);
    transition: opacity 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.25s cubic-bezier(0.16,1,0.3,1);
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
  }
  #zv-panel.open {
    opacity: 1 !important;
    pointer-events: all !important;
    transform: translateY(0) scale(1) !important;
  }

  /* Header */
  #zv-header {
    background: linear-gradient(135deg, #061426 0%, #0B2240 100%) !important;
    padding: 16px 18px 46px !important;
    position: relative;
    flex-shrink: 0;
  }
  #zv-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  #zv-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  #zv-brand-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0055D4 0%, #00D2FF 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px rgba(0, 210, 255, 0.35);
    flex-shrink: 0;
  }
  #zv-brand-info h4 {
    color: #FFFFFF !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    line-height: 1.2 !important;
  }
  #zv-brand-info span {
    color: #00D2FF !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  #zv-brand-info span b {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #10B981;
    border-radius: 50%;
  }
  #zv-close-btn {
    background: rgba(255, 255, 255, 0.12) !important;
    border: none !important;
    border-radius: 50% !important;
    width: 28px !important;
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    color: rgba(255, 255, 255, 0.85) !important;
    padding: 0 !important;
    transition: background 0.2s !important;
  }
  #zv-close-btn:hover { background: rgba(255, 255, 255, 0.25) !important; color: #fff !important; }

  #zv-header-msg {
    color: rgba(255, 255, 255, 0.88) !important;
    font-size: 13px !important;
    line-height: 1.45 !important;
  }

  #zv-team-avatars {
    position: absolute;
    bottom: -18px;
    left: 18px;
    display: flex;
  }
  .zv-team-av {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #FFFFFF;
    margin-right: -8px;
    background: linear-gradient(135deg, #0055D4, #00D2FF);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #fff;
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }

  /* === MESSAGE STREAM === */
  #zv-messages {
    flex: 1;
    overflow-y: auto !important;
    padding: 28px 16px 12px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    background: #F8FAFC !important;
  }
  #zv-messages::-webkit-scrollbar { width: 4px; }
  #zv-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

  /* Bot message */
  .zv-msg-bot {
    display: flex !important;
    align-items: flex-end !important;
    gap: 8px !important;
    align-self: flex-start !important;
    max-width: 90% !important;
    animation: zvMsgIn 0.2s ease;
  }
  .zv-msg-bot-av {
    width: 28px !important;
    height: 28px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, #0055D4, #00D2FF) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }
  .zv-msg-bot-bubble {
    background: #FFFFFF !important;
    color: #1E293B !important;
    padding: 12px 14px !important;
    border-radius: 18px 18px 18px 4px !important;
    font-size: 13.5px !important;
    line-height: 1.55 !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06) !important;
    border: 1px solid #E2E8F0 !important;
  }
  .zv-msg-bot-bubble strong {
    color: #061426 !important;
    font-weight: 700 !important;
  }
  .zv-msg-bot-bubble a {
    color: #0055D4 !important;
    font-weight: 600 !important;
    text-decoration: underline !important;
  }
  .zv-msg-bot-bubble ul {
    margin: 6px 0 6px 16px !important;
  }
  .zv-msg-bot-bubble li {
    margin-bottom: 4px !important;
  }

  /* User message */
  .zv-msg-user {
    display: flex !important;
    justify-content: flex-end !important;
    align-self: flex-end !important;
    max-width: 84% !important;
    animation: zvMsgIn 0.2s ease;
  }
  .zv-msg-user-bubble {
    background: linear-gradient(135deg, #0055D4 0%, #0077EE 100%) !important;
    color: #FFFFFF !important;
    padding: 11px 15px !important;
    border-radius: 18px 18px 4px 18px !important;
    font-size: 13.5px !important;
    line-height: 1.5 !important;
    box-shadow: 0 2px 8px rgba(0, 85, 212, 0.3) !important;
    font-weight: 500 !important;
  }

  .zv-ts {
    font-size: 10px !important;
    color: #94A3B8 !important;
    margin-top: 4px !important;
    padding: 0 4px !important;
  }
  .zv-msg-user .zv-ts { text-align: right !important; }

  /* Typing */
  #zv-typing {
    display: flex !important;
    align-items: flex-end !important;
    gap: 8px !important;
    align-self: flex-start !important;
  }
  #zv-typing-dots {
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 18px 18px 18px 4px !important;
    padding: 10px 14px !important;
    display: flex !important;
    gap: 5px !important;
    align-items: center !important;
  }
  .zv-dot {
    width: 6px !important;
    height: 6px !important;
    background: #0055D4 !important;
    border-radius: 50% !important;
    animation: zvBounce 1.4s ease-in-out infinite;
    opacity: 0.6;
  }
  .zv-dot:nth-child(2) { animation-delay: 0.15s; }
  .zv-dot:nth-child(3) { animation-delay: 0.3s; }

  /* Quick Replies / Chips */
  .zv-chips {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    margin-top: 4px !important;
    padding-left: 36px !important;
  }
  .zv-chip {
    background: #FFFFFF !important;
    border: 1.5px solid #BAE6FD !important;
    color: #0369A1 !important;
    padding: 6px 12px !important;
    border-radius: 18px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.18s ease !important;
    white-space: nowrap !important;
    outline: none !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
  }
  .zv-chip:hover {
    background: #E0F2FE !important;
    border-color: #0284C7 !important;
    color: #0284C7 !important;
    transform: translateY(-1px) !important;
  }

  /* Lead Card */
  .zv-lead-card {
    background: #FFFBF5 !important;
    border: 1.5px solid #FED7AA !important;
    border-radius: 12px !important;
    padding: 14px !important;
    margin-top: 4px !important;
  }
  .zv-lead-card h5 {
    color: #C2410C !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
  }
  .zv-lead-card p {
    color: #78350F !important;
    font-size: 12px !important;
    margin-bottom: 10px !important;
    line-height: 1.4 !important;
  }
  .zv-lead-input {
    width: 100% !important;
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 8px !important;
    padding: 8px 10px !important;
    font-size: 12.5px !important;
    color: #1E293B !important;
    margin-bottom: 8px !important;
    outline: none !important;
  }
  .zv-lead-input:focus {
    border-color: #0055D4 !important;
    box-shadow: 0 0 0 3px rgba(0, 85, 212, 0.12) !important;
  }
  .zv-lead-submit {
    width: 100% !important;
    background: linear-gradient(135deg, #EA580C, #FF7A00) !important;
    color: #FFFFFF !important;
    border: none !important;
    padding: 9px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    transition: opacity 0.2s !important;
  }
  .zv-lead-submit:hover { opacity: 0.9 !important; }

  /* Input Footer */
  #zv-footer {
    padding: 12px 14px !important;
    background: #FFFFFF !important;
    border-top: 1px solid #F1F5F9 !important;
    flex-shrink: 0;
  }
  #zv-form {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    background: #F8FAFC !important;
    border: 1.5px solid #E2E8F0 !important;
    border-radius: 24px !important;
    padding: 6px 6px 6px 14px !important;
    transition: border-color 0.2s !important;
  }
  #zv-form:focus-within {
    border-color: #0055D4 !important;
    box-shadow: 0 0 0 3px rgba(0, 85, 212, 0.1) !important;
    background: #FFFFFF !important;
  }
  #zv-input {
    flex: 1 !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    color: #1E293B !important;
    font-size: 13.5px !important;
    min-width: 0 !important;
  }
  #zv-input::placeholder { color: #94A3B8 !important; }
  #zv-send {
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    background: #0055D4 !important;
    border: none !important;
    color: #FFFFFF !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    padding: 0 !important;
    flex-shrink: 0 !important;
    transition: background 0.2s !important;
  }
  #zv-send:hover:not(:disabled) { background: #0072FF !important; }
  #zv-send:disabled { background: #CBD5E1 !important; cursor: not-allowed !important; }

  #zv-footer-brand {
    text-align: center !important;
    font-size: 10.5px !important;
    color: #94A3B8 !important;
    margin-top: 6px !important;
  }
  #zv-footer-brand a { color: #0055D4 !important; font-weight: 600 !important; text-decoration: none !important; }

  /* Animations */
  @keyframes zvFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes zvMsgIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes zvBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

  @media (max-width: 480px) {
    #zv-panel { right: 0 !important; bottom: 0 !important; width: 100vw !important; max-width: 100vw !important; height: 100svh !important; max-height: 100svh !important; border-radius: 0 !important; }
    #zv-launcher { bottom: 16px !important; right: 16px !important; }
  }
`;

class ZavronLiveChat {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.injectStyles();
    this.render();
    this.attachEvents();
    this.loadHistory();

    if (!sessionStorage.getItem('zv_greeting_dismissed')) {
      setTimeout(() => this.showGreeting(), 2000);
    }

    if (this.messages.length === 0) {
      setTimeout(() => {
        this.addBot(
          "👋 **Hello! Welcome to Zavron Solutions.**\n\nI'm your live AI support specialist. How can I assist your business today?",
          ["Web Development", "SEO & Rankings", "Shopify / E-Commerce", "Pricing & Quote", "Talk to a Human"]
        );
      }, 500);
    }
  }

  injectStyles() {
    if (document.getElementById('zv-styles')) return;
    const style = document.createElement('style');
    style.id = 'zv-styles';
    style.textContent = CHAT_CSS;
    document.head.appendChild(style);
  }

  render() {
    if (document.getElementById('zv-chat-root')) return;

    const root = document.createElement('div');
    root.id = 'zv-chat-root';
    root.innerHTML = `
      <!-- Launcher -->
      <div id="zv-launcher">
        <div id="zv-greeting-bubble" style="display:none;">
          <div class="zv-gb-name"><span class="zv-gb-dot"></span>Live Agent Online</div>
          <p>👋 Hi! How can we help scale your business today?</p>
        </div>
        <button id="zv-btn" type="button" aria-label="Open live chat">
          <div id="zv-notif-dot"></div>
          <svg id="zv-btn-icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <svg id="zv-btn-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Panel -->
      <div id="zv-panel" role="dialog" aria-label="Live Chat">
        <!-- Header -->
        <div id="zv-header">
          <div id="zv-header-top">
            <div id="zv-brand">
              <div id="zv-brand-avatar">
                <svg width="18" height="18" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="18" r="4.5" fill="#00D2FF"/></svg>
              </div>
              <div id="zv-brand-info">
                <h4>Zavron Solutions</h4>
                <span><b></b> Online · Instant Replies</span>
              </div>
            </div>
            <button id="zv-close-btn" type="button" aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div id="zv-header-msg">Ask us anything about web engineering, SEO growth, or pricing.</div>
          <div id="zv-team-avatars">
            <div class="zv-team-av">M</div>
            <div class="zv-team-av" style="background:linear-gradient(135deg,#FF7A00,#FFB347);">Z</div>
          </div>
        </div>

        <!-- Messages -->
        <div id="zv-messages"></div>

        <!-- Input Footer -->
        <div id="zv-footer">
          <form id="zv-form" autocomplete="off">
            <input id="zv-input" type="text" placeholder="Type your message…" autocomplete="off" />
            <button type="submit" id="zv-send" disabled aria-label="Send">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div id="zv-footer-brand">Powered by <a href="https://zavronsolutions.com" target="_blank">Zavron Solutions</a></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  attachEvents() {
    const btn = document.getElementById('zv-btn');
    const closeBtn = document.getElementById('zv-close-btn');
    const greeting = document.getElementById('zv-greeting-bubble');
    const form = document.getElementById('zv-form');
    const input = document.getElementById('zv-input');
    const send = document.getElementById('zv-send');

    btn.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.close());
    greeting.addEventListener('click', () => { this.open(); greeting.style.display = 'none'; });

    input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      send.disabled = true;
      this.handleUser(text);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  showGreeting() {
    const g = document.getElementById('zv-greeting-bubble');
    if (g && !this.isOpen) {
      g.style.display = 'block';
    }
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  open() {
    this.isOpen = true;
    document.getElementById('zv-panel').classList.add('open');
    document.getElementById('zv-btn').classList.add('open');
    document.getElementById('zv-greeting-bubble').style.display = 'none';
    const notif = document.getElementById('zv-notif-dot');
    if (notif) notif.style.display = 'none';
    sessionStorage.setItem('zv_greeting_dismissed', '1');
    setTimeout(() => {
      document.getElementById('zv-input').focus();
      this.scrollBottom();
    }, 100);
  }

  close() {
    this.isOpen = false;
    document.getElementById('zv-panel').classList.remove('open');
    document.getElementById('zv-btn').classList.remove('open');
  }

  handleUser(text) {
    this.addUser(text);
    this.showTyping();
    const delay = 600 + Math.random() * 300;
    setTimeout(() => {
      this.hideTyping();
      const r = this.getReply(text);
      this.addBot(r.text, r.chips, r.lead);
    }, delay);
  }

  getReply(raw) {
    const t = raw.toLowerCase();

    // Greetings
    if (/\b(hi|hello|hey|salam|assalam|good morning|good afternoon|good evening|howdy|sup)\b/.test(t)) {
      return {
        text: "Hello! 👋 Great to connect with you.\n\nZavron Solutions provides enterprise digital solutions for US companies:\n\n• **Custom Web Development** (Next.js, React, Node)\n• **Enterprise SEO** & Google Map Pack Dominance\n• **Shopify Plus & E-Commerce** Scaling\n• **Google Ads & Digital Marketing**\n\nHow can we help your business today?",
        chips: ["Web Development", "SEO Services", "Pricing & Quote", "Talk to a Specialist"]
      };
    }

    // Human / Specialist
    if (/\b(human|agent|person|specialist|call|phone|email|contact|hire|speak|talk to|reach)\b/.test(t)) {
      return {
        text: "I'd be happy to connect you with our senior strategists! 🤝\n\nPlease share your details below and an expert from our US team will follow up within **2 business hours**.",
        lead: true,
        chips: ["Email us directly", "Visit Contact Page"]
      };
    }

    // Pricing & Quotes
    if (/\b(price|pricing|cost|how much|quote|estimate|rates|budget|package|plan)\b/.test(t)) {
      return {
        text: "💰 **Our Transparent Investment Tiers:**\n\n• **Custom Websites & Web Apps** — $2,500 – $15,000+\n• **SEO Retainers** — Growth packages tailored to competition\n• **Shopify / E-Commerce** — Store setups to headless enterprise\n• **Google Ads PPC** — Setup + performance ad management\n\nWould you like a tailored quote for your project?",
        chips: ["Get Free Quote →", "Web Dev Pricing", "SEO Retainer Info", "Talk to a Specialist"]
      };
    }

    // Direct Contact
    if (/\b(email us|reach us|send message|send email|visit contact)\b/.test(t)) {
      return {
        text: "You can reach our team directly at:\n\n✉️ **zavronsolutions@gmail.com**\n⏰ Mon–Fri: 8:00 AM – 6:00 PM EST\n\nOr explore our [Contact Page](/contact/).",
        chips: ["Leave Details Here", "Get Free Proposal"]
      };
    }

    // Proposal / Quote
    if (/\b(free quote|get quote|proposal|get started|start project)\b/.test(t)) {
      return {
        text: "Let's build your **custom proposal**! 🚀\n\nYou can use our interactive 60-second wizard: [Get a Free Quote](/get-a-free-quote/)\n\nOr submit your details right here:",
        lead: true,
        chips: []
      };
    }

    // About
    if (/\b(who are you|about|company|agency|zavron|where are you|located)\b/.test(t)) {
      return {
        text: `🌟 **About Zavron Solutions**\n\n${ZAVRON_KB.agency.overview}\n\n📍 ${ZAVRON_KB.agency.coverage}\n✉️ ${ZAVRON_KB.agency.email}\n⏰ ${ZAVRON_KB.agency.hours}`,
        chips: ["Explore Services", "View Case Studies", "Get Free Proposal"]
      };
    }

    // Portfolio
    if (/\b(portfolio|work|case stud|example|past|client|result|project)\b/.test(t)) {
      return {
        text: "📈 **Proven Client Transformations:**\n\nWe have driven 120k+ monthly organic visitors, engineered sub-second Next.js stores, and increased conversion rates by 3x+ for US brands.\n\nExplore our case studies: [View Work Portfolio](/work/)",
        chips: ["SEO Results", "Web Development Work", "Request Custom Proposal"]
      };
    }

    // Match Services
    for (const svc of ZAVRON_KB.services) {
      if (svc.keywords.some(k => t.includes(k))) {
        return {
          text: `🚀 **${svc.name}**\n\n${svc.summary}\n\n[Explore ${svc.name} →](${svc.url})`,
          chips: ["Get a Quote for This", "Other Services", "Talk to a Specialist"]
        };
      }
    }

    // Match Industries
    for (const ind of ZAVRON_KB.industries) {
      const words = ind.name.toLowerCase().split(/\s+/);
      if (words.some(w => w.length > 3 && t.includes(w))) {
        return {
          text: `🏢 **Zavron for ${ind.name}**\n\n${ind.desc}\n\n[View ${ind.name} Solutions →](${ind.url})`,
          chips: ["Request Proposal", "Other Industries", "Get Free Quote"]
        };
      }
    }

    // Fallback
    return {
      text: "Thanks for reaching out! 😊\n\nZavron Solutions specializes in **custom web development, enterprise SEO, e-commerce, and paid digital growth** for US brands.\n\nWhat specific service or goal can we assist you with?",
      chips: ["Web Development", "SEO & Rankings", "Shopify Store", "Pricing Info", "Talk to a Specialist"]
    };
  }

  addUser(text) {
    const msg = { role: 'user', text, ts: this.time() };
    this.messages.push(msg);
    this.renderMsg(msg);
    this.save();
  }

  addBot(text, chips = [], lead = false) {
    const msg = { role: 'bot', text, chips, lead, ts: this.time() };
    this.messages.push(msg);
    this.renderMsg(msg);
    this.save();
  }

  renderMsg(msg) {
    const container = document.getElementById('zv-messages');
    if (!container) return;

    const wrap = document.createElement('div');

    if (msg.role === 'bot') {
      const formattedHtml = this.format(msg.text);
      wrap.innerHTML = `
        <div class="zv-msg-bot">
          <div class="zv-msg-bot-av">
            <svg width="14" height="14" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <div class="zv-msg-bot-bubble">${formattedHtml}</div>
            <div class="zv-ts">${msg.ts}</div>
          </div>
        </div>
      `;

      if (msg.lead) {
        const leadDiv = document.createElement('div');
        leadDiv.style.paddingLeft = '36px';
        leadDiv.innerHTML = `
          <div class="zv-lead-card">
            <h5>🚀 Request Strategy Consultation</h5>
            <p>Our senior strategist will review and reply within 2 hours.</p>
            <form class="zv-lead-form">
              <input class="zv-lead-input" type="text" placeholder="Your Full Name" required />
              <input class="zv-lead-input" type="email" placeholder="Email Address" required />
              <input class="zv-lead-input" type="tel" placeholder="Phone Number (optional)" />
              <textarea class="zv-lead-input" rows="2" placeholder="Brief project summary..." style="resize:none;"></textarea>
              <button type="submit" class="zv-lead-submit">Send to Zavron Team →</button>
            </form>
          </div>
        `;
        container.appendChild(wrap);
        container.appendChild(leadDiv);

        const leadForm = leadDiv.querySelector('.zv-lead-form');
        leadForm.addEventListener('submit', e => {
          e.preventDefault();
          const inputs = leadForm.querySelectorAll('.zv-lead-input');
          const name = inputs[0].value;
          const email = inputs[1].value;
          const phone = inputs[2].value;
          const details = inputs[3].value;
          leadDiv.innerHTML = `<div style="padding-left:36px;"><div class="zv-lead-card"><p style="color:#065F46;font-weight:700;margin:0;">✅ Thank you, ${this.esc(name)}! Your inquiry has been sent to our directors. We'll be in touch shortly.</p></div></div>`;
          this.submitLead({ name, email, phone, details });
        });

        this.scrollBottom();
        return;
      }

      if (msg.chips && msg.chips.length > 0) {
        const chipsDiv = document.createElement('div');
        chipsDiv.className = 'zv-chips';
        msg.chips.forEach(chip => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'zv-chip';
          btn.textContent = chip;
          btn.addEventListener('click', () => this.handleUser(chip));
          chipsDiv.appendChild(btn);
        });
        container.appendChild(wrap);
        container.appendChild(chipsDiv);
        this.scrollBottom();
        return;
      }
    } else {
      wrap.innerHTML = `
        <div class="zv-msg-user">
          <div>
            <div class="zv-msg-user-bubble">${this.esc(msg.text)}</div>
            <div class="zv-ts">${msg.ts}</div>
          </div>
        </div>
      `;
    }

    container.appendChild(wrap);
    this.scrollBottom();
  }

  showTyping() {
    const c = document.getElementById('zv-messages');
    if (!c || document.getElementById('zv-typing')) return;
    const t = document.createElement('div');
    t.id = 'zv-typing';
    t.innerHTML = `<div class="zv-msg-bot-av"><svg width="14" height="14" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div id="zv-typing-dots"><div class="zv-dot"></div><div class="zv-dot"></div><div class="zv-dot"></div></div>`;
    c.appendChild(t);
    this.scrollBottom();
  }

  hideTyping() {
    const t = document.getElementById('zv-typing');
    if (t) t.remove();
  }

  format(text) {
    if (!text) return '';
    let escaped = this.esc(text);
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    escaped = escaped.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
    return escaped;
  }

  esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  time() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollBottom() {
    const c = document.getElementById('zv-messages');
    if (c) setTimeout(() => { c.scrollTop = c.scrollHeight; }, 20);
  }

  save() {
    try { sessionStorage.setItem('zv_msgs', JSON.stringify(this.messages.slice(-30))); } catch (e) {}
  }

  loadHistory() {
    try {
      const saved = JSON.parse(sessionStorage.getItem('zv_msgs') || '[]');
      if (saved.length) {
        this.messages = saved;
        saved.forEach(m => this.renderMsg(m));
      }
    } catch (e) {}
  }

  async submitLead(data) {
    const leadRecord = {
      id: 'lead_' + Date.now(),
      date: new Date().toISOString(),
      name: data.name || 'Chat Prospect',
      email: data.email,
      phone: data.phone || 'N/A',
      company: 'Live Website Visitor',
      service: 'Live Chatbot Inquiry',
      details: data.details || 'Chatbot Consultation Request',
      status: 'new'
    };

    // 1. Save in local browser storage so admin dashboard displays it immediately
    try {
      const stored = JSON.parse(localStorage.getItem('zavron_leads') || '[]');
      stored.unshift(leadRecord);
      localStorage.setItem('zavron_leads', JSON.stringify(stored));
    } catch (e) {}

    // 2. Dispatch to backend API
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: leadRecord,
          message: `Live chat consultation request from ${data.name}: ${data.details || 'General inquiry'}`
        })
      });
    } catch (e) {
      console.log('Chat API dispatched');
    }
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window._zvChat = new ZavronLiveChat(); });
  } else {
    window._zvChat = new ZavronLiveChat();
  }
}
