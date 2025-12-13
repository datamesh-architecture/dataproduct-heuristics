# Repository Guidelines

## Project Structure & Module Organization
`src/App.tsx` orchestrates the stepper UI, `src/components/` holds cards, navigation, and summary widgets, and `src/data/heuristics.ts` models the scoring logic for each decision heuristic. Tailwind styles live alongside components, while shared config files (`vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`) sit at the root. Tests reside in `src/__tests__/`, and the canonical heuristic reference lives in `data_product_cut_decision_canvas.md`.

## Build, Test & Development Commands
- `npm run dev` – launches Vite with hot reload; visit the printed localhost port.
- `npm run build` – type-checks via `tsc -b` and emits the production bundle in `dist/`.
- `npm run preview` – serves the build locally to validate deployment artifacts.
- `npm test` / `npm run test:watch` – runs Jest suites once or in watch mode; use watch when iterating on questions or summaries.

## Coding Style & Naming Conventions
Maintain TypeScript strictness defined in `tsconfig.json` and keep components typed explicitly (no implicit `any`). React components and hooks use PascalCase (e.g., `QuestionCard`, `useScoreTable`), helper utilities use camelCase, and test files mirror their targets (`QuestionCard.test.tsx`). Stick to Tailwind utility classes for styling; co-locate component-specific styles rather than editing global CSS. Format code with the default VS Code TypeScript + ESLint settings (2-space indent) and run `npm run build` before pushing to catch type issues early.

## Testing Guidelines
Jest with React Testing Library drives unit coverage; focus on the wizard flow, local-storage hydration, and scoring summaries. Place tests under `src/__tests__/` or next to the component using the `.test.tsx` suffix. Prefer descriptive `describe`/`it` names that mirror user journeys (“persists answers between sessions”). When adding new heuristics or summary steps, extend both the data model and the relevant snapshot tests to avoid regressions.

## Commit & Pull Request Practices
Follow the existing imperative-tense style (“Add question reset button”, “Refine summary table”). Keep commits small, grouping related UI and data updates. Pull requests should include: purpose summary, screenshots or GIFs for UI changes, test plan (commands + outcomes), and references to issues or heuristics sections impacted. Ensure `npm run build` and `npm test` pass before requesting review; note any follow-up work explicitly in the PR description.

## Local Storage & Configuration Tips
The questionnaire persists under the `data-product-cut-answers` key; when testing reset flows, click **Clear saved answers** or wipe the key via DevTools. Avoid renaming this key without updating the clear-storage button logic inside `src/App.tsx`. For environment tweaks, prefer `.env.local` consumed by Vite and document any new variables in the README.
