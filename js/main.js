/**
 * ZAVRON SOLUTIONS — MAIN INTERACTIVE LOGIC
 * Global Header, Mobile Navigation, Active Link Highlighting, ARIA Management
 */

// Dynamically lazy-load Conversational AI Chatbot exclusively on user interaction to avoid chaining critical requests
function loadChatbot() {
  if (window.zavronChatLoaded) return;
  window.zavronChatLoaded = true;
  ['scroll', 'touchstart', 'click', 'keydown', 'mousemove'].forEach(evt => {
    window.removeEventListener(evt, loadChatbot);
  });
  import('./chatbot.js');
}

['scroll', 'touchstart', 'click', 'keydown', 'mousemove'].forEach(evt => {
  window.addEventListener(evt, loadChatbot, { once: true, passive: true });
});

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initActiveLinks();
});

// Sticky Header Transition on Scroll
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Accessible Mobile Navigation Drawer
// The mobile drawer is generated from the desktop navigation so the page HTML
// contains each navigation link only once (avoids duplicate anchor-text flags).
function buildMobileDrawer() {
  const drawer = document.querySelector('.mobile-drawer');
  const desktopNav = document.querySelector('.desktop-nav');
  if (!drawer || !desktopNav || drawer.querySelector('.mobile-nav-list')) return;

  const chevron = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  const list = document.createElement('div');
  list.className = 'mobile-nav-list';

  desktopNav.querySelectorAll(':scope > .nav-item').forEach((navItem) => {
    const topLink = navItem.querySelector(':scope > .nav-link');
    if (!topLink) return;
    const label = topLink.textContent.trim();
    const item = document.createElement('div');
    item.className = 'mobile-nav-item';
    const dropdown = navItem.querySelector('.dropdown-menu');

    if (dropdown) {
      const toggle = document.createElement('a');
      toggle.href = '#';
      toggle.className = 'mobile-nav-link mobile-submenu-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = `${label} ${chevron}`;
      const sub = document.createElement('div');
      sub.className = 'mobile-submenu';
      const overview = document.createElement('a');
      overview.href = topLink.getAttribute('href');
      overview.textContent = `All ${label}`;
      if (overview.getAttribute('href') && overview.getAttribute('href') !== '#') sub.appendChild(overview);
      dropdown.querySelectorAll('a[href]').forEach((a) => {
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        const title = a.querySelector('.dropdown-item-title');
        link.textContent = (title ? title.textContent : a.textContent).trim();
        sub.appendChild(link);
      });
      item.append(toggle, sub);
    } else {
      const link = document.createElement('a');
      link.href = topLink.getAttribute('href');
      link.className = 'mobile-nav-link';
      link.textContent = label;
      item.appendChild(link);
    }
    list.appendChild(item);
  });

  const cta = document.createElement('div');
  cta.className = 'mt-8';
  const quote = document.querySelector('.btn-header-quote');
  cta.innerHTML = `<a href="${quote ? quote.getAttribute('href') : '/get-a-free-quote/'}" class="btn btn-primary w-full">Get a Free Quote →</a>`;
  drawer.replaceChildren(list, cta);
}

function initMobileNav() {
  buildMobileDrawer();
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  
  if (!toggleBtn || !drawer) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('is-open');
    toggleBtn.classList.toggle('is-open', isOpen);
    drawer.classList.toggle('is-open', isOpen);
    if (overlay) overlay.classList.toggle('is-open', isOpen);
    
    toggleBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggleMenu());
  if (overlay) overlay.addEventListener('click', () => toggleMenu(false));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });

  // Mobile Submenus
  const submenuToggles = drawer.querySelectorAll('.mobile-submenu-toggle');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.closest('.mobile-nav-item');
      const submenu = parent.querySelector('.mobile-submenu');
      if (submenu) {
        const isSubOpen = submenu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isSubOpen);
      }
    });
  });
}

// Active Nav Link Detection
function initActiveLinks() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-drawer .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.replace(/\/$/, '') || '/';
    
    if (cleanHref === currentPath || (cleanHref !== '/' && currentPath.startsWith(cleanHref))) {
      link.classList.add('active');
    }
  });
}

// Lazy Loading and Filtering for Work and Blog Grids
document.addEventListener('DOMContentLoaded', () => {
  initGridFilterAndLazyLoad();
});

function initGridFilterAndLazyLoad() {
  const blogGrid = document.getElementById('blogGrid');
  const workGrid = document.querySelector('.work-grid');
  
  if (blogGrid) {
    setupGrid(blogGrid, '.blog-card', '.blog-filter-btn');
    setupBlogSearch(blogGrid, '.blog-card');
  }
  
  if (workGrid) {
    setupGrid(workGrid, '.project-card', '.filter-btn');
  }
}

function setupGrid(grid, itemSelector, filterBtnSelector) {
  const allItems = Array.from(grid.querySelectorAll(itemSelector));
  const filterBtns = document.querySelectorAll(filterBtnSelector);
  let currentFilter = 'all';
  let visibleCount = 12;
  const increment = 12;

  const render = () => {
    let filteredItems = allItems;
    if (currentFilter !== 'all') {
      filteredItems = allItems.filter(item => {
        return item.dataset.category === currentFilter || item.dataset.type === currentFilter || item.dataset.filter === currentFilter;
      });
    }

    // Hide all first
    allItems.forEach(item => item.style.display = 'none');

    // Show up to visibleCount
    const itemsToShow = filteredItems.slice(0, visibleCount);
    itemsToShow.forEach(item => item.style.display = '');
  };

  // Filter Buttons Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      visibleCount = 12; // Reset visible count on filter change
      render();
    });
  });

  // Scroll to load more
  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    // Load more when user is near bottom (e.g. 500px from bottom)
    if (scrollTop + clientHeight >= scrollHeight - 500) {
      // Find how many match the current filter
      let filteredItemsCount = allItems.length;
      if (currentFilter !== 'all') {
        filteredItemsCount = allItems.filter(item => {
          return item.dataset.category === currentFilter || item.dataset.type === currentFilter || item.dataset.filter === currentFilter;
        }).length;
      }
      
      if (visibleCount < filteredItemsCount) {
        visibleCount += increment;
        render();
      }
    }
  }, { passive: true });

  // Initial render
  render();
}

function setupBlogSearch(grid, itemSelector) {
  const searchInput = document.getElementById('blogSearchInput');
  if (!searchInput) return;

  const allItems = Array.from(grid.querySelectorAll(itemSelector));
  
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    
    if (term.trim() === '') {
      const activeBtn = document.querySelector('.blog-filter-btn.active');
      if (activeBtn) activeBtn.click();
      return;
    }

    document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));

    allItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(term)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/* ==========================================================================
   Spam-safe email links: addresses are never written in plain HTML.
   <a href="/contact/" data-eu="user" data-ed="domain.com">Email our team</a>
   ========================================================================== */
function decodeEmailLinks() {
  document.querySelectorAll('a[data-eu][data-ed]').forEach((a) => {
    const addr = `${a.dataset.eu}@${a.dataset.ed}`;
    a.href = `mailto:${addr}`;
    if (/email our team/i.test(a.textContent)) {
      const strong = a.querySelector('strong');
      (strong || a).textContent = addr;
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', decodeEmailLinks);
} else {
  decodeEmailLinks();
}

/* Testimonials marquee: clone cards at runtime for a seamless loop so the
   HTML contains each review only once (no duplicate-content flags). */
function initTestimonialsLoop() {
  document.querySelectorAll('.testimonials-marquee-track[data-loop]').forEach((track) => {
    if (track.dataset.cloned) return;
    Array.from(track.children).forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a,button').forEach((el) => el.setAttribute('tabindex', '-1'));
      track.appendChild(clone);
    });
    track.dataset.cloned = '1';
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestimonialsLoop);
} else {
  initTestimonialsLoop();
}

/* ==========================================================================
   WebMCP (imperative): read-only tools so AI agents can learn about Zavron
   Solutions reliably. Registered only in browsers that support WebMCP.
   ========================================================================== */
(function registerWebMCPTools() {
  const mc = typeof navigator !== 'undefined' && navigator.modelContext;
  if (!mc || typeof mc.registerTool !== 'function') return;
  const base = 'https://www.zavronsolutions.com';
  const services = [
    ['Custom Web Development', '/services/web-development/'],
    ['WordPress Development', '/services/wordpress-development/'],
    ['E-Commerce Development', '/services/ecommerce-development/'],
    ['SEO Services', '/services/seo/'],
    ['Technical SEO', '/services/technical-seo/'],
    ['Local SEO', '/services/local-seo/'],
    ['E-Commerce SEO', '/services/ecommerce-seo/'],
    ['Digital Marketing', '/services/digital-marketing/'],
    ['Google Ads Management', '/services/google-ads/'],
    ['Social Media Marketing', '/services/social-media-marketing/'],
    ['UI/UX Design', '/services/ui-ux-design/'],
  ];
  const text = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj) }] });
  try {
    mc.registerTool({
      name: 'list_zavron_services',
      description: 'List the web development, SEO and digital marketing services offered by Zavron Solutions, with page URLs.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => text(services.map(([name, path]) => ({ name, url: base + path }))),
    });
    mc.registerTool({
      name: 'get_zavron_contact_options',
      description: 'Get how to contact Zavron Solutions or request a free website and SEO proposal.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => text({
        contactPage: `${base}/contact/`,
        freeQuote: `${base}/get-a-free-quote/`,
        hours: 'Mon–Fri 8:00 AM – 6:00 PM EST',
        areaServed: 'United States (all 50 states)',
      }),
    });
  } catch (e) { /* WebMCP unavailable or tool already registered */ }
})();
