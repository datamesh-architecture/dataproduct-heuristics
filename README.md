# Data Product Cut – Decision Canvas Assistant

This project is a React + TypeScript frontend that guides data product teams through the heuristics outlined in `data_product_cut_decision_canvas.md`. The UI focuses on one heuristic at a time, surfaces summaries between sections, and ends with a transparent score table. Local storage keeps answers between sessions, and a dedicated button clears all saved data instantly.

## Tech stack

- React 18 with TypeScript
- Vite for development/build
- Tailwind CSS for styling
- Jest + React Testing Library for unit tests

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Run the type-safe production build:
   ```bash
   npm run build
   ```
4. Preview the production bundle locally:
   ```bash
   npm run preview
   ```

## Testing

Unit tests cover the wizard navigation, persistence behaviour, and outcome summary rendering.

```bash
npm test
```

Use `npm run test:watch` for an interactive workflow.

## Project structure

- `src/data/heuristics.ts` – Canonical representation of every heuristic, summary step, scoring helpers, and recommendation logic.
- `src/components/` – Presentation components (`QuestionCard`, `SummaryCard`, `FinalSummary`).
- `src/App.tsx` – Stepper experience, storage hydration, and navigation controls.
- `src/__tests__/` – Jest + RTL test suites.

## Local storage

Answers live under the `data-product-cut-answers` key. Click **Start over** in the header to reset the questionnaire and wipe the key from the browser.
