# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## API configuration

The frontend communicates with a separate backend service. Set the public API base URL with an
environment variable, for example in a `.env` file:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3335   # or the full URL for your production API
```

During local development we configure a proxy so that browser requests are sent to the
Nuxt server (avoiding CORS issues) and then forwarded to the real API. The default
runtime value is `/api/v1` and the corresponding proxy is defined in
`nuxt.config.ts`.

If you see `Failed to fetch` in the browser console when hitting paths such as
`/api/v1/expertises`, make sure:

1. The backend service is running and listening on the port you expect.
2. `NUXT_PUBLIC_API_BASE_URL` is pointed at that service (or left blank to use the
   default `/api/v1` and let the dev proxy forward the request).

Now continue with the normal build instructions below.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
