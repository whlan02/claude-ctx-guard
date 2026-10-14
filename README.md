# claude-ctx-guard

Let Claude Code see its own context size, and nudge you to `/compact` at the right moment, before long sessions get slow, expensive and fuzzy.

A tiny hook injects the **exact token count** into every prompt (`[context] 117.7k / 1.00M tokens (12%), warn at 150.0k`). A short rule set tells the agent what to do at natural breakpoints: commit, then suggest `/compact` (with a one-line note only when a non-obvious decision must survive).

## Install (let Claude do it)

Paste this into Claude Code:

```text
Install claude-ctx-guard from https://github.com/whlan02/claude-ctx-guard
by following its INSTALL.md. Show me the settings.json change before applying it.
```

Then open a **new session** and ask: *"What does the [context] line say?"* If Claude quotes it, you're done.

## What you get

- **Exact tokens, every turn.** Not just a percentage, and visible to the agent, not only to you.
- **Your threshold.** Edit `warn_tokens` in `~/.claude/ctx/config.json`; it takes effect on the next message.
- **Sensible nudges.** At task boundaries or above the threshold, the agent commits and suggests `/compact` (or `/clear` for unrelated work). It never interrupts half-done work.

## Config

`~/.claude/ctx/config.json`

| key | default | meaning |
|---|---|---|
| `warn_tokens` | `150000` | above this, the agent is told to suggest compacting |
| `context_window` | `1000000` | your model's window size (use `200000` for 200k models) |

## Limits (read these)

- The agent **cannot run `/compact` itself**. It can only remind you and give you the command.
- Token counts come from the session transcript (`usage` of the latest main-thread response). After `/compact`, the number is stale until the next response.
- Window size is not auto-detected; set `context_window` yourself.
- Tested on Claude Code Desktop, Windows 11. The statusline route does not work in Desktop (it never runs), which is why this uses a `UserPromptSubmit` hook.

## Uninstall

Remove the `UserPromptSubmit` entry that points at `ctx-hook.mjs` from `~/.claude/settings.json`, delete `~/.claude/ctx/`, and delete the block between `<!-- claude-ctx-guard:start -->` and `<!-- claude-ctx-guard:end -->` in `~/.claude/CLAUDE.md`.

## License

MIT
