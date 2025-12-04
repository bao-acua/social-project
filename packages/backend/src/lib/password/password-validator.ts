export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}


export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    return {
      valid: false,
      errors: ['Password is required'],
    };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  if (isCommonPassword(password)) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  // Check for sequential characters
  if (hasSequentialCharacters(password)) {
    errors.push('Password should not contain sequential characters (e.g., "123", "abc")');
  }

  // Check for repeated characters
  if (hasRepeatedCharacters(password)) {
    errors.push('Password should not contain too many repeated characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password',
    'password123',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'monkey',
    '1234567',
    'letmein',
    'trustno1',
    'dragon',
    'baseball',
    '111111',
    'iloveyou',
    'master',
    'sunshine',
    'ashley',
    'bailey',
    'passw0rd',
    'shadow',
    '123123',
    '654321',
    'superman',
    'qazwsx',
    'michael',
    'football',
    'welcome',
    'jesus',
    'ninja',
    'mustang',
    'password1',
    '123456789',
    'adobe123',
    'admin',
    'azerty',
    'loveme',
    'welcome123',
    'login',
    'princess',
    'qwertyuiop',
    'solo',
    'starwars',
  ];

  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Check for sequential characters (e.g., "123", "abc", "xyz")
 */
function hasSequentialCharacters(password: string): boolean {
  const lower = password.toLowerCase();

  // Check for sequential numbers
  for (let i = 0; i < lower.length - 2; i++) {
    const charCode1 = lower.charCodeAt(i);
    const charCode2 = lower.charCodeAt(i + 1);
    const charCode3 = lower.charCodeAt(i + 2);

    // Check if three consecutive characters are sequential
    if (charCode2 === charCode1 + 1 && charCode3 === charCode2 + 1) {
      return true;
    }

    // Check if three consecutive characters are reverse sequential
    if (charCode2 === charCode1 - 1 && charCode3 === charCode2 - 1) {
      return true;
    }
  }

  return false;
}

function hasRepeatedCharacters(password: string): boolean {
  // Check for 3 or more repeated characters
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }

  return false;
}

export function generatePasswordSuggestion(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*';

  let password = '';

  // Add at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Add random characters to reach minimum length
  const allChars = uppercase + lowercase + digits + special;
  while (password.length < 12) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  let score = 0;

  if (!password) return 'weak';

  // Length score
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety score
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Complexity score
  if (!hasSequentialCharacters(password)) score++;
  if (!hasRepeatedCharacters(password)) score++;
  if (!isCommonPassword(password)) score++;

  // Return strength based on score
  if (score <= 3) return 'weak';
  if (score <= 6) return 'medium';
  if (score <= 8) return 'strong';
  return 'very-strong';
}
