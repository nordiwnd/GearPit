# Workflow: PR & CI Triage (CI Loop)

Focus: Monitoring GitHub Actions and fixing regressions.

## 1. PR Creation
- Summarize changes.
- Instruct user to push and create PR.

## 2. CI Monitoring
- Watch GitHub Actions output.

## 3. Triage (If CI Fails)
- **Do NOT** run local tests blindly.
- Reference Skill: `ci-triage` (Analyze logs for ARM64 specific issues or Race Conditions).
- Propose fixes to be applied in `feature-dev` workflow.

## 4. Merge Ready
- If CI passes: Mark task as Done.