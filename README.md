# Full Stack Human — FSH Hub

A responsive Spanish-language Web3 talent landing page built with React, TypeScript, Tailwind CSS, Vite, and Lucide. Includes a custom orbital hero, impact cards, keyboard-accessible BESSI tabs, three training modules, a credential preview, trainer methodology, and responsive navigation.

## Development

Use Node.js 24 and npm 11.10.0 or newer. npm 10 may fail while resolving
Vitest's optional peer dependencies.

```sh
npm ci
npm run dev
```

## Verification and production

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static hosting service. The site uses anchor navigation, so no SPA fallback routing is needed.

## Product boundaries

- The booking dialog prepares a GitHub issue with the selected module and proposed date/time. The visitor must review and submit the issue on GitHub; availability is not confirmed by the landing page. Requests are public, and the interface warns visitors not to include personal information.
- The Stellar/ACTA credential is a clearly labeled design preview. Wallet connections, credential issuance, and smart-contract integration are not implemented.
- No contact information or trainer biographies are fabricated.
- Impact metrics and source labels reproduce the supplied brief and should receive editorial source verification before use in a commercial campaign.
- Google Fonts supplies DM Sans, Space Grotesk, and IBM Plex Mono. Local system fallbacks remain available.
- There are no analytics, first-party cookies, or server-side form submissions.

## Configuration

Set the repository/contact destination in `src/data.ts`. Module and BESSI content are defined in the same file. Replace the GitHub request flow with an approved booking provider when real scheduling details are available.
