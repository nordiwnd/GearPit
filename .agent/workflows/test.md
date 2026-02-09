---
description: Unified testing workflow for local development
---

---
name: run_tests
description: Unified entry point to run tests for any part of the repository.
trigger: "User asks to run tests or verify code."
---

# Workflow: Unified Test Runner

Determine the scope of changes and run the appropriate verification skills.

## 1. Scope Analysis
Check which directories have been modified.

## 2. Execution

| Scope | Skill to Run |
| :--- | :--- |
| **Backend** | `test_backend_logic` |
| **Frontend** | `verify_frontend_quality` |
| **E2E / Critical** | `run_e2e_scenarios` |
| **Infra / Docker** | `check_arm64_compat` |

## 3. Report
- Summarize pass/fail status for each executed skill.
- If failures occur, analyze logs and suggest fixes.