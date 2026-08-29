const fs = require('fs');
const path = require('path');

// ============================================================
// The unified full footer HTML to inject into every page
// ============================================================
const FOOTER_HTML = `  <!-- ==================== GLOBAL FOOTER ==================== -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <!-- Col 1: Brand Info -->
        <div>
          <a href="/" class="brand-logo" style="margin-bottom:1rem;">
            <div class="brand-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 12 17 20 7"></polyline><polyline points="4 17 12 7 20 17"></polyline></svg>
            </div>
            <div class="brand-logo-text">
              <span class="brand-logo-title">ZAVRON</span>
              <span class="brand-logo-subtitle">SOLUTIONS</span>
            </div>
          </a>
          <p class="footer-brand-p">
            Helping US businesses build better digital experiences, improve online visibility, and turn digital growth into measurable business results.
          </p>
          <!-- Social Icons -->
          <div class="footer-social">
            <a href="https://www.facebook.com/zavronsolutions" target="_blank" rel="noopener noreferrer" aria-label="Zavron Solutions on Facebook" class="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://www.instagram.com/zavronsolutions" target="_blank" rel="noopener noreferrer" aria-label="Zavron Solutions on Instagram" class="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.linkedin.com/company/zavronsolutions" target="_blank" rel="noopener noreferrer" aria-label="Zavron Solutions on LinkedIn" class="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://twitter.com/zavronsolutions" target="_blank" rel="noopener noreferrer" aria-label="Zavron Solutions on X / Twitter" class="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div>
          <h4 class="footer-col-title">Quick Links</h4>
          <div class="footer-links">
            <a href="/" class="footer-link">Home</a>
            <a href="/about-us/" class="footer-link">About Us</a>
            <a href="/services/" class="footer-link">Services</a>
            <a href="/work/" class="footer-link">Work</a>
            <a href="/industries/" class="footer-link">Industries</a>
            <a href="/blog/" class="footer-link">Blog</a>
            <a href="/contact/" class="footer-link">Contact</a>
          </div>
        </div>

        <!-- Col 3: Services -->
        <div>
          <h4 class="footer-col-title">Services</h4>
          <div class="footer-links">
            <a href="/services/web-development/" class="footer-link">Web Development</a>
            <a href="/services/wordpress-development/" class="footer-link">WordPress Development</a>
            <a href="/services/ecommerce-development/" class="footer-link">E-Commerce Development</a>
            <a href="/services/seo/" class="footer-link">SEO Services</a>
            <a href="/services/local-seo/" class="footer-link">Local SEO</a>
            <a href="/services/digital-marketing/" class="footer-link">Digital Marketing</a>
            <a href="/services/ui-ux-design/" class="footer-link">UI/UX Design</a>
          </div>
        </div>

        <!-- Col 4: Resources -->
        <div>
          <h4 class="footer-col-title">Resources</h4>
          <div class="footer-links">
            <a href="/blog/" class="footer-link">Blog &amp; Insights</a>
            <a href="/case-studies/" class="footer-link">Case Studies</a>
            <a href="/resources/guides/" class="footer-link">Strategy Guides</a>
            <a href="/resources/faqs/" class="footer-link">Agency FAQs</a>
            <a href="/get-a-free-quote/" class="footer-link text-orange">Get a Free Quote</a>
          </div>
        </div>

        <!-- Col 5: Contact -->
        <div>
          <h4 class="footer-col-title">Contact</h4>
          <div class="footer-contact-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <a href="mailto:zavronsolutions@gmail.com" style="color:var(--color-text-light-muted);">zavronsolutions@gmail.com</a>
          </div>
          <div class="footer-contact-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>Mon – Fri: 8:00 AM – 6:00 PM EST</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div>
          &copy; 2026 Zavron Solutions. All Rights Reserved. Serving US Businesses Nationwide.
        </div>
        <div class="footer-legal-links">
          <a href="/privacy-policy/">Privacy Policy</a>
          <a href="/terms-and-conditions/">Terms &amp; Conditions</a>
          <a href="/cookie-policy/">Cookie Policy</a>
          <a href="/disclaimer/">Disclaimer</a>
        </div>
      </div>
    </div>
  </footer>`;

// ============================================================
// Utility: Process all HTML files recursively
// ============================================================
function getAllHtmlFiles(dir) {
  const results = [];
  const skip = new Set(['node_modules', 'dist', '.git', 'scripts']);
  for (const file of fs.readdirSync(dir)) {
    if (skip.has(file)) continue;
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results.push(...getAllHtmlFiles(full));
    } else if (file.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const root = '.';
const htmlFiles = getAllHtmlFiles(root);
let updatedCount = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // -----------------------------------------------
  // 1. Replace email address everywhere
  // -----------------------------------------------
  const emailPatterns = [
    /contact@zavronsolutions\.com/g,
    /zavronsolutions@gmail\.com(?!.*zavronsolutions@gmail\.com)/g, // keep existing correct ones
  ];
  const newContent1 = content.replace(/contact@zavronsolutions\.com/g, 'zavronsolutions@gmail.com');
  if (newContent1 !== content) { content = newContent1; modified = true; }

  // -----------------------------------------------
  // 2. Remove phone number contact items from contact page body
  // -----------------------------------------------
  // Remove "+1 (800) 555-ZAVRON" standalone phone references outside footer
  const phoneRemoved = content
    // Remove phone divs in body/contact sections
    .replace(/<div[^>]*class="[^"]*flex[^"]*gap[^"]*items-center[^"]*"[^>]*>[\s\S]*?\+1 \(800\) 555-ZAVRON[\s\S]*?<\/div>/g, '')
    // Remove generic contact-item phone rows
    .replace(/<div[^>]*>[\s\S]{0,200}\+1 \(800\) 555-ZAVRON[\s\S]{0,200}<\/div>/g, '')
    // Also clean up remaining phone references inline
    .replace(/\+1 \(800\) 555-ZAVRON/g, '');
  if (phoneRemoved !== content) { content = phoneRemoved; modified = true; }

  // -----------------------------------------------
  // 3. Replace entire <footer ...>...</footer> with the unified footer
  //    UNLESS it's the home page (which already has the full footer)
  // -----------------------------------------------
  const normalizedPath = filePath.replace(/\\/g, '/');
  const isHomePage = normalizedPath.endsWith('/index.html') && !normalizedPath.includes('/about-us/') 
    && !normalizedPath.includes('/services/') && !normalizedPath.includes('/work/')
    && !normalizedPath.includes('/case-studies/') && !normalizedPath.includes('/industries/')
    && !normalizedPath.includes('/resources/') && !normalizedPath.includes('/blog/')
    && !normalizedPath.includes('/contact/') && !normalizedPath.includes('/get-a-free-quote/')
    && !normalizedPath.includes('/privacy-policy/') && !normalizedPath.includes('/terms-and-conditions/')
    && !normalizedPath.includes('/cookie-policy/') && !normalizedPath.includes('/disclaimer/');

  // Replace footer on ALL pages (including home — we'll re-inject consistent one)
  const footerRegex = /<footer[\s\S]*?<\/footer>/;
  if (footerRegex.test(content)) {
    const replaced = content.replace(footerRegex, FOOTER_HTML);
    if (replaced !== content) { content = replaced; modified = true; }
  }

  // -----------------------------------------------
  // 4. Fix hero headline color — ensure no inline dark color overrides
  // -----------------------------------------------
  // Remove any inline color styles on hero h1/h2 that set navy/dark colors
  content = content.replace(/(class="hero-headline"[^>]*style="[^"]*?)color\s*:\s*var\(--color-navy-\d+\)[^"]*"/g, '$1"');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Updated:', filePath.replace(root + path.sep, ''));
    updatedCount++;
  } else {
    console.log('⏭  No change:', filePath.replace(root + path.sep, ''));
  }
}

console.log('\n✅ Done! Updated', updatedCount, '/', htmlFiles.length, 'files.');
