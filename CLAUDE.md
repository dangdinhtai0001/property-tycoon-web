# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 5. Task Tracking with Beads (bd)

This project uses `bd` (beads) for all task tracking. Never use markdown TODO lists.

### 5.1. Essential commands

| Command                       | Action                                                                |
|-------------------------------|-----------------------------------------------------------------------|
| `bd prime`                    | Print workflow context + full command reference (run first if unsure) |
| `bd ready`                    | List tasks with no open blockers                                      |
| `bd show <id>`                | View task details                                                     |
| `bd update <id> --claim`      | Atomically claim a task (sets assignee + in_progress)                 |
| `bd close <id>`               | Close a completed task (add comment summarizing changes first)        |
| `bd create "Title" -p <0-3>`  | Create a new task (P0=critical, P3=low)                               |
| `bd remember "insight"`       | Store persistent project memory (do NOT create MEMORY.md files)       |
| `bd dep add <child> <parent>` | Link tasks (blocks, related, parent-child)                            |
| `bd comments add <id> "msg"`  | Append a comment to a task                                            |

### 5.2. Workflow

1. **Before starting any work**, run `bd ready` to find available tasks. If no task exists for what you're about to do,
   create one with `bd create`.
2. **Claim the task** you're working on: `bd update <id> --claim`
3. **When done**, add a comment summarizing changes: `bd comments add <id> "summary of changes"` then close:
   `bd close <id>`
4. **For insights** that should survive context window compaction, use `bd remember "insight"` — not markdown memory
   files.
5. **Run `bd sync`** before ending a session. These guidelines are working if:** fewer unnecessary changes in diffs,
   fewer
   rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 7. RTK — Token-Optimized Commands

**Always prefix commands with `rtk`.** It filters output to essentials, saving 60-99% tokens. Safe to use on any
command — passthrough if no filter exists.

**In command chains, prefix every command:**

```bash
# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

### 6.1. Command Reference

| Category    | Commands                                                                                                                                                     | Savings |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **Build**   | `rtk cargo build`, `rtk cargo check`, `rtk cargo clippy`, `rtk tsc`, `rtk lint`, `rtk prettier --check`, `rtk next build`                                    | 70-87%  |
| **Test**    | `rtk cargo test`, `rtk go test`, `rtk jest`, `rtk vitest`, `rtk playwright test`, `rtk pytest`, `rtk rspec`, `rtk test <cmd>`                                | 60-99%  |
| **Git**     | `rtk git status`, `rtk git log`, `rtk git diff`, `rtk git show`, `rtk git add`, `rtk git commit`, `rtk git push`, `rtk git pull` (all subcommands supported) | 59-80%  |
| **GitHub**  | `rtk gh pr view`, `rtk gh pr checks`, `rtk gh run list`, `rtk gh issue list`, `rtk gh api`                                                                   | 26-87%  |
| **JS/TS**   | `rtk pnpm list`, `rtk pnpm outdated`, `rtk pnpm install`, `rtk npm run`, `rtk npx`, `rtk prisma`                                                             | 70-90%  |
| **Files**   | `rtk ls <path>` (tree), `rtk read <file>`, `rtk grep <pattern>`, `rtk find <pattern>`                                                                        | 60-75%  |
| **Infra**   | `rtk docker ps`, `rtk docker images`, `rtk docker logs`, `rtk kubectl get`, `rtk kubectl logs`                                                               | 85%     |
| **Network** | `rtk curl <url>`, `rtk wget <url>`                                                                                                                           | 65-70%  |
| **Meta**    | `rtk gain` (stats), `rtk gain --history`, `rtk discover` (find missed usage), `rtk proxy <cmd>` (no-filter debug), `rtk init` (add to CLAUDE.md)             | —       |

### 6.2. Analysis Helpers

```bash
rtk err <cmd>        # Filter errors only from any command
rtk log <file>       # Deduplicated logs with counts
rtk json <file>      # JSON structure without values
rtk deps             # Dependency overview
rtk env              # Environment variables compact
rtk summary <cmd>    # Smart summary of command output
rtk diff             # Ultra-compact diffs
```

**Overall average: 60-90% token reduction on common dev operations.**
