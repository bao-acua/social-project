# End-to-End Tests with Playwright

This directory contains comprehensive end-to-end tests for the social project application using Playwright.

## Setup

### Prerequisites

1. PostgreSQL database running locally
2. Node.js installed
3. Both backend and frontend applications configured

### Database Setup

The e2e tests use a separate test database to avoid interfering with development data.

1. Create the test database:
```bash
createdb social_project_test_db
```

2. The test database schema will be automatically created when running migrations. Make sure you've run migrations for the backend:
```bash
cd packages/backend
npm run db:migrate
```

### Environment Configuration

The test environment is configured in `.env.test` at the project root:

```env
NODE_ENV=test
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgres://localhost:5432/social_project_db
DATABASE_TEST_URL=postgres://localhost:5432/social_project_test_db
CORS_ORIGIN=http://localhost:3001
JWT_SECRET=test_secret_key_for_e2e_testing
```

## Running Tests

### Run all e2e tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test e2e/auth/sign-in.spec.ts
```

### Run specific test suite
```bash
npx playwright test e2e/auth/
```

## Test Structure

```
e2e/
├── auth/                    # Authentication tests
│   ├── sign-in.spec.ts     # Login functionality
│   └── sign-up.spec.ts     # Registration and validation
├── home/                    # Home page tests
│   └── home-page.spec.ts   # Hero section and navigation
├── posts/                   # Post management tests
│   ├── admin-post-management.spec.ts
│   └── user-post-management.spec.ts
├── search/                  # Search functionality tests
│   └── search.spec.ts
├── profile/                 # Profile management tests
│   └── update-profile.spec.ts
├── fixtures/                # Test fixtures and setup
│   ├── base.ts             # Base test fixture with authentication
│   └── test-data.ts        # Test data constants
└── helpers/                 # Test helper functions
    ├── auth.ts             # Authentication helpers
    └── database.ts         # Database utilities
```

## Test Coverage

### Authentication (auth/)
- ✅ Sign-in with valid credentials
- ✅ Sign-in with invalid credentials
- ✅ Form validation
- ✅ Session persistence
- ✅ Sign-up with valid information
- ✅ Password strength validation
- ✅ Username validation
- ✅ Password confirmation matching
- ✅ Duplicate username detection

### Home Page (home/)
- ✅ Hero section for authenticated/unauthenticated users
- ✅ Navigation between pages
- ✅ Navbar functionality

### Posts (posts/)

**Admin Post Management:**
- ✅ Admin can delete any user's post
- ✅ Admin can see deleted posts
- ✅ Admin can edit their own posts
- ✅ Admin cannot edit other users' posts
- ✅ Admin can delete multiple posts

**User Post Management:**
- ✅ User can create new posts
- ✅ User cannot see deleted posts
- ✅ User can edit their own posts
- ✅ User can delete their own posts
- ✅ User cannot edit other users' posts
- ✅ User cannot delete other users' posts
- ✅ Form validation for posts
- ✅ Cancel operations (create, edit, delete)

### Search (search/)
- ✅ Search posts by content
- ✅ Search posts by author name
- ✅ Clear search functionality
- ✅ No results handling
- ✅ Case insensitive search
- ✅ Empty search query handling
- ✅ Search state persistence

### Profile (profile/)
- ✅ Update full name
- ✅ Validation for empty full name
- ✅ Cancel profile update
- ✅ Username as read-only
- ✅ Auto-generated initials
- ✅ Full name length validation
- ✅ Changes persist after reload

## Data-CI Attributes

All components have been updated with `data-ci` attributes for reliable element selection in tests. Examples:

- `data-ci="login-username-input"` - Login username field
- `data-ci="register-submit-button"` - Registration submit button
- `data-ci="create-post-trigger"` - Create post button
- `data-ci="post-actions-menu-trigger"` - Post actions menu
- `data-ci="navbar-user-menu-trigger"` - User menu in navbar
- `data-ci="search-input"` - Search input field
- `data-ci="profile-modal"` - Profile update modal

## Test Fixtures

### Base Fixture

The base fixture (`fixtures/base.ts`) provides:

- **cleanDatabase**: Automatically cleans the test database before each test
- **authenticatedUser**: Creates and logs in a regular user
- **authenticatedAdmin**: Creates and logs in an admin user

Usage:
```typescript
test('my test', async ({ page, authenticatedUser }) => {
  // User is already logged in
  // authenticatedUser contains: { username, password, userId }
});
```

### Test Data

Predefined test data is available in `fixtures/test-data.ts`:

```typescript
TEST_USERS.admin      // Admin user credentials
TEST_USERS.user1      // Regular user 1
TEST_USERS.user2      // Regular user 2
TEST_POSTS.post1      // Sample post content
INVALID_PASSWORDS     // Array of invalid passwords with error messages
```

## Helper Functions

### Database Helpers (`helpers/database.ts`)

- `getTestDatabaseConnection()` - Get database connection
- `clearDatabase()` - Clear all data from test database
- `resetDatabase()` - Reset database to clean state
- `createTestUser(userData)` - Create a test user directly in DB
- `createTestPost(postData)` - Create a test post directly in DB

### Authentication Helpers (`helpers/auth.ts`)

- `login(page, username, password)` - Log in a user
- `register(page, username, password, fullName)` - Register a new user
- `logout(page)` - Log out current user
- `getAuthToken(page)` - Get auth token from localStorage
- `setAuthToken(page, token)` - Set auth token in localStorage
- `clearAuthToken(page)` - Clear auth data from localStorage

## Best Practices

1. **Use data-ci attributes**: Always prefer `data-ci` attributes over CSS selectors or text content
2. **Clean database**: Use `cleanDatabase` fixture to ensure test isolation
3. **Use fixtures**: Leverage `authenticatedUser` and `authenticatedAdmin` fixtures for authenticated tests
4. **Explicit waits**: Use `waitForURL()` for navigation and `expect().toBeVisible()` for elements
5. **Descriptive test names**: Write clear, descriptive test names that explain what is being tested
6. **Test independence**: Each test should be independent and not rely on other tests

## Troubleshooting

### Tests fail to connect to database
- Ensure PostgreSQL is running
- Verify the test database exists: `psql -l | grep social_project_test_db`
- Check `.env.test` has correct DATABASE_TEST_URL

### Tests timeout
- Increase timeout in `playwright.config.ts` if needed
- Ensure both backend and frontend are starting correctly
- Check backend logs for errors

### Port conflicts
- Make sure ports 3000 (backend) and 3001 (frontend) are available
- Kill any existing processes on these ports

### Clean test database manually
```bash
psql social_project_test_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## CI/CD Integration

For CI/CD pipelines, use the following configuration:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    CI: true
    DATABASE_TEST_URL: postgres://localhost:5432/social_project_test_db
```

## Contributing

When adding new tests:

1. Add `data-ci` attributes to new components
2. Create test data in `fixtures/test-data.ts` if needed
3. Use existing helpers or create new ones in `helpers/`
4. Follow the existing test structure and naming conventions
5. Ensure tests are independent and can run in any order
