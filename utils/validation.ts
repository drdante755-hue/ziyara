/**
 * Validates a form data object
 * @param formData - The form data to validate
 * @returns true if valid, false otherwise
 */
export function validateForm(formData: Record<string, unknown>): boolean {
  // Check if formData exists and has values
  if (!formData || typeof formData !== "object") {
    return false
  }

  // Check email validation if email field exists
  if ("email" in formData) {
    const email = formData.email as string
    if (!email || typeof email !== "string") {
      return false
    }
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return false
    }
  }

  // Check that no required fields are empty
  for (const [key, value] of Object.entries(formData)) {
    if (value === "" || value === null || value === undefined) {
      return false
    }
  }

  return true
}

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a phone number (supports Arabic/international formats)
 * @param phone - The phone number to validate
 * @returns true if valid phone format
 */
export function validatePhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "")
  // Check for valid phone format (allows + prefix and 8-15 digits)
  const phoneRegex = /^\+?[0-9]{8,15}$/
  return phoneRegex.test(cleaned)
}
