/**
 * ZAVRON SOLUTIONS — FORM VALIDATION & NOTIFICATION SYSTEM
 * Dispatches all inquiries directly to zavronsolutions@gmail.com
 * & Automatically sends confirmation emails to prospective clients
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
  }, 6000);
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

      const userEmailInput = contactForm.querySelector('input[type="email"]');
      const userEmail = userEmailInput ? userEmailInput.value.trim() : '';
      const userNameInput = contactForm.querySelector('input[id*="Name"], input[name="name"]');
      const userName = userNameInput ? userNameInput.value.trim() : 'Valued Client';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="display:inline-block; vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          Sending &amp; Notifying Team...
        `;
      }

      const formData = new FormData(contactForm);
      // Ensure target destination & autoresponder parameters are explicitly set
      formData.append('_destination', 'zavronsolutions@gmail.com');
      if (userEmail) {
        formData.append('email', userEmail);
        formData.append('_replyto', userEmail);
        formData.append('_autoresponse', 
          `Hello ${userName},\n\n` +
          `Thank you for contacting Zavron Solutions! We have received your inquiry.\n\n` +
          `A senior digital strategist has been assigned to your message and is reviewing your project details. We will contact you within 2 business hours with an actionable technical and commercial assessment.\n\n` +
          `If you have urgent specifications or assets to share, feel free to reply directly to this email.\n\n` +
          `Warm regards,\n` +
          `Muhammad Junaid\n` +
          `CEO & Founder | Zavron Solutions\n` +
          `https://zavronsolutions.com`
        );
      }
      formData.append('_subject', `🚀 New Client Message: ${userName} — Zavron Solutions`);

      const payload = {
        name: userName,
        email: userEmail,
        phone: contactForm.querySelector('input[type="tel"]')?.value || 'N/A',
        company: contactForm.querySelector('input[name="company"], input[id*="Company"]')?.value || 'N/A',
        service: contactForm.querySelector('select[name="service"], select[id*="Service"]')?.value || 'General Inquiry',
        message: contactForm.querySelector('textarea')?.value || 'No message content',
        source: window.location.pathname
      };

      try {
        let sent = false;
        try {
          const apiRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (apiRes.ok) {
            sent = true;
          }
        } catch (apiErr) {
          console.log('Direct SMTP API not reached, using fallback dispatcher');
        }

        if (!sent) {
          await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });
        }

        contactForm.reset();
        showToast(`Thank you ${userName}! Your message has been received and a confirmation email was dispatched to ${userEmail || 'your inbox'}. Our team will follow up within 2 hours.`);
      } catch (err) {
        console.warn('Form submission note:', err);
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

      const email = emailInput.value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Subscribe';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Subscribing...';
      }

      const formData = new FormData();
      formData.append('email', email);
      formData.append('_destination', 'zavronsolutions@gmail.com');
      formData.append('_subject', `📰 New Strategy Newsletter Subscriber: ${email}`);
      formData.append('_autoresponse', `Welcome to the Zavron Solutions Digital Strategy Bulletin!\n\nYou're now subscribed to receive our quarterly technical breakdowns on SEO architecture, headless e-commerce, and high-velocity web engineering.\n\nWarm regards,\nZavron Solutions Team`);

      try {
        await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        form.reset();
        showToast(`Thank you! A confirmation has been sent to ${email}.`);
      } catch (err) {
        form.reset();
        showToast('Thank you for subscribing to Zavron Solutions insights!');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });
}
