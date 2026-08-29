/**
 * ZAVRON SOLUTIONS — MAIN INTERACTIVE LOGIC
 * Global Header, Mobile Navigation, Active Link Highlighting, ARIA Management
 */

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
function initMobileNav() {
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
