export const TEST_USERS = {
  admin: {
    username: 'admin_user',
    password: 'AdminPass123!',
    fullName: 'Admin User',
    role: 'admin' as const,
  },
  user1: {
    username: 'john_doe',
    password: 'UserPass123!',
    fullName: 'John Doe',
    role: 'user' as const,
  },
  user2: {
    username: 'jane_smith',
    password: 'UserPass123!',
    fullName: 'Jane Smith',
    role: 'user' as const,
  },
};

export const TEST_POSTS = {
  post1: {
    content: 'This is a test post about technology and innovation.',
  },
  post2: {
    content: 'Another post discussing software development best practices.',
  },
  deletedPost: {
    content: 'This post will be deleted by admin.',
  },
};

export const INVALID_PASSWORDS = [
  { value: 'weak', error: 'Password must be at least 8 characters long' },
  { value: 'noupperca', error: 'Password must contain at least one uppercase letter' },
  { value: 'NOLOWERCASE', error: 'Password must contain at least one lowercase letter' },
  { value: 'NoNumber!', error: 'Password must contain at least one number' },
  { value: 'NoSpecial1', error: 'Password must contain at least one special character' },
];

export const SEARCH_QUERIES = {
  technology: 'technology',
  software: 'software',
  nonExistent: 'nonexistentqueryxyz123',
};
