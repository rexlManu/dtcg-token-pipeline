# Design decisions

These architecture decision records describe the scope of this reference implementation.
All three decisions are accepted.

## 1. Use DTCG JSON as the single source

### Context

Token changes need a reviewable history and a build that runs without a design tool account.
A Figma-only source ties both tasks to one service and its export process.

### Decision

Keep the source tokens in `brands/<brand>/*.tokens.json` in DTCG 2025.10 format.
Use Style Dictionary v5 to resolve aliases and produce CSS and JSON.

### Consequence

Git records token changes, and the same files drive local builds and CI.
Design tool integration needs a separate adapter. This repository has no Figma sync.

## 2. Check contrast in CI

### Context

A colour change can reduce contrast in an existing foreground and background pair.
Visual review alone does not give a repeatable numeric check.

### Decision

Calculate WCAG contrast from the resolved build output for each listed pair.
Fail the CI job when a pair falls below its minimum. Save a report for review.

### Consequence

Contributors must fix failing pairs before merge.
Repository rules must require the token check to enforce that rule on GitHub.
The check covers listed opaque sRGB pairs. It does not prove that a rendered page meets WCAG.

## 3. Keep contrast pairs with each brand

### Context

Brands share token names but can use different colours and contrast targets.
One global list would force every brand to use the same pair requirements.

### Decision

Store each brand's foreground, background, and minimum ratio tuples in its own `pairs.json`.
Discover brand directories when checking the full repository.

### Consequence

A brand can add a pair or require AAA without changing another brand.
Contributors must maintain each list as colour uses change. An unlisted pair has no contrast gate.
