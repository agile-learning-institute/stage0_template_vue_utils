# Template Changes Proposal: stage0_template_vue_utils

Proposed updates to align the template with the tested fixes in mentorhub_spa_utils. All changes have been validated in the generated repo.

---

## 1. process.yaml – Add port context and merge config files

**Add context selectors** for `common_code`, `api_utils`, and `spa_utils` (needed for port placeholders):

```yaml
  - key: architecture
    type: path
    path: specifications.architecture.architecture
  - key: common_code
    type: selector
    path: architecture.domains
    filter:
      property: name
      value: "common_code"
  - key: api_utils
    type: selector
    path: common_code.repos
    filter:
      property: name
      value: "api_utils"
  - key: spa_utils
    type: selector
    path: common_code.repos
    filter:
      property: name
      value: "spa_utils"

requires:
  # ... existing requires ...
  - common_code
  - api_utils.port
  - spa_utils.port
```

**Add templates** for the dev/Cypress config files so they are merged:

```yaml
  - path: "./vite.config.dev.ts"
    merge: true
  - path: "./cypress.config.ts"
    merge: true
```

**Note:** If `common_code`, `api_utils.port`, and `spa_utils.port` are already in `requires`, add the context selectors above. Without them, the merge will fail.

---

## 2. vite.config.dev.ts – Use architecture ports

**Current (hardcoded):**
```ts
  server: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/dev-login': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
```

**Proposed (from architecture):**
```ts
  server: {
    port: {{ spa_utils.port }},
    proxy: {
      '/api': {
        target: 'http://localhost:{{ api_utils.port }}',
        changeOrigin: true
      },
      '/dev-login': {
        target: 'http://localhost:{{ api_utils.port }}',
        changeOrigin: true
      }
    }
  }
```

---

## 3. cypress.config.ts – Use spa_utils port

**Current:**
```ts
    baseUrl: 'http://localhost:8081',
```

**Proposed:**
```ts
    baseUrl: 'http://localhost:{{ spa_utils.port }}',
```

---

## 4. CONTRIBUTING.md – Use api_utils port placeholder

**Current:**
```markdown
# Assumes api_utils dev server running at localhost:8080
npm run dev
```

**Proposed:**
```markdown
# Assumes api_utils dev server running at localhost:{{ api_utils.port }}
npm run dev
```

---

## 5. tests/setup.ts – Already updated ✓

Console.error suppression for Auto-save error tests is already in place. No further changes needed.

---

## 6. vitest.config.ts – Already updated ✓

Coverage exclusions for `cypress/**`, `demo/**`, `**/vite-env.d.ts`, and `**/vite.config*.ts` are already in place. No further changes needed.

---

## 7. test_expected – Update expected output

After applying the template changes, regenerate and update `test_expected/` to match:

- `test_expected/vite.config.dev.ts` – use ports 8387 and 8388 (mentorhub values)
- `test_expected/cypress.config.ts` – use baseUrl `http://localhost:8388`
- `test_expected/CONTRIBUTING.md` – use 8387 for api_utils port

---

## Summary

| File | Action |
|------|--------|
| `.stage0_template/process.yaml` | Add context selectors, add templates for vite/cypress configs |
| `vite.config.dev.ts` | Replace 8080/8081 with `{{ api_utils.port }}` / `{{ spa_utils.port }}` |
| `cypress.config.ts` | Replace 8081 with `{{ spa_utils.port }}` |
| `CONTRIBUTING.md` | Replace 8080 with `{{ api_utils.port }}` |
| `tests/setup.ts` | Already done |
| `vitest.config.ts` | Already done |
| `.stage0_template/test_expected/*` | Update after merge validation |

---

## Architecture dependency

These changes assume the architecture specification includes a `common_code` domain with `api_utils` (port 8387) and `spa_utils` (port 8388) repos. Products without this structure will need to adjust or add the `common_code` domain.
