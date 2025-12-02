# SwiftServiceCRM

SwiftServiceCRM is a lightweight CRM built with a Vite/React front-end and a Node/Drizzle backend to manage hauling jobs, customers, quotes, scheduling, and finances.

## Getting started locally
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set required environment variables**
   - `DATABASE_URL` (PostgreSQL/Neon connection string). Example: `postgresql://user:password@host:5432/swiftservicecrm`.

3. **Apply the schema to your database**
   ```bash
   npm run db:push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The API and client are served together on `http://localhost:5000` by default.

5. **Check TypeScript types** (optional)
   ```bash
   npm run check
   ```

## Contributing via GitHub
1. Create a branch for your work: `git checkout -b feature/my-change`.
2. Commit your updates: `git commit -am "Describe your change"`.
3. Push to your fork or origin: `git push origin feature/my-change`.
4. Open a pull request in GitHub to review and merge.

## Feature Roadmap
See [`docs/feature-roadmap.md`](docs/feature-roadmap.md) for an implementation plan covering upcoming lead management, invoicing, customer portal, operations, analytics, automation, and security enhancements.
