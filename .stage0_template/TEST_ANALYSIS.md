# Test Analysis: mentorhub_spa_utils (stage0_template_vue_utils)

**Date:** 2025-02-11  
**Template:** stage0_template_vue_utils  
**Generated output:** mentorhub_spa_utils  
**Test command:** `npm run test`

## Executive Summary

All **90 unit tests pass** in mentorhub_spa_utils when running `npm run test`. However, several issues were identified that may cause confusion, noisy output, or future failures. This document characterizes these problems and recommends template updates.

---

## 1. Stderr Pollution During Tests (Primary Test-Related Issue)

### Observation

When running tests, the following stderr output appears:

```
stderr | tests/components/AutoSaveField.test.ts > AutoSaveField > should handle save errors
Auto-save error: Error: Save failed
    at ...

stderr | tests/components/AutoSaveSelect.test.ts > AutoSaveSelect > should handle save errors
Auto-save error: Error: Save failed
    ...

stderr | tests/components/AutoSaveSelect.test.ts > AutoSaveSelect > should handle error without message
Auto-save error: {}

stderr | tests/components/AutoSaveField.test.ts > AutoSaveField > should handle error without message
Auto-save error: {}
```

### Root Cause

`AutoSaveField.vue` and `AutoSaveSelect.vue` both call `console.error('Auto-save error:', err)` in their catch blocks when `onSave` fails. The tests intentionally trigger these errors to verify error-handling behavior (e.g., that `vm.error` is set correctly). The component correctly logs the error for debugging in production, but this produces noisy stderr during unit tests.

### Template Fix Recommendation

**Option A (recommended):** Suppress `console.error` during error-handling tests in `tests/setup.ts` or per-test. Add to `tests/setup.ts`:

```ts
// Suppress expected console.error in error-handling tests (AutoSaveField, AutoSaveSelect)
const originalError = console.error
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Auto-save error:')) {
    return // Suppress in tests
  }
  originalError.apply(console, args)
}
```

**Option B:** Alternatively, mock `console.error` in the specific tests that trigger save errors (e.g., `beforeEach` or within the test). This keeps the suppression localized but requires changes in multiple test files.

**Option C:** Use Vitest's `stderr` configuration to silence or redirect stderr during tests. Vitest does not provide a built-in way to filter stderr by message, so Option A or B is cleaner.

---

## 2. process.yaml Metadata Mismatch

### Observation

The `stage0_template_vue_utils/.stage0_template/process.yaml` contains:

```yaml
$id: "https://stage0/template-configurator-api/process.yaml"
title: Process file for a MongoDB configurator API template
```

This metadata appears to have been copied from a different template (e.g., `stage0_template_configurator_api` or `stage0_template_mongodb_api`). The Vue SPA utils template is not a MongoDB configurator API.

### Root Cause

Copy-paste or template-forking without updating metadata.

### Template Fix Recommendation

Update `process.yaml` in `stage0_template_vue_utils`:

```yaml
$id: "https://stage0/stage0_template_vue_utils/process.yaml"
title: Process file for Vue SPA utility library template
```

Additionally, the `requires` section includes `info.db_name`, `info.base_port`, and `architecture.domains`. The SPA utils template does not appear to use these in its merged files. Consider whether these are truly required or can be relaxed to align with the template's actual needs. If the merge succeeds with the current product/architecture specs, this may be harmless but is worth reviewing.

---

## 3. CONTRIBUTING.md Uses Generic "spa_utils" Name

### Observation

The CONTRIBUTING.md heading says "Contributing to spa_utils" and the project structure diagram shows `spa_utils/`. The actual package name is `{{info.slug}}_spa_utils` (e.g., `mentorhub_spa_utils`).

### Root Cause

The template uses a hardcoded generic name instead of the product-specific slug.

### Template Fix Recommendation

Update the template CONTRIBUTING.md to use:

- Heading: `# Contributing to {{info.slug}}_spa_utils`
- Project structure: `{{info.slug}}_spa_utils/` in the diagram

This ensures generated output matches the actual package name.

---

## 4. Lint Script Without ESLint Config

### Observation

`package.json` includes `"lint": "eslint src"` but:

- ESLint is **not** in `devDependencies`
- No `eslint.config.js` or `.eslintrc.*` exists

Running `npm run lint` fails with:

```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

### Root Cause

The lint script was added to package.json without adding ESLint as a dependency or providing a config file. CI does not run `npm run lint`, so this does not cause CI failures, but it can confuse developers who run it locally.

### Template Fix Recommendation

**Option A:** Add ESLint and a config to the template:

- Add `eslint`, `@eslint/js`, `typescript-eslint` (or equivalent) to devDependencies
- Add `eslint.config.js` (flat config for ESLint 9+) or `.eslintrc.cjs` for older ESLint

**Option B:** Remove the lint script from package.json if linting is not intended for this template, or document that it must be configured by the consuming project.

---

## 5. Vitest Coverage Thresholds

### Observation

Coverage run completed successfully. All thresholds are met:

- `src/components/**`: 100% (threshold 85%)
- `src/composables/**`: 94–100% (threshold 90%)
- `src/utils/**`: 100% (threshold 100%)

No coverage-related failures were observed.

---

## 6. CONTRIBUTING.md `npm install` vs `npm install --dev`

### Observation

- Template: `npm install`  
- Some generated output (e.g., mentorhub_spa_utils): `npm install --dev`

`npm install --dev` is deprecated; `npm install` installs devDependencies by default. If the generated repo was manually edited, `--dev` may have been added historically. The template's `npm install` is correct.

---

## Summary of Recommended Template Changes

| Priority | File | Change |
|----------|------|--------|
| High | `tests/setup.ts` | Add `console.error` suppression for "Auto-save error:" to reduce stderr noise |
| Medium | `.stage0_template/process.yaml` | Fix `$id` and `title` to reflect Vue SPA utils template |
| Medium | `CONTRIBUTING.md` | Use `{{info.slug}}_spa_utils` for heading and project structure |
| Low | `package.json` | Either add ESLint + config or remove lint script |
| Low | `process.yaml` | Review `requires` for unnecessary fields (db_name, base_port, etc.) |

---

## Verifying Template Changes

After updating the template:

1. Run the stage0 merge to regenerate `mentorhub_spa_utils` (or equivalent output).
2. Run `npm run test` and confirm no new stderr pollution from Auto-save error tests.
3. Run `npm run test:coverage` and confirm thresholds still pass.
4. If lint is kept, run `npm run lint` and confirm it succeeds.
