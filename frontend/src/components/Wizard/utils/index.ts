import { WizardStep } from '..';

export const showPreviousButton = (steps?: WizardStep[], activeStep?: WizardStep): boolean => {
  if (steps && steps.length > 1 && activeStep) {
    return steps.findIndex((step) => activeStep?.key === step.key) > 0;
  }

  return false;
};

export const showNextButton = (steps?: WizardStep[], activeStep?: WizardStep): boolean => {
  if (steps && steps.length > 1 && activeStep) {
    return steps.findIndex((step) => activeStep.key === step.key) < steps.length - 1;
  }

  return false;
};

export const showFinishButton = (steps?: WizardStep[], activeStep?: WizardStep): boolean => {
  if (steps && steps.length > 1 && activeStep) {
    return steps.findIndex((step) => activeStep.key === step.key) === steps.length - 1;
  }

  return false;
};
