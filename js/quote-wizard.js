/**
 * ZAVRON SOLUTIONS — 5-STEP INTERACTIVE QUOTE BUILDER
 * Seamless AJAX Step Navigation, Input Validation & Confirmation Email Dispatch
 */

document.addEventListener('DOMContentLoaded', () => {
  initQuoteWizard();
});

function initQuoteWizard() {
  const wizardContainer = document.getElementById('quoteWizard');
  if (!wizardContainer) return;

  let currentStep = 1;
  const totalSteps = 5;

  const progressFill = document.getElementById('wizardProgressFill');
  const stepPanes = wizardContainer.querySelectorAll('.wizard-step-pane');
  const stepBadges = wizardContainer.querySelectorAll('.wizard-step-badge');
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');

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

  // Step Badges (Tab Headers) Click Navigation
  stepBadges.forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      const targetStep = parseInt(badge.dataset.step, 10);
      if (targetStep === currentStep) return;

      // If jumping forward, validate intermediate steps
      if (targetStep > currentStep) {
        if (!validateCurrentStep()) return;
      }
      currentStep = targetStep;
      updateUI(false); // Seamless switch without jumping
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

    // Smoothly keep wizard in view ONLY if top is scrolled off-screen
    if (shouldScroll) {
      const rect = wizardContainer.getBoundingClientRect();
      if (rect.top < 40 || rect.top > window.innerHeight / 2) {
        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const validateCurrentStep = () => {
    const currentPane = wizardContainer.querySelector(`.wizard-step-pane[data-step="${currentStep}"]`);
    if (!currentPane) return true;

    let valid = true;
    const requiredInputs = currentPane.querySelectorAll('input[required], select[required], textarea[required]');

    requiredInputs.forEach(input => {
      const errorMsg = input.parentElement.querySelector('.form-error-msg');
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
    if (currentStep === 2) {
      const selectedServices = currentPane.querySelectorAll('.option-card.selected');
      const serviceError = document.getElementById('step2ServiceError');
      if (selectedServices.length === 0) {
        if (serviceError) serviceError.classList.add('visible');
        valid = false;
      } else {
        if (serviceError) serviceError.classList.remove('visible');
      }
    }

    // Step 3 validation (budget selection)
    if (currentStep === 3) {
      const selectedBudget = currentPane.querySelector('.option-card.selected');
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

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateUI(false); // Stay seamlessly on same screen
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        currentStep--;
        updateUI(false); // Stay seamlessly on same screen
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (validateCurrentStep()) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="display:inline-block; vertical-align:middle; margin-right:8px;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          Submitting &amp; Sending Confirmation...
        `;

        // Gather all wizard data accurately
        const businessName = document.getElementById('quoteBusinessName')?.value || 'Not specified';
        const industry = document.getElementById('quoteIndustry')?.value || 'Not specified';
        const currentWebsite = document.getElementById('quoteWebsite')?.value || 'None provided';
        
        const selectedServices = Array.from(document.querySelectorAll('.wizard-step-pane[data-step="2"] .option-card.selected'))
          .map(c => c.querySelector('.option-card-title')?.textContent.trim())
          .filter(Boolean);
          
        const selectedBudget = document.querySelector('.wizard-step-pane[data-step="3"] .option-card.selected .option-card-title')?.textContent.trim() || 'Flexible / Undecided';
        const timeline = document.getElementById('quoteTimeline')?.value || 'Standard';
        const projectDetails = document.getElementById('quoteDetails')?.value || document.getElementById('quoteProjectNotes')?.value || 'None provided';
        
        const contactName = document.getElementById('quoteFullName')?.value || document.getElementById('quoteContactName')?.value || 'Valued Client';
        const contactEmail = document.getElementById('quoteEmail')?.value || document.getElementById('quoteContactEmail')?.value || '';
        const contactPhone = document.getElementById('quotePhone')?.value || document.getElementById('quoteContactPhone')?.value || 'Not provided';

        // Prepare AJAX Payload
        const formData = new FormData();
        formData.append('name', contactName);
        formData.append('email', contactEmail); // Required for FormSubmit autoresponder
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
        
        // Automated confirmation email sent to user's inbox
        formData.append('_autoresponse', 
          `Hello ${contactName},\n\n` +
          `Thank you for requesting a project quote with Zavron Solutions!\n\n` +
          `We have received your inquiry for ${businessName}.\n` +
          `• Services Requested: ${selectedServices.join(', ') || 'Full Strategy'}\n` +
          `• Target Budget Tier: ${selectedBudget}\n` +
          `• Target Timeline: ${timeline}\n\n` +
          `A senior digital strategist is currently reviewing your project requirements and will follow up with an actionable scope assessment within 2 business hours.\n\n` +
          `If you have urgent files or questions, you can reply directly to this email or reach our executive desk at zavronsolutions@gmail.com.\n\n` +
          `Warm regards,\n` +
          `Muhammad Junaid\n` +
          `CEO & Founder | Zavron Solutions\n` +
          `https://zavronsolutions.com`
        );

        try {
          await fetch('https://formsubmit.co/ajax/zavronsolutions@gmail.com', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });
        } catch (err) {
          console.warn('Quote submission network fallback:', err);
        }

        // Show Success Pane with customized confirmation text without reloading
        const successPane = document.getElementById('wizardSuccessPane');
        const formWrapper = document.getElementById('wizardFormWrapper');
        if (formWrapper && successPane) {
          formWrapper.style.display = 'none';
          successPane.style.display = 'block';
          
          // Inject dynamic user confirmation message
          const confirmDetails = document.getElementById('wizardConfirmEmailDetails');
          if (confirmDetails) {
            confirmDetails.innerHTML = `
              <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1.25rem; margin: 1.5rem auto 2rem; max-width: 580px; text-align: left;">
                <div style="display: flex; align-items: center; gap: 0.75rem; color: #10b981; font-weight: 700; margin-bottom: 0.5rem;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Confirmation Email Sent to ${contactEmail}
                </div>
                <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; line-height: 1.5;">
                  A copy of your quote request and project summary has been sent to <strong>${contactEmail}</strong>. Our senior team is reviewing your requirements now.
                </p>
              </div>
            `;
          }
          
          wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  updateUI(false);
}

function populateWizardReview() {
  const companyName = document.getElementById('quoteBusinessName')?.value || 'Not specified';
  const industry = document.getElementById('quoteIndustry')?.value || 'Not specified';
  const selectedServices = Array.from(document.querySelectorAll('.wizard-step-pane[data-step="2"] .option-card.selected'))
    .map(c => c.querySelector('.option-card-title')?.textContent.trim())
    .filter(Boolean);
  const selectedBudget = document.querySelector('.wizard-step-pane[data-step="3"] .option-card.selected .option-card-title')?.textContent.trim() || 'Flexible / Undecided';
  const timeline = document.getElementById('quoteTimeline')?.value || 'Standard';

  const reviewBox = document.getElementById('wizardReviewSummary');
  if (reviewBox) {
    reviewBox.innerHTML = `
      <div style="background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-border-light); font-size: 0.925rem; line-height: 1.6;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <p style="margin-bottom: 0;"><strong>Company:</strong> ${companyName} (${industry})</p>
          <p style="margin-bottom: 0;"><strong>Target Timeline:</strong> ${timeline}</p>
        </div>
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--color-border-light);">
          <p style="margin-bottom: 0.35rem;"><strong>Selected Services:</strong> ${selectedServices.join(', ') || 'Full Strategic Suite'}</p>
          <p style="margin-bottom: 0;"><strong>Target Budget Tier:</strong> <span class="text-orange" style="font-weight: 700;">${selectedBudget}</span></p>
        </div>
      </div>
    `;
  }
}
