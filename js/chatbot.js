/**
 * ZAVRON SOLUTIONS — AI LIVE AGENT CHATBOT
 * Comprehensive 100% Knowledge Base of Zavron Solutions
 * Handles conversational queries, service recommendations, quotes, and lead generation
 */

const ZAVRON_KB = {
  agency: {
    name: "Zavron Solutions",
    tagline: "Top-Rated US Digital Solutions & Engineering Agency",
    email: "zavronsolutions@gmail.com",
    hours: "Monday – Friday: 8:00 AM – 6:00 PM EST",
    coverage: "Serving US Businesses Nationwide (New York, California, Texas, Florida, Illinois, and nationwide)",
    overview: "Zavron Solutions is an elite US full-service digital agency specializing in custom web development, enterprise WordPress, Shopify/WooCommerce e-commerce, technical & local SEO, Google Ads PPC, and conversion-driven UI/UX design. We help ambitious brands transform digital presence into measurable revenue."
  },
  services: [
    {
      id: "web-development",
      name: "Custom Web Development",
      url: "/services/web-development/",
      summary: "High-performance bespoke web applications, Next.js / React platforms, Node.js backends, microservices, and sub-second load times engineered for high scalability and security.",
      keywords: ["web dev", "website", "react", "nextjs", "node", "frontend", "backend", "full stack", "custom code", "web application", "software"]
    },
    {
      id: "wordpress-development",
      name: "Enterprise WordPress Development",
      url: "/services/wordpress-development/",
      summary: "Bespoke custom WordPress themes with zero bloat, headless decoupled WordPress (WP + Next.js), enterprise security hardening, speed optimization (90+ Google PageSpeed), and ongoing maintenance retainers.",
      keywords: ["wordpress", "wp", "headless wordpress", "woocommerce", "elementor", "custom theme", "plugin development", "wp maintenance"]
    },
    {
      id: "ecommerce-development",
      name: "E-Commerce Development",
      url: "/services/ecommerce-development/",
      summary: "Shopify Plus and WooCommerce engineering, custom ERP/CRM integrations, checkout funnel CRO, multi-currency architecture, and frictionless mobile commerce.",
      keywords: ["ecommerce", "e-commerce", "shopify", "shopify plus", "woocommerce", "online store", "checkout", "cart abandonment"]
    },
    {
      id: "seo",
      name: "Search Engine Optimization (SEO)",
      url: "/services/seo/",
      summary: "Comprehensive white-hat organic search strategies, topical authority clustering, semantic search, entity SEO, competitor conquesting, and high-ROI keyword rankings.",
      keywords: ["seo", "rankings", "google ranking", "organic traffic", "topical authority", "search engine optimization"]
    },
    {
      id: "local-seo",
      name: "Local SEO & Google Map Pack",
      url: "/services/local-seo/",
      summary: "Dominate Google Maps 3-Pack rankings, Google Business Profile (GBP) optimization, geo-targeted landing pages, consistent NAP citations, and high-velocity 5-star review acquisition.",
      keywords: ["local seo", "map pack", "google maps", "near me", "google business profile", "gbp", "citations", "reviews"]
    },
    {
      id: "technical-seo",
      name: "Technical SEO & Core Web Vitals",
      url: "/services/technical-seo/",
      summary: "Sub-second Core Web Vitals (LCP, INP, CLS), JSON-LD Schema markup, crawl budget maximization, SSR JavaScript indexing, zero-loss site migrations, and hreflang architecture.",
      keywords: ["technical seo", "core web vitals", "pagespeed", "schema markup", "json-ld", "crawl budget", "site migration"]
    },
    {
      id: "ecommerce-seo",
      name: "E-Commerce SEO",
      url: "/services/ecommerce-seo/",
      summary: "Category page SEO hierarchy, product schema rich snippets, faceted navigation canonicalization, internal link equity distribution, and transactional keyword capture.",
      keywords: ["ecommerce seo", "product seo", "category page seo", "faceted navigation", "product schema"]
    },
    {
      id: "digital-marketing",
      name: "Digital Marketing & Growth",
      url: "/services/digital-marketing/",
      summary: "Omnichannel growth frameworks, customer acquisition cost (CAC) reduction, B2B lead gen playbooks, full-funnel attribution, and conversion rate optimization (CRO).",
      keywords: ["digital marketing", "marketing", "growth", "cac", "funnel", "cro", "conversion rate", "lead gen"]
    },
    {
      id: "google-ads",
      name: "Google Ads & PPC Management",
      url: "/services/google-ads/",
      summary: "Data-backed Google Search, Performance Max, and Shopping campaigns. Strict negative keyword mining, high Quality Scores, and lower Cost Per Acquisition (CPA).",
      keywords: ["google ads", "ppc", "pay per click", "performance max", "adwords", "cpa", "search ads", "paid search"]
    },
    {
      id: "social-media-marketing",
      name: "Paid & Organic Social Media",
      url: "/services/social-media-marketing/",
      summary: "High-converting B2B campaigns on LinkedIn, DTC scaling on Meta (Instagram & Facebook), viral TikTok ad strategies, and multi-touch retargeting sequences.",
      keywords: ["social media", "meta ads", "facebook ads", "instagram ads", "linkedin ads", "tiktok ads", "retargeting"]
    },
    {
      id: "ui-ux-design",
      name: "UI/UX Design & Design Systems",
      url: "/services/ui-ux-design/",
      summary: "Conversion-centric UI/UX design, interactive Figma prototypes, scalable design systems, mobile-first responsive interfaces, and continuous user testing.",
      keywords: ["ui", "ux", "ui/ux", "web design", "figma", "prototyping", "design system", "user experience"]
    }
  ],
  industries: [
    { name: "Real Estate & Property Developers", url: "/industries/real-estate/", desc: "IDX integration, luxury listings, local SEO for realtors, and buyer lead funnels." },
    { name: "Healthcare & Medical Practices", url: "/industries/healthcare/", desc: "HIPAA-compliant web dev, patient booking systems, local SEO, and clinic reputation management." },
    { name: "E-Commerce & Retail Brands", url: "/industries/ecommerce/", desc: "High-converting Shopify/WooCommerce, inventory sync, personalized product recommendations." },
    { name: "Restaurants & Hospitality", url: "/industries/restaurants/", desc: "Direct commission-free online ordering, multi-location local SEO, table booking UX." },
    { name: "Law Firms & Attorneys", url: "/industries/law-firms/", desc: "High-value case acquisition, intake automation, legal thought leadership, personal injury SEO." },
    { name: "Construction & Commercial Contractors", url: "/industries/construction/", desc: "Commercial portfolios, estimating calculators, roofing/HVAC local SEO, commercial RFP leads." },
    { name: "SaaS & Technology Companies", url: "/industries/saas-technology/", desc: "Product marketing sites, PLG onboarding UX, programmatic technical SEO, pricing page CRO." },
    { name: "Professional & Financial Services", url: "/industries/professional-services/", desc: "Authority-building portals for consultants, accountants, wealth advisors, and executive search." },
    { name: "Small Businesses", url: "/industries/small-business/", desc: "Cost-effective, rapid turnaround websites with out-of-the-box local search domination." }
  ],
  pricingAndProcess: {
    process: "1. Discovery & Strategic Audit -> 2. Architecture & Wireframing -> 3. Agile Sprints -> 4. Rigorous QA & Speed Hardening -> 5. Launch & Ongoing ROI Growth.",
    quote: "We offer customized, transparent pricing based on your project goals. You can generate an instant estimate using our interactive Quote Wizard at /get-a-free-quote/ or request a custom proposal directly here!",
    timeline: "Standard web projects typically take 2-4 weeks, while complex enterprise applications or full re-platforms take 6-10 weeks."
  }
};

class ZavronChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.unreadCount = 0;
    this.hasGreeted = false;
    this.init();
  }

  init() {
    // Inject chat widget HTML into document if not present
    if (!document.getElementById('zavronChatRoot')) {
      this.renderWidget();
    }
    this.attachEvents();
    this.loadState();

    // Auto trigger initial greeting if new visitor after 2.5 seconds
    if (this.messages.length === 0) {
      setTimeout(() => {
        this.addBotMessage(
          `👋 **Hello & Welcome to Zavron Solutions!**\n\nI'm your **Live AI Agent**. I can help you with:\n• Custom Web & App Development\n• Technical & Local SEO\n• E-Commerce & Shopify Plus\n• Free Project Estimates & Pricing\n\nHow can I help grow your business today?`,
          [
            "Tell me about Web Development",
            "How does your SEO work?",
            "Get a Free Quote",
            "Speak to a Specialist"
          ]
        );
      }, 1500);
    }
  }

  renderWidget() {
    // Inject chatbot.css if not present
    if (!document.querySelector('link[href*="chatbot.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/chatbot.css';
      document.head.appendChild(link);
    }

    const root = document.createElement('div');
    root.id = 'zavronChatRoot';
    root.innerHTML = `
      <!-- Floating Launcher Button -->
      <div class="zavron-chat-launcher" id="zavronChatLauncher" aria-label="Open Live Chat">
        <div class="zavron-chat-badge-prompt" id="zavronChatPrompt">
          <span class="zavron-chat-badge-dot"></span>
          <span>Chat with Zavron Live Agent</span>
        </div>
        <button class="zavron-chat-btn" id="zavronChatToggle" aria-haspopup="dialog">
          <div class="zavron-chat-ping"></div>
          <!-- Chat Icon -->
          <svg class="icon-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <!-- Close Icon -->
          <svg class="icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Chat Window -->
      <div class="zavron-chat-window" id="zavronChatWindow" role="dialog" aria-modal="true" aria-labelledby="zavronAgentTitle">
        <!-- Header -->
        <div class="zavron-chat-header">
          <div class="zavron-chat-agent-info">
            <div class="zavron-chat-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              <div class="zavron-chat-avatar-status" title="Online"></div>
            </div>
            <div class="zavron-chat-meta">
              <h4 id="zavronAgentTitle">Zavron Live Agent</h4>
              <span>● Online • Instant Replies</span>
            </div>
          </div>
          <div class="zavron-chat-header-actions">
            <button class="zavron-chat-icon-btn" id="zavronChatMinimize" title="Minimize Chat" aria-label="Minimize Chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat Stream -->
        <div class="zavron-chat-body" id="zavronChatBody">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Input Box -->
        <div class="zavron-chat-footer">
          <form class="zavron-chat-form" id="zavronChatForm">
            <input
              type="text"
              id="zavronChatInput"
              class="zavron-chat-input"
              placeholder="Ask anything about our services..."
              autocomplete="off"
            />
            <button type="submit" class="zavron-chat-send-btn" id="zavronSendBtn" aria-label="Send Message" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  attachEvents() {
    const launcher = document.getElementById('zavronChatLauncher');
    const toggleBtn = document.getElementById('zavronChatToggle');
    const minimizeBtn = document.getElementById('zavronChatMinimize');
    const prompt = document.getElementById('zavronChatPrompt');
    const form = document.getElementById('zavronChatForm');
    const input = document.getElementById('zavronChatInput');
    const sendBtn = document.getElementById('zavronSendBtn');

    toggleBtn.addEventListener('click', () => this.toggleChat());
    if (prompt) prompt.addEventListener('click', () => this.toggleChat(true));
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => this.toggleChat(false));

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      sendBtn.disabled = true;
      this.handleUserMessage(text);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat(false);
      }
    });
  }

  toggleChat(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    const windowEl = document.getElementById('zavronChatWindow');
    const toggleBtn = document.getElementById('zavronChatToggle');
    const prompt = document.getElementById('zavronChatPrompt');

    if (this.isOpen) {
      windowEl.classList.add('is-open');
      toggleBtn.classList.add('is-active');
      if (prompt) prompt.style.display = 'none';
      setTimeout(() => {
        document.getElementById('zavronChatInput').focus();
        this.scrollToBottom();
      }, 100);
    } else {
      windowEl.classList.remove('is-open');
      toggleBtn.classList.remove('is-active');
    }
  }

  handleUserMessage(text) {
    this.addUserMessage(text);
    this.showTyping();

    // Natural bot response delay
    setTimeout(() => {
      this.hideTyping();
      const response = this.computeBotResponse(text);
      this.addBotMessage(response.text, response.chips, response.leadForm);
    }, 700 + Math.random() * 400);
  }

  computeBotResponse(rawInput) {
    const text = rawInput.toLowerCase();

    // 1. GREETING
    if (/(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(text)) {
      return {
        text: `Hello! 👋 It's great to connect with you. I am Zavron's live AI consultant. How can we help you achieve your digital goals? Are you looking for custom web development, ranking on Google with SEO, or an e-commerce platform?`,
        chips: ["Explore Web Development", "SEO & Organic Rankings", "Shopify & E-Commerce", "Get a Free Quote"]
      };
    }

    // 2. LEAD / SPEAK TO SPECIALIST / HUMAN
    if (/(human|specialist|call me|consultant|talk to someone|agent|phone|contact you|hire|meeting|schedule)\b/.test(text)) {
      return {
        text: `I'd be delighted to connect you directly with one of our Senior Digital Strategists! You can leave your contact info below, email us directly at **zavronsolutions@gmail.com**, or use our [Get a Free Quote](/get-a-free-quote/) form.`,
        leadForm: true,
        chips: ["Email Zavron Directly", "Use Quote Wizard"]
      };
    }

    // 3. QUOTE / PRICING / COST / TIMELINE
    if (/(quote|price|pricing|cost|how much|estimate|timeline|rates|budget)\b/.test(text)) {
      return {
        text: `💰 **Transparent, Value-Driven Investment**\n\nAt Zavron Solutions, we tailor solutions for ambitious businesses:\n• **Custom Websites & Web Apps**: typically $2,500 – $15,000+ depending on complexity.\n• **High-Impact SEO Campaigns**: Monthly retainers focused on measurable organic ROI.\n• **Shopify / E-Commerce**: Tailored from store setup to enterprise customizations.\n\nYou can get an instant interactive estimate in 60 seconds with our [Free Quote Wizard](/get-a-free-quote/)!`,
        chips: ["Launch Quote Wizard", "Leave My Contact Info", "Tell Me About Timelines"]
      };
    }

    // 4. CHECK SPECIFIC SERVICES
    for (const service of ZAVRON_KB.services) {
      const match = service.keywords.some(k => text.includes(k));
      if (match) {
        return {
          text: `🚀 **${service.name}**\n\n${service.summary}\n\n👉 Learn more about our technical methodology: [${service.name} Overview](${service.url})`,
          chips: ["Get a Quote for this", "Case Studies & Work", "Other Services", "Speak to a Specialist"]
        };
      }
    }

    // 5. CHECK INDUSTRIES
    for (const ind of ZAVRON_KB.industries) {
      if (text.includes(ind.name.toLowerCase().split(' ')[0]) || text.includes(ind.name.toLowerCase().split(' ')[1] || '')) {
        return {
          text: `🏢 **Zavron for ${ind.name}**\n\n${ind.desc}\n\nWe build custom solutions engineered specifically for US industry compliance, high-value client acquisition, and conversion. View our vertical playbook: [${ind.name} Solutions](${ind.url})`,
          chips: ["Request Industry Proposal", "Explore Other Industries", "Get a Free Quote"]
        };
      }
    }

    // 6. WHO ARE YOU / ABOUT US
    if (/(who are you|about zavron|about us|company|where are you located|location|agency)\b/.test(text)) {
      return {
        text: `🌟 **About Zavron Solutions**\n\n${ZAVRON_KB.agency.overview}\n\n📍 **Coverage**: ${ZAVRON_KB.agency.coverage}\n✉️ **Direct Email**: ${ZAVRON_KB.agency.email}\n⏰ **Hours**: ${ZAVRON_KB.agency.hours}\n\nRead our full story: [About Zavron Solutions](/about-us/)`,
        chips: ["Explore Services", "View Portfolio", "Get a Free Quote"]
      };
    }

    // 7. PORTFOLIO / CASE STUDIES / RESULTS
    if (/(portfolio|work|case studies|examples|past work|clients|results)\b/.test(text)) {
      return {
        text: `📈 **Measurable Client Success**\n\nWe take pride in engineering real business results for US brands — from taking clients from 0 to 120k+ monthly organic visitors to delivering sub-second Next.js web applications.\n\nExplore our client transformations: [View Our Work & Case Studies](/work/)`,
        chips: ["Web Dev Projects", "SEO Case Studies", "Get a Free Quote"]
      };
    }

    // 8. DEFAULT INTELLIGENT FALLBACK
    return {
      text: `Thanks for asking! Zavron Solutions provides end-to-end digital solutions for US businesses — from **Custom Next.js & WordPress Development** to **Enterprise SEO** and **Paid Ads**.\n\nCould you clarify what you have in mind? Or would you prefer to receive a custom proposal tailored to your specifications?`,
      chips: ["Web Development", "SEO Optimization", "Get a Free Quote", "Connect with an Expert"]
    };
  }

  addUserMessage(text) {
    const msg = { sender: 'user', text, time: this.getTime() };
    this.messages.push(msg);
    this.appendMessageEl(msg);
    this.saveState();
  }

  addBotMessage(text, chips = [], leadForm = false) {
    const msg = { sender: 'bot', text, chips, leadForm, time: this.getTime() };
    this.messages.push(msg);
    this.appendMessageEl(msg);
    this.saveState();
  }

  showTyping() {
    const body = document.getElementById('zavronChatBody');
    if (!body || document.getElementById('zavronTyping')) return;
    const typing = document.createElement('div');
    typing.id = 'zavronTyping';
    typing.className = 'zavron-typing-indicator';
    typing.innerHTML = `
      <div class="zavron-typing-dot"></div>
      <div class="zavron-typing-dot"></div>
      <div class="zavron-typing-dot"></div>
    `;
    body.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping() {
    const typing = document.getElementById('zavronTyping');
    if (typing) typing.remove();
  }

  appendMessageEl(msg) {
    const body = document.getElementById('zavronChatBody');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `zavron-msg zavron-msg-${msg.sender}`;

    // Format markdown bold & links
    let formattedText = this.formatMarkdown(msg.text);

    let contentHtml = `
      <div class="zavron-msg-bubble">${formattedText}</div>
      <div class="zavron-msg-time">${msg.time}</div>
    `;

    // Add Lead Capture Form inside Chat if requested
    if (msg.leadForm) {
      contentHtml += `
        <div class="zavron-lead-card">
          <h5>🚀 Request a Quick Proposal</h5>
          <p>Leave your details and a Zavron senior specialist will reach out within 2 business hours.</p>
          <form class="zavron-lead-form">
            <input type="text" placeholder="Your Full Name" required class="lead-name" />
            <input type="email" placeholder="Work Email" required class="lead-email" />
            <input type="tel" placeholder="Phone Number (optional)" class="lead-phone" />
            <textarea placeholder="Briefly describe your project..." rows="2" class="lead-details"></textarea>
            <button type="submit" class="zavron-lead-submit">Send to Zavron Team →</button>
          </form>
        </div>
      `;
    }

    // Add Quick Reply Chips if present
    if (msg.chips && msg.chips.length > 0) {
      contentHtml += `<div class="zavron-chat-chips">`;
      for (const chip of msg.chips) {
        contentHtml += `<button class="zavron-chip-btn" data-text="${chip}">${chip}</button>`;
      }
      contentHtml += `</div>`;
    }

    div.innerHTML = contentHtml;
    body.appendChild(div);

    // Attach click events to chip buttons
    const chipBtns = div.querySelectorAll('.zavron-chip-btn');
    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-text');
        this.handleUserMessage(query);
      });
    });

    // Attach submit event to lead form if present
    const leadFormEl = div.querySelector('.zavron-lead-form');
    if (leadFormEl) {
      leadFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = leadFormEl.querySelector('.lead-name').value;
        const email = leadFormEl.querySelector('.lead-email').value;
        const phone = leadFormEl.querySelector('.lead-phone').value;
        const details = leadFormEl.querySelector('.lead-details').value;

        leadFormEl.innerHTML = `<div style="color:var(--chat-accent-green); font-weight:600; font-size:0.85rem; padding:10px 0;">✓ Thank you ${name}! Your request has been dispatched to our senior strategy team. We will be in touch shortly!</div>`;

        // Send to API
        this.submitLead({ name, email, phone, details, source: 'Chatbot Live Agent' });
      });
    }

    this.scrollToBottom();
  }

  async submitLead(payload) {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          service: 'Live Chatbot Inquiry',
          budget: 'Not Specified',
          message: `Inquiry from Chatbot Live Agent:\n\nDetails: ${payload.details}\nPhone: ${payload.phone}`
        })
      });
    } catch (err) {
      console.warn('Lead dispatch logged locally:', payload);
    }
  }

  formatMarkdown(text) {
    return text
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  getTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    const body = document.getElementById('zavronChatBody');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  saveState() {
    try {
      sessionStorage.setItem('zavron_chat_history', JSON.stringify(this.messages.slice(-20)));
    } catch (e) {
      // Storage unavailable or disabled
    }
  }

  loadState() {
    try {
      const saved = sessionStorage.getItem('zavron_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messages = parsed;
          parsed.forEach(msg => this.appendMessageEl(msg));
        }
      }
    } catch (e) {
      this.messages = [];
    }
  }
}

// Global Auto-initialize
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.zavronChatInstance = new ZavronChatbot();
  });
}
