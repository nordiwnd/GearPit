# Workflow: Feature Development (Local Loop)

Focus: Implementation and Local Verification.

## 1. Context Setup
- Analyze request.
- Reference `.agent/rules/01-stack.md` for tech constraints.

## 2. Implementation
- Modify/Create code.
- Adhere to `02-backend.md` or `03-frontend.md`.

## 3. Local Verification (MANDATORY)
Perform the following skills to verify correctness:

### Backend Changes
- [ ] Run Skill: `test-backend`
- [ ] Verify logs show no errors.

### Frontend Changes
- [ ] Run Skill: `test-frontend`
- [ ] Ensure UI components render correctly.

### Pre-Commit Check (Infrastructure)
- [ ] Run Skill: `verify-arm64`
- [ ] **Constraint:** If this fails, DO NOT COMMIT. Fix architecture issues first.

## 4. Completion
- Once all Skills pass, generate a commit message (English).
- Instruction: "Ready to push. Proceed to `pull-request` workflow."