# PRPM OpenCode Plugin Helper

A development tool for building OpenCode plugins. It helps you discover events, debug plugin behavior, and scaffold new plugins with working templates.

## What This Plugin Does

**This is a plugin for plugin developers.** It provides:

1. **Debug Mode** - Logs all OpenCode events and tool executions in real-time
2. **Event Discovery** - Lists all available events you can hook into
3. **Template Scaffolding** - Provides working starter code for common plugin patterns

## Installation

```bash
# Copy the .opencode folder to your project
cp -r .opencode /path/to/your/project/
```

Or install via PRPM:
```bash
prpm install @prpm/opencode
```

## How to Build a Plugin

### Step 1: Enable Debug Mode

Run OpenCode with debug mode to see all events firing:

```bash
cd /path/to/your/project
PRPM_PLUGIN_DEBUG=true opencode
```

You'll see output like:
```
[PRPM Debug] session.created {"sessionID":"abc123"}...
[PRPM Debug] Tool Before: Read {"filePath":"/src/index.ts"}
[PRPM Debug] Tool After: Read - Read file
[PRPM Debug] message.updated {"messageID":"msg1"}...
[PRPM Debug] session.idle {}...
```

### Step 2: Identify Events You Need

Use OpenCode normally while watching the logs. For example:
- Want to run code when AI finishes? Look for `session.idle`
- Want to intercept file reads? Look for `tool.execute.before` with tool `Read`
- Want to know when files change? Look for `file.edited`

Or list all available events:
```
prpm:events
```

### Step 3: Get a Template

List available templates:
```
prpm:templates
```

View a specific template:
```
prpm:template:basic
prpm:template:security
prpm:template:notification
prpm:template:custom-tool
prpm:template:logging
```

### Step 4: Create Your Plugin

Replace `.opencode/plugin/index.ts` with your own code based on the template:

```typescript
import type { Plugin } from "@opencode-ai/plugin";

const MyPlugin: Plugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        await $`osascript -e 'display notification "Done!" with title "OpenCode"'`;
      }
    },
  };
};

export default MyPlugin;
```

### Step 5: Test It

```bash
opencode
```

## Available Commands

| Command | Description |
|---------|-------------|
| `prpm:events` | List all OpenCode events |
| `prpm:templates` | List available plugin templates |
| `prpm:template:<name>` | View a specific template |
| `prpm:debug:on` | Enable debug logging at runtime |
| `prpm:debug:off` | Disable debug logging |

## Plugin Templates

### basic
Simple event handler starter - good for learning the plugin structure.

### security
Blocks access to sensitive files (.env, credentials.json, etc.) - useful for protecting secrets.

### notification
Sends OS notifications when sessions complete - works on macOS and Linux.

### custom-tool
Registers a custom tool the AI can use - extends OpenCode's capabilities.

### logging
Full event and tool logging - useful for debugging complex workflows.

## Event Reference

| Category | Events |
|----------|--------|
| **command** | `command.executed` |
| **file** | `file.edited`, `file.watcher.updated` |
| **installation** | `installation.updated` |
| **lsp** | `lsp.client.diagnostics`, `lsp.updated` |
| **message** | `message.part.removed`, `message.part.updated`, `message.removed`, `message.updated` |
| **permission** | `permission.replied`, `permission.updated` |
| **server** | `server.connected` |
| **session** | `session.created`, `session.compacted`, `session.deleted`, `session.diff`, `session.error`, `session.idle`, `session.status`, `session.updated` |
| **todo** | `todo.updated` |
| **tool** | `tool.execute.before`, `tool.execute.after` |
| **tui** | `tui.prompt.append`, `tui.command.execute`, `tui.toast.show` |

## Important: Plugin Export Pattern

OpenCode plugins **must use a default export only**. Named exports will cause errors.

```typescript
// CORRECT
const MyPlugin: Plugin = async (context) => { ... };
export default MyPlugin;

// WRONG - will cause "fn3 is not a function" error
export const MyPlugin: Plugin = async (context) => { ... };
export default MyPlugin;
export { OTHER_STUFF };
```

## Hook Signatures

```typescript
// Event handler
event: async ({ event }) => {
  // event.type: string
  // event.data: unknown
}

// Before tool execution
"tool.execute.before": async (input, output) => {
  // input: { tool: string, sessionID: string, callID: string }
  // output: { args: any }
}

// After tool execution
"tool.execute.after": async (input, output) => {
  // input: { tool: string, sessionID: string, callID: string }
  // output: { title: string, output: string, metadata: any }
}
```

## Claude Code Migration

If you're porting hooks from Claude Code:

| Claude Code Hook | OpenCode Event |
|------------------|----------------|
| `PreToolUse` | `tool.execute.before` |
| `PostToolUse` | `tool.execute.after` |
| `SessionEnd` | `session.idle` |

---

<details>
<summary><strong>For Agents</strong></summary>

## Agent Instructions

You are helping a user build an OpenCode plugin. OpenCode is a CLI coding assistant similar to Claude Code.

### Key Facts

1. **Plugins live in `.opencode/plugin/index.ts`**
2. **Must use default export only** - named exports cause module loading errors
3. **Hook signatures matter** - `tool.execute.after` takes `(input, output)` not `(result)`

### Correct Plugin Structure

```typescript
import type { Plugin } from "@opencode-ai/plugin";

const MyPlugin: Plugin = async (context) => {
  const { project, directory, $, client } = context;

  return {
    // Event handler (optional)
    event: async ({ event }) => { },

    // Tool hooks (optional)
    "tool.execute.before": async (input, output) => { },
    "tool.execute.after": async (input, output) => { },

    // Custom tools (optional)
    tool: {
      myTool: tool({ ... })
    }
  };
};

export default MyPlugin;
```

### Common Mistakes to Avoid

1. **Multiple exports** - Only use `export default`, no named exports
2. **Wrong hook signature** - `tool.execute.after` takes two params `(input, output)`, not one
3. **Using `result.duration` or `result.success`** - These don't exist in the API
4. **File not named `index.ts`** - OpenCode looks for `.opencode/plugin/index.ts` specifically

### Available Context

The plugin function receives:
- `project` - Project info (name, path, etc.)
- `directory` - Absolute path to project directory
- `$` - Bun shell for running commands
- `client` - OpenCode SDK client
- `worktree` - Git worktree path

### Testing Plugins

```bash
# With debug logging
PRPM_PLUGIN_DEBUG=true opencode

# Normal mode
opencode
```

### When User Asks for Help

1. First check if they have the correct export pattern
2. Verify hook signatures match the API
3. Suggest using debug mode to see what events fire
4. Provide complete, working code (not snippets)

</details>

## License

MIT
