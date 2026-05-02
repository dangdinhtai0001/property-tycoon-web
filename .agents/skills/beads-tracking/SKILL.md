---
name: beads-tracking
description: Use Beads for repo-level issue tracking, durable follow-up work, and persistent project knowledge.
---

# Beads Tracking Skill

Use this skill for repo-level implementation work, issue tracking, and durable follow-up tasks.

Tiny explanatory, review-only, or clarification tasks do not require a Beads issue unless the user or project policy asks for one.

## Prime issue context

Run this when full issue workflow context is needed:

```bash
bd prime
````

## Common commands

```bash
bd ready
bd show <id>
bd update <id> --claim
bd close <id>
bd remember "<useful persistent project knowledge>"
```

## Rules

* Use `bd` for repo-level implementation work, issue tracking, and durable follow-up tasks.
* Do not use TodoWrite, TaskCreate, or ad-hoc markdown TODO lists for project task tracking.
* Use `bd remember` for durable project knowledge.
* Do not create or edit `MEMORY.md` files unless explicitly instructed.
* If Beads conflicts with `.llm/memory` guidance, use Beads for persistent project knowledge unless the user explicitly requests otherwise.

## Fallback when bd is unavailable

If `bd` is unavailable or fails:

1. Report the exact command.
2. Report the error output.
3. Continue only with non-destructive work that can be safely verified without Beads.
4. Do not claim Beads state was updated.
5. Include any skipped Beads action in the final response.
