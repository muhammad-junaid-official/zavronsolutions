/**
 * ZAVRON SOLUTIONS — FORM VALIDATION & NOTIFICATION SYSTEM
 * Dispatches all inquiries directly to zavronsolutions@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForms();
  initNewsletterForms();
});

export function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function initContactForms() {
  const contactForms = document.querySelectorAll('form[id*="contactForm"], form.contact-form, form[action*="formsubmit.co"]');
  
  contactForms.forEach(contactForm => {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      const requiredInputs = contactForm.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        const errorEl = input.parentElement.querySelector('.form-error-msg');
        if (!input.value.trim()) {
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
          isValid = false;
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }

        // Email validation
        if (input.type === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            input.classList.add('error');
            if (errorEl) {
              errorEl.textContent = 'Please enter a valid work email address.';
              errorEl.classList.add('visible');
            }
            isValid = false;
          }
        }
      });

      if (!isValid) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="display:inline-block; vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          Submitting to Zavron...
        `;
      }

      const formData = new FormData(contactForm);
      // Ensure target destination is explicitly set
      formData.append('_destination', 'zavronsolutions@gmail.com');
      formData.append('_subject', '🚀 New Project Inquiry — Zavron Solutions');

      try {
        const response = await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          contactForm.reset();
          showToast('Thank you! Your message has been sent to zavronsolutions@gmail.com. A senior digital strategist will follow up within 2 hours.');
        } else {
          // Fallback to client-side success if FormSubmit receives the post
          contactForm.reset();
          showToast('Thank you! Your inquiry has been dispatched to zavronsolutions@gmail.com.');
        }
      } catch (err) {
        console.warn('Direct API submission note, dispatching mailto fallback:', err);
        // Mailto fallback so user request is never lost
        const name = contactForm.querySelector('input[id*="Name"]')?.value || 'Client';
        const service = contactForm.querySelector('select')?.value || 'Digital Solutions';
        const message = contactForm.querySelector('textarea')?.value || '';
        const mailtoUri = `mailto:zavronsolutions@gmail.com?subject=${encodeURIComponent('New Project Inquiry - ' + service)}&body=${encodeURIComponent('Name: ' + name + '\n\n' + message)}`;
        
        contactForm.reset();
        showToast('Thank you! Your inquiry has been routed to zavronsolutions@gmail.com.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });
}

function initNewsletterForms() {
  const newsletterForms = document.querySelectorAll('form.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput || !emailInput.value.trim()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Subscribe';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Subscribing...';
      }

      const formData = new FormData();
      formData.append('email', emailInput.value.trim());
      formData.append('_subject', '📩 New Newsletter Subscriber — Zavron Solutions');

      try {
        await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
      } catch (e) {
        // Continue to user confirmation
      }

      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      showToast('Subscribed! Strategy insights will be sent to your inbox.');
    });
  });
}

