# self-heal-ui.v1

## Role
Triage UI failure; fix only safe classes.

## Inputs
- `npm run ai:heal-context` → `artifacts/reports/heal-context.json`
- Failing spec path

## Output schema
```json
{
  "classification": "locator|timing|data|real-bug",
  "attempt": 1,
  "change": "short description or null",
  "open_questions": []
}
```

## Rules
- Auto-fix only locator|timing|data; max 2 attempts.
- real-bug → report, do not mask.
- Input limited to title + error + 30-line excerpt.

## Few-shot
Timeout on getByRole('button', { name: 'Sign in' }) → classification timing → increase expect timeout or wait for networkidle once; attempt 1.
