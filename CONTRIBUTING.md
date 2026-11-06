# Contribute

Use the Node 22 version in [.nvmrc](.nvmrc) and the pnpm version in `package.json`.
Run commands from the repository root in a POSIX shell.
Style Dictionary v5 is the only direct dependency. Use Node built-in modules for scripts and tests.

## Check a change locally

```sh
pnpm install
pnpm check:all
pnpm test
```

`check:all` builds and checks every directory under `brands/`.
`test` checks the contrast maths and builds every shipped brand to check its pairs.

To build and check one brand, run:

```sh
BRAND=northwind pnpm tokens
```

To run the steps separately, use:

```sh
BRAND=northwind pnpm build
pnpm check northwind
```

Build again after a token change. The checker reads `dist/<brand>/tokens.json` and does not rebuild tokens.
Do not edit or commit `dist/` or `node_modules/`.

## Add a brand

1. Copy an example directory, such as `brands/acme/`, to `brands/contoso/`.
2. Edit the description and values in `core.tokens.json`. Keep the shared semantic token names.
3. Define the brand colour scale, neutrals, spacing, radii, and typography in DTCG 2025.10 format.
4. Use opaque sRGB colour objects. Use token aliases for semantic colours where possible.
5. Edit `brands/contoso/pairs.json` to cover the brand's foreground and background combinations.
6. Run `BRAND=contoso pnpm tokens`.
7. Run `pnpm check:all` and `pnpm test` before you open a pull request.

The all-brands command, tests, and CI discover directories under `brands/`.
You do not need to add the brand to a second list.

## Add a contrast pair

Add a tuple to the brand's `pairs.json`:

```json
[
	["color.text-muted", "color.surface-raised", 4.5]
]
```

The entries are the foreground token path, the background token path, and the minimum contrast ratio.
Use paths from the generated `tokens.json`, including the dots between groups.
Both tokens must resolve to opaque, six-digit sRGB hex colours in that output.

Choose the minimum for the actual use:

| Minimum | Use |
| --- | --- |
| 3 | AA large text or qualifying non-text UI components |
| 4.5 | AA normal text or AAA large text |
| 7 | AAA normal text |

Large text means at least 18 pt, or 14 pt when bold, under WCAG.
The checker accepts these three minimum values. It cannot infer text size or component use.
Add each background that the foreground can appear on.

Run the brand's build and check, then inspect `dist/<brand>/contrast-report.json`.
The report keeps full ratios. The terminal table rounds ratios to two decimal places.
A displayed `4.50` can still fail a minimum of 4.5.

## Resolve a failed check

A failing pair blocks merge. Change the colours or correct the intended foreground and background use, then rebuild.
Do not remove a pair or lower its minimum to hide a failure.
If a use changes, explain the pair change in the pull request.

The `Tokens` workflow runs on pushes and pull requests.
Repository administrators must require its `Build and check tokens` status in the GitHub repository rules.
The workflow alone does not configure those rules.

Include the reason for a token change and the local check results in the pull request.
For pipeline changes, update the relevant documentation and [changelog](CHANGELOG.md).
