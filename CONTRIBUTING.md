# Contributing

Thank you for helping improve Roven Finance.

1. Open an issue describing the change before starting substantial work.
2. Create a focused branch from `main`.
3. Keep the product read-only: never introduce custody, approvals or transaction
   construction without a separate security review.
4. Run `npm run test:all` and `npx next build` before opening a pull request.
5. Do not commit credentials, wallet secrets, `.env` files or generated build
   artifacts.

Pull requests should explain the user impact, security implications and the
checks used to validate the change.
