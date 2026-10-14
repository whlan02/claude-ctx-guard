// UserPromptSubmit hook: read the session transcript, compute current context tokens,
// and inject the number into the agent's context. Threshold lives in config.json.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
let input = {};
try { input = JSON.parse(raw); } catch {}

let cfg = { warn_tokens: 150000, context_window: 1000000 };
try {
  cfg = { ...cfg, ...JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'ctx', 'config.json'), 'utf8')) };
} catch {}

// Last main-thread assistant usage = size of the context sent on the latest API call.
function lastUsage(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const len = Math.min(size, 4 * 1024 * 1024);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    const lines = buf.toString('utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i].includes('"usage"')) continue;
      let o;
      try { o = JSON.parse(lines[i]); } catch { continue; }
      if (o.type !== 'assistant' || o.isSidechain) continue;
      const u = o.message && o.message.usage;
      if (u) return u;
    }
  } finally {
    fs.closeSync(fd);
  }
  return null;
}

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : (n / 1e3).toFixed(1) + 'k');

let text = '';
try {
  const u = input.transcript_path && lastUsage(input.transcript_path);
  if (u) {
    const used = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
    const pct = ((used / cfg.context_window) * 100).toFixed(0);
    text = `[context] ${fmt(used)} / ${fmt(cfg.context_window)} tokens (${pct}%), warn at ${fmt(cfg.warn_tokens)}.`;
    if (used >= cfg.warn_tokens) {
      text += ' THRESHOLD EXCEEDED: at the next natural stopping point, commit/push if appropriate, then tell the user to /compact (give a ready-to-paste /compact instruction) or start a new session. Do not interrupt work that is half-done.';
    }
  }
} catch {}

if (text) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: text },
  }));
}
