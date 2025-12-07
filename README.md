This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Testing

This project includes a comprehensive testing setup with unit tests, component tests, and end-to-end tests.

### Running Unit & Component Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Running End-to-End Tests (Cypress)

First, make sure the development server is running:

```bash
pnpm dev
```

Then in another terminal:

```bash
# Open Cypress interactive UI
pnpm cypress:open

# Run Cypress tests headlessly (for CI)
pnpm cypress:run
```

### Test Structure

```
/src
  /components/__tests__/    # Component tests (React Testing Library)
  /lib/utils/__tests__/     # Unit tests for utilities
/cypress
  /e2e/                     # End-to-end tests
  /support/                 # Cypress support files
```

### Writing New Tests

- **Unit Tests**: Place in `__tests__` folder next to the module being tested
- **Component Tests**: Use React Testing Library (RTL)
- **E2E Tests**: Add `.cy.js` files in `cypress/e2e/`

Follow TDD: **Red → Green → Refactor**

## Deploy on Vercel


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
