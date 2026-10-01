import os
import glob
import re

blog_dirs = glob.glob('blog/*/index.html')
print(f"Enriching {len(blog_dirs)} blogs with trending USA high-ranking keywords...")

# Keyword mapping dictionary based on topic patterns
topic_keywords = {
    # AI & Modern Search
    "ai-overviews": [
        "Google AI Overviews SEO", "SGE search optimization USA", "AI search ranking factors 2026",
        "Generative Engine Optimization GEO", "LLM search visibility", "zero click search strategy",
        "AI answer engine optimization", "organic search authority USA"
    ],
    "ai-driven-seo": [
        "AI driven SEO playbook 2026", "AI SEO strategy USA", "machine learning search algorithms",
        "automated technical SEO audit", "generative engine optimization", "AI organic traffic growth",
        "enterprise SEO intelligence", "semantic search optimization"
    ],
    "topical-authority": [
        "topical authority SEO guide", "semantic SEO strategy USA", "content hub architecture",
        "topic cluster modeling", "Google Helpful Content guidelines", "knowledge graph SEO",
        "search intent clustering", "organic ranking dominance"
    ],
    "entity-seo": [
        "entity SEO optimization", "Google Knowledge Graph optimization", "semantic search entities",
        "Wikidata schema linking", "brand authority entity SEO USA", "structured knowledge graph",
        "semantic entity relationships", "topical relevance algorithms"
    ],
    "enterprise-seo-audit": [
        "enterprise SEO audit checklist USA", "large scale website SEO audit", "technical SEO architecture",
        "crawl budget optimization enterprise", "enterprise organic growth strategy", "Core Web Vitals enterprise audit",
        "multi-domain SEO governance", "high revenue SEO strategy"
    ],
    "organic-search-roi": [
        "organic search ROI measurement framework", "SEO attribution modeling USA", "measuring SEO business impact",
        "organic search revenue calculation", "executive SEO reporting", "SEO customer acquisition cost",
        "organic marketing ROI analytics", "enterprise SEO valuation"
    ],
    
    # Technical SEO
    "schema-markup": [
        "schema markup JSON-LD guide", "structured data SEO USA", "rich snippets Google Search",
        "Organization schema markup", "FAQ schema structured data", "Product schema JSON-LD",
        "nested schema architecture", "Google rich results optimization"
    ],
    "crawl-budget": [
        "crawl budget optimization large websites", "Googlebot crawl efficiency", "server log analysis SEO",
        "indexation management USA", "XML sitemap architecture", "robots.txt optimization enterprise",
        "faceted navigation crawl control", "technical SEO infrastructure"
    ],
    "javascript-seo": [
        "JavaScript SEO rendering indexing guide", "dynamic rendering SEO USA", "Next.js React SEO indexing",
        "client-side rendering vs SSR", "hydration SEO issues", "Googlebot JavaScript execution",
        "headless CMS SEO rendering", "DOM crawlability optimization"
    ],
    "international-seo": [
        "international SEO hreflang architecture", "global multi-regional website SEO", "hreflang tag implementation guide",
        "geo-targeting Google Search", "ccTLD vs subfolder SEO", "multilingual website optimization",
        "cross-border digital marketing USA", "international search expansion"
    ],
    "site-migration": [
        "site migration SEO checklist zero loss", "website redesign SEO preservation", "301 redirect mapping strategy",
        "URL migration best practices USA", "domain change SEO guide", "post migration traffic recovery",
        "HTTP to HTTPS migration checklist", "enterprise site relaunch SEO"
    ],
    "ecommerce-category-page": [
        "ecommerce category page SEO architecture", "collection page SEO USA", "faceted search ranking",
        "ecommerce internal linking taxonomy", "PLP SEO optimization", "ecommerce buyer intent keywords",
        "Shopify category SEO", "WooCommerce collection rankings"
    ],
    "product-schema": [
        "product schema rich snippets ecommerce", "Merchant Center structured data", "product review schema JSON-LD",
        "in-stock price schema Google", "ecommerce rich snippet CTR", "Google Shopping organic listings",
        "schema markup for Shopify USA", "WooCommerce structured data"
    ],
    "faceted-navigation": [
        "faceted navigation SEO canonicalization", "filter crawl bloat prevention", "canonical tags ecommerce filters",
        "URL parameter handling Googlebot", "AJAX faceted navigation SEO", "ecommerce crawl efficiency USA",
        "category filter indexation strategy", "technical ecommerce SEO"
    ],
    "ecommerce-content-strategy": [
        "ecommerce content strategy product blogs", "commercial intent blogging USA", "ecommerce buyer journey content",
        "product led content marketing", "DTC organic revenue funnel", "ecommerce top of funnel SEO",
        "high converting product articles", "ecommerce SEO content framework"
    ],
    "internal-linking": [
        "internal linking strategies for ecommerce", "PageRank sculpting internal links", "contextual linking architecture",
        "anchor text distribution SEO", "ecommerce breadcrumb hierarchy", "silo structure internal links USA",
        "automated internal linking strategies", "organic visibility lift"
    ],
    
    # Web Development & Core Web Vitals
    "enterprise-web-development": [
        "enterprise web development trends USA", "modern web application architecture", "scalable enterprise frontend",
        "microservices web architecture", "cloud native website development", "enterprise digital transformation USA",
        "headless CMS enterprise platforms", "high security corporate web solutions"
    ],
    "custom-web-development": [
        "custom web development vs templates ROI", "bespoke website development USA", "custom software agency vs WordPress template",
        "enterprise web design ROI", "custom web app performance", "tailored digital platform engineering",
        "commercial website build costs", "proprietary tech stack advantages"
    ],
    "nextjs-react": [
        "Next.js React for modern business websites", "Next.js App Router performance USA", "React server components SSR",
        "Vercel enterprise deployment", "headless web development Nextjs", "fast business website framework",
        "jamstack enterprise web development", "high conversion web engineering"
    ],
    "core-web-vitals": [
        "Core Web Vitals website speed optimization", "improve LCP Largest Contentful Paint", "Interaction to Next Paint INP 2026",
        "Cumulative Layout Shift CLS fix", "Google PageSpeed 100 score USA", "web performance engineering",
        "CDN edge caching optimization", "critical CSS JavaScript minification"
    ],
    "ada-compliance": [
        "ADA compliance website USA", "WCAG 2.2 AA guidelines checklist", "website accessibility lawsuit prevention",
        "accessible web design standards", "screen reader compatibility audit", "ADA title III website compliance",
        "digital accessibility agency USA", "accessible UI UX engineering"
    ],
    
    # WordPress & CMS
    "enterprise-wordpress-security": [
        "enterprise WordPress security hardening guide", "WordPress malware prevention USA", "WAF firewall WordPress enterprise",
        "two factor auth WordPress security", "headless WordPress security benefits", "secure WordPress hosting architecture",
        "penetration testing WordPress", "vulnerability patching protocols"
    ],
    "custom-wordpress-theme": [
        "custom WordPress theme development guide", "Gutenberg block theme development", "clean code WordPress themes USA",
        "bespoke WordPress engineering", "full site editing FSE agency", "speed optimized WordPress themes",
        "lightweight corporate WordPress theme", "custom PHP React blocks"
    ],
    "headless-wordpress": [
        "headless WordPress decoupled architecture", "WPGraphQL Next.js headless setup", "decoupled CMS advantages USA",
        "headless WordPress performance", "secure decoupled web architecture", "JAMstack WordPress agency",
        "REST API WordPress integration", "modern corporate CMS solutions"
    ],
    "wordpress-speed": [
        "WordPress speed optimization techniques", "faster WordPress load times USA", "Redis object cache WordPress",
        "database query optimization WP", "image compression WebP AVIF", "server level caching Nginx",
        "disable unused WordPress scripts", "sub second WordPress load times"
    ],
    "wordpress-maintenance": [
        "WordPress maintenance retainer benefits", "website support retainer USA", "scheduled WordPress plugin updates",
        "daily cloud backup WordPress", "24/7 uptime monitoring agency", "WordPress emergency fix support",
        "proactive website maintenance plan", "secure CMS management"
    ],
    
    # E-Commerce & DTC
    "shopify-plus": [
        "Shopify Plus vs WooCommerce enterprise comparison", "Shopify Plus migration agency USA", "enterprise ecommerce platforms 2026",
        "custom Shopify theme development", "Shopify Plus checkout extensibility", "high volume ecommerce scaling",
        "WooCommerce enterprise hosting", "DTC store migration costs"
    ],
    "ecommerce-checkout": [
        "ecommerce checkout funnel optimization USA", "reduce cart abandonment rate", "one click checkout UX design",
        "Shopify checkout CRO best practices", "mobile payment Apple Pay Google Pay", "frictionless checkout experience",
        "ecommerce conversion rate lift", "average order value optimization"
    ],
    "custom-ecommerce-integrations": [
        "custom ecommerce integrations ERP CRM", "Shopify NetSuite ERP integration", "WooCommerce Salesforce sync USA",
        "omnichannel inventory API integration", "automated order fulfillment systems", "warehouse management system WMS sync",
        "custom middleware development", "enterprise ecommerce automation"
    ],
    "b2b-ecommerce": [
        "B2B ecommerce portal development guide", "wholesale ordering platform USA", "tiered pricing wholesale ecommerce",
        "net 30 terms corporate checkout", "customer specific catalog pricing", "punchout catalog B2B integration",
        "custom B2B commerce solutions", "industrial distributor portals"
    ],
    "mobile-commerce": [
        "mobile commerce CRO strategies", "m-commerce checkout optimization USA", "mobile shopping app UX design",
        "thumb zone mobile navigation", "accelerated mobile page ecommerce", "mobile conversion rate improvements",
        "responsive product gallery UX", "mobile shopper engagement"
    ],
    "dtc-ecommerce": [
        "DTC ecommerce growth strategies USA", "direct to consumer brand scaling", "customer lifetime value LTV ecommerce",
        "subscription ecommerce model UX", "viral DTC marketing campaigns", "omnichannel customer retention",
        "first party data collection DTC", "profitable DTC ecommerce growth"
    ],
    "sustainable-packaging": [
        "sustainable packaging brand storytelling retail", "eco-friendly packaging marketing USA", "transparent supply chain branding",
        "green consumer trust building", "sustainable DTC ecommerce brands", "ethical brand differentiation",
        "packaging unboxing experience UX", "conscious consumer marketing"
    ],
    "personalized-product": [
        "personalized product recommendations ecommerce", "AI recommendation engine for Shopify", "dynamic upselling cross selling USA",
        "collaborative filtering product suggestions", "boost average order value AOV", "personalized shopping experiences",
        "real time product matching algorithms", "ecommerce personalization ROI"
    ],
    
    # Local SEO & Google Maps
    "google-map-pack": [
        "Google map pack ranking factors USA", "local 3-pack SEO optimization", "proximity search ranking factors",
        "Google Business Profile categories", "geo-tagged local signals", "local search algorithm updates 2026",
        "multi-location map pack dominance", "hyper-local SEO agency"
    ],
    "multi-location-local-seo": [
        "multi-location local SEO architecture", "franchise SEO strategy USA", "store locator landing pages SEO",
        "centralized citation management", "multi-city search ranking", "localized schema for franchises",
        "enterprise local SEO management", "regional customer acquisition"
    ],
    "google-business-profile": [
        "Google Business Profile optimization guide", "GBP ranking signals USA", "Google reviews management strategy",
        "GBP posts and photo optimization", "claim and optimize local listings", "local search conversion rate",
        "Google Maps business ranking", "local lead generation tactics"
    ],
    "local-citation": [
        "local citation management NAP consistency", "business directory listings USA", "Name Address Phone consistency",
        "citation building services", "data aggregator distribution", "local directory audit checklist",
        "local SEO citation building", "search trust signals"
    ],
    "online-review": [
        "online review generation local SEO impact", "automated customer review funnel USA", "Google reviews ranking factor",
        "reputation marketing software", "negative review response strategy", "high star rating local trust",
        "review acquisition workflows", "local SEO review velocity"
    ],
    "local-search-domination": [
        "local search domination for small service businesses", "service area business SEO USA", "contractor local marketing",
        "near me search ranking tactics", "local keyword targeting", "high converting local landing pages",
        "local service ads LSA Google", "small business lead generation"
    ],
    
    # Paid Ads & Lead Gen
    "google-ads-performance-max": [
        "Google Ads Performance Max optimization guide", "PMax campaign strategy USA", "asset group optimization PMax",
        "audience signals Google Ads", "first party data customer match", "PMax negative keyword management",
        "high ROAS Google advertising", "AI powered search campaigns"
    ],
    "negative-keyword": [
        "negative keyword mastery ad spend efficiency", "Google Ads wasted spend reduction USA", "negative keyword lists strategy",
        "search query audit best practices", "PPC budget optimization", "high intent search query filtering",
        "lower cost per acquisition CPA", "maximizing Google Ads ROI"
    ],
    "high-intent-search": [
        "high intent search campaigns B2B lead gen", "bottom of funnel Google Ads USA", "B2B buyer keyword strategy",
        "commercial intent PPC keywords", "high ticket client acquisition PPC", "landing page CRO for paid search",
        "lead quality scoring Google Ads", "enterprise PPC lead funnels"
    ],
    "google-ads-quality-score": [
        "Google Ads quality score cost reduction", "improve 10/10 quality score Google", "ad relevance landing page experience",
        "expected CTR optimization", "lower CPC Google Ads USA", "ad copy AB testing frameworks",
        "keyword level quality score audit", "profitable PPC scaling"
    ],
    "linkedin-b2b-advertising": [
        "LinkedIn B2B advertising strategy guide", "LinkedIn Ads Account Based Marketing ABM", "sponsored content campaign optimization USA",
        "LinkedIn matched audiences targeting", "high value executive lead generation", "LinkedIn cost per lead reduction",
        "B2B enterprise pipeline generation", "C-suite decision maker ads"
    ],
    "meta-ads-scaling": [
        "Meta Ads scaling strategies DTC brands", "Facebook Instagram ad scaling USA", "Advantage+ shopping campaigns ASC",
        "creative testing frameworks Meta", "post iOS tracking attribution", "high ROAS Facebook advertising",
        "dynamic creative optimization DCO", "scaling DTC ad budgets"
    ],
    "tiktok-ads": [
        "TikTok Ads ecommerce growth playbook", "Spark Ads optimization USA", "TikTok Shop marketing strategy",
        "Gen Z influencer ad creative", "TikTok conversion pixel setup", "viral video ads for DTC brands",
        "lower CPM video advertising", "ecommerce social commerce scaling"
    ],
    "social-media-retargeting": [
        "social media retargeting funnel architecture", "omnichannel remarketing strategy USA", "custom audience pixel retargeting",
        "abandoned cart retargeting ads", "dynamic product ads DPA Facebook", "multi-touchpoint ad sequences",
        "lower retargeting CPA", "high converting customer winback"
    ],
    
    # CRO, Strategy & UX
    "omnichannel-digital-marketing": [
        "omnichannel digital marketing strategy USA", "integrated cross channel marketing", "unified customer journey mapping",
        "cross platform marketing attribution", "holistic digital growth agency", "omnichannel retail and services",
        "seamless brand experience", "multi-channel customer acquisition"
    ],
    "customer-acquisition-cost": [
        "customer acquisition cost reduction strategies", "lower CAC improve LTV USA", "efficient growth marketing tactics",
        "organic acquisition vs paid ads", "conversion funnel leak fixes", "customer retention rate boosting",
        "sustainable unit economics", "profitable digital marketing scaling"
    ],
    "b2b-lead-generation": [
        "B2B lead generation digital playbook", "high ticket B2B marketing USA", "inbound lead generation systems",
        "sales qualified leads SQL pipeline", "content syndication lead gen", "marketing qualified lead automation",
        "consultative sales funnels", "enterprise client acquisition"
    ],
    "full-funnel-attribution": [
        "full funnel attribution modeling guide", "multi-touch attribution MTA USA", "marketing mix modeling MMM",
        "first touch vs linear attribution", "GA4 data driven attribution", "cross device customer journey tracking",
        "accurate marketing ROI reporting", "executive attribution dashboards"
    ],
    "conversion-rate-optimization": [
        "conversion rate optimization CRO framework", "website AB testing methodology USA", "heuristic UX evaluations",
        "heatmaps user session analysis", "landing page conversion lift", "micro-copy and CTA optimization",
        "form abandonment fixes", "data driven CRO agency"
    ],
    "mobile-first-ux": [
        "mobile first UX best practices 2026", "responsive UI UX design USA", "mobile ergonomics thumb friendly",
        "sub-second mobile page loads", "mobile micro-interactions", "app like web experiences PWA",
        "mobile navigation patterns", "accessible mobile UI design"
    ],
    "micro-interactions": [
        "micro interactions and user engagement", "UI micro-animations UX design USA", "delightful interface interactions",
        "CSS JavaScript micro animations", "interactive button states feedback", "elevated digital experience design",
        "user retention through micro UI", "premium brand interface styling"
    ],
    "user-testing": [
        "user testing methods for higher CRO", "remote usability testing guide USA", "moderated vs unmoderated testing",
        "user journey friction discovery", "think-aloud protocol UX", "usability test synthesis",
        "data backed UX redesign", "customer centric web optimization"
    ],
    "organic-social-vs-paid": [
        "organic social vs paid amplification", "social media ROI comparison USA", "viral organic reach strategies",
        "paid social boost frameworks", "community building brand trust", "blended social media strategy",
        "B2B social engagement", "content amplification playbooks"
    ],
    
    # Industry Specific
    "hipaa-compliant": [
        "HIPAA compliant healthcare web development", "secure patient portal design USA", "BAA compliant web hosting",
        "medical clinic website security", "protected health information PHI web forms", "telehealth platform development",
        "healthcare digital compliance", "encrypted doctor booking systems"
    ],
    "patient-booking": [
        "patient booking system UX optimization", "healthcare appointment conversion rate USA", "EMR EHR integrated scheduling",
        "mobile clinic booking UX", "frictionless healthcare intake forms", "reduce doctor appointment no-shows",
        "telemedicine consultation funnel", "medical practice patient acquisition"
    ],
    "medical-practice": [
        "medical practice local SEO patient acquisition", "doctor local search ranking USA", "clinic Google Map Pack dominance",
        "physician review management", "healthcare schema markup", "medical clinic digital marketing",
        "elective surgery patient leads", "private practice growth strategy"
    ],
    "reputation-management-for-healthcare": [
        "reputation management for healthcare providers", "physician online reviews strategy USA", "doctor rating site management",
        "patient satisfaction survey funnels", "mitigate negative medical reviews", "healthcare brand trust building",
        "HIPAA safe review responses", "clinical authority marketing"
    ],
    "law-firm-web-design": [
        "law firm web design high value case acquisition", "attorney website design agency USA", "legal landing page CRO",
        "law practice website branding", "mobile intake forms for lawyers", "credible legal design standards",
        "corporate defense law websites", "high ticket legal client conversion"
    ],
    "personal-injury": [
        "personal injury law firm SEO strategies", "car accident attorney SEO USA", "high competition legal keywords",
        "personal injury case acquisition", "contingency fee legal marketing", "legal citation local dominance",
        "personal injury Google Ads", "mass tort lead generation"
    ],
    "ppc-campaign-management-for-attorneys": [
        "PPC campaign management for attorneys", "Google Ads for law firms USA", "high CPC legal keyword bidding",
        "lawyer cost per signed case", "negative keyword filtering for attorneys", "legal click fraud prevention",
        "exclusive lawyer lead generation", "attorney search ad management"
    ],
    "live-chat-and-intake": [
        "live chat and intake automation law firms", "24/7 legal client intake chatbots USA", "automated case screening software",
        "CRM integration for lawyers", "instant client qualification", "higher attorney lead conversion",
        "after hours legal inquiry handling", "streamlined legal intake"
    ],
    "legal-content": [
        "legal content marketing thought leadership", "law firm practice area guides USA", "authoritative legal blogging",
        "SEO legal articles for lawyers", "demonstrating legal expertise E-E-A-T", "high search volume legal questions",
        "reputable law firm content strategy", "client educating law articles"
    ],
    "real-estate-website-design": [
        "real estate website design IDX integration", "luxury MLS property search website USA", "real estate broker web design",
        "interactive neighborhood map filters", "lead capture real estate portals", "real estate IDX feed synchronization",
        "mobile friendly MLS search", "high converting real estate web design"
    ],
    "real-estate-virtual-tours": [
        "real estate virtual tours interactive UX", "Matterport 3D property tour integration USA", "immersive luxury real estate web",
        "interactive floor plan web viewer", "virtual open house digital marketing", "engage luxury real estate buyers",
        "high definition property showcases", "cutting edge real estate UX"
    ],
    "google-ads-for-luxury-real-estate": [
        "Google Ads for luxury real estate listings", "high net worth property buyer ads USA", "luxury real estate PPC campaigns",
        "multi-million dollar home search ads", "geo-targeted real estate advertising", "exclusive property marketing funnels",
        "high ticket real estate leads", "brokerage ad spend optimization"
    ],
    "local-seo-strategies-for-real-estate": [
        "local SEO strategies for real estate agents", "neighborhood specialist SEO USA", "realtor Google Business Profile",
        "local farm area digital domination", "homes for sale local search ranking", "real estate agent review strategies",
        "hyper local real estate blogging", "community page SEO architecture"
    ],
    "restaurant-website-design": [
        "restaurant website design online ordering direct", "commission free online ordering USA", "hospitality website UX design",
        "digital food menu responsive design", "direct table booking integration", "restaurant customer loyalty web design",
        "mobile dining ordering experience", "restaurant branding digital presence"
    ],
    "hospitality-website-ux": [
        "hospitality website UX direct hotel bookings", "boutique hotel website design USA", "reduce OTA booking commissions",
        "hotel room reservation engine UX", "luxury resort digital storytelling", "guest checkout booking flow",
        "hospitality brand trust", "higher direct hotel revenue"
    ],
    "local-seo-for-multi-location-restaurants": [
        "local SEO for multi location restaurants", "restaurant franchise SEO USA", "local menu schema structured data",
        "Google Maps food ordering buttons", "multi unit dining local citations", "restaurant review management",
        "local foodie search optimization", "neighborhood dining visibility"
    ],
    "digital-loyalty-programs": [
        "digital loyalty programs for casual dining", "restaurant customer retention systems USA", "mobile loyalty app integrations",
        "repeat dining incentive marketing", "SMS email rewards automation", "guest lifetime value hospitality",
        "omnichannel dining rewards", "restaurant loyalty revenue growth"
    ],
    "social-media-marketing-for-food": [
        "social media marketing for food beverage brands", "viral food video marketing USA", "Instagram TikTok restaurant marketing",
        "influencer tasting partnerships", "mouth watering food photography", "local dining foot traffic ads",
        "menu launch promotional campaigns", "hospitality social media agency"
    ],
    "estimating-tools": [
        "estimating tools and cost calculators contractors", "construction cost calculator web design USA", "instant project estimate widgets",
        "contractor lead qualification tools", "interactive pricing widgets construction", "boost qualified building leads",
        "remodeling budget calculator", "home builder interactive tools"
    ],
    "lead-generation-ppc-for-general-contractors": [
        "lead generation PPC for general contractors", "commercial construction Google Ads USA", "home renovation PPC campaigns",
        "high ticket construction leads", "exclusive contractor ad management", "roofing siding general contractor ads",
        "construction landing page CRO", "contractor return on ad spend"
    ],
    "local-seo-for-roofing": [
        "local SEO for roofing and HVAC contractors", "emergency roof repair local search USA", "HVAC technician Google Map Pack",
        "contractor service area SEO", "storm damage contractor marketing", "contractor local citation building",
        "home services review acquisition", "contractor phone call generation"
    ],
    "reputation-management-for-construction": [
        "reputation management for construction companies", "contractor online review management USA", "build trust commercial construction",
        "Google business reviews for builders", "remodeling contractor testimonials", "overcoming negative construction reviews",
        "showcase certified workmanship", "construction brand credibility"
    ],
    "lead-generation-funnels-for-property-developers": [
        "lead generation funnels for property developers", "commercial property development marketing USA", "pre-construction sales lead funnels",
        "investor capital acquisition web funnels", "luxury condominium buyer marketing", "property development landing pages",
        "high net worth real estate leads", "architectural digital marketing"
    ],
    "b2b-saas-website-redesign": [
        "B2B SaaS website redesign conversion boost", "SaaS marketing website agency USA", "demo request funnel optimization",
        "product messaging and positioning", "interactive product tour web design", "reduce SaaS churn through UI UX",
        "enterprise software sales funnels", "ARR growth web redesign"
    ],
    "product-led-growth": [
        "product led growth UX onboarding design", "PLG user activation framework USA", "frictionless self serve SaaS signup",
        "time to value TTV SaaS optimization", "in app feature discovery UX", "freemium to paid conversion rate",
        "SaaS product onboarding best practices", "user engagement loops"
    ],
    "technical-seo-for-saas": [
        "technical SEO for SaaS programmatic pages", "programmatic SEO architecture USA", "integration marketplace SEO pages",
        "comparison alternative pages SEO", "SaaS crawl budget indexation", "API documentation SEO best practices",
        "scalable organic customer acquisition", "high domain rating SaaS SEO"
    ],
    "saas-pricing-page": [
        "SaaS pricing page psychology and optimization", "tier pricing UX design USA", "annual vs monthly billing toggle",
        "enterprise custom quote CTA", "pricing page CRO best practices", "feature comparison matrix UX",
        "value metric pricing architecture", "boost SaaS ARPU and conversions"
    ],
    "b2b-content-marketing": [
        "B2B content marketing SaaS demand generation", "bottom of funnel software articles USA", "competitor alternative blog posts",
        "SaaS thought leadership content", "lead magnet gated assets UX", "product led content marketing",
        "pipeline generation content strategy", "software customer acquisition"
    ],
    "consulting-firm": [
        "consulting firm website design authority", "management consultant branding USA", "professional advisory web design",
        "white paper research publication UX", "C-suite client acquisition funnels", "boutique advisory digital presence",
        "executive thought leadership platform", "prestigious consulting web design"
    ],
    "lead-generation-funnels-for-accounting": [
        "lead generation funnels for accounting firms", "CPA firm digital marketing USA", "tax advisory client acquisition funnels",
        "bookkeeping services landing page", "high value corporate tax leads", "audit accounting marketing automation",
        "trusted financial firm web design", "client intake for accountants"
    ],
    "executive-search": [
        "executive search firm digital branding", "headhunter agency website design USA", "C-level executive recruitment marketing",
        "confidential executive placement portal", "corporate talent acquisition branding", "executive recruiting authority",
        "retainer search firm web design", "premium recruitment brand positioning"
    ],
    "content-syndication": [
        "content syndication for professional advisors", "wealth management thought leadership USA", "syndicated financial advisory articles",
        "broadening executive audience reach", "third party publishing authority", "high net worth client marketing",
        "financial content distribution", "expert advisor brand visibility"
    ],
    "client-portal-design": [
        "client portal design for financial advisors", "secure wealth management portal UX USA", "fintech dashboard UI UX design",
        "encrypted document sharing portal", "portfolio reporting interface design", "financial client trust and security",
        "advisory firm digital tools", "frictionless client onboarding"
    ],
    "small-business-website-launch": [
        "small business website launch checklist USA", "affordable small business web design", "local business website essentials",
        "mobile friendly small business site", "Google Maps and search setup", "fast website launch timeline",
        "small business digital marketing starter", "professional web presence agency"
    ],
    "cost-effective-digital-marketing": [
        "cost effective digital marketing for small business", "high ROI small business marketing USA", "budget friendly lead generation",
        "local SEO and social media tactics", "maximize small business ad spend", "guaranteed small business growth strategies",
        "affordable digital agency services", "cost efficient customer acquisition"
    ],
    "crm-and-email-automation": [
        "CRM and email automation for small businesses", "HubSpot Mailchimp small business setup USA", "automated lead nurture sequences",
        "customer retention email marketing", "small business sales pipeline automation", "welcome email onboarding flows",
        "higher repeat purchase rate", "time saving business automation"
    ],
    "website-maintenance-and-security": [
        "website maintenance and security for small business", "small business website protection USA", "prevent website hacks and downtime",
        "automatic SSL and backup solutions", "affordable website care plans", "small business tech support agency",
        "website vulnerability scanning", "business continuity digital maintenance"
    ]
}

default_fallback = [
    "digital agency USA", "enterprise web development", "search engine optimization USA",
    "technical SEO architecture", "high performance web applications", "organic search visibility",
    "conversion rate optimization", "digital growth strategy 2026"
]

updated_count = 0

for file_path in blog_dirs:
    dir_name = os.path.basename(os.path.dirname(file_path))
    
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()
    
    # Match keywords
    selected_kws = None
    for pattern, kws in topic_keywords.items():
        if pattern in dir_name:
            selected_kws = kws
            break
            
    if not selected_kws:
        # Fallback tailored with title terms
        title_m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        t = title_m.group(1).split('|')[0].strip() if title_m else dir_name.replace('-', ' ')
        selected_kws = [t, f"{t} USA", f"{t} guide 2026"] + default_fallback[:5]
    
    kw_string = ", ".join(selected_kws)
    
    # Check if meta keywords exists
    kw_regex = re.compile(r'<meta[^>]+name=["\']keywords["\'][^>]*>', re.IGNORECASE)
    kw_regex_rev = re.compile(r'<meta[^>]+content=["\'][^"\']+["\'][^>]+name=["\']keywords["\'][^>]*>', re.IGNORECASE)
    
    new_meta_tag = f'<meta name="keywords" content="{kw_string}"/>'
    
    if kw_regex.search(html):
        new_html = kw_regex.sub(new_meta_tag, html)
    elif kw_regex_rev.search(html):
        new_html = kw_regex_rev.sub(new_meta_tag, html)
    else:
        # Insert after <meta name="description" ...>
        desc_pos = re.search(r'(<meta[^>]+name=["\']description["\'][^>]*>)', html, re.IGNORECASE)
        if desc_pos:
            matched = desc_pos.group(1)
            new_html = html.replace(matched, matched + "\n" + new_meta_tag)
        else:
            # Insert after <head>
            new_html = html.replace('<head>', '<head>\n' + new_meta_tag, 1)
            
    if new_html != html:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_html)
        updated_count += 1

print(f"Successfully enriched {updated_count} blogs with trending USA keywords!")
