# Full Stack Human — FSH Hub

A responsive Spanish-language Web3 talent landing page built with React, TypeScript, Tailwind CSS, Vite, and Lucide. Includes a custom orbital hero, impact cards, keyboard-accessible BESSI tabs, three training modules, a credential preview, trainer methodology, and responsive navigation.

The `/app` route hosts the FSH Hub dApp MVP on **Stellar testnet**: Google
sign-in through a Pollar embedded wallet, Friendbot XLM prefunding, Circle
test USDC (the asset Trustless Work documents for testnet), XLM/USDC balances, module selection, scheduling, and a
Trustless Work (Soroban) single-release escrow that is funded before the
session and released by the user once the session took place.

## El problema

Los equipos Web3 fallan mucho más por razones humanas que técnicas. Un
protocolo puede tener una arquitectura impecable y aún así perder un grant por
un pitch confuso, quemar a su equipo core en la carrera hacia mainnet o
disolverse por conflictos que nadie supo coordinar.

- **Comunicación ineficaz cuesta dinero.** El _Pulse of the Profession_ de PMI
  (2013) estima que por cada USD 1,000 M invertidos en proyectos se pierden
  USD 75 M por comunicación deficiente.
- **La mayoría de los proyectos de software no cumplen.** Los informes CHAOS del
  Standish Group sitúan entre ~68 % y 84 % los proyectos con retrasos,
  sobrecostos o fallos, y las causas dominantes son organizacionales y de
  comunicación, no de código.
- **Las habilidades sociales valen cada vez más.** Deming (2017, _QJE_) muestra
  que entre 1980 y 2012 los empleos con alta demanda de habilidades sociales
  crecieron ~12 puntos porcentuales del empleo en EE. UU., y que los mayores
  salarios están en roles que combinan habilidad técnica **y** social.
- **Contratar solo por hard skills sale caro.** En el _Global Talent Trends
  2019_ de LinkedIn, el 92 % de los reclutadores dijo que las soft skills
  importan igual o más que las técnicas y el 89 % atribuyó las malas
  contrataciones a la falta de ellas.

En el ecosistema Stellar esto se traduce en builders que dominan Soroban, SEPs
y anclajes, pero llegan al SCF, a un hackathon o a una integración con un
partner sin herramientas para negociar, sostener el estrés o coordinar a su
equipo. Ese es el hueco que FSH Hub cubre.

## La solución

FSH Hub es una plataforma de entrenamiento **personalizado** de habilidades
socioemocionales para builders Web3, diseñada por psicólogas y pagada y
acreditada on-chain en Stellar:

1. **Diagnóstico** de fortalezas y áreas a desarrollar (Big Five + BESSI).
2. **Módulos por dominio conductual** (pitch persuasivo, gestión del estrés y
   burnout, coordinación asertiva) dictados 1:1 por una entrenadora.
3. **Pago en escrow** (Trustless Work / Soroban): el builder deposita USDC antes
   de la sesión, los fondos quedan bloqueados y se liberan solo cuando la
   sesión ocurrió. Sin intermediarios ni cobros anticipados sin servicio.
4. **Acreditación verificable** (roadmap): credenciales ACTA en Soroban que
   prueban las habilidades entrenadas.

## Metodología: de Dev Full Stack a Full Stack Human

La metodología combina dos marcos con amplia base empírica.

### Big Five (OCEAN): quién eres

El modelo de los Cinco Grandes describe la personalidad en cinco rasgos:
**O**penness (apertura), **C**onscientiousness (responsabilidad),
**E**xtraversion, **A**greeableness (amabilidad) y **N**euroticism (inverso de la
estabilidad emocional). Es el modelo de personalidad más replicado de la
psicología y el mejor predictor no cognitivo de desempeño laboral:

- El metaanálisis de Barrick y Mount (1991, _Personnel Psychology_) encontró
  que la **responsabilidad** predice el desempeño en todos los grupos
  ocupacionales estudiados, incluidos los profesionales técnicos, y que la
  **extraversión** predice el éxito en roles con interacción social (ventas,
  gestión), justo el terreno de un pitch a VCs o un grant committee.
- Judge, Higgins, Thoresen y Barrick (1999) siguieron a personas durante décadas
  y hallaron que responsabilidad y baja neuroticidad predicen el éxito
  profesional (ingresos y estatus) incluso controlando por inteligencia.
- La estabilidad emocional (bajo neuroticismo) se asocia consistentemente con
  menor burnout y mejor afrontamiento del estrés, el riesgo número uno en
  sprints de mainnet y hackathons.

FSH Hub **no intenta cambiar tu personalidad**: usa tu perfil OCEAN para elegir
qué herramientas operativas enseñarte y cómo (por ejemplo, un pitch para un
builder introvertido se estructura distinto al de uno extravertido, pero ambos
pueden ser igual de persuasivos).

### BESSI: qué sabes hacer

El _Behavioral, Emotional, and Social Skills Inventory_ (Soto, Napolitano,
Sowden y Roberts, 2022) distingue entre **rasgos** (tendencias) y
**habilidades** (capacidad de ejecutar una conducta cuando la situación lo
pide). A diferencia de los rasgos, las habilidades se entrenan directamente.
BESSI organiza 32 habilidades en cinco dominios, que son los cinco ejes del
catálogo de FSH Hub:

| Dominio BESSI         | Rasgo Big Five relacionado | Ejemplo en un equipo Stellar                          |
| --------------------- | -------------------------- | ----------------------------------------------------- |
| Autogestión           | Responsabilidad            | Cumplir milestones de SCF sin sobrecargar al equipo   |
| Compromiso social     | Extraversión               | Pitch a VCs, liderar una community call               |
| Cooperación           | Amabilidad                 | Resolver conflictos de diseño en un equipo dev remoto |
| Resiliencia emocional | Estabilidad emocional      | Sostener un incidente en mainnet sin quemarse         |
| Innovación            | Apertura                   | Reencuadrar el producto tras el feedback de usuarios  |

La evidencia de que estas habilidades sí cambian con intervención es sólida:
Roberts et al. (2017, _Psychological Bulletin_) revisaron 207 estudios y
hallaron cambios promedio de ~0,37 desviaciones estándar tras intervenciones de
pocas semanas, con la mayor ganancia en estabilidad emocional, y con efectos que
se mantienen en el tiempo. En FSH Hub cada módulo ataca un dominio BESSI
concreto con práctica situada en escenarios Web3 (grant, hackathon, incidente,
retro de equipo).

> Las cifras anteriores provienen de las fuentes citadas; antes de usarlas en
> material comercial conviene verificar la edición exacta de cada informe.

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

| Variable                      | Purpose                                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_POLLAR_PUBLISHABLE_KEY` | Pollar project key. The provider is pinned to `stellarNetwork: "testnet"`; login uses `{ provider: "google" }`. Add the site origin to the allowed origins of the Pollar project. |
| `VITE_TRUSTLESS_WORK_API_KEY` | Trustless Work API key. The app always talks to the development/testnet API (`https://dev.api.trustlesswork.com`).                                                                |

Without `VITE_POLLAR_PUBLISHABLE_KEY` the login screen renders with the Google
button disabled and an explanatory notice. Without `VITE_TRUSTLESS_WORK_API_KEY`
the wallet, faucets, and scheduling still work, but the payment button reports
that the escrow cannot be deployed.

### Testnet flow

1. **Google sign-in (Pollar)** creates or restores the user's embedded Stellar wallet.
   Right after the first login a typeform-style BESSI questionnaire (10
   questions, one per screen) estimates the user's five skill domains, shows
   the results and recommends the trainer's available module; results are
   stored per wallet and can be redone from _Perfil_.
2. **Friendbot** funds the account with test XLM automatically the first time the
   account does not exist on Horizon; a manual button is also available.
3. **Test USDC (Circle)**: the "Obtener USDC de prueba" button creates the
   USDC trustline with the Pollar wallet (`setTrustline`) when it is missing and
   opens the Circle faucet (<https://faucet.circle.com>, network _Stellar
   Testnet_), which sends 20 test USDC per address every 2 hours. Asset details
   for the Pollar dashboard (enabled assets, testnet):
   - code `USDC`
   - issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`

   The platform and trainer role accounts already hold this trustline (all
   escrow parties need it before funding).

4. **Balances** (XLM + USDC) come from Horizon testnet.
5. **Escrow**: paying a session deploys a Trustless Work _single-release_ escrow
   (10 USDC, user = approver + release signer, trainer = service provider +
   receiver, FSH platform = platform address + dispute resolver), then funds it.
   Both steps are signed by the user's Pollar wallet. The contract ID is shown
   with a Stellar Expert link and stored in `localStorage` per wallet. Every
   on-chain interaction (Friendbot, USDC trustline, deploy, fund, approve,
   release) links to its transaction on Stellar Expert.
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
