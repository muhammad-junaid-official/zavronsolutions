/**
 * ZAVRON SOLUTIONS — BLOG POST GENERATOR
 * Generates SEO-optimized HTML pages for new blog posts created via Admin Dashboard
 */

export function generatePostHtml(post) {
  const {
    title,
    slug,
    metaDescription,
    focusKeyword,
    category,
    readingTime = '7 min read',
    author = 'Muhammad Junaid',
    authorRole = 'CEO & Founder',
    date = new Date().toISOString().split('T')[0],
    featuredImage = '/assets/og-image.jpg',
    contentHtml = ''
  } = post;

  const url = `https://zavronsolutions.com/blog/${slug}/`;
  const categoryFormatted = (category || 'Web Development').replace(/-/g, ' ').toUpperCase();

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>${escapeHtml(title)} | Zavron Solutions</title>
  <meta content="${escapeHtml(metaDescription)}" name="description"/>
  <meta content="${escapeHtml(focusKeyword || '')}, web development USA, technical SEO, digital agency" name="keywords"/>
  <meta content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" name="robots"/>
  <meta content="US" name="geo.region"/>
  <meta content="United States" name="geo.placename"/>
  <link href="${url}" rel="canonical"/>
  <meta content="en_US" property="og:locale"/>
  <meta content="article" property="og:type"/>
  <meta content="${url}" property="og:url"/>
  <meta content="${escapeHtml(title)} | Zavron Solutions" property="og:title"/>
  <meta content="${escapeHtml(metaDescription)}" property="og:description"/>
  <meta content="${featuredImage}" property="og:image"/>
  <link href="/assets/favicon.svg" rel="icon" type="image/svg+xml"/>
  <link href="/favicon.ico" rel="icon" type="image/x-icon"/>
  <link href="/site.webmanifest" rel="manifest"/>
  <meta content="#061426" name="theme-color"/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link href="/css/variables.css" rel="stylesheet"/>
  <link href="/css/global.css" rel="stylesheet"/>
  <link href="/css/components.css" rel="stylesheet"/>
  <link href="/css/animations.css" rel="stylesheet"/>
  <link href="/css/chatbot.css" rel="stylesheet"/>

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(title)},
    "description": ${JSON.stringify(metaDescription)},
    "datePublished": "${date}T08:00:00+00:00",
    "dateModified": "${date}T08:00:00+00:00",
    "mainEntityOfPage": "${url}",
    "image": "${featuredImage}",
    "author": {
      "@type": "Person",
      "name": "${author}",
      "jobTitle": "${authorRole}",
      "url": "https://zavronsolutions.com/about-us/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zavron Solutions",
      "url": "https://zavronsolutions.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zavronsolutions.com/assets/favicon.svg"
      }
    }
  }
  </script>
  <style>
    .blog-article-content {
      color: #E2E8F0;
      line-height: 1.8;
      font-size: 1.08rem;
    }
    .blog-article-content h2 {
      font-size: 1.85rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 2.5rem 0 1.2rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .blog-article-content h3 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #00D2FF;
      margin: 2rem 0 1rem 0;
    }
    .blog-article-content p {
      margin-bottom: 1.5rem;
    }
    .blog-article-content ul, .blog-article-content ol {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }
    .blog-article-content li {
      margin-bottom: 0.6rem;
    }
    .blog-article-content a {
      color: #00D2FF;
      text-decoration: underline;
    }
    .blog-author-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(18, 38, 71, 0.7);
      border: 1px solid rgba(0, 210, 255, 0.2);
      border-radius: 12px;
      padding: 18px 24px;
      margin: 3rem 0;
    }
  </style>
</head>
<body>
  <!-- Global Header -->
  <header class="site-header" id="siteHeader">
    <div class="header-container">
      <a href="/" class="brand-logo" aria-label="Zavron Solutions Home">
        <div class="brand-logo-icon">
          <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18H48L24 46H48" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="48" cy="18" r="4.5" fill="#00D2FF" />
          </svg>
        </div>
        <div class="brand-logo-text">
          <span class="brand-logo-title">ZAVRON</span>
          <span class="brand-logo-subtitle">SOLUTIONS</span>
        </div>
      </a>
      <nav class="desktop-nav">
        <a href="/" class="nav-link">Home</a>
        <a href="/about-us/" class="nav-link">About Us</a>
        <a href="/services/" class="nav-link">Services</a>
        <a href="/work/" class="nav-link">Work</a>
        <a href="/industries/" class="nav-link">Industries</a>
        <a href="/blog/" class="nav-link active">Blog</a>
        <a href="/contact/" class="nav-link">Contact</a>
      </nav>
      <div class="header-actions">
        <a href="/get-a-free-quote/" class="btn btn-primary">Get a Free Quote</a>
      </div>
    </div>
  </header>

  <main id="mainContent">
    <!-- Hero Article Header -->
    <section class="hero" style="padding-bottom: 3rem;">
      <div class="hero-grid-bg"></div>
      <div class="container" style="max-width: 860px;">
        <div class="breadcrumbs" style="margin-bottom: 1.5rem;">
          <a href="/">Home</a><span class="separator">/</span>
          <a href="/blog/">Blog</a><span class="separator">/</span>
          <span class="current">${categoryFormatted}</span>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 1rem;">
          <span class="hero-pill-badge active">${categoryFormatted}</span>
          <span class="hero-pill-badge">${readingTime}</span>
        </div>

        <h1 class="hero-headline" style="font-size: clamp(2rem, 3.8vw, 3.2rem); line-height: 1.2; margin-bottom: 1.2rem;">
          ${escapeHtml(title)}
        </h1>

        <p style="font-size: 1.15rem; color: #94A3B8; line-height: 1.6; margin-bottom: 2rem;">
          ${escapeHtml(metaDescription)}
        </p>

        <div style="display: flex; align-items: center; gap: 12px; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #00D2FF; color: #061426; display: flex; align-items: center; justify-content: center; font-weight: 800;">
            ${author.charAt(0)}
          </div>
          <div>
            <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">${author}</div>
            <div style="font-size: 0.8rem; color: #00D2FF;">${authorRole} • Published ${date}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Article Body -->
    <section class="section section-dark" style="padding-top: 2rem;">
      <div class="container" style="max-width: 860px;">
        <article class="blog-article-content">
          ${contentHtml}

          <!-- Author Bio Box -->
          <div class="blog-author-card">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #00D2FF; color: #061426; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.4rem; flex-shrink: 0;">
              ${author.charAt(0)}
            </div>
            <div>
              <h4 style="margin: 0 0 4px 0; color: #FFFFFF; font-size: 1rem;">Written by ${author}</h4>
              <p style="margin: 0; font-size: 0.85rem; color: #94A3B8;">
                Founder & Technical Lead at Zavron Solutions. Specializing in high-performance web systems, headless WordPress, and data-driven organic search growth for US mid-market businesses.
              </p>
            </div>
          </div>

          <!-- Bottom CTA -->
          <div style="background: linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(255, 122, 0, 0.1) 100%); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 16px; padding: 36px; text-align: center; margin: 3rem 0;">
            <h3 style="margin: 0 0 10px 0; font-size: 1.6rem; color: #FFFFFF;">Ready to Scale Your Digital Presence?</h3>
            <p style="margin: 0 auto 20px; max-width: 600px; color: #CBD5E1; font-size: 0.95rem;">
              Partner with Zavron Solutions for custom web engineering, high-ranking SEO architectures, and revenue-driven digital campaigns.
            </p>
            <a href="/get-a-free-quote/" class="btn btn-primary" style="padding: 12px 28px; font-weight: 700;">Get a Free Proposal &amp; Technical Audit →</a>
          </div>
        </article>
      </div>
    </section>
  </main>

  <!-- Global Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-bottom">
        <div>&copy; 2026 Zavron Solutions. All Rights Reserved. Serving US Businesses Nationwide.</div>
        <div class="footer-legal-links">
          <a href="/privacy-policy/">Privacy Policy</a>
          <a href="/terms-and-conditions/">Terms &amp; Conditions</a>
          <a href="/cookie-policy/">Cookie Policy</a>
          <a href="/disclaimer/">Disclaimer</a>
        </div>
      </div>
    </div>
  </footer>

  <script type="module" src="/js/main.js"></script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
