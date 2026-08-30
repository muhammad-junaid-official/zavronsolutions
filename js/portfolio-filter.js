/**
 * ZAVRON SOLUTIONS — PORTFOLIO & WORK FILTER
 */

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilter();
});

function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.work-grid .project-card, .work-grid .work-card');

  if (!filterBtns.length || !projectCards.length) return;

  // Calculate counts for each filter
  filterBtns.forEach(btn => {
    const filter = btn.getAttribute('data-filter');
    let count = 0;
    if (filter === 'all') {
      count = projectCards.length;
    } else {
      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (categories.includes(filter)) count++;
      });
    }

    // Append count badge if not already present
    let countBadge = btn.querySelector('.filter-count');
    if (!countBadge) {
      countBadge = document.createElement('span');
      countBadge.className = 'filter-count';
      btn.appendChild(countBadge);
    }
    countBadge.textContent = count;
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.35s ease-out forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

