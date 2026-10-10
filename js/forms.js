/**
 * ZAVRON SOLUTIONS — FORM VALIDATION & NOTIFICATION SYSTEM
 * Handles Contact Form, Newsletter Subscriptions & Direct Inquiry Dispatches
 * Includes Duplicate Prevention, Sanitization, Fallback Resilience & Data Preservation.
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const iconSvg = type === 'error'
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 7000);
}

function initContactForms() {
  const contactForms = document.querySelectorAll('form[id*="contactForm"], form.contact-form, form[action*="formsubmit.co"]');
  
  contactForms.forEach(contactForm => {
    let isSubmitting = false;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      let isValid = true;
      const requiredInputs = contactForm.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        const errorEl = input.parentElement ? input.parentElement.querySelector('.form-error-msg') : null;
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

      const userEmailInput = contactForm.querySelector('input[type="email"]');
      const userEmail = userEmailInput ? userEmailInput.value.trim() : '';
      const userNameInput = contactForm.querySelector('input[id*="Name"], input[name="name"]');
      const userName = userNameInput ? userNameInput.value.trim() : 'Valued Client';
      const userCompany = contactForm.querySelector('input[name="company"], input[id*="Company"]')?.value.trim() || 'N/A';
      const userPhone = contactForm.querySelector('input[type="tel"]')?.value.trim() || 'N/A';
      const userService = contactForm.querySelector('select[name="service"], select[id*="Service"]')?.value.trim() || 'General Inquiry';
      const userMessage = contactForm.querySelector('textarea')?.value.trim() || 'No message content';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

      // Lock submission
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="display:inline-block; vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          Transmitting Message...
        `;
      }

      const payload = {
        name: userName,
        email: userEmail,
        phone: userPhone,
        company: userCompany,
        service: userService,
        message: userMessage,
        source: window.location.pathname
      };

      const formData = new FormData(contactForm);
      formData.append('_destination', 'zavronsolutions@gmail.com');
      formData.append('_subject', `🚀 New Client Message: ${userName} — Zavron Solutions`);
      formData.append('_template', 'table');

      let serverAccepted = false;

      // 1. Try primary SMTP endpoint
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const apiRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const apiJson = await apiRes.json().catch(() => ({}));
          if (apiJson && (apiJson.success || apiJson.accepted)) {
            serverAccepted = true;
          }
        }
      } catch (apiErr) {
        console.warn('Primary contact API notice:', apiErr.name === 'AbortError' ? 'Timeout' : apiErr.message);
      }

      // 2. Try fallback endpoint if primary was not accepted
      if (!serverAccepted) {
        try {
          const fbController = new AbortController();
          const fbTimeout = setTimeout(() => fbController.abort(), 9000);

          const fbRes = await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' },
            signal: fbController.signal
          });
          clearTimeout(fbTimeout);

          if (fbRes.ok) {
            const fbJson = await fbRes.json().catch(() => ({}));
            if (fbJson && (fbJson.success === 'true' || fbJson.success === true || fbRes.status === 200)) {
              serverAccepted = true;
            }
          }
        } catch (fbErr) {
          console.warn('Fallback contact notice:', fbErr.name === 'AbortError' ? 'Timeout' : fbErr.message);
        }
      }

      // 3. Handle outcome
      if (!serverAccepted) {
        // DO NOT reset form! Preserve entered values!
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast(
          'Message delivery encountered a temporary connection issue. Your details have been preserved. Please try clicking submit again, or email us directly at zavronsolutions@gmail.com.',
          'error'
        );
        return;
      }

      // Success: Save in local leads cache for admin dashboard, reset form, and display confirmation
      try {
        const stored = JSON.parse(localStorage.getItem('zavron_leads') || '[]');
        stored.unshift({
          id: 'lead_' + Date.now(),
          date: new Date().toISOString(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          company: payload.company,
          service: payload.service,
          details: payload.message,
          status: 'new'
        });
        localStorage.setItem('zavron_leads', JSON.stringify(stored));
      } catch (e) {}

      contactForm.reset();
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      showToast(
        `Thank you ${userName}! Your message has been received. Our senior strategy team will review your project and follow up within 1 business day.`,
        'success'
      );
    });
  });
}

function initNewsletterForms() {
  const newsletterForms = document.querySelectorAll('form.newsletter-form');
  newsletterForms.forEach(form => {
    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput || !emailInput.value.trim()) return;

      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid work email address.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Subscribe';

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Subscribing...';
      }

      const formData = new FormData();
      formData.append('email', email);
      formData.append('_destination', 'zavronsolutions@gmail.com');
      formData.append('_subject', `📰 New Strategy Newsletter Subscriber: ${email}`);
      formData.append('_template', 'table');

      try {
        const fbRes = await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (fbRes.ok) {
          form.reset();
          showToast(`Thank you! You are now subscribed to Zavron Solutions quarterly technical insights.`, 'success');
        } else {
          showToast('Subscription is temporarily unavailable. Please email zavronsolutions@gmail.com directly.', 'error');
        }
      } catch (err) {
        showToast('Subscription is temporarily unavailable. Please email zavronsolutions@gmail.com directly.', 'error');
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });
}
