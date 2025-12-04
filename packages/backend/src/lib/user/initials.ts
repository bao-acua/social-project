export function generateUserInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  const words = fullName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  const getFirstAlphaChar = (word: string | undefined): string => {
    if (!word) return '';
    const match = word.match(/[a-zA-Z]/);
    return match ? match[0].toUpperCase() : '';
  };

  const alphabeticWords = words.filter(word => /[a-zA-Z]/.test(word));

  if (alphabeticWords.length === 0) {
    return '';
  }

  if (alphabeticWords.length === 1) {
    return getFirstAlphaChar(alphabeticWords[0]);
  }

  const firstInitial = getFirstAlphaChar(alphabeticWords[0]);
  const lastInitial = getFirstAlphaChar(alphabeticWords[alphabeticWords.length - 1]);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}
