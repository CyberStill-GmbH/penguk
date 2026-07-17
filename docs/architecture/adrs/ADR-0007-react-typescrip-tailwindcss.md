# ADR-0007 — Use React + TypeScript + Tailwind CSS

## Status

Accepted

## Context

Penguk's frontend must support a custom design produced in Figma, be
maintainable by open-source contributors, and share type definitions and
tooling conventions with the backend (ADR-0002) where practical.

## Decision

Penguk's frontend is built with React and TypeScript, styled with
Tailwind CSS. UI components are implemented using shadcn/ui, which
provides unstyled primitives (via Radix UI) copied directly into the
codebase and restyled to match the Figma design, rather than adopting an
opinionated component library's default design system.

## Consequences

### Positive

- A single language (TypeScript) across backend and frontend reduces
  context-switching for contributors and enables shared type definitions
  where relevant.
- Tailwind's utility-first approach allows the Figma design to be
  implemented directly without fighting a third-party design system.
- shadcn/ui components live in the codebase itself, avoiding external
  version drift and giving full control over behavior and styling.

### Negative

- Utility-first CSS can reduce readability in markup for contributors
  unfamiliar with Tailwind's conventions.
- Copying components into the codebase (shadcn/ui) means updates to the
  underlying primitives must be applied manually rather than through a
  package upgrade.

## Alternatives Considered

- **Vue or Svelte** — rejected; smaller overlap with the TypeScript-first,
  React-experienced tooling and ecosystem the project is standardizing on.
- **Material UI / Chakra UI** — rejected; both impose their own design
  system, which would conflict with implementing a custom Figma design
  faithfully.