// src/components/LeadForm/validation.ts
export type LeadValidationErrors = Partial<Record<"fullName" | "email" | "phone" | "consent", string>>;

export function validateStep1(
  form: { fullName: string; email: string; phone: string; consent: boolean }
): LeadValidationErrors {
  const errors: LeadValidationErrors = {};
  
  if (!form.fullName || form.fullName.trim().length < 2) {
    errors.fullName = "Inserisci nome e cognome (almeno 2 caratteri).";
  }
  
  const emailRe = /^\S+@\S+\.\S+$/;
  if (!form.email || !emailRe.test(form.email.trim())) {
    errors.email = "Inserisci un'email valida.";
  }
  
  if (form.phone && form.phone.trim().length > 0 && form.phone.trim().length < 8) {
    errors.phone = "Il telefono deve avere almeno 8 caratteri.";
  }
  
  if (!form.consent) {
    errors.consent = "Devi accettare per inviare la richiesta.";
  }
  
  return errors;
}

export function validateStep2(
  form: { fullName: string; email: string; phone: string; consent: boolean }
): LeadValidationErrors {
  // Step 2 validation (same as step 1 since step 2 just adds optional message)
  return validateStep1(form);
}