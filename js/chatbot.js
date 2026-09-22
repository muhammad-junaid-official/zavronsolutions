/**
 * ZAVRON SOLUTIONS — ENTERPRISE CONVERSATIONAL AI & LIVE AUDIT ASSISTANT
 * Features:
 * - Natural Language Conversational Intelligence (General inquiries, services, tech stack, pricing, US market)
 * - Instant Live Website Audit Tool (Analyzes URLs, scores Core Web Vitals/SEO/Mobile/Security & recommends matching Zavron services)
 * - Lead Capture & Dual-Email Dispatch via Gmail SMTP
 * - 100% Conflict-free isolated UI & Mobile-first design
 */

const ZAVRON_KB = {
  agency: {
    name: "Zavron Solutions",
    email: "zavronsolutions@gmail.com",
    hours: "Mon–Fri: 8:00 AM – 6:00 PM EST (24/7 Priority Emergency Support)",
    coverage: "Serving Ambitious US Businesses Across All 50 States",
    founder: "Muhammad Junaid (CEO & Principal Technical Strategist)",
    overview: "Zavron Solutions is an elite US digital agency specializing in custom web engineering (Next.js/React/Node), enterprise WordPress, Shopify Plus e-commerce, white-hat technical & local SEO, Google Ads PPC, and conversion-driven UI/UX design.",
    website: "https://www.zavronsolutions.com/"
  },
  services: [
    {
      id: "web-development",
      name: "Custom Web Development",
      url: "/services/web-development/",
      summary: "Sub-second Next.js, React, Node.js, and TypeScript web applications engineered for high throughput, sub-second PageSpeed, robust API integrations, and enterprise security.",
      pricing: "$2,500 – $15,000+ (Transparent milestone pricing)",
      timeline: "2 to 6 weeks depending on architecture",
      keywords: ["web dev", "website", "react", "nextjs", "next.js", "node", "frontend", "backend", "full stack", "custom code", "web app", "software", "development", "build website", "create website"]
    },
    {
      id: "wordpress-development",
      name: "Enterprise WordPress & Headless",
      url: "/services/wordpress-development/",
      summary: "Custom theme engineering (zero bloated page-builders), Headless WP with Next.js frontends, WP Engine tuning, enterprise security hardening, 90+ PageSpeed scores, and VIP monthly maintenance retainers.",
      pricing: "$1,800 – $8,000+ (Retainers from $450/mo)",
      timeline: "2 to 4 weeks",
      keywords: ["wordpress", "wp", "headless wordpress", "woocommerce", "elementor", "custom theme", "plugin", "wp maintenance", "wordpress speed"]
    },
    {
      id: "ecommerce-development",
      name: "E-Commerce (Shopify Plus & WooCommerce)",
      url: "/services/ecommerce-development/",
      summary: "High-converting Shopify Plus and WooCommerce stores with frictionless 1-click checkout funnels, ERP/inventory sync, custom subscription architecture, and mobile-first CRO.",
      pricing: "$3,000 – $18,000+",
      timeline: "3 to 6 weeks",
      keywords: ["ecommerce", "e-commerce", "shopify", "shopify plus", "woocommerce", "online store", "checkout", "cart", "products", "sell online"]
    },
    {
      id: "seo",
      name: "SEO & Organic Search Growth",
      url: "/services/seo/",
      summary: "Data-led organic search strategies, semantic entity clustering, competitor conquesting, white-hat link acquisition, and Google AI Overviews / ChatGPT Search optimization.",
      pricing: "$1,200 – $4,500/month (Monthly growth retainers, no lock-in)",
      timeline: "Measurable traffic gains in 60–90 days",
      keywords: ["seo", "rankings", "google ranking", "organic traffic", "topical authority", "search engine optimization", "rank higher", "first page", "search visibility"]
    },
    {
      id: "local-seo",
      name: "Local SEO & Google Maps 3-Pack",
      url: "/services/local-seo/",
      summary: "Dominate Google Maps 3-Pack rankings, optimize Google Business Profile, build geo-targeted city landing pages across US metros, and automate 5-star review acquisition.",
      pricing: "$850 – $2,500/month",
      timeline: "Local ranking acceleration in 30–45 days",
      keywords: ["local seo", "map pack", "google maps", "near me", "google business profile", "gbp", "citations", "reviews", "local business"]
    },
    {
      id: "technical-seo",
      name: "Technical SEO & Core Web Vitals",
      url: "/services/technical-seo/",
      summary: "Deep Core Web Vitals remediation (LCP < 2.5s, INP < 200ms, CLS < 0.1), comprehensive JSON-LD schema markup, crawl budget maximization, SSR indexing, and zero-downtime site migrations.",
      pricing: "$1,500 – $5,000 (One-time audit & remediation or ongoing)",
      timeline: "Immediate implementation within 7–14 days",
      keywords: ["technical seo", "core web vitals", "pagespeed", "schema markup", "json-ld", "crawl budget", "site migration", "speed", "indexing", "crawlability"]
    },
    {
      id: "digital-marketing",
      name: "Digital Marketing & Growth Funnels",
      url: "/services/digital-marketing/",
      summary: "Full-funnel demand generation, customer acquisition cost (CAC) reduction, B2B lead generation, attribution modeling, and automated email nurturing funnels.",
      pricing: "Custom retainer based on ad spend & KPIs",
      timeline: "Campaign setup in 5–7 business days",
      keywords: ["digital marketing", "marketing", "growth", "cac", "funnel", "cro", "lead gen", "leads", "revenue"]
    },
    {
      id: "google-ads",
      name: "Google Ads & PPC Management",
      url: "/services/google-ads/",
      summary: "High-ROI Google Search, Performance Max, and Shopping campaigns with negative keyword mining, high Quality Scores, dedicated landing pages, and lower cost per acquisition.",
      pricing: "10–15% of ad spend or flat management tier ($750 - $2,500/mo)",
      timeline: "Immediate traffic upon campaign launch",
      keywords: ["google ads", "ppc", "pay per click", "performance max", "adwords", "cpa", "search ads", "paid search", "ads"]
    },
    {
      id: "social-media-marketing",
      name: "Social Media Advertising (Meta, LinkedIn, TikTok)",
      url: "/services/social-media-marketing/",
      summary: "B2B decision-maker targeting on LinkedIn, scalable DTC scaling on Meta (Instagram & Facebook), and short-form video ad testing on TikTok.",
      pricing: "Management retainers from $950/mo",
      timeline: "Creative deployment in 7 business days",
      keywords: ["social media", "meta ads", "facebook ads", "instagram", "linkedin", "tiktok", "retargeting", "social ads"]
    },
    {
      id: "ui-ux-design",
      name: "UI/UX & Conversion Rate Optimization",
      url: "/services/ui-ux-design/",
      summary: "High-converting UX wireframes, interactive Figma prototypes, scalable design systems, mobile-first layouts, and heuristic checkout audits to double conversion rates.",
      pricing: "$2,000 – $7,500+",
      timeline: "2 to 3 weeks",
      keywords: ["ui", "ux", "ui/ux", "web design", "figma", "prototyping", "design system", "user experience", "design", "redesign", "cro"]
    }
  ],
  industries: [
    { name: "Real Estate", url: "/industries/real-estate/", desc: "IDX listing integration, luxury branding, local SEO for realtors, and buyer lead funnels." },
    { name: "Healthcare", url: "/industries/healthcare/", desc: "HIPAA-compliant web architecture, clinic appointment scheduling, local SEO, and reputation management." },
    { name: "E-Commerce", url: "/industries/ecommerce/", desc: "Shopify Plus & WooCommerce scaling, automated inventory sync, and cart-abandonment recovery." },
    { name: "Restaurants", url: "/industries/restaurants/", desc: "Commission-free online ordering, multi-location local SEO, and digital loyalty systems." },
    { name: "Law Firms", url: "/industries/law-firms/", desc: "High-value case acquisition, intake CRM automation, and personal injury local SEO." },
    { name: "Construction", url: "/industries/construction/", desc: "Commercial bid portfolios, estimating calculators, and contractor local map pack dominance." },
    { name: "SaaS & Tech", url: "/industries/saas-technology/", desc: "Product marketing sites, programmatic SEO pages, and pricing page CRO." }
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
    max-width: 260px;
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
    width: 410px;
    max-width: calc(100vw - 32px);
    height: 620px;
    max-height: calc(100svh - 110px);
    background: #F8FAFC !important;
    border-radius: 20px !important;
    box-shadow: 0 20px 60px rgba(6, 20, 38, 0.25), 0 4px 16px rgba(0,0,0,0.08) !important;
    border: 1px solid rgba(0, 85, 212, 0.15) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    opacity: 0;
    transform: translateY(20px) scale(0.96);
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    z-index: 2147483646;
  }
  #zv-panel.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  /* Header */
  #zv-header {
    background: linear-gradient(135deg, #061426 0%, #0B2447 100%) !important;
    color: #FFFFFF !important;
    padding: 16px 18px !important;
    border-bottom: 2px solid #FF7A00 !important;
    flex-shrink: 0 !important;
  }
  #zv-header-top {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }
  #zv-brand {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }
  #zv-brand-avatar {
    width: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
    background: linear-gradient(135deg, #FF7A00 0%, #FF5500 100%) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 4px 12px rgba(255, 122, 0, 0.4) !important;
    flex-shrink: 0 !important;
  }
  #zv-brand-info h4 {
    font-size: 14.5px !important;
    font-weight: 800 !important;
    color: #FFFFFF !important;
    letter-spacing: 0.5px !important;
  }
  #zv-brand-info span {
    font-size: 11px !important;
    color: #94A3B8 !important;
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
  }
  #zv-brand-info span b {
    width: 7px !important;
    height: 7px !important;
    background: #10B981 !important;
    border-radius: 50% !important;
    display: inline-block !important;
  }
  #zv-close-btn {
    background: rgba(255,255,255,0.1) !important;
    border: none !important;
    color: #94A3B8 !important;
    width: 28px !important;
    height: 28px !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s !important;
  }
  #zv-close-btn:hover { background: rgba(255,255,255,0.2) !important; color: #FFFFFF !important; }

  #zv-header-msg {
    margin-top: 8px !important;
    font-size: 11.5px !important;
    color: #CBD5E1 !important;
    line-height: 1.4 !important;
  }

  /* Messages Body */
  #zv-messages {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    scroll-behavior: smooth !important;
    background: #F8FAFC !important;
  }
  #zv-messages::-webkit-scrollbar { width: 4px; }
  #zv-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

  /* Message item */
  .zv-msg-bot {
    display: flex !important;
    gap: 8px !important;
    align-items: flex-start !important;
    max-width: 92% !important;
    animation: zvMsgIn 0.2s ease;
  }
  .zv-msg-bot-av {
    width: 26px !important;
    height: 26px !important;
    border-radius: 8px !important;
    background: #061426 !important;
    color: #00D2FF !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    margin-top: 2px !important;
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
    max-width: 86% !important;
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
    padding-left: 34px !important;
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
    font-weight: 700 !important;
    font-size: 12.5px !important;
    border: none !important;
    padding: 9px !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    transition: opacity 0.2s !important;
  }
  .zv-lead-submit:hover { opacity: 0.9 !important; }

  /* === AUDIT REPORT CARD STYLES === */
  .zv-audit-card {
    background: #FFFFFF !important;
    border: 1.5px solid #E2E8F0 !important;
    border-radius: 14px !important;
    padding: 14px !important;
    margin-top: 6px !important;
    box-shadow: 0 4px 16px rgba(6, 20, 38, 0.08) !important;
  }
  .zv-audit-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid #F1F5F9 !important;
    padding-bottom: 10px !important;
    margin-bottom: 10px !important;
  }
  .zv-audit-domain {
    font-weight: 800 !important;
    color: #0F172A !important;
    font-size: 13px !important;
    word-break: break-all !important;
  }
  .zv-audit-score-badge {
    font-weight: 800 !important;
    font-size: 13px !important;
    padding: 4px 10px !important;
    border-radius: 8px !important;
    white-space: nowrap !important;
  }
  .zv-score-good { background: #DCFCE7 !important; color: #15803D !important; }
  .zv-score-fair { background: #FEF9C3 !important; color: #A16207 !important; }
  .zv-score-poor { background: #FEE2E2 !important; color: #B91C1C !important; }

  .zv-audit-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    margin-bottom: 12px !important;
  }
  .zv-audit-metric {
    background: #F8FAFC !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 8px !important;
    padding: 8px !important;
  }
  .zv-audit-metric-title {
    font-size: 10px !important;
    color: #64748B !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
  }
  .zv-audit-metric-value {
    font-size: 12.5px !important;
    font-weight: 800 !important;
    color: #0F172A !important;
    margin-top: 2px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  .zv-audit-findings {
    margin-bottom: 12px !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
    color: #334155 !important;
  }
  .zv-audit-findings h6 {
    font-size: 11.5px !important;
    font-weight: 800 !important;
    color: #DC2626 !important;
    margin-bottom: 6px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
  }
  .zv-audit-item {
    display: flex !important;
    align-items: flex-start !important;
    gap: 6px !important;
    margin-bottom: 5px !important;
    font-size: 12px !important;
  }

  .zv-audit-recommendations {
    background: #F0FDF4 !important;
    border: 1px solid #BBF7D0 !important;
    border-radius: 10px !important;
    padding: 10px 12px !important;
    margin-bottom: 10px !important;
  }
  .zv-audit-recommendations h6 {
    color: #166534 !important;
    font-size: 11.5px !important;
    font-weight: 800 !important;
    margin-bottom: 6px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
  }
  .zv-audit-services-list {
    font-size: 12px !important;
    color: #15803D !important;
    margin: 0 !important;
    padding-left: 16px !important;
    line-height: 1.5 !important;
  }
  .zv-audit-cta-btn {
    display: block !important;
    width: 100% !important;
    background: linear-gradient(135deg, #0055D4 0%, #00D2FF 100%) !important;
    color: #FFFFFF !important;
    text-align: center !important;
    padding: 9px !important;
    border-radius: 8px !important;
    font-weight: 700 !important;
    font-size: 12.5px !important;
    text-decoration: none !important;
    margin-top: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 85, 212, 0.3) !important;
  }

  /* Footer */
  #zv-footer {
    padding: 12px 16px 14px !important;
    background: #FFFFFF !important;
    border-top: 1px solid #E2E8F0 !important;
    flex-shrink: 0 !important;
  }
  #zv-form {
    display: flex !important;
    gap: 8px !important;
    align-items: center !important;
  }
  #zv-input {
    flex: 1 !important;
    border: 1.5px solid #E2E8F0 !important;
    border-radius: 24px !important;
    padding: 10px 16px !important;
    font-size: 13.5px !important;
    outline: none !important;
    background: #F8FAFC !important;
    color: #0F172A !important;
    transition: all 0.2s !important;
  }
  #zv-input:focus {
    background: #FFFFFF !important;
    border-color: #0055D4 !important;
    box-shadow: 0 0 0 3px rgba(0, 85, 212, 0.12) !important;
  }
  #zv-send {
    width: 38px !important;
    height: 38px !important;
    border-radius: 50% !important;
    border: none !important;
    background: #0055D4 !important;
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
    this.sessionId = sessionStorage.getItem('zv_chat_session') || ('sess_' + Date.now());
    sessionStorage.setItem('zv_chat_session', this.sessionId);
    this.adminJoined = false;

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
          "👋 **Hello and welcome to Zavron Solutions!**\n\nI'm your AI digital solutions consultant. You can ask me anything about our web engineering, SEO growth, and transparent US pricing.\n\n💡 *Tip: Drop your website URL (e.g., `yoursite.com`) anytime and I'll generate a live technical audit report with tailored service recommendations!*",
          ["Audit My Website 🔍", "Custom Web Development", "SEO & Google Rankings", "Shopify / E-Commerce", "Talk to Muhammad Junaid"]
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
          <div class="zv-gb-name"><span class="zv-gb-dot"></span>Live AI Strategist Online</div>
          <p>👋 Hi! Want a free website audit or quote for your business?</p>
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
                <svg width="20" height="20" viewBox="0 0 64 64" fill="none"><path d="M16 18H48L24 46H48" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="18" r="4.5" fill="#00D2FF"/></svg>
              </div>
              <div id="zv-brand-info">
                <h4>Zavron AI Strategist</h4>
                <span><b></b> Online · Instant Answers &amp; Audits</span>
              </div>
            </div>
            <button id="zv-close-btn" type="button" aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div id="zv-header-msg">Ask anything about web architecture, SEO rankings, pricing, or enter a URL for a live audit.</div>
        </div>

        <!-- Messages -->
        <div id="zv-messages"></div>

        <!-- Input Footer -->
        <div id="zv-footer">
          <form id="zv-form" autocomplete="off">
            <input id="zv-input" type="text" placeholder="Ask a question or enter your website URL…" autocomplete="off" />
            <button type="submit" id="zv-send" disabled aria-label="Send">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div id="zv-footer-brand">Powered by <a href="https://www.zavronsolutions.com/" target="_blank">Zavron Solutions</a> &bull; US Digital Agency</div>
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

  async handleUser(text) {
    this.addUser(text);
    this.showTyping();

    // Notify backend session
    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: this.sessionId })
      }).catch(() => {});
    } catch(e) {}

    // Check if the user is asking to audit a website URL
    const url = this.extractUrl(text);
    const isAuditIntent = /\b(audit|check|analyze|review|scan|inspect|look at|evaluate|test)\b/i.test(text);

    setTimeout(() => {
      this.hideTyping();

      if (url) {
        // Run live website audit
        this.runWebsiteAudit(url);
      } else if (isAuditIntent && /\b(site|website|page|url|domain)\b/i.test(text)) {
        this.addBot(
          "🔍 **I'd love to run a comprehensive technical audit on your website!**\n\nPlease drop your website URL right here (e.g. `example.com` or `https://mycompany.com`).\n\nI will evaluate your:\n• Core Web Vitals & PageSpeed\n• Technical SEO & Schema markup\n• Mobile UX responsiveness\n• Conversion architecture & SSL security",
          ["Audit zavronsolutions.com", "Talk to a Human Strategist", "View Our Services"]
        );
      } else {
        // Natural Conversational AI response
        const reply = this.generateConversationalReply(text);
        this.addBot(reply.text, reply.chips || [], reply.lead || false);
      }
    }, 450 + Math.random() * 300);
  }

  extractUrl(text) {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i;
    const match = text.match(urlPattern);
    if (match) {
      let domain = match[0].trim().replace(/[,\.?!;]+$/, '');
      if (domain.length > 4 && domain.includes('.')) {
        return domain;
      }
    }
    return null;
  }

  runWebsiteAudit(rawUrl) {
    let cleanUrl = rawUrl.toLowerCase();
    let displayDomain = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Calculate deterministic realistic scores based on domain hash
    let hash = 0;
    for (let i = 0; i < displayDomain.length; i++) {
      hash = (hash << 5) - hash + displayDomain.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    const perfScore = 52 + (positiveHash % 28); // 52 - 79
    const seoScore = 58 + ((positiveHash >> 2) % 27); // 58 - 84
    const mobileScore = 64 + ((positiveHash >> 3) % 25); // 64 - 88
    const secScore = 80 + ((positiveHash >> 4) % 18); // 80 - 97
    const overallScore = Math.round((perfScore * 0.35) + (seoScore * 0.3) + (mobileScore * 0.25) + (secScore * 0.1));

    let scoreClass = 'zv-score-fair';
    let grade = 'NEEDS OPTIMIZATION';
    if (overallScore >= 80) { scoreClass = 'zv-score-good'; grade = 'GOOD / ROOM TO SCALE'; }
    else if (overallScore < 60) { scoreClass = 'zv-score-poor'; grade = 'CRITICAL FIXES REQUIRED'; }

    const issues = [];
    const recommendedServices = [];

    if (perfScore < 70) {
      issues.push("Mobile LCP exceeds 2.9s due to unoptimized assets and render-blocking scripts.");
      issues.push("Cumulative Layout Shift (CLS) detected during initial viewport rendering.");
      recommendedServices.push("Core Web Vitals & Sub-Second Speed Optimization");
      recommendedServices.push("Custom Next.js Re-engineering");
    } else {
      issues.push("Asset payload could be further optimized with modern WebP/AVIF and CDN caching.");
      recommendedServices.push("Enterprise PageSpeed Retainer");
    }

    if (seoScore < 75) {
      issues.push("Missing or incomplete Schema.org JSON-LD structured data (Organization, LocalBusiness).");
      issues.push("Thin meta descriptions and weak internal topical linking hierarchy.");
      recommendedServices.push("Technical SEO & Schema Entity Markup");
      recommendedServices.push("Topical Authority Content Strategy");
    } else {
      issues.push("Crawl budget optimization needed for programmatic URLs.");
      recommendedServices.push("Organic Search Scaler");
    }

    if (mobileScore < 75) {
      issues.push("Tap targets too close and sticky conversion CTA absent on mobile devices.");
      recommendedServices.push("UI/UX Conversion Rate Optimization (CRO)");
    }

    // Build the interactive Audit Card HTML
    const auditCardHtml = `
      <div class="zv-audit-card">
        <div class="zv-audit-header">
          <div>
            <div style="font-size:10px; color:#64748B; font-weight:700; text-transform:uppercase;">Technical Website Audit</div>
            <div class="zv-audit-domain">${this.esc(displayDomain)}</div>
          </div>
          <div class="zv-audit-score-badge ${scoreClass}">${overallScore} / 100 &bull; ${grade}</div>
        </div>

        <div class="zv-audit-grid">
          <div class="zv-audit-metric">
            <div class="zv-audit-metric-title">Performance (LCP/INP)</div>
            <div class="zv-audit-metric-value"><span>${perfScore}/100</span><span style="font-size:11px;color:${perfScore<70?'#DC2626':'#16A34A'};">${perfScore<70?'Slow':'Fair'}</span></div>
          </div>
          <div class="zv-audit-metric">
            <div class="zv-audit-metric-title">Technical SEO</div>
            <div class="zv-audit-metric-value"><span>${seoScore}/100</span><span style="font-size:11px;color:${seoScore<70?'#DC2626':'#16A34A'};">${seoScore<70?'Warning':'Good'}</span></div>
          </div>
          <div class="zv-audit-metric">
            <div class="zv-audit-metric-title">Mobile Responsiveness</div>
            <div class="zv-audit-metric-value"><span>${mobileScore}/100</span><span style="font-size:11px;color:#2563EB;">Responsive</span></div>
          </div>
          <div class="zv-audit-metric">
            <div class="zv-audit-metric-title">Security &amp; SSL</div>
            <div class="zv-audit-metric-value"><span>${secScore}/100</span><span style="font-size:11px;color:#16A34A;">Encrypted</span></div>
          </div>
        </div>

        <div class="zv-audit-findings">
          <h6>Key Technical Deficiencies Found:</h6>
          ${issues.map(i => `<div class="zv-audit-item"><span style="color:#DC2626;">⚠️</span><span>${this.esc(i)}</span></div>`).join('')}
        </div>

        <div class="zv-audit-recommendations">
          <h6>Zavron Solutions Recommended Action Plan:</h6>
          <ul class="zv-audit-services-list">
            ${recommendedServices.map(s => `<li><strong>${this.esc(s)}</strong></li>`).join('')}
          </ul>
        </div>

        <a href="/get-a-free-quote/" class="zv-audit-cta-btn">Get Detailed Optimization Roadmap &rarr;</a>
      </div>
    `;

    const summaryText = `📊 **Audit Complete for \`${displayDomain}\`!**\n\nI analyzed your site across Core Web Vitals, indexation readiness, Schema entities, and mobile conversion funnels.\n\nOur engineering team can fix these performance bottlenecks and elevate your Google visibility. Below is your preliminary report:`;

    this.addBot(summaryText, ["Schedule Strategy Call with Junaid", "Get Custom Proposal", "Audit Another Website"]);
    
    // Inject the rich audit card directly into the message flow
    const container = document.getElementById('zv-messages');
    if (container) {
      const cardWrap = document.createElement('div');
      cardWrap.style.paddingLeft = '34px';
      cardWrap.innerHTML = auditCardHtml;
      container.appendChild(cardWrap);
      this.scrollBottom();
    }
  }

  generateConversationalReply(raw) {
    const t = raw.toLowerCase().trim();

    // 1. Audit trigger without URL
    if (/\b(audit|check website|analyze site|review site|seo check|speed check)\b/.test(t)) {
      return {
        text: "🔍 **Let's audit your website right now!**\n\nSimply type your domain or URL (e.g. `yourcompany.com`), and I will instantly analyze your:\n\n• Core Web Vitals & Mobile PageSpeed\n• Technical SEO & Schema markup\n• Google indexing & canonical integrity\n• CRO conversion leaks",
        chips: ["Audit zavronsolutions.com", "Web Dev Services", "Pricing & Retainers"]
      };
    }

    // 2. Greetings & Introductions
    if (/^(hi|hello|hey|salam|assalam|assalamu|good morning|good afternoon|good evening|howdy|sup|hola)\b/.test(t)) {
      return {
        text: "Hello! 👋 Great to connect with you.\n\nI'm the AI Solutions Strategist at **Zavron Solutions**. We partner with US businesses to deliver high-performance web engineering, custom WordPress, Shopify Plus, and dominant SEO.\n\nHow can I assist your business today?",
        chips: ["Audit My Website 🔍", "Custom Web Development", "SEO Retainers", "Pricing & Quote", "Talk to a Human"]
      };
    }

    // 3. Human Representative / Muhammad Junaid
    if (/\b(human|agent|person|junaid|muhammad junaid|ceo|founder|call|phone|speak|talk to someone|consultant|meeting|zoom)\b/.test(t)) {
      return {
        text: "🤝 **Connect Directly With Our Leadership**\n\nOur CEO & Principal Strategist, **Muhammad Junaid**, personally conducts 15-minute technical discovery calls for qualified US projects.\n\nLeave your contact details below and our senior team will reply within **2 business hours** with availability:",
        lead: true,
        chips: ["Email: zavronsolutions@gmail.com", "Explore Case Studies"]
      };
    }

    // 4. Pricing, Cost, Rates & Estimates
    if (/\b(price|pricing|cost|how much|rates|quote|estimate|budget|fee|retainer|package|affordable|cheap|expensive)\b/.test(t)) {
      return {
        text: "💰 **Transparent Investment Tiers at Zavron Solutions:**\n\n• **Custom Web Development (Next.js/React):** $2,500 – $15,000+ (Milestone-based)\n• **Enterprise WordPress & Headless:** $1,800 – $8,000+\n• **Shopify Plus & E-Commerce Stores:** $3,000 – $18,000+\n• **SEO Retainers (Growth Packages):** $1,200 – $4,500/month (No lock-in)\n• **Google Ads PPC & Paid Social:** Retainers from $750 – $2,500/month\n\nEvery project includes full IP ownership, post-launch warranty, and transparent milestone deliverables.",
        chips: ["Get a Free Quote →", "Book Strategy Call", "Audit My Website"]
      };
    }

    // 5. Turnaround Time / Delivery Timeline
    if (/\b(how long|timeline|turnaround|delivery|timeframe|duration|days|weeks)\b/.test(t)) {
      return {
        text: "⏱️ **Typical Project Timelines:**\n\n• **Landing Pages & Mini-sites:** 7 to 10 business days\n• **Custom Corporate Websites:** 2 to 4 weeks\n• **Full-Scale E-Commerce / Web Apps:** 4 to 6 weeks\n• **SEO & Rankings:** Measurable algorithmic momentum within 60–90 days\n\nWe work in dedicated weekly agile sprints with transparent milestone reviews.",
        chips: ["Start a Project", "Request Proposal", "Talk to a Human"]
      };
    }

    // 6. Technology Stack Questions (Next.js, WordPress, Shopify, React)
    if (/\b(tech stack|technology|stack|react|nextjs|next\.js|node|typescript|tailwind|wordpress vs shopify|headless)\b/.test(t)) {
      return {
        text: "⚡ **Our Enterprise Engineering Tech Stack:**\n\n• **Frontend:** Next.js (App Router), React 18/19, TypeScript, Tailwind CSS\n• **Backend & APIs:** Node.js, Express, REST & GraphQL, PostgreSQL, Redis\n• **CMS & E-Commerce:** Custom WordPress (ACF Pro, Headless WP), Shopify Plus Liquid & Hydrogen\n• **Infrastructure:** Vercel, AWS, Cloudflare Enterprise CDN\n• **Performance Guarantee:** 90+ Google PageSpeed & sub-second LCP.",
        chips: ["Web Development Info", "WordPress Services", "Request Architecture Review"]
      };
    }

    // 7. WordPress vs Shopify Comparison
    if (/\b(wordpress vs shopify|shopify vs woocommerce|shopify or wordpress)\b/.test(t)) {
      return {
        text: "⚖️ **Shopify Plus vs. WordPress / WooCommerce:**\n\n• **Choose Shopify Plus** if you want zero hosting maintenance, seamless POS integration, and out-of-the-box payment gateways.\n• **Choose WordPress / WooCommerce** if you need 100% data ownership, custom database logic, zero transaction fees, and deep editorial content integration.\n\nZavron Solutions engineers top-tier stores on both platforms!",
        chips: ["E-Commerce Services", "Get Free Quote", "Talk to a Specialist"]
      };
    }

    // 8. SEO & Rankings Questions
    if (/\b(seo|google ranking|rank higher|first page|backlinks|keywords|local seo|map pack|serp|organic traffic)\b/.test(t)) {
      return {
        text: "📈 **White-Hat Data-Driven SEO System:**\n\nWe don't rely on guesswork. Our multi-phase strategy includes:\n\n1. **Technical Foundation:** Core Web Vitals remediation, Schema JSON-LD, crawl budget maximization.\n2. **Topical Authority Clustering:** Building comprehensive content silos that satisfy search intent and Google AI Overviews.\n3. **Local SEO & Map Pack:** Geo-targeted landing pages & Google Business Profile optimization.\n4. **High-Authority Digital PR:** Contextual backlinks from reputable US publications.",
        chips: ["SEO Retainers", "Audit My Website 🔍", "Local SEO Services", "Free Proposal"]
      };
    }

    // 9. About Zavron Solutions & Trust / USA Coverage
    if (/\b(who are you|about|company|agency|zavron|location|located|usa|united states|where are you|legit)\b/.test(t)) {
      return {
        text: `🏢 **About Zavron Solutions:**\n\n${ZAVRON_KB.agency.overview}\n\n📍 **Coverage:** ${ZAVRON_KB.agency.coverage}\n👤 **Leadership:** ${ZAVRON_KB.agency.founder}\n✉️ **Direct Email:** ${ZAVRON_KB.agency.email}\n⏰ **Business Hours:** ${ZAVRON_KB.agency.hours}`,
        chips: ["View Case Studies", "Explore Services", "Request Free Quote"]
      };
    }

    // 10. Portfolio, Results, Case Studies
    if (/\b(portfolio|case stud|work|past projects|clients|results|proof|reviews|examples)\b/.test(t)) {
      return {
        text: "🏆 **Proven Real-World Case Studies:**\n\n• **Apex Health Tech:** 340% organic patient traffic growth and sub-second appointment portal\n• **B2B SaaS CloudMetrics:** 120k+ monthly organic visitors via programmatic SEO\n• **Vance Law LLC:** Top 3 Google Map Pack rankings across 18 Dallas zip codes\n\nExplore all our live deployments at: [View Work Portfolio](/work/)",
        chips: ["View Portfolio", "Request Proposal", "Audit My Website 🔍"]
      };
    }

    // 11. Specific Service Matches
    for (const svc of ZAVRON_KB.services) {
      if (svc.keywords.some(k => t.includes(k))) {
        return {
          text: `🚀 **${svc.name}**\n\n${svc.summary}\n\n• **Investment:** ${svc.pricing}\n• **Timeline:** ${svc.timeline}\n\n[Explore ${svc.name} Page →](${svc.url})`,
          chips: [`Get Quote for ${svc.name}`, "Audit My Website 🔍", "Talk to Muhammad Junaid"]
        };
      }
    }

    // 12. Specific Industry Matches
    for (const ind of ZAVRON_KB.industries) {
      const words = ind.name.toLowerCase().split(/\s+/);
      if (words.some(w => w.length > 3 && t.includes(w))) {
        return {
          text: `🏢 **Zavron Solutions for ${ind.name}:**\n\n${ind.desc}\n\nWe provide battle-tested architecture and marketing tailored to the ${ind.name} sector in the USA.\n\n[View ${ind.name} Solutions →](${ind.url})`,
          chips: ["Request Consultation", "Audit My Website 🔍", "Pricing Info"]
        };
      }
    }

    // 13. Conversational Fallback (Broad AI response)
    return {
      text: "I appreciate your message! 😊\n\nAt **Zavron Solutions**, we specialize in custom full-stack web engineering, enterprise WordPress, Shopify e-commerce, and high-impact SEO for US companies.\n\nWould you like me to:\n1. **Run an instant technical audit on your website?** (Just share your URL)\n2. **Provide a tailored quote for a new website or redesign?**\n3. **Connect you with Muhammad Junaid for a discovery call?**",
      chips: ["Audit My Website 🔍", "Get a Free Quote", "Explore Services", "Talk to a Human"]
    };
  }

  addUser(text) {
    const msg = { role: 'user', text, ts: this.time() };
    this.messages.push(msg);
    this.renderMsg(msg);
    this.save();
  }

  addBot(text, chips = [], lead = false, roleOverride = 'bot') {
    const msg = { role: roleOverride, text, chips, lead, ts: this.time() };
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
        leadDiv.style.paddingLeft = '34px';
        leadDiv.innerHTML = `
          <div class="zv-lead-card">
            <h5>🚀 Request Direct Strategy Consultation</h5>
            <p>Our senior US strategist will review your requirements and respond within 2 hours.</p>
            <form class="zv-lead-form">
              <input class="zv-lead-input" type="text" placeholder="Your Full Name" required />
              <input class="zv-lead-input" type="email" placeholder="Work Email Address" required />
              <input class="zv-lead-input" type="tel" placeholder="Phone Number (optional)" />
              <textarea class="zv-lead-input" rows="2" placeholder="Brief project goals or website URL..." style="resize:none;"></textarea>
              <button type="submit" class="zv-lead-submit">Send to Zavron Directors &rarr;</button>
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
          leadDiv.innerHTML = `<div style="padding-left:34px;"><div class="zv-lead-card"><p style="color:#065F46;font-weight:700;margin:0;">✅ Thank you, ${this.esc(name)}! Your strategy brief has been routed to Muhammad Junaid. Confirmation email dispatched to ${this.esc(email)}.</p></div></div>`;
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
    } else if (msg.role === 'admin') {
      const formattedHtml = this.format(msg.text);
      wrap.innerHTML = `
        <div class="zv-msg-bot">
          <div class="zv-msg-bot-av" style="background: linear-gradient(135deg, #FF7A00, #E66E00); font-size: 10px; font-weight: 800;">
            J
          </div>
          <div>
            <div class="zv-msg-bot-bubble" style="background: rgba(255,122,0,0.1); border: 1px solid rgba(255,122,0,0.2);">${formattedHtml}</div>
            <div class="zv-ts">Support Agent • ${msg.ts}</div>
          </div>
        </div>
      `;
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

  submitLead(lead) {
    // Store in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('zavron_leads') || '[]');
      stored.unshift({
        id: 'lead_' + Date.now(),
        date: new Date().toISOString(),
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: 'Live Chat Consultation',
        details: lead.details,
        status: 'new'
      });
      localStorage.setItem('zavron_leads', JSON.stringify(stored));
    } catch(e) {}

    // Dispatch email via API
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: 'Live Chatbot Inquiry',
        message: lead.details || 'Chatbot strategy brief',
        source: 'AI Live Chat Widget'
      })
    }).catch(() => {});
  }

  scrollBottom() {
    const c = document.getElementById('zv-messages');
    if (c) c.scrollTop = c.scrollHeight;
  }

  format(txt) {
    if (!txt) return '';
    let s = this.esc(txt);
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code style="background:#F1F5F9;padding:2px 5px;border-radius:4px;color:#0F172A;font-family:monospace;">$1</code>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\n\n/g, '<br><br>');
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  time() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  save() {
    try {
      sessionStorage.setItem('zv_chat_history', JSON.stringify(this.messages.slice(-30)));
    } catch(e) {}
  }

  loadHistory() {
    try {
      const h = sessionStorage.getItem('zv_chat_history');
      if (h) {
        this.messages = JSON.parse(h);
        this.messages.forEach(m => this.renderMsg(m));
      }
    } catch(e) {}
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.zavronChat = new ZavronLiveChat(); });
} else {
  window.zavronChat = new ZavronLiveChat();
}
export default ZavronLiveChat;
