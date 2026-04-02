# AGENTS.md

This file defines the operating standards for any agent working in this repository.

## Scope

- Apply these rules to all changes in this codebase.
- Prefer minimal, targeted edits that preserve existing behavior.
- Keep the frontend and backend responsibilities separate unless a change explicitly requires both.

## Coding Standards

- Follow the existing TypeScript and React style already used in the repo.
- Keep functions small and focused.
- Prefer composition over duplicated logic.
- Move shared logic into model, controller, or utility modules instead of leaving it in views/components.
- Reuse existing UI components before creating new ones.
- Avoid unnecessary dependencies.
- Preserve the current design language and responsive behavior.
- Use ASCII-only unless the file already contains non-ASCII content or there is a clear reason to add it.
- Do not add comments unless the code is genuinely hard to follow.

## Frontend Standards

- Keep presentation components focused on rendering.
- Keep state, effects, and data transformation in controller or hook layers.
- Keep shared data rules in model or utility files.
- Maintain mobile-first behavior.
- Verify that UI changes work on both mobile and desktop layouts.

## Backend Standards

- Do not change backend behavior unless the task requires it.
- Keep scraper and API changes conservative because upstream markup can change.
- Preserve existing cache and normalization behavior unless a change is intentional.

## Validation Standards

- After code changes, run the smallest meaningful validation first.
- For frontend changes, verify TypeScript and production build success.
- For backend changes, verify backend build or relevant tests.
- If a change affects UI behavior, confirm the app still renders correctly.

## PR Creation Standards

Before opening or preparing a pull request, an agent should:

1. Summarize the change in plain language.
2. List the main files or areas touched.
3. State the validation performed.
4. Call out any known limitations or follow-up work.
5. Keep the PR description concise and factual.

### Suggested PR Structure

- Title: short, imperative, and specific.
- Description:
  - What changed
  - Why it changed
  - How it was validated
  - Any risks or follow-ups

### PR Hygiene

- Do not include unrelated file changes.
- Do not claim tests or validation that were not actually run.
- If the change is UI related, mention the user-facing behavior.
- If the change is safe but incomplete, note the remaining work clearly.

## Commit Message Standards

- Use conventional commit-style prefixes for every commit title.
- Allowed primary types:
  - `feat`
  - `fix`
  - `docs`
  - `refactor`
  - `chore`
  - `test`
  - `build`
  - `ci`
  - `perf`
  - `style`
- Format:
  - `<type>: <short imperative summary>`
  - Example: `feat: add quick preset filters to showtimes view`
  - Example: `fix: handle null booking links in mobile cards`
- Keep commit titles concise and specific.
- Do not use vague titles like `update`, `changes`, or `fix stuff`.

## Working Rules

- Use `apply_patch` for manual file edits.
- Do not revert user changes unless explicitly requested.
- Do not use destructive git commands unless explicitly requested.
- Prefer non-interactive git commands.
- When uncertain, inspect the codebase before editing.

## Repository Context

- This repository is the Where2Watch Cape Town showtimes app.
- Frontend work currently uses a controller/model/view split under `frontend/src/features/showtimes`.
- The app includes live scraping, local filtering, pagination, shareable result links, and a best-pick recommendation.

## Final Output Expectations

When reporting work back to the user:

- Be concise.
- State what changed, what was validated, and any remaining caveats.
- Link to relevant files when helpful.
- If a PR is likely next, include a short PR-ready summary.
