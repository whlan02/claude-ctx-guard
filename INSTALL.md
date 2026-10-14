# INSTALL.md (instructions for the AI agent)

You are installing claude-ctx-guard for the user. Follow these steps in order. Never overwrite existing user files; merge. Ask before modifying `settings.json`.

Paths below use `~` for the user's home directory. Use forward slashes in the hook command.

## 1. Preconditions
- Run `node --version`. Node 18+ is required. If missing, stop and tell the user.

## 2. Copy files
- Create `~/.claude/ctx/`.
- Copy `src/ctx-hook.mjs` to `~/.claude/ctx/ctx-hook.mjs` (overwrite is fine, it is ours).
- Copy `src/config.json` to `~/.claude/ctx/config.json` **only if it does not exist** (it holds the user's threshold).
- Ask the user their model's context window (1M or 200k) and set `context_window` accordingly if it differs from the default.

## 3. Register the hook (needs user confirmation)
Read `~/.claude/settings.json` (it may not exist; if so, start from `{}`).
Add this entry to `hooks.UserPromptSubmit`, **keeping every existing hook and key**:

```json
{
  "hooks": [
    { "type": "command", "command": "node ~/.claude/ctx/ctx-hook.mjs" }
  ]
}
```

If an entry with `ctx-hook.mjs` already exists, do nothing. Show the user the resulting diff and wait for a yes before writing.

## 4. Add the rules
Append the contents of `src/rules.md` to `~/.claude/CLAUDE.md` (create it if missing), wrapped like this so it can be removed later:

```text
<!-- claude-ctx-guard:start -->
...contents of src/rules.md...
<!-- claude-ctx-guard:end -->
```

If the markers already exist, replace what is between them instead of appending again.

## 5. Verify
- Test the script against the current transcript. Pipe `{"transcript_path":"<absolute path of this session's .jsonl>"}` to `node ~/.claude/ctx/ctx-hook.mjs`. Use a native OS path (on Windows `C:\...`, not `/c/...`). Expect JSON containing `[context] ... tokens`.
- Tell the user: hooks and CLAUDE.md load at session start, so open a **new session** and ask "What does the [context] line say?". If the agent quotes it, installation worked.

## 6. Report
Tell the user what was changed (three places: `~/.claude/ctx/`, `settings.json`, `CLAUDE.md`), where to edit the threshold (`~/.claude/ctx/config.json`), and that the agent can only suggest `/compact`, not run it.
