# Context management (global rules)

Before each user message, a hook injects a line like `[context] X / Y tokens (P%), warn at W`. That is the real current size of the context.
In long sessions every turn re-reads the whole history, which is expensive and degrades quality, so wrap up at sensible breakpoints.

## What counts as a breakpoint
Any one of these:
- An independent subtask is finished (feature done, bug fixed, one refactor pass complete)
- Tests/build pass and the working tree is in a stable state
- The `[context]` line says `THRESHOLD EXCEEDED` (the warn threshold has been passed)
- The user is about to switch to an unrelated topic

## At a breakpoint, in order
1. Once the working tree is stable: commit unless the user objects. Push per the project's convention; if unsure, ask first.
2. Suggest the user run `/compact`. The default summary already keeps the goal, changed files and open items, so do not write a long template. Only when there is a "decision that is not visible in the code" or an "important pending item", add one line, for example:
   `/compact Remember: decided not to split the useFoo hook`
   Otherwise just say "good time to /compact".
3. If the next task is unrelated to the current one, suggest `/clear` or a new session instead of compacting.

## Do not
- Do not interrupt to suggest compacting while the code is broken or a task is half-done; reach a stable point first.
- Do not pretend you ran `/compact` or `/clear`; only the user can.
- Remind once per breakpoint, not every turn. If there is no breakpoint and no threshold breach, do not bring up compacting.
- Do not repeat the `[context]` numbers in replies unless the user asks or you are giving a compact suggestion.

## Threshold
The threshold is `warn_tokens` in `~/.claude/ctx/config.json`, which the user adjusts. Trust the number the hook injects; do not estimate it yourself.
