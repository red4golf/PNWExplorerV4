# Running PNWExplorerV4 on GitHub

## Local run (after cloning)

```bash
npm ci
npm run check
npm run dev
```

## Production build

```bash
npm ci
npm run build
npm start
```

## Notes

- A CI workflow is included at `.github/workflows/ci.yml` to run typecheck and build on pushes/PRs.
- Upload storage now defaults to local disk unless explicit production/deployment flags are set.
  This makes GitHub/local execution work without Replit-specific environment variables.
