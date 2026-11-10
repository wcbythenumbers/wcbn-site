# WCBN site — instructions for Claude Code

## Git workflow (always)
- Work directly on the `main` branch. Do not create new branches or worktrees, and do not switch away from `main`.
- If the repo is not on `main` when a session starts, stop and tell the user before making changes.
- When the user asks to commit (or a prompt says to commit), commit on `main` and then push to GitHub with `git push origin main`, so Vercel deploys it to the live site. Confirm in your reply that the push to `origin main` succeeded.
- Do not commit `.DS_Store` or anything in `.claude/`.

## Scope
- Do not modify anything outside the scope of the request. Preserve all existing components, styles, and functionality exactly as they are — including the Subscribe button, WCBN logo, and all other nav items. Mobile-first: minimum 44px tap targets throughout.
