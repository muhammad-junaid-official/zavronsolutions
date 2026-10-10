import re
import os
from pathlib import Path

# Category-specific technical insights dictionary to generate deep, relevant content
CATEGORY_KNOWLEDGE = {
    "E-COMMERCE & RETAIL": {
        "s1_title": "Wholesale & Retail Conversion Architecture",
        "s1_desc": "Modern e-commerce infrastructure requires decoupled product catalog indexing, edge-cached stock updates, and frictionless checkout flows. For high-volume US retail brands, latency directly degrades gross merchandise value (GMV).",
        "s2_title": "Catalog Synchronization & Checkout Optimization",
        "pillars": [
            ("Real-Time Inventory State Management", "Implementing WebSocket or low-latency webhook triggers to synchronize ERP warehouse stock levels with storefront frontends without cache thrashing."),
            ("Friction-Free Checkout & Express Wallets", "Eliminating multistep form friction by integrating native Apple Pay, Google Pay, and Shop Pay direct buy buttons to capture mobile conversions."),
            ("Server-Side Order Validation & Cart Abandonment", "Triggering transactional event pipelines that capture cart states before session abandonment, driving high-intent email/SMS recovery automation.")
        ],
        "s3_title": "Tracking E-Commerce Unit Economics & Attribution",
        "kpis": "Key operational benchmarks include Customer Acquisition Cost (CAC), Return on Ad Spend (ROAS), Average Order Value (AOV), and 90-day repeat purchase velocity."
    },
    "CONSTRUCTION & CONTRACTING": {
        "s1_title": "Commercial Contractor Bidding & Portfolio Architecture",
        "s1_desc": "Commercial and residential general contractors require web architectures that build immediate trust with institutional project owners, architects, and high-value property developers.",
        "s2_title": "Interactive Estimating & Project Showcase Engineering",
        "pillars": [
            ("Structured Project Case Studies", "Presenting completed commercial jobs with structured metadata: square footage, delivery timelines, safety compliance records, and high-resolution media."),
            ("Pre-Qualification Lead Funnels", "Implementing tiered inquiry forms that qualify commercial bid opportunities by project budget, scope tier, and geographic zoning before scheduling site assessments."),
            ("Local Authority & Subcontractor Proof", "Showcasing regional trade associations (AGC, ABC), OSHA compliance certifications, and localized Google Business Profile signals across primary operating zones.")
        ],
        "s3_title": "Measuring Commercial Bid Velocity & Lead Quality",
        "kpis": "Primary metrics center on Cost Per Qualified Bid Opportunity (CPQBO), average project contract value, and proposal conversion rate."
    },
    "UI/UX DESIGN": {
        "s1_title": "Behavioral UX Design & Cognitive Load Optimization",
        "s1_desc": "Effective interface design balances aesthetic sophistication with ruthless clarity. Reducing cognitive friction at critical decision nodes turns casual browsers into high-intent pipeline leads.",
        "s2_title": "Design Systems, Motion Mechanics & Usability Patterns",
        "pillars": [
            ("Tokenized Figma-to-Code Design Systems", "Establishing centralized typography, color variables, spacing scales, and accessible component libraries that guarantee design-dev parity."),
            ("Purposeful Micro-Interactions", "Deploying subtle motion feedback on interactive elements (buttons, inputs, status cards) to confirm user actions without increasing layout shift or rendering delays."),
            ("Strict Accessibility (WCAG 2.2 AA)", "Guaranteeing color contrast ratios above 4.5:1, semantic keyboard focus states, visible tab indices, and ARIA labeling for screen-reader users.")
        ],
        "s3_title": "Quantifying Usability Lift & Engagement Signals",
        "kpis": "Track Task Completion Rate (TCR), interaction to conversion drop-off, form abandonment rates, and Interaction to Next Paint (INP) benchmarks."
    },
    "RESTAURANTS & HOSPITALITY": {
        "s1_title": "Hospitality Digital Infrastructure & Direct Booking Capture",
        "s1_desc": "Restaurants and luxury hospitality operators must bypass high third-party commission aggregators by delivering blazing-fast direct booking and ordering experiences.",
        "s2_title": "Menu Schema, Local Discovery & Reservation Routing",
        "pillars": [
            ("Semantic Menu & Event Schema.org Data", "Deploying Restaurant and Menu JSON-LD structured markup so dishes, dietary filters, and pricing populate directly inside Google Knowledge Panels."),
            ("Direct POS & Table Reservation Integration", "Embedding seamless booking widgets (OpenTable, Resy, Toast POS) with zero third-party iframe lag to capture reservations on mobile devices."),
            ("Localized Map Pack & Reputation Domination", "Synchronizing localized NAP citations, menu photos, and active customer review responses across Google Maps and Apple Maps.")
        ],
        "s3_title": "Measuring Hospitality Margin Preservation",
        "kpis": "Focus on Direct Booking Share (vs. OTA / third-party aggregator commissions), Table Turn Velocity, and Customer Lifetime Value through digital loyalty programs."
    },
    "REAL ESTATE": {
        "s1_title": "High-Concurrency MLS/IDX Engineering & Buyer Acquisition",
        "s1_desc": "Real estate brokerages and property developers require enterprise-grade search platforms that synchronize MLS listing feeds in real time while capturing high-net-worth investor inquiries.",
        "s2_title": "Spatial Property Search & Lead Routing Blueprints",
        "pillars": [
            ("Real-Time RESO Web API Syncing", "Connecting to MLS feeds via RESO Web API standards with automated cache invalidation to present accurate pricing, status, and open house data."),
            ("Interactive Spatial & School Boundary Mapping", "Enabling polygon map search with vector tiles that allow prospective buyers to filter by neighborhood boundaries and transit corridors."),
            ("Automated Property Valuation Funnels", "Integrating address autocomplete and comparative market analysis (CMA) valuation calculators to capture motivated home seller listings.")
        ],
        "s3_title": "Measuring Brokerage Lead Velocity & Acquisition Costs",
        "kpis": "Track Cost Per Buyer/Seller Inquiry, MLS search engagement depth, CMA form completion rates, and agent lead response velocity."
    },
    "LAW FIRMS & LEGAL": {
        "s1_title": "High-Value Legal Practice Retainers & Intake Architecture",
        "s1_desc": "Attorneys and legal practices require digital platforms that convey unimpeachable authority, protect client confidentiality, and capture urgent inquiries before prospective clients contact competing firms.",
        "s2_title": "Secure Client Intake, Ethical Compliance & Search Trust",
        "pillars": [
            ("HIPAA & Bar Association Compliant Intake", "Deploying encrypted, SSL/TLS-secured consultation forms with explicit non-attorney-client privilege disclaimers and automated CRM routing."),
            ("Practice-Specific E-E-A-T Thought Leadership", "Publishing substantive legal guides, case outcome analyses, and attorney credentials to satisfy Google search quality rater guidelines."),
            ("24/7 Intake Automation & Direct Response", "Integrating automated client intake triage that screens prospective case parameters and facilitates immediate callback scheduling.")
        ],
        "s3_title": "Measuring Case Quality & Legal Acquisition ROI",
        "kpis": "Analyze Cost Per Qualified Case Lead (CPQL), retainer conversion percentage, average case value, and organic visibility across core practice practice areas."
    },
    "SOCIAL MEDIA MARKETING": {
        "s1_title": "Paid Social Acquisition & Creative Testing Infrastructure",
        "s1_desc": "Scaling paid social across Meta, LinkedIn, and TikTok in 2026 demands algorithmic creative testing, robust server-side conversion APIs, and audience segmentation that navigates privacy frameworks.",
        "s2_title": "Conversion API Integration & Creative Velocity Systems",
        "pillars": [
            ("Server-Side CAPI & Offline Conversion Tracking", "Deploying Meta Conversions API and LinkedIn Insight Tags via server-side Google Tag Manager to bypass browser ad blockers and iOS tracking limits."),
            ("Iterative Creative Testing Matrix", "Systematically testing hooks, problem-solution angles, and visual formats to identify winning creative variations before scaling ad spend."),
            ("Frictionless Mobile Landing Page Match", "Aligning paid ad messaging with dedicated, sub-second landing pages optimized for single-action conversion to prevent post-click bounce.")
        ],
        "s3_title": "Evaluating Incremental ROAS & Customer LTV",
        "kpis": "Benchmark Blended CAC, Merchandising Efficiency Ratio (MER), First-Order Profitability, and 60-day cohort retention rates."
    },
    "SAAS & TECHNOLOGY": {
        "s1_title": "Product-Led Growth Architecture & Demand Generation",
        "s1_desc": "B2B SaaS companies must align high-intent organic search authority with intuitive product onboarding to reduce churn and accelerate annual recurring revenue (ARR).",
        "s2_title": "Demo Scheduling, Pricing Architecture & Onboarding UX",
        "pillars": [
            ("Interactive Demo & Sandbox Portals", "Providing lightweight interactive product walkthroughs directly on marketing pages so prospective buyers experience core value before booking a demo."),
            ("Transparent Tiered Pricing Architecture", "Structuring clear feature comparison grids, self-serve annual billing toggles, and seamless enterprise custom quote triggers."),
            ("Friction-Free Self-Serve Onboarding", "Minimizing sign-up fields, offering OAuth single sign-on (Google/GitHub/Microsoft), and delivering instant product activation.")
        ],
        "s3_title": "Measuring SaaS Pipeline Velocity & Unit Metrics",
        "kpis": "Monitor CAC Payback Period, Net Revenue Retention (NRR), Trial-to-Paid Conversion Rate, and Annual Contract Value (ACV)."
    },
    "PROFESSIONAL SERVICES": {
        "s1_title": "Advisory Brand Authority & High-Value B2B Client Acquisition",
        "s1_desc": "Consulting firms, executive search practices, and wealth managers win mandates based on demonstrated expertise, client trust, and frictionless private portal access.",
        "s2_title": "Client Portal Systems & Authority Thought Leadership",
        "pillars": [
            ("Secure Client Collaboration Portals", "Architecting encrypted file exchange, project status dashboards, and private milestone review spaces that validate premium pricing."),
            ("Executive Syndication & Entity Authority", "Publishing peer-reviewed industry whitepapers, research briefings, and LinkedIn executive articles linked to verified company Knowledge Graphs."),
            ("Bespoke Discovery Scheduling", "Deploying personalized qualification surveys that screen prospective clients by asset size or organizational complexity before booking senior advisory calls.")
        ],
        "s3_title": "Tracking Advisory Pipeline & Retainer Lifetime Value",
        "kpis": "Key operational metrics include Win Rate on Competitive Proposals, Average Retainer Value, and Inbound Inquiries from Qualified Decision Makers."
    },
    "HEALTHCARE & MEDICAL": {
        "s1_title": "Patient-Centric Digital Infrastructure & Clinical Authority",
        "s1_desc": "Healthcare providers, dental clinics, and regional health networks must bridge the gap between clinical excellence, HIPAA-aligned data handling, and empathetic patient booking.",
        "s2_title": "Online Scheduling, Provider Schema & Local Health Discovery",
        "pillars": [
            ("HIPAA-Compliant Patient Booking Systems", "Engineering secure appointment scheduling with real-time EHR calendar sync, automated reminder SMS, and zero clinical data leakage to third parties."),
            ("MedicalWebPage & Physician Schema.org", "Implementing granular medical schema detailing specialties, accepted insurance plans, hospital affiliations, and board certifications."),
            ("Empathetic Condition & Treatment Information", "Authoring evidence-grounded treatment overviews that answer patient anxieties clearly and direct them toward professional medical consultation.")
        ],
        "s3_title": "Evaluating Patient Acquisition & Clinical Growth",
        "kpis": "Monitor New Patient Booking Rate, Patient Show Rate, Online Schedule Adoption %, and Local 3-Pack Presence for high-intent specialty searches."
    },
    "SMALL BUSINESS": {
        "s1_title": "Local Market Dominance & High-ROI Digital Systems",
        "s1_desc": "Independent service businesses and growing local companies require lean, high-impact digital systems that convert regional search traffic into reliable booked jobs without enterprise overhead.",
        "s2_title": "Google Business Profile, Fast Quotes & Automated Follow-Up",
        "pillars": [
            ("Complete Local Pack Domination", "Optimizing Google Business Profile categories, photo uploads, service menus, and geo-targeted citations to capture top-3 map pack positions."),
            ("Instant Mobile Click-to-Call & Quote Funnels", "Ensuring phone numbers, email links, and short quote forms are sticky and immediately accessible on smartphone viewports."),
            ("Automated Review & Re-Engagement Pipelines", "Triggering post-service text messages requesting Google reviews, building an insurmountable local reputation advantage over competitors.")
        ],
        "s3_title": "Maximizing Local Revenue Per Marketing Dollar",
        "kpis": "Focus on Cost Per Booked Job, Local Map Pack Call Volume, Review Generation Velocity, and Referral Customer Rates."
    },
    "E-COMMERCE SEO": {
        "s1_title": "E-Commerce SEO Architecture & Faceted Crawl Budget Control",
        "s1_desc": "Scaling organic revenue across large SKU catalogs requires strict faceted navigation management, canonicalization hierarchies, and high-relevance category content.",
        "s2_title": "Indexation Control, Semantic Clusters & Product Schema",
        "pillars": [
            ("Faceted Navigation & Canonical Hygiene", "Preventing crawl budget exhaustion and index bloat by enforcing canonical links to root category URLs while noindexing thin parameter filters."),
            ("Semantic Product & Offer Schema Markup", "Deploying Product, Offer, AggregateRating, and InStock schema to secure high-visibility rich snippet pricing and badge features in Google SERPs."),
            ("High-Intent Category Copy & Answer Blocks", "Enriching top-tier category pages with original buyer guide summaries, comparison specifications, and contextual internal linking to sub-categories.")
        ],
        "s3_title": "Measuring Organic E-Commerce Revenue Lift",
        "kpis": "Track Organic Revenue Share, Non-Brand Category Ranking Impressions, Click-Through Rate (CTR) on Rich Snippets, and Crawl Efficiency."
    },
    "WORDPRESS DEVELOPMENT": {
        "s1_title": "Custom WordPress Engineering & Performance Architecture",
        "s1_desc": "Enterprise WordPress development means moving beyond heavy commercial page builders to bespoke block-based themes (FSE) or headless architectures that load under 0.8 seconds.",
        "s2_title": "Clean Theme Development, Security Hardening & Caching",
        "pillars": [
            ("Custom Lightweight Theme Engineering", "Building bespoke Gutenberg blocks with native PHP and lightweight CSS, eliminating redundant vendor script bundles and plugin bloat."),
            ("Server-Side Object Caching & Edge Redis", "Configuring Redis object caching, PHP OPcache, and persistent MariaDB query optimization to handle high-concurrency traffic spikes effortlessly."),
            ("Enterprise WordPress Security Protocol", "Implementing strict file permission policies, two-factor authentication, XML-RPC termination, and automated daily off-site cloud backups.")
        ],
        "s3_title": "Benchmarking Core Web Vitals & Content Velocity",
        "kpis": "Benchmark Mobile PageSpeed Score (95+), Largest Contentful Paint (<0.8s), Cumulative Layout Shift (0.00), and Editorial Publishing Efficiency."
    },
    "DIGITAL MARKETING": {
        "s1_title": "Full-Funnel Digital Growth & Commercial Pipeline Engine",
        "s1_desc": "Sustainable digital marketing in competitive US markets unifies paid acquisition, organic search authority, and conversion rate optimization into a single, cohesive revenue engine.",
        "s2_title": "Attribution Modeling, Channel Synergy & Lead Acceleration",
        "pillars": [
            ("Multi-Touch Attribution & First-Party Data", "Connecting CRM lead records with Google Analytics 4 and advertising platforms using first-party click IDs to understand genuine commercial customer journeys."),
            ("Channel Cross-Pollination", "Using paid search search-query reports to inform organic content clusters, while retargeting organic visitors with targeted social proof ads."),
            ("Continuous Landing Page Experimentation", "Running structured A/B tests on headline messaging, form complexity, and CTA positioning to incrementally lower cost-per-acquisition.")
        ],
        "s3_title": "Tracking Marketing Efficiency & Pipeline Growth",
        "kpis": "Key leadership metrics include Cost Per Qualified Lead (CPQL), Customer Lifetime Value to CAC Ratio (LTV:CAC > 3:1), and Sales Pipeline Velocity."
    },
    "GOOGLE ADS MANAGEMENT": {
        "s1_title": "High-Intent Google Ads Architecture & Quality Score Optimization",
        "s1_desc": "Maximizing Google Ads ROI requires ruthless negative keyword governance, tight ad-group single-theme structures (STAGs), and dedicated landing pages with high historical Quality Scores.",
        "s2_title": "Bidding Strategies, Enhanced Tracking & Ad Copy Mastery",
        "pillars": [
            ("Target CPA & Value-Based Smart Bidding", "Feeding server-verified conversion values back into Google Ads to enable algorithmic Smart Bidding that targets high-margin transactions."),
            ("Exhaustive Negative Keyword Sculpting", "Systematically filtering out irrelevant query variants, employment seekers, and academic researchers to protect client ad spend."),
            ("Dynamic Search Ads & Responsive Ad Testing", "Pairing responsive search ads with dedicated landing pages that echo query headlines, elevating Quality Scores to 8-10 and slashing CPCs.")
        ],
        "s3_title": "Evaluating Paid Search Efficiency & Profitability",
        "kpis": "Monitor Quality Score Average, Impression Share in Absolute Top Position, Conversion Rate by Device, and Blended Return on Ad Spend (ROAS)."
    },
    "LOCAL SEO": {
        "s1_title": "Local Search Domination & Geographic Trust Signals",
        "s1_desc": "Winning the local Google 3-Pack requires hyper-local geographic relevance, consistent Name-Address-Phone (NAP) citations across primary aggregators, and an active review engine.",
        "s2_title": "Profile Optimization, Geo-Signals & Local Schema",
        "pillars": [
            ("Comprehensive Google Business Profile Architecture", "Configuring exact primary/secondary categories, weekly photo updates, geo-tagged products/services, and automated FAQ responses."),
            ("NAP Consistency & Primary Citation Aggregators", "Auditing and synchronizing business identity data across Data Axle, Localeze, Foursquare, and prominent regional directories."),
            ("LocalBusiness & GeoCoordinates Schema.org Markup", "Embedding granular Schema.org JSON-LD specifying verified operational hours, service area radii, and verified contact channels.")
        ],
        "s3_title": "Measuring Local Map Pack & Phone Call Growth",
        "kpis": "Benchmark Google Maps Impressions, Direction Requests, Direct Phone Calls, and Local Search Grid Visibility across target zip codes."
    },
    "E-COMMERCE DEVELOPMENT": {
        "s1_title": "Bespoke E-Commerce Architecture & Conversion Acceleration",
        "s1_desc": "Custom e-commerce platforms must effortlessly handle complex checkout business logic, tiered wholesale pricing, and instantaneous product filtering without frontend latency.",
        "s2_title": "Headless Storefronts, ERP Connectivity & Checkout CRO",
        "pillars": [
            ("Modern Headless & Liquid Storefront Engineering", "Developing lightweight frontend architectures that load product pages instantly, keeping shoppers engaged and minimizing bounce rates."),
            ("Automated Wholesale & B2B Rules Engines", "Configuring customer account tiers that dynamically reveal volume discounts, custom catalog subsets, and Net-30 invoicing."),
            ("One-Click Checkout & Mobile Usability", "Removing unnecessary form fields and providing native browser auto-fill support to maximize mobile conversion velocity.")
        ],
        "s3_title": "Benchmarking Transaction Volume & Revenue Velocity",
        "kpis": "Measure Checkout Funnel Abandonment Rate, Mobile Conversion Rate, Average Order Value (AOV), and Server Response Time under flash sale traffic."
    },
    "SEO SERVICES": {
        "s1_title": "Enterprise SEO Strategy & Organic Topical Authority",
        "s1_desc": "Modern enterprise search leadership is built on technical website health, deep topical topic clustering, and authoritative knowledge graph positioning across competitive US sectors.",
        "s2_title": "Technical Hygiene, Entity Graphs & Content Architecture",
        "pillars": [
            ("Comprehensive Technical Architecture Audits", "Eliminating redirect chains, fixing indexation traps, auditing XML sitemaps, and maintaining pristine canonical tags across all page variants."),
            ("Topical Authority & Content Hub Hierarchies", "Designing pillar-cluster architectures that exhaustively answer search intent across informational, commercial, and transactional query stages."),
            ("Algorithmic E-E-A-T & Author Attribution", "Showcasing verifiable author credentials, linking corporate social profiles, and anchoring claims with reputable primary industry references.")
        ],
        "s3_title": "Measuring Enterprise Organic Search Compounding",
        "kpis": "Track Qualified Inbound Organic Pipeline, Share of Search Voice, Keyword Visibility in Positions 1-3, and Revenue Attribution from Non-Brand Search."
    },
    "WEB DEVELOPMENT": {
        "s1_title": "Modern Enterprise Web Engineering & Edge Delivery",
        "s1_desc": "Building high-performance digital platforms requires clean semantic HTML, modular component architectures, sub-second edge distribution, and bulletproof security hygiene.",
        "s2_title": "Modern Frameworks, Edge Performance & Security Protocols",
        "pillars": [
            ("Static Site Generation & Incremental Edge Caching", "Pre-rendering static pages and serving them from global CDN edge networks to achieve Time to First Byte (TTFB) below 100 milliseconds."),
            ("Zero-Vulnerability Security Engineering", "Enforcing strict Content Security Policy (CSP) headers, automated dependency vulnerability patching, and encrypted form transmission."),
            ("Responsive Accessibility & Cross-Browser Parity", "Building fluid CSS layouts that render flawlessly across all mobile, tablet, and ultra-wide desktop viewport resolutions.")
        ],
        "s3_title": "Benchmarking Technical Excellence & System Longevity",
        "kpis": "Evaluate Core Web Vitals (LCP, INP, CLS), Accessibility Scores (100 WCAG), Server Uptime (99.99%), and Developer Maintenance Efficiency."
    }
}

print("Knowledge dictionary compiled with 19 domain categories.")
