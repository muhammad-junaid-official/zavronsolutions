const fs = require('fs');
let c = fs.readFileSync('404.html','utf8');
const start = c.indexOf('<main');
const end = c.indexOf('</main>') + 7;
const mainBody = c.substring(start, end);
const newMainBody = `
<main id="main-content">
<section class="hero text-center" style="min-height:85vh; display:flex; align-items:center; position: relative; overflow: hidden;">
  <div class="hero-grid-bg" style="opacity: 0.5;"></div>
  <div style="position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(0,210,255,0.08) 0%, rgba(6,20,38,0) 70%); border-radius: 50%; filter: blur(80px); pointer-events: none;"></div>
  <div style="position: absolute; bottom: -10%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(255,122,0,0.08) 0%, rgba(6,20,38,0) 70%); border-radius: 50%; filter: blur(80px); pointer-events: none;"></div>

  <div class="container" style="max-width:800px; margin:0 auto; position: relative; z-index: 2;">
    <div style="font-size: clamp(8rem, 20vw, 15rem); font-weight: 800; line-height: 1; letter-spacing: -0.05em; margin-bottom: -1rem; background: linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.1) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.9; text-shadow: 0px 20px 40px rgba(0,0,0,0.5);">
      4<span style="color: transparent; background: linear-gradient(135deg, #FF7A00 0%, #E66E00 100%); -webkit-background-clip: text;">0</span>4
    </div>
    
    <div class="eyebrow eyebrow-pill dark" style="margin-bottom:1.5rem; display: inline-flex; align-items: center; gap: 8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      Page Not Found
    </div>
    
    <h1 class="hero-headline" style="font-size:clamp(2rem, 4vw, 3rem); margin-bottom:1.25rem;">
      Looks Like This Page <br/><span class="text-orange">Got Lost in Space.</span>
    </h1>
    
    <p class="hero-subhead" style="margin:0 auto 2.5rem; color: #94A3B8; font-size: 1.125rem;">
      The URL you requested could not be found, might have been moved, or doesn't exist anymore. Don't worry, let's get you back on track to exploring our premium digital solutions.
    </p>
    
    <div style="display:flex; justify-content:center; gap:1.25rem; flex-wrap:wrap; margin-top: 2rem;">
      <a class="btn btn-primary btn-lg" style="box-shadow: 0 10px 25px -5px rgba(255,122,0,0.4);" href="/">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        Back to Home
      </a>
      <a class="btn btn-secondary btn-lg" href="/services/">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
        Explore Services
      </a>
    </div>

    <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center;">
      <span style="font-size: 0.875rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; font-weight: 600;">Or try these popular destinations</span>
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;">
        <a href="/about-us/" style="color: #E2E8F0; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 4px; transition: color 0.2s ease;" onmouseover="this.style.color='#00D2FF'" onmouseout="this.style.color='#E2E8F0'">About Us <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
        <a href="/work/" style="color: #E2E8F0; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 4px; transition: color 0.2s ease;" onmouseover="this.style.color='#00D2FF'" onmouseout="this.style.color='#E2E8F0'">Our Work <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
        <a href="/contact/" style="color: #E2E8F0; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 4px; transition: color 0.2s ease;" onmouseover="this.style.color='#00D2FF'" onmouseout="this.style.color='#E2E8F0'">Contact Support <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
      </div>
    </div>
  </div>
</section>
</main>
`;
c = c.replace(mainBody, newMainBody);
fs.writeFileSync('404.html', c, 'utf8');
console.log('404 Updated');
