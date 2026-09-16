/**
 * ZAVRON SOLUTIONS — PROFESSIONAL LIVE CHAT WIDGET
 * Styled like Intercom/Tidio — works on all pages without separate CSS file
 * Brand: Dark Navy #061426, Cyan #00D2FF, Orange #FF7A00
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
    { id: "web-development", name: "Custom Web Development", url: "/services/web-development/", summary: "High-performance Next.js, React, and Node.js web applications engineered for sub-second load times, scalability, and enterprise security.", keywords: ["web dev", "website", "react", "nextjs", "node", "frontend", "backend", "full stack", "custom code", "web application", "software"] },
    { id: "wordpress-development", name: "Enterprise WordPress", url: "/services/wordpress-development/", summary: "Custom WordPress themes, headless WordPress (WP + Next.js), enterprise security hardening, 90+ PageSpeed scores, and ongoing maintenance retainers.", keywords: ["wordpress", "wp", "headless wordpress", "woocommerce", "elementor", "custom theme", "plugin", "wp maintenance"] },
    { id: "ecommerce-development", name: "E-Commerce Development", url: "/services/ecommerce-development/", summary: "Shopify Plus and WooCommerce engineering, custom ERP/CRM integrations, checkout funnel CRO, multi-currency architecture, and mobile commerce.", keywords: ["ecommerce", "e-commerce", "shopify", "shopify plus", "woocommerce", "online store", "checkout", "cart"] },
    { id: "seo", name: "SEO & Organic Search", url: "/services/seo/", summary: "White-hat organic search strategies, topical authority clustering, entity SEO, Google rankings, competitor conquesting, and measurable ROI.", keywords: ["seo", "rankings", "google ranking", "organic traffic", "topical authority", "search engine optimization", "organic search"] },
    { id: "local-seo", name: "Local SEO & Google Maps", url: "/services/local-seo/", summary: "Dominate Google Maps 3-Pack, optimize Google Business Profile, build geo-targeted pages, consistent NAP citations, and 5-star review acquisition.", keywords: ["local seo", "map pack", "google maps", "near me", "google business profile", "gbp", "citations", "reviews", "local"] },
    { id: "technical-seo", name: "Technical SEO", url: "/services/technical-seo/", summary: "Core Web Vitals (LCP, INP, CLS), JSON-LD Schema markup, crawl budget maximization, SSR JavaScript indexing, and zero-loss site migrations.", keywords: ["technical seo", "core web vitals", "pagespeed", "schema markup", "json-ld", "crawl budget", "site migration", "technical"] },
    { id: "digital-marketing", name: "Digital Marketing & Growth", url: "/services/digital-marketing/", summary: "Omnichannel growth frameworks, customer acquisition cost reduction, B2B lead generation, full-funnel attribution, and conversion rate optimization.", keywords: ["digital marketing", "marketing", "growth", "cac", "funnel", "cro", "conversion rate", "lead gen", "leads"] },
    { id: "google-ads", name: "Google Ads & PPC", url: "/services/google-ads/", summary: "Data-backed Google Search, Performance Max, and Shopping campaigns with negative keyword mining, high Quality Scores, and lower Cost Per Acquisition.", keywords: ["google ads", "ppc", "pay per click", "performance max", "adwords", "cpa", "search ads", "paid search", "ads"] },
    { id: "social-media-marketing", name: "Paid & Organic Social", url: "/services/social-media-marketing/", summary: "High-converting B2B LinkedIn campaigns, DTC Meta/Instagram/Facebook scaling, viral TikTok ad strategies, and multi-touch retargeting sequences.", keywords: ["social media", "meta ads", "facebook ads", "instagram", "linkedin", "tiktok", "retargeting", "social"] },
    { id: "ui-ux-design", name: "UI/UX Design", url: "/services/ui-ux-design/", summary: "Conversion-centric UI/UX design, interactive Figma prototypes, scalable design systems, mobile-first responsive interfaces, and user testing.", keywords: ["ui", "ux", "ui/ux", "web design", "figma", "prototyping", "design system", "user experience", "design"] }
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
  #zv-chat-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif; }
  #zv-chat-root a { color: inherit; }

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
    background: #FFFFFF;
    color: #1E293B;
    padding: 12px 16px;
    border-radius: 14px 14px 2px 14px;
    font-size: 13.5px;
    font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1);
    max-width: 240px;
    line-height: 1.5;
    cursor: pointer;
    animation: zvFadeIn 0.4s ease;
    border: 1px solid rgba(0,0,0,0.06);
    position: relative;
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
    font-weight: 700;
    color: #061426;
    font-size: 13px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  #zv-greeting-bubble .zv-gb-dot {
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    display: inline-block;
    animation: zvPulse 2s ease-in-out infinite;
  }
  #zv-greeting-bubble p {
    color: #475569;
    font-size: 12.5px;
  }

  #zv-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0055D4 0%, #00D2FF 100%);
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(0, 114, 255, 0.45), 0 2px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    position: relative;
    outline: none;
  }
  #zv-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 32px rgba(0,114,255,0.55);
  }
  #zv-btn-icon-chat, #zv-btn-icon-close {
    position: absolute;
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  #zv-btn-icon-close { opacity: 0; transform: rotate(-90deg); }
  #zv-btn.open #zv-btn-icon-chat { opacity: 0; transform: rotate(90deg); }
  #zv-btn.open #zv-btn-icon-close { opacity: 1; transform: rotate(0deg); }

  #zv-notif-dot {
    position: absolute;
    top: 0;
    right: 2px;
    width: 14px;
    height: 14px;
    background: #FF7A00;
    border: 2px solid #fff;
    border-radius: 50%;
    animation: zvPing 1.8s cubic-bezier(0,0,0.2,1) infinite;
  }

  /* === MAIN CHAT PANEL === */
  #zv-panel {
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 380px;
    max-width: calc(100vw - 32px);
    height: 560px;
    max-height: calc(100svh - 120px);
    background: #FFFFFF;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2147483646;
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px) scale(0.97);
    transition: opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1);
  }
  #zv-panel.open {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0) scale(1);
  }

  /* Panel Header — dark brand gradient */
  #zv-header {
    background: linear-gradient(135deg, #061426 0%, #0A2040 100%);
    padding: 18px 18px 50px;
    position: relative;
    flex-shrink: 0;
  }
  #zv-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  #zv-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  #zv-brand-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00D2FF 0%, #0072FF 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 3px rgba(0,210,255,0.25);
    flex-shrink: 0;
  }
  #zv-brand-info h4 {
    color: #FFFFFF;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
  }
  #zv-brand-info span {
    color: #00D2FF;
    font-size: 11.5px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  #zv-brand-info span b {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #10B981;
    border-radius: 50%;
    animation: zvPulse 2s ease-in-out infinite;
  }
  #zv-close-btn {
    background: rgba(255,255,255,0.12);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.8);
    transition: background 0.2s;
  }
  #zv-close-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }

  #zv-header-msg {
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    line-height: 1.55;
  }

  /* Overlapping avatar row */
  #zv-team-avatars {
    position: absolute;
    bottom: -22px;
    left: 18px;
    display: flex;
  }
  .zv-team-av {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    margin-right: -10px;
    background: linear-gradient(135deg, #0055D4, #00D2FF);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  /* === MESSAGE STREAM === */
  #zv-messages {
    flex: 1;
    overflow-y: auto;
    padding: 36px 14px 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
    background: #F8FAFC;
  }
  #zv-messages::-webkit-scrollbar { width: 4px; }
  #zv-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

  /* Bot messages */
  .zv-msg-bot {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    align-self: flex-start;
    max-width: 88%;
    animation: zvMsgIn 0.22s ease;
  }
  .zv-msg-bot-av {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0055D4, #00D2FF);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 13px;
  }
  .zv-msg-bot-bubble {
    background: #FFFFFF;
    color: #1E293B;
    padding: 11px 14px;
    border-radius: 18px 18px 18px 4px;
    font-size: 13.5px;
    line-height: 1.55;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    border: 1px solid #E8EEF4;
  }
  .zv-msg-bot-bubble strong { color: #061426; }
  .zv-msg-bot-bubble a { color: #0072FF; text-decoration: underline; }

  /* User messages */
  .zv-msg-user {
    display: flex;
    justify-content: flex-end;
    align-self: flex-end;
    max-width: 82%;
    animation: zvMsgIn 0.22s ease;
  }
  .zv-msg-user-bubble {
    background: linear-gradient(135deg, #0055D4 0%, #0099DD 100%);
    color: #FFFFFF;
    padding: 11px 14px;
    border-radius: 18px 18px 4px 18px;
    font-size: 13.5px;
    line-height: 1.55;
    box-shadow: 0 3px 10px rgba(0,85,212,0.35);
  }

  /* Timestamp */
  .zv-ts {
    font-size: 10.5px;
    color: #94A3B8;
    margin-top: 3px;
    padding: 0 6px;
  }
  .zv-msg-user .zv-ts { text-align: right; }

  /* Typing indicator */
  #zv-typing {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    align-self: flex-start;
  }
  #zv-typing-av {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0055D4, #00D2FF);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 13px;
  }
  #zv-typing-dots {
    background: #FFFFFF;
    border: 1px solid #E8EEF4;
    border-radius: 18px 18px 18px 4px;
    padding: 12px 16px;
    display: flex;
    gap: 5px;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .zv-dot {
    width: 7px;
    height: 7px;
    background: #0055D4;
    border-radius: 50%;
    animation: zvBounce 1.4s ease-in-out infinite;
    opacity: 0.6;
  }
  .zv-dot:nth-child(2) { animation-delay: 0.15s; }
  .zv-dot:nth-child(3) { animation-delay: 0.3s; }

  /* Quick Replies */
  .zv-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 2px;
    padding-left: 36px;
  }
  .zv-chip {
    background: #EFF6FF;
    border: 1.5px solid #BFDBFE;
    color: #1D4ED8;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .zv-chip:hover {
    background: #DBEAFE;
    border-color: #93C5FD;
    transform: translateY(-1px);
  }

  /* Lead form inside chat */
  .zv-lead-card {
    background: #FFFBF5;
    border: 1.5px solid #FED7AA;
    border-radius: 12px;
    padding: 14px;
    margin-top: 4px;
  }
  .zv-lead-card h5 {
    color: #C2410C;
    font-size: 12.5px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .zv-lead-card p { color: #78350F; font-size: 11.5px; margin-bottom: 10px; }
  .zv-lead-input {
    width: 100%;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 7px;
    padding: 8px 10px;
    font-size: 12.5px;
    color: #1E293B;
    margin-bottom: 7px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .zv-lead-input:focus { border-color: #0055D4; box-shadow: 0 0 0 3px rgba(0,85,212,0.12); }
  .zv-lead-submit {
    width: 100%;
    background: linear-gradient(135deg, #EA580C, #FF7A00);
    color: #FFFFFF;
    border: none;
    padding: 9px;
    font-size: 12.5px;
    font-weight: 700;
    border-radius: 7px;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: inherit;
  }
  .zv-lead-submit:hover { opacity: 0.9; }

  /* === FOOTER / INPUT AREA === */
  #zv-footer {
    padding: 12px 14px;
    background: #FFFFFF;
    border-top: 1px solid #F1F5F9;
    flex-shrink: 0;
  }
  #zv-form {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F8FAFC;
    border: 1.5px solid #E2E8F0;
    border-radius: 24px;
    padding: 6px 6px 6px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  #zv-form:focus-within {
    border-color: #0055D4;
    box-shadow: 0 0 0 3px rgba(0,85,212,0.12);
    background: #FFFFFF;
  }
  #zv-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #1E293B;
    font-size: 13.5px;
    font-family: inherit;
    min-width: 0;
  }
  #zv-input::placeholder { color: #94A3B8; }
  #zv-send {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #0055D4;
    border: none;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  #zv-send:hover:not(:disabled) { background: #0072FF; transform: scale(1.05); }
  #zv-send:disabled { background: #CBD5E1; cursor: not-allowed; }

  #zv-footer-brand {
    text-align: center;
    font-size: 10.5px;
    color: #94A3B8;
    margin-top: 8px;
  }
  #zv-footer-brand a { color: #0055D4; font-weight: 600; text-decoration: none; }

  /* === KEYFRAMES === */
  @keyframes zvFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes zvMsgIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes zvPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.25); opacity: 0.7; } }
  @keyframes zvPing { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
  @keyframes zvBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-5px); opacity: 1; } }

  @media (max-width: 480px) {
    #zv-panel { right: 0; bottom: 0; width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; border-radius: 0; }
    #zv-launcher { bottom: 16px; right: 16px; }
  }
`;

class ZavronLiveChat {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.greetingDismissed = false;
    this.injectStyles();
    this.render();
    this.attachEvents();
    this.loadHistory();

    // Show greeting bubble after 2s if not dismissed before
    if (!sessionStorage.getItem('zv_greeting_dismissed')) {
      setTimeout(() => this.showGreeting(), 2000);
    }

    // Send initial bot greeting if fresh session
    if (this.messages.length === 0) {
      setTimeout(() => {
        this.addBot(
          `👋 <strong>Hello! Welcome to Zavron Solutions.</strong>\n\nI'm your live support agent. How can I help you today?`,
          ["Web Development", "SEO & Rankings", "Shopify / E-Commerce", "Pricing & Quote", "Talk to a Human"]
        );
      }, 600);
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
          <p>👋 Hi! How can we help grow your business today?</p>
        </div>
        <button id="zv-btn" aria-label="Open live chat">
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
                <svg width="20" height="20" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="18" r="4.5" fill="#00D2FF"/></svg>
              </div>
              <div id="zv-brand-info">
                <h4>Zavron Solutions</h4>
                <span><b></b> Online · Instant Replies</span>
              </div>
            </div>
            <button id="zv-close-btn" aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div id="zv-header-msg">Ask us anything about web development, SEO, pricing — we reply instantly.</div>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div id="zv-footer-brand">Powered by <a href="https://zavronsolutions.com">Zavron Solutions</a></div>
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
      g.style.animation = 'zvFadeIn 0.4s ease';
    }
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  open() {
    this.isOpen = true;
    document.getElementById('zv-panel').classList.add('open');
    document.getElementById('zv-btn').classList.add('open');
    document.getElementById('zv-greeting-bubble').style.display = 'none';
    document.getElementById('zv-notif-dot').style.display = 'none';
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
    const delay = 700 + Math.random() * 400;
    setTimeout(() => {
      this.hideTyping();
      const r = this.getReply(text);
      this.addBot(r.text, r.chips, r.lead);
    }, delay);
  }

  getReply(raw) {
    const t = raw.toLowerCase();

    // Greeting
    if (/\b(hi|hello|hey|salam|assalam|good morning|good afternoon|good evening|howdy|sup)\b/.test(t)) {
      return { text: `Hello! 👋 Great to hear from you.\n\nI'm Zavron's live support agent. We help US businesses with:\n\n• **Custom Web Development** (Next.js, React, Node)\n• **Enterprise SEO** & Google Rankings\n• **Shopify Plus / E-Commerce**\n• **Google Ads & Digital Marketing**\n\nWhat can I help you with today?`, chips: ["Web Development", "SEO Services", "Pricing Info", "Talk to a Specialist"] };
    }

    // Human / Speak to Agent
    if (/\b(human|agent|person|specialist|call|phone|email|contact|hire|speak|talk to|reach)\b/.test(t)) {
      return {
        text: `I'd love to connect you with one of our senior strategists! 🤝\n\nPlease leave your details below and a Zavron expert will reach out within **2 business hours**.`,
        lead: true,
        chips: ["Send Email Instead", "Visit Contact Page"]
      };
    }

    // Quote / Pricing
    if (/\b(price|pricing|cost|how much|quote|estimate|rates|budget|package|plan)\b/.test(t)) {
      return {
        text: `💰 **Our Investment Approach**\n\nWe offer transparent, value-driven pricing:\n\n• **Custom Websites** — $2,500–$15,000+\n• **SEO Campaigns** — Monthly retainers based on goals\n• **Shopify / E-Commerce** — Store setup to full enterprise builds\n• **Google Ads PPC** — Setup + percentage of ad spend\n\nEvery project is scoped to your specific goals. Want a free estimate?`,
        chips: ["Get Free Quote →", "Web Dev Pricing", "SEO Pricing", "Talk to a Specialist"]
      };
    }

    // Contact page
    if (/\b(contact|email us|reach us|send message|send email|visit contact)\b/.test(t)) {
      return { text: `You can reach us directly:\n\n📧 **zavronsolutions@gmail.com**\n⏰ Mon–Fri: 8:00 AM – 6:00 PM EST\n\nOr use our **Contact Form**: [Contact Page](/contact/)`, chips: ["Leave Details Here", "Get Free Quote"] };
    }

    // Free Quote
    if (/\b(free quote|get quote|quote wizard|start project|get started|proposal)\b/.test(t)) {
      return { text: `Great! Let's get you a **free custom proposal**. 🚀\n\nOur Quote Wizard takes just 60 seconds and tailors a strategy specifically to your business goals.\n\n👉 [Open Free Quote Wizard](/get-a-free-quote/)\n\nOr leave your details here and our team will reach out:`, lead: true, chips: [] };
    }

    // About Zavron
    if (/\b(who are you|about|company|agency|zavron|where are you|located)\b/.test(t)) {
      return { text: `🌟 **About Zavron Solutions**\n\n${ZAVRON_KB.agency.overview}\n\n📍 ${ZAVRON_KB.agency.coverage}\n✉️ ${ZAVRON_KB.agency.email}\n⏰ ${ZAVRON_KB.agency.hours}\n\nWe've helped 100+ US businesses grow organically and scale their digital platforms.`, chips: ["Explore Services", "View Our Work", "Get a Free Quote"] };
    }

    // Portfolio / Work
    if (/\b(portfolio|work|case stud|example|past|client|result|project)\b/.test(t)) {
      return { text: `📈 **Real Results for Real Businesses**\n\nWe've taken clients from zero to 120,000+ monthly organic visitors, built sub-second Next.js platforms, and driven 3x+ conversion rate improvements.\n\nSee our client transformations: [View Work & Case Studies](/work/)`, chips: ["SEO Case Studies", "Web Dev Projects", "Get a Free Quote"] };
    }

    // Check services
    for (const svc of ZAVRON_KB.services) {
      if (svc.keywords.some(k => t.includes(k))) {
        return {
          text: `🚀 **${svc.name}**\n\n${svc.summary}\n\n[Learn More About ${svc.name}](${svc.url})`,
          chips: ["Get a Quote for This", "See Other Services", "Talk to a Specialist"]
        };
      }
    }

    // Industries
    for (const ind of ZAVRON_KB.industries) {
      const words = ind.name.toLowerCase().split(/\s+/);
      if (words.some(w => w.length > 3 && t.includes(w))) {
        return {
          text: `🏢 **Zavron for ${ind.name}**\n\n${ind.desc}\n\n[View ${ind.name} Solutions](${ind.url})`,
          chips: ["Request Proposal", "Other Industries", "Get Free Quote"]
        };
      }
    }

    // Default fallback
    return {
      text: `Thanks for your message! 😊\n\nZavron Solutions helps US businesses grow through **custom web development, SEO, e-commerce, and paid digital marketing**.\n\nCould you tell me more about what you're looking for? I'm here to help!`,
      chips: ["Web Development", "SEO & Rankings", "Shopify Store", "Pricing Info", "Speak to a Specialist"]
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
    const formattedText = this.format(msg.text);

    if (msg.role === 'bot') {
      wrap.innerHTML = `
        <div class="zv-msg-bot">
          <div class="zv-msg-bot-av">
            <svg width="14" height="14" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <div class="zv-msg-bot-bubble">${formattedText}</div>
            <div class="zv-ts">${msg.ts}</div>
          </div>
        </div>
      `;

      // Lead form
      if (msg.lead) {
        const leadDiv = document.createElement('div');
        leadDiv.style.paddingLeft = '36px';
        leadDiv.innerHTML = `
          <div class="zv-lead-card">
            <h5>🚀 Quick Proposal Request</h5>
            <p>Our senior strategist will reach out within 2 business hours.</p>
            <form class="zv-lead-form">
              <input class="zv-lead-input" type="text" placeholder="Your Full Name" required />
              <input class="zv-lead-input" type="email" placeholder="Email Address" required />
              <input class="zv-lead-input" type="tel" placeholder="Phone (optional)" />
              <textarea class="zv-lead-input" rows="2" placeholder="Briefly describe your project…" style="resize:none;"></textarea>
              <button type="submit" class="zv-lead-submit">Send to Zavron Team →</button>
            </form>
          </div>
        `;
        container.appendChild(wrap);
        container.appendChild(leadDiv);

        const leadForm = leadDiv.querySelector('.zv-lead-form');
        leadForm.addEventListener('submit', e => {
          e.preventDefault();
          const name = leadForm.querySelectorAll('.zv-lead-input')[0].value;
          const email = leadForm.querySelectorAll('.zv-lead-input')[1].value;
          const phone = leadForm.querySelectorAll('.zv-lead-input')[2].value;
          const details = leadForm.querySelectorAll('.zv-lead-input')[3].value;
          leadDiv.innerHTML = `<div style="padding-left:36px;"><div class="zv-lead-card"><p style="color:#065F46;font-weight:700;">✅ Thank you, ${name}! Your inquiry has been sent. We'll be in touch shortly.</p></div></div>`;
          this.submitLead({ name, email, phone, details });
        });

        this.scrollBottom();
        return;
      }

      // Chips
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
    t.innerHTML = `<div id="zv-typing-av"><svg width="14" height="14" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div id="zv-typing-dots"><div class="zv-dot"></div><div class="zv-dot"></div><div class="zv-dot"></div></div>`;
    c.appendChild(t);
    this.scrollBottom();
  }

  hideTyping() {
    const t = document.getElementById('zv-typing');
    if (t) t.remove();
  }

  format(text) {
    return this.esc(text)
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  }

  esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  time() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollBottom() {
    const c = document.getElementById('zv-messages');
    if (c) setTimeout(() => { c.scrollTop = c.scrollHeight; }, 30);
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
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, service: 'Live Chat Inquiry', message: data.details || 'Chat lead submission' })
      });
    } catch (e) {}
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window._zvChat = new ZavronLiveChat(); });
  } else {
    window._zvChat = new ZavronLiveChat();
  }
}
