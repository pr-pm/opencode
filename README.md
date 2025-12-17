# PRPM OpenCode Meta Plugin

A meta-plugin for OpenCode that helps you create, debug, and manage OpenCode plugins. Install once, and get expert assistance with plugin development directly in your OpenCode sessions.

## Installation

```bash
prpm install @prpm/opencode
```

Or with npm:

```bash
npm install -g @prpm/opencode
```

## What's Included

### Plugin: PRPM Plugin Helper

A utility plugin that provides:
- **Template scaffolding**: Generate boilerplate for common plugin patterns
- **Event debugging**: Log and inspect plugin events in real-time
- **Validation**: Check plugin structure and event handlers

### Agent: Plugin Builder

An AI agent specialized in creating OpenCode plugins:
- Understands all 32+ OpenCode events
- Knows best practices for plugin architecture
- Can generate complete plugin implementations

### Slash Command: /create-plugin

Quick plugin scaffolding:
```
/create-plugin env-protection   # Security-focused plugin
/create-plugin notify           # Notification plugin
/create-plugin custom-tool      # Custom tool registration
```

## Quick Start

After installation, you can:

1. **Use the agent**: Type `@plugin-builder` followed by your request
   ```
   @plugin-builder Create a plugin that blocks reading .env files
   ```

2. **Use the command**: Scaffold a new plugin
   ```
   /create-plugin my-plugin
   ```

3. **Enable debugging**: The plugin helper logs events in debug mode
   ```javascript
   // In your opencode.json
   {
     "plugins": {
       "prpm-plugin-helper": {
         "debug": true
       }
     }
   }
   ```

## Event Reference

OpenCode plugins can hook into these events:

| Category | Events |
|----------|--------|
| **command** | `command.executed` |
| **file** | `file.edited`, `file.watcher.updated` |
| **lsp** | `lsp.client.diagnostics`, `lsp.updated` |
| **message** | `message.part.removed`, `message.part.updated`, `message.removed`, `message.updated` |
| **permission** | `permission.replied`, `permission.updated` |
| **server** | `server.connected` |
| **session** | `session.created`, `session.compacted`, `session.deleted`, `session.diff`, `session.error`, `session.idle`, `session.status`, `session.updated` |
| **todo** | `todo.updated` |
| **tool** | `tool.execute.before`, `tool.execute.after` |
| **tui** | `tui.prompt.append`, `tui.command.execute`, `tui.toast.show` |

## Claude Code Compatibility

This plugin is compatible with [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)'s Claude Code compatibility layer. The event mappings:

| Claude Hook | OpenCode Event |
|-------------|----------------|
| `PreToolUse` | `tool.execute.before` |
| `PostToolUse` | `tool.execute.after` |
| `SessionEnd` | `session.idle` |

## Plugin Templates

### Security Plugin

```javascript
export const SecurityPlugin = async ({ project }) => {
  return {
    'tool.execute.before': async (input, output) => {
      if (output.args.filePath?.includes('.env')) {
        throw new Error('Blocked: Cannot read sensitive files');
      }
    }
  };
};
```

### Notification Plugin

```javascript
export const NotifyPlugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        await $`osascript -e 'display notification "Session complete" with title "OpenCode"'`;
      }
    }
  };
};
```

### Custom Tool Plugin

```javascript
import { tool } from "@opencode-ai/plugin";

export const CustomToolPlugin = async (ctx) => {
  return {
    tool: {
      myTool: tool({
        description: "My custom tool",
        args: { input: tool.schema.string() },
        async execute(args) {
          return `Processed: ${args.input}`;
        }
      })
    }
  };
};
```

## Links

- [OpenCode Documentation](https://opencode.ai/docs)
- [PRPM Registry](https://prpm.dev)
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)

## License

MIT
