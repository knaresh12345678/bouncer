// Test email validation logic
function validateEmail(email) {
  // Enhanced regex pattern for stricter email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Additional validation to prevent invalid TLDs like .commmmm
  const parts = email.split('.');
  if (parts.length < 2) return false;

  // Check TLD length (between 2 and 6 characters)
  const tld = parts[parts.length - 1];
  if (tld.length < 2 || tld.length > 6) return false;

  // Check if TLD contains only letters
  if (!/^[a-zA-Z]+$/.test(tld)) return false;

  // Check domain part (between @ and .)
  const domainPart = email.substring(email.lastIndexOf('@') + 1, email.lastIndexOf('.'));
  if (!domainPart || domainPart.length < 2) return false;

  return emailRegex.test(email);
}

// Test cases
const testEmails = [
  'naresh31@gmail.commmmm', // Should be INVALID
  'naresh31@gmail.com',     // Should be VALID
  'test@example.org',       // Should be VALID
  'user@domain.co.in',      // Should be VALID
  'invalid@domain.c',       // Should be INVALID (TLD too short)
  'invalid@domain.abcdefg', // Should be INVALID (TLD too long)
  'test@.com',              // Should be INVALID (no domain)
  'test@domain.',           // Should be INVALID (no TLD)
  'test@domain.123',        // Should be INVALID (TLD contains numbers)
];

console.log('Testing email validation:');
testEmails.forEach(email => {
  const isValid = validateEmail(email);
  console.log(`${email}: ${isValid ? 'VALID' : 'INVALID'}`);
});