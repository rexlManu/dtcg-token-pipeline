# Changelog

Changes to the reference pipeline are recorded here.
The past versions describe milestones from Git history. They are not published package releases.

## Unreleased

- Split the source into Acme and Northwind brands with colour scales, neutrals, spacing, radii, typography, and semantic aliases.
- Use DTCG 2025.10 sRGB colour objects and resolve aliases with Style Dictionary v5.
- Select a brand with `BRAND`, default to Acme, and generate CSS and flat JSON in `dist/<brand>/`.
- Move contrast pairs into each brand and save ratios, WCAG levels, and pass results in JSON reports.
- Add Node tests for contrast maths, thresholds, rounding, and every shipped brand.
- Check every brand on pushes and pull requests with Node 22 and upload contrast reports.
- Add decision records, contribution steps, and documentation for the pipeline's limits.
- Add `pnpm check:all` to build and check all brand directories with a summary and a failing exit code when needed.

Source tokens move from `tokens/core.tokens.json` to `brands/<brand>/core.tokens.json`.
Contrast pairs move from `tokens/contrast-pairs.json` to `brands/<brand>/pairs.json`.
Consumers must use the brand-specific output path instead of `dist/variables.css`.

## 0.2.0 - 2026-10-27

- Explain the JSON source of truth and the contrast gate in the README.
- Rename the muted surface token to `color.surface-raised`.

## 0.1.0 - 2026-09-19

- Add the initial JSON token set for colours, spacing, radii, and fonts.
- Add a Style Dictionary v5 build for CSS custom properties.
- Add a Node contrast checker and a list of foreground and background pairs.
- Run the contrast check after the token build with the combined `tokens` command.
