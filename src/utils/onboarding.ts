const ONBOARDING_KEY = "kallappetti_needs_onboarding";

export function markNeedsOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export function clearOnboardingFlag() {
  localStorage.removeItem(ONBOARDING_KEY);
}

export function needsOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}
