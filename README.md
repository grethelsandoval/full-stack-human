# Full Stack Human — FSH Hub

A responsive Spanish-language Web3 talent landing page built with React, TypeScript, Tailwind CSS, Vite, and Lucide. Includes a custom orbital hero, impact cards, keyboard-accessible BESSI tabs, three training modules, a credential preview, trainer methodology, and responsive navigation.

The `/app` route hosts the FSH Hub dApp MVP on **Stellar testnet**: Google
sign-in through a Pollar embedded wallet, Friendbot XLM prefunding, Blend
Capital test USDC, XLM/USDC balances, module selection, scheduling, and a
Trustless Work (Soroban) single-release escrow that is funded before the
session and released by the user once the session took place.

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

Deploy the generated `dist/` directory to any static hosting service. The build
also emits `dist/app/index.html`, so `/app` works on hosts without SPA rewrites;
the dApp itself uses hash routes (`/app#/modulo/…`, `/app#/agendar/…`,
`/app#/reserva/<contractId>`).

## dApp configuration (`/app`)

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| --- | --- |
| `VITE_POLLAR_PUBLISHABLE_KEY` | Pollar project key. The provider is pinned to `stellarNetwork: "testnet"`; login uses `{ provider: "google" }`. Add the site origin to the allowed origins of the Pollar project. |
| `VITE_TRUSTLESS_WORK_API_KEY` | Trustless Work API key. The app always talks to the development/testnet API (`https://dev.api.trustlesswork.com`). |

Without `VITE_POLLAR_PUBLISHABLE_KEY` the login screen renders with the Google
button disabled and an explanatory notice. Without `VITE_TRUSTLESS_WORK_API_KEY`
the wallet, faucets, and scheduling still work, but the payment button reports
that the escrow cannot be deployed.

### Testnet flow

1. **Google sign-in (Pollar)** creates or restores the user's embedded Stellar wallet.
2. **Friendbot** funds the account with test XLM automatically the first time the
   account does not exist on Horizon; a manual button is also available.
3. **Blend test USDC**: the faucet (`getAssets?userId=<G…>`) returns a base64 XDR
   wrapped in JSON. The app signs and submits it with the Pollar wallet, which
   adds the trustline and pays test USDC (issuer
   `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56`).
4. **Balances** (XLM + USDC) come from Horizon testnet.
5. **Escrow**: paying a session deploys a Trustless Work *single-release* escrow
   (30 USDC, user = approver + release signer, trainer = service provider +
   receiver, FSH platform = platform address + dispute resolver), then funds it.
   Both steps are signed by the user's Pollar wallet. The contract ID is shown
   with a Stellar Expert link and stored in `localStorage` per wallet.
6. **After the session** the user approves the milestone and releases the funds.
   In production the trainer would sign the milestone; in this MVP the user
   confirms the session, as specified in the designs.

Platform/trainer testnet role addresses live in `src/dapp/config.ts`; their
secret keys are never part of the frontend.

## Product boundaries

- The booking dialog prepares a GitHub issue with the selected module and proposed date/time. The visitor must review and submit the issue on GitHub; availability is not confirmed by the landing page. Requests are public, and the interface warns visitors not to include personal information.
- The Stellar/ACTA credential is a clearly labeled design preview; credential issuance is not implemented. Wallets and escrow smart contracts are implemented in the `/app` dApp on testnet only.
- No contact information or trainer biographies are fabricated.
- Impact metrics and source labels reproduce the supplied brief and should receive editorial source verification before use in a commercial campaign.
- Google Fonts supplies DM Sans, Space Grotesk, and IBM Plex Mono. Local system fallbacks remain available.
- There are no analytics, first-party cookies, or server-side form submissions.

## Configuration

Set the repository/contact destination in `src/data.ts`. Landing module and BESSI content are defined in the same file; dApp catalog content lives in `src/dapp/catalog.ts`. Replace the GitHub request flow with an approved booking provider when real scheduling details are available.
