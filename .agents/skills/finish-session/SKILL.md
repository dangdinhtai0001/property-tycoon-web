---
name: finish-session
description: Complete a coding session by running final checks, reviewing diffs, updating task state, and reporting commit or push status.
---

# Finish Session Skill

Use this skill before ending a coding session.

Work is complete when the requested change is verified and reported. Commit and push only when the user explicitly asks for it or when project policy for the current task requires it.

## Completion checklist

1. File or update Beads issues for remaining repo-level follow-up work when Beads is available and appropriate.

2. Run relevant quality gates:

```bash
# Examples only; choose commands appropriate to the repo.
npm test
npm run lint
npm run typecheck
npm run build
````

3. Run the workflow report:

```bash
python -m tools.llm_agent_workflow after-change
```

4. Read:

```text
.llm/reports/latest-task-report.md
```

5. Update issue status in `bd` when Beads is available and appropriate.

6. Review the final diff and status:

```bash
git diff
git status --short
```

7. If commit/push is required by the user or project policy, commit with a clear message.

8. If commit/push is required, push:

```bash
git pull --rebase
bd dolt push
git push
git status
```

If Beads is unavailable, skip `bd dolt push` and report that Beads sync was not performed.

## Final response must include

* what changed
* tests/checks run
* workflow report highlights
* commit/push status, or why commit/push was not required
* remaining risks or follow-up issues

## Failure handling

If push fails, diagnose and retry when safe.

If blocked by conflicts, permissions, remote rejection, unavailable tools, or unrelated user changes, stop and report the exact blocker.
