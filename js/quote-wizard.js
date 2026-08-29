/**
 * ZAVRON SOLUTIONS — 5-STEP INTERACTIVE QUOTE BUILDER
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
    card.addEventListener('click', () => {
      const isMulti = card.dataset.multi === 'true';
      const parent = card.closest('.option-grid');
      
      if (!isMulti) {
        parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      } else {
        card.classList.toggle('selected');
      }
    });
  });

  const updateUI = () => {
    // Update panes
    stepPanes.forEach(pane => {
      pane.classList.toggle('active', parseInt(pane.dataset.step, 10) === currentStep);
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

    window.scrollTo({ top: wizardContainer.offsetTop - 100, behavior: 'smooth' });
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
            errorMsg.textContent = 'Please enter a valid email address.';
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
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateUI();
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateCurrentStep()) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting Request...';

        setTimeout(() => {
          const successPane = document.getElementById('wizardSuccessPane');
          const formWrapper = document.getElementById('wizardFormWrapper');
          if (formWrapper && successPane) {
            formWrapper.style.display = 'none';
            successPane.style.display = 'block';
            successPane.scrollIntoView({ behavior: 'smooth' });
          }
        }, 1200);
      }
    });
  }

  updateUI();
}

function populateWizardReview() {
  const companyName = document.getElementById('quoteBusinessName')?.value || 'Not specified';
  const selectedServices = Array.from(document.querySelectorAll('.wizard-step-pane[data-step="2"] .option-card.selected'))
    .map(c => c.querySelector('.option-card-title')?.textContent.trim())
    .filter(Boolean);
  const selectedBudget = document.querySelector('.wizard-step-pane[data-step="3"] .option-card.selected .option-card-title')?.textContent.trim() || 'Flexible';
  const timeline = document.getElementById('quoteTimeline')?.value || 'Standard';

  const reviewBox = document.getElementById('wizardReviewSummary');
  if (reviewBox) {
    reviewBox.innerHTML = `
      <div style="background: var(--color-bg-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-border-light); font-size: 0.925rem; line-height: 1.6;">
        <p style="margin-bottom: 0.5rem;"><strong>Business:</strong> ${companyName}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Selected Services:</strong> ${selectedServices.join(', ') || 'Custom Digital Solution'}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Target Budget:</strong> ${selectedBudget}</p>
        <p style="margin-bottom: 0;"><strong>Timeline:</strong> ${timeline}</p>
      </div>
    `;
  }
}
