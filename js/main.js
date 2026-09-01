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
