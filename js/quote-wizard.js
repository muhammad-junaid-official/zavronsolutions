/**
 * ZAVRON SOLUTIONS — 5-STEP INTERACTIVE QUOTE BUILDER
 * Robust Lead Capture Engine with Step Validation, Duplicate Protection,
 * Safe Data Escaping, Fallback Resilience, and Preserved User State on Error.
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
  initQuoteWizard();
});

function initQuoteWizard() {
  const wizardContainer = document.getElementById('quoteWizard');
  if (!wizardContainer) return;

  let currentStep = 1;
  const totalSteps = 5;
  let isSubmitting = false;

  const progressFill = document.getElementById('wizardProgressFill');
  const stepPanes = wizardContainer.querySelectorAll('.wizard-step-pane');
  const stepBadges = wizardContainer.querySelectorAll('.wizard-step-badge');
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');

  // Clear previous error notification if present
  function clearSubmissionError() {
    const existing = document.getElementById('wizardSubmissionErrorBanner');
    if (existing) existing.remove();
  }

  // Display accessible error banner while preserving all form inputs
  function showSubmissionError(message) {
    clearSubmissionError();
    const banner = document.createElement('div');
    banner.id = 'wizardSubmissionErrorBanner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: var(--radius-md, 8px); padding: 1rem 1.25rem; margin-bottom: 1.5rem; color: #fca5a5; font-size: 0.95rem; line-height: 1.5;';
    banner.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style="flex: 1;">
          <strong style="color: #ffffff; display: block; margin-bottom: 0.25rem;">Submission Notice</strong>
          <div>${escapeHtml(message)}</div>
          <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button type="button" id="wizardRetryBtn" class="btn btn-primary btn-sm" style="background: #ef4444; border-color: #ef4444; padding: 6px 16px; font-size: 0.85rem;">Retry Submission</button>
            <a href="mailto:zavronsolutions@gmail.com?subject=Direct%20Quote%20Inquiry" class="btn btn-outline btn-sm" style="padding: 6px 16px; font-size: 0.85rem; border-color: rgba(255,255,255,0.3); color: #ffffff;">Email zavronsolutions@gmail.com directly</a>
          </div>
        </div>
      </div>
    `;
    const step5Pane = wizardContainer.querySelector('.wizard-step-pane[data-step="5"]');
    if (step5Pane) {
      step5Pane.insertBefore(banner, step5Pane.firstChild);
    }

    const retryBtn = document.getElementById('wizardRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearSubmissionError();
        if (submitBtn) submitBtn.click();
      });
    }

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Option Card selection (multiple or single)
  wizardContainer.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const isMulti = card.dataset.multi === 'true';
      const parent = card.closest('.option-grid');
      
      if (!isMulti) {
        parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        // Clear error if any
        const budgetError = document.getElementById('step3BudgetError');
        if (budgetError) budgetError.classList.remove('visible');
      } else {
        card.classList.toggle('selected');
        // Clear error if at least one selected
        const serviceError = document.getElementById('step2ServiceError');
        if (serviceError && parent.querySelectorAll('.option-card.selected').length > 0) {
          serviceError.classList.remove('visible');
        }
      }
    });
  });

  // Comprehensive Step Validator for any arbitrary step number
  const validateStep = (stepNum) => {
    const pane = wizardContainer.querySelector(`.wizard-step-pane[data-step="${stepNum}"]`);
    if (!pane) return true;

    let valid = true;

    // Standard inputs validation
    const requiredInputs = pane.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
      const errorMsg = input.parentElement ? input.parentElement.querySelector('.form-error-msg') : null;
      if (!input.value.trim()) {
        input.classList.add('error');
        if (errorMsg) errorMsg.classList.add('visible');
        valid = false;
      } else {
        input.classList.remove('error');
        if (errorMsg) errorMsg.classList.remove('visible');
      }

      if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          input.classList.add('error');
          if (errorMsg) {
            errorMsg.textContent = 'Please enter a valid work email address.';
            errorMsg.classList.add('visible');
          }
          valid = false;
        }
      }
    });

    // Step 2 validation (services selection)
    if (stepNum === 2) {
      const selectedServices = pane.querySelectorAll('.option-card.selected');
      const serviceError = document.getElementById('step2ServiceError');
      if (selectedServices.length === 0) {
        if (serviceError) serviceError.classList.add('visible');
        valid = false;
      } else {
        if (serviceError) serviceError.classList.remove('visible');
      }
    }

    // Step 3 validation (budget selection)
    if (stepNum === 3) {
      const selectedBudget = pane.querySelector('.option-card.selected');
      const budgetError = document.getElementById('step3BudgetError');
      if (!selectedBudget) {
        if (budgetError) budgetError.classList.add('visible');
        valid = false;
      } else {
        if (budgetError) budgetError.classList.remove('visible');
      }
    }

    return valid;
  };

  const validateCurrentStep = () => validateStep(currentStep);

  // Validate all previous steps sequentially before jumping forward
  const getFirstIncompleteStep = () => {
    for (let s = 1; s <= totalSteps; s++) {
      if (!validateStep(s)) return s;
    }
    return totalSteps;
  };

  // Step Badges (Tab Headers) Click Navigation with rigorous step completion checking
  stepBadges.forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const targetStep = parseInt(badge.dataset.step, 10);
      if (targetStep === currentStep) return;

      if (targetStep > currentStep) {
        // Enforce all intermediate steps
        for (let s = currentStep; s < targetStep; s++) {
          if (!validateStep(s)) {
            currentStep = s;
            updateUI(true);
            return;
          }
        }
      }

      currentStep = targetStep;
      updateUI(false);
    });
  });

  const updateUI = (shouldScroll = false) => {
    // Update panes
    stepPanes.forEach(pane => {
      const paneStep = parseInt(pane.dataset.step, 10);
      if (paneStep === currentStep) {
        pane.classList.add('active');
        pane.style.display = 'block';
      } else {
        pane.classList.remove('active');
        pane.style.display = 'none';
      }
    });

    // Update progress bar
    if (progressFill) {
      progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
    }

    // Update badges
    stepBadges.forEach(badge => {
      const stepNum = parseInt(badge.dataset.step, 10);
      badge.classList.toggle('active', stepNum === currentStep);
      badge.classList.toggle('completed', stepNum < currentStep);
    });

    // Button states
    if (prevBtn) {
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }
    if (nextBtn && submitBtn) {
      if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
        populateWizardReview();
      } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
      }
    }

    if (shouldScroll) {
      const rect = wizardContainer.getBoundingClientRect();
      if (rect.top < 40 || rect.top > window.innerHeight / 2) {
        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateUI(false);
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (currentStep > 1) {
        currentStep--;
        updateUI(false);
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isSubmitting) return; // Prevent duplicate clicks

      // Clear any prior submission error banner
      clearSubmissionError();

      // Ensure every single step 1 through 5 is valid
      const incompleteStep = getFirstIncompleteStep();
      if (incompleteStep < totalSteps) {
        currentStep = incompleteStep;
        updateUI(true);
        return;
      }

      if (!validateCurrentStep()) return;

      // Lock submission
      isSubmitting = true;
      submitBtn.disabled = true;
      if (prevBtn) prevBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="display:inline-block; vertical-align:middle; margin-right:8px;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        Transmitting Scope Requirements...
      `;

      // Gather form inputs
      const businessName = document.getElementById('quoteBusinessName')?.value.trim() || 'Not specified';
      const industry = document.getElementById('quoteIndustry')?.value.trim() || 'Not specified';
      const currentWebsite = document.getElementById('quoteWebsite')?.value.trim() || 'None provided';
      
      const selectedServices = Array.from(document.querySelectorAll('.wizard-step-pane[data-step="2"] .option-card.selected'))
        .map(c => c.querySelector('.option-card-title')?.textContent.trim())
        .filter(Boolean);
        
      const selectedBudget = document.querySelector('.wizard-step-pane[data-step="3"] .option-card.selected .option-card-title')?.textContent.trim() || 'Flexible / Undecided';
      const timeline = document.getElementById('quoteTimeline')?.value.trim() || 'Standard';
      const projectDetails = document.getElementById('quoteDetails')?.value.trim() || document.getElementById('quoteProjectNotes')?.value.trim() || 'None provided';
      
      const contactName = document.getElementById('quoteFullName')?.value.trim() || document.getElementById('quoteContactName')?.value.trim() || 'Valued Client';
      const contactEmail = document.getElementById('quoteEmail')?.value.trim() || document.getElementById('quoteContactEmail')?.value.trim() || '';
      const contactPhone = document.getElementById('quotePhone')?.value.trim() || document.getElementById('quoteContactPhone')?.value.trim() || 'Not provided';

      // Honeypot check
      const honeypot = document.getElementById('quoteHoneypot')?.value || '';

      // Prepare payload for primary SMTP endpoint
      const smtpPayload = {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        company: businessName,
        service: selectedServices.join(', ') || 'Custom Digital Architecture',
        budget: selectedBudget,
        timeline: timeline,
        message: `Current Website: ${currentWebsite}\nIndustry: ${industry}\n\nProject Scope & Requirements:\n${projectDetails}`,
        source: 'Interactive Quote Wizard',
        honeypot: honeypot
      };

      // Prepare form data for fallback dispatcher
      const formData = new FormData();
      formData.append('name', contactName);
      formData.append('email', contactEmail);
      formData.append('_replyto', contactEmail);
      formData.append('phone', contactPhone);
      formData.append('Business_Name', businessName);
      formData.append('Industry', industry);
      formData.append('Current_Website', currentWebsite);
      formData.append('Selected_Services', selectedServices.join(', ') || 'Custom Digital Architecture');
      formData.append('Budget_Tier', selectedBudget);
      formData.append('Target_Timeline', timeline);
      formData.append('Project_Requirements', projectDetails);
      formData.append('_destination', 'zavronsolutions@gmail.com');
      formData.append('_subject', `🎯 New Project Quote Request: ${businessName} (${selectedBudget})`);
      formData.append('_template', 'table');

      let serverAccepted = false;
      let primaryDeliverySuccess = false;

      // 1. Attempt primary backend API (/api/send-email)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout

        const apiRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smtpPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const apiJson = await apiRes.json().catch(() => ({}));
          if (apiJson && (apiJson.success || apiJson.accepted)) {
            serverAccepted = true;
            primaryDeliverySuccess = !!(apiJson.delivery && apiJson.delivery.adminSent);
          }
        }
      } catch (apiErr) {
        console.warn('Primary dispatch notice:', apiErr.name === 'AbortError' ? 'Timeout' : apiErr.message);
      }

      // 2. Attempt fallback dispatcher if primary endpoint was not accepted
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
          console.warn('Fallback dispatch notice:', fbErr.name === 'AbortError' ? 'Timeout' : fbErr.message);
        }
      }

      // 3. Handle Result
      if (!serverAccepted) {
        // BOTH primary and fallback failed: PRESERVE all entered values, DO NOT show success
        isSubmitting = false;
        submitBtn.disabled = false;
        if (prevBtn) prevBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        showSubmissionError(
          'We were unable to route your inquiry due to a temporary network connection error. All your entered details and selections have been safely preserved. Please click Retry Submission or email us directly at zavronsolutions@gmail.com.'
        );
        return;
      }

      // Backend accepted: Transition to verified Success Pane
      isSubmitting = false;
      const successPane = document.getElementById('wizardSuccessPane');
      const formWrapper = document.getElementById('wizardFormWrapper');
      if (formWrapper && successPane) {
        formWrapper.style.display = 'none';
        successPane.style.display = 'block';

        const confirmDetails = document.getElementById('wizardConfirmEmailDetails');
        if (confirmDetails) {
          confirmDetails.innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md, 8px); padding: 1.25rem; margin: 1.5rem auto 2rem; max-width: 580px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 0.75rem; color: #10b981; font-weight: 700; margin-bottom: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Inquiry Successfully Logged for ${escapeHtml(contactName)}
              </div>
              <p style="font-size: 0.9rem; color: var(--color-text-secondary, #94a3b8); margin: 0; line-height: 1.5;">
                Your project scope and technical parameters have been routed to our senior software architects. A dedicated strategist will follow up directly at <strong>${escapeHtml(contactEmail)}</strong> within <strong>1 business day</strong>.
              </p>
            </div>
          `;
        }

        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  updateUI(false);
}

function populateWizardReview() {
  const companyName = document.getElementById('quoteBusinessName')?.value.trim() || 'Not specified';
  const industry = document.getElementById('quoteIndustry')?.value.trim() || 'Not specified';
  const selectedServices = Array.from(document.querySelectorAll('.wizard-step-pane[data-step="2"] .option-card.selected'))
    .map(c => c.querySelector('.option-card-title')?.textContent.trim())
    .filter(Boolean);
  const selectedBudget = document.querySelector('.wizard-step-pane[data-step="3"] .option-card.selected .option-card-title')?.textContent.trim() || 'Flexible / Undecided';
  const timeline = document.getElementById('quoteTimeline')?.value.trim() || 'Standard';

  const reviewBox = document.getElementById('wizardReviewSummary');
  if (reviewBox) {
    reviewBox.innerHTML = `
      <div style="background: var(--color-bg-alt, #0c2340); padding: 1.25rem; border-radius: var(--radius-md, 8px); border: 1px solid var(--color-border-light, rgba(255,255,255,0.1)); font-size: 0.925rem; line-height: 1.6;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <p style="margin-bottom: 0;"><strong>Company:</strong> ${escapeHtml(companyName)} (${escapeHtml(industry)})</p>
          <p style="margin-bottom: 0;"><strong>Target Timeline:</strong> ${escapeHtml(timeline)}</p>
        </div>
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--color-border-light, rgba(255,255,255,0.1));">
          <p style="margin-bottom: 0.35rem;"><strong>Selected Services:</strong> ${escapeHtml(selectedServices.join(', ') || 'Full Strategic Suite')}</p>
          <p style="margin-bottom: 0;"><strong>Target Budget Tier:</strong> <span class="text-orange" style="font-weight: 700; color: #ff7a00;">${escapeHtml(selectedBudget)}</span></p>
        </div>
      </div>
    `;
  }
}
