---
name: context-pilot-workflow
description: Build task context, run preflight, and verify post-change impact for implementation, debugging, review, and explanation work.
---

# Context Pilot Workflow Skill

Use this skill for implementation, debugging, review-only, or explanation tasks in this repository.

## Before editing code

For implementation or debugging tasks, run:

```bash
python -m tools.llm_agent_workflow start "<task>" --mode implement --budget medium
````

Use `--mode debug` for bug investigation, `--mode review` for review-only work, and `--mode explain` for explanation-only work.

For small explanatory tasks, use:

```bash
python -m tools.llm_agent_workflow start "<task>" --mode explain --budget small
```

If `tools.llm_agent_workflow` is unavailable or fails:

1. Report the exact command.
2. Report the error output.
3. Continue only when direct source inspection and relevant tests can provide equivalent verification.
4. Do not edit code if the missing workflow blocks safe progress.

## After running start

1. Read `.llm/context/latest.md`.
2. Check the preflight result.
3. Follow this table:

| Preflight | Required action                                           |
| --------- | --------------------------------------------------------- |
| `PASS`    | Continue normally                                         |
| `WARN`    | Continue, but verify facts directly from source code      |
| `FAIL`    | Do not edit code; report the issue and what must be fixed |
| `BLOCK`   | Stop immediately; report the blocker                      |

## After editing code

After any code or test change, run:

```bash
python -m tools.llm_agent_workflow after-change
```

Then read:

```text
.llm/reports/latest-task-report.md
```

Use the report to identify:

* changed files
* suggested tests
* wiki update needs
* memory/update notes
* verification gaps

If `after-change` says no changes were detected, verify with:

```bash
git diff
```

Do not claim work is complete until the diff and verification status are clear.

## Review-only work

For reviewing current local changes, prefer:

```bash
python -m tools.llm_agent_workflow review --from-git
```

Do not modify code during review unless the user explicitly asks for fixes.
