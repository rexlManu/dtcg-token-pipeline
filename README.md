# DTCG token pipeline

Reference implementation of a design-token pipeline with WCAG contrast gating, used as the
starting point for brand projects.

- Source tokens are DTCG 2025.10 JSON (`tokens/*.tokens.json`), the same shape Figma Variables
  export into through the Variables REST API.
- Style Dictionary v5 builds CSS custom properties and a flat JSON for apps.
- `pnpm check` fails the build when a defined foreground/background pair drops below its WCAG AA
  ratio, so a token change cannot ship a contrast regression.

```sh
pnpm install
pnpm tokens
```

Add pairs to `tokens/contrast-pairs.json` with the minimum ratio that applies (4.5 for body text,
3.0 for large text and UI borders, 7.0 for AAA).
