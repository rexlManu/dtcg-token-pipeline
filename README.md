# DTCG token pipeline

A reference implementation for teams that want design tokens in Git and a repeatable contrast check.
It builds two example brands from [DTCG 2025.10 JSON](https://www.designtokens.org/tr/2025.10/format/) with Style Dictionary v5.
A Node script checks the resolved colours against each brand's contrast pairs.

Use this repository as a starting point for a token pipeline.
It is not a complete design system or an accessibility certification.

## Example brands

Both brands have a ten-step brand colour scale, neutrals, spacing, radii, typography, and semantic colour aliases.
They share token names so a consumer can switch brand stylesheets.

| Brand | Palette and layout | Font stack |
| --- | --- | --- |
| `acme` | Blue, warm neutrals, wider spacing, softer corners | Inter with system fallbacks |
| `northwind` | Teal, cool neutrals, compact spacing, smaller corners | Source Sans 3 with system fallbacks |

The font files are not included. Each stack works with its system fallbacks.
Each brand has its own [contrast pairs](brands/acme/pairs.json), including text, muted text, brand buttons, and danger text.
Northwind's [pair list](brands/northwind/pairs.json) also requires AAA for muted text on its main surface.

## Run the pipeline

Use Node 22.23.1 from [.nvmrc](.nvmrc) and pnpm 10.34.5 from `package.json`.
Style Dictionary is the only direct dependency. The checker and tests use Node built-in modules.
Run these commands from the repository root:

```sh
	pnpm install
	pnpm test
```

`test` runs the contrast maths tests and verifies every shipped brand with a fresh build.

To build and check the default brand, Acme, run:

```sh
	pnpm tokens
```

Set `BRAND` to select another brand. These examples use POSIX shell syntax:

```sh
	BRAND=northwind pnpm tokens
```

You can also run the build and check separately:

```sh
	BRAND=northwind pnpm build
	pnpm check northwind
```

The checker accepts a positional brand, then uses `BRAND`, then defaults to `acme`.
It reads the existing build output. Rebuild after a source token change.

## Source and output formats

Edit `brands/<brand>/*.tokens.json` and `brands/<brand>/pairs.json`.
Source colours use DTCG sRGB objects. Semantic tokens refer to scale tokens with aliases such as `{color.palette.brand.600}`.
Style Dictionary resolves the aliases before the contrast check.

The pipeline writes these files for each brand:

| File | Contents |
| --- | --- |
| `dist/<brand>/variables.css` | CSS custom properties in `:root`, such as `--color-brand` and `--space-md` |
| `dist/<brand>/tokens.json` | Flat, resolved values with dot-separated paths, such as `color.brand` |
| `dist/<brand>/contrast-report.json` | The brand, pair counts, colours, full ratios, minimums, WCAG levels, and pass results |

JSON values use the same CSS transforms as the stylesheet.
Colours become hex values, dimensions include units, and font families become CSS font stacks.
The generated JSON is a consumer format, not a second DTCG source.
Generated files are ignored by Git.

Load one brand stylesheet at a time. Both stylesheets define the same variable names in `:root`.

```css
	@import './dist/acme/variables.css';

	.button {
	  color: var(--color-on-brand);
	  background: var(--color-brand);
	  padding: var(--space-sm) var(--space-md);
	  border-radius: var(--radius-md);
	  font-family: var(--font-family);
	}
```

## Contrast and the CI gate

Each pair is `[foreground token path, background token path, minimum ratio]`.
The checker calculates [WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) for opaque sRGB colours.
It compares the full ratio with the minimum and rounds only the terminal table to two decimal places.

The report labels ratios of at least 7 as `AAA`, at least 4.5 as `AA`, and at least 3 as `AA large`.
Lower ratios receive `Fail`. `AAA` and `AA` refer to normal text.
A pair passes only when its ratio meets its own minimum.
For example, a pair with an `AA` result still fails a minimum of 7.

The [Tokens workflow](.github/workflows/tokens.yml) runs on pushes and pull requests with a pinned Node 22 version.
It installs the lockfile, builds and checks every brand, and runs the tests.
It uploads contrast reports as artifacts for 14 days, including reports with failed pairs.
A failed pair returns a non-zero exit code and fails the CI job.

Require the `Build and check tokens` status in GitHub repository rules to block merges when the gate fails.
The workflow does not configure those rules itself.

See [CONTRIBUTING.md](CONTRIBUTING.md) to add a brand or a pair.
The [decision records](docs/decisions.md) explain the source format and contrast gate.
The [changelog](CHANGELOG.md) records changes to the reference pipeline.

## Limitations

- No Figma sync. Token JSON is the source of truth, and no design tool adapter is included.
- No dark mode. Each example brand defines one light theme.
- No publishing yet. The package is private, and outputs are local build files or CI artifacts.
- The contrast gate covers only listed pairs. It does not inspect pages, font sizes, states, or component use.
- The checker accepts only opaque, six-digit sRGB hex colours in the build output. It rejects alpha and other colour formats.
- The checker does not model gradients, images, transparency, or browser rendering.
