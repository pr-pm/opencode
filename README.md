# PRPM OpenCode Meta-Plugin

A comprehensive development toolkit for building OpenCode plugins, agents, and skills. This meta-plugin provides AI-powered assistance, templates, and best practices for extending OpenCode.

## What This Plugin Does

**This is a plugin for OpenCode developers.** It provides:

1. **Plugin Builder Agent** - AI assistant for creating plugins with knowledge of all 32+ events
2. **Agent Builder Agent** - AI assistant for creating custom agents with configuration expertise
3. **Debug Mode** - Logs all OpenCode events and tool executions in real-time
4. **Template Scaffolding** - Working starter code for common patterns

## Installation

```bash
prpm install @prpm/opencode
```

Or manually copy the `.opencode` folder to your project.

## Included Packages

| Package | Type | Description |
|---------|------|-------------|
| `plugin-helper` | Plugin | Debug utility with event logging and templates |
| `plugin-builder-agent` | Agent | AI assistant for creating plugins |
| `agent-builder-agent` | Agent | AI assistant for creating agents |
| `create-plugin-command` | Command | Scaffold plugins from templates |
| `create-agent-command` | Command | Scaffold agents from templates |

## Quick Start

### Creating a Plugin

Use the slash command:
```
/create-plugin my-plugin security
```

Or invoke the agent directly:
```
@plugin-builder help me create a plugin that blocks .env file access
```

### Creating an Agent

Use the slash command:
```
/create-agent my-agent review
```

Or invoke the agent directly:
```
@agent-builder create a code review agent that focuses on security
```

### Debug Mode

Run OpenCode with debug logging to see all events:
```bash
PRPM_PLUGIN_DEBUG=true opencode
```

## Plugin Templates

| Template | Description |
|----------|-------------|
| `basic` | Simple event handler starter |
| `security` | Block sensitive file access |
| `notification` | OS notifications on events |
| `custom-tool` | Register custom AI tools |
| `logging` | Full event/tool logging |

## Agent Templates

| Template | Mode | Description |
|----------|------|-------------|
| `primary` | primary | Full-access development agent |
| `plan` | primary | Analysis-only, no modifications |
| `review` | subagent | Code review specialist |
| `docs` | subagent | Documentation writer |
| `security` | subagent | Security auditor |
| `test` | subagent | Test generator |
| `custom` | subagent | Minimal template |

## Available Commands

| Command | Description |
|---------|-------------|
| `/create-plugin <name> [template]` | Scaffold a new plugin |
| `/create-agent <name> [template]` | Scaffold a new agent |
| `prpm:events` | List all OpenCode events |
| `prpm:templates` | List plugin templates |
| `prpm:template:<name>` | View specific template |
| `prpm:debug:on` | Enable debug logging |
| `prpm:debug:off` | Disable debug logging |

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

## File Locations

### Plugins
- **Global**: `~/.config/opencode/plugin/`
- **Project**: `.opencode/plugin/`

### Agents
- **Global**: `~/.config/opencode/agent/`
- **Project**: `.opencode/agent/`

### Skills
- **Global**: `~/.opencode/skill/`
- **Project**: `.opencode/skill/`

## Plugin Structure

```typescript
import type { Plugin } from "@opencode-ai/plugin";

const MyPlugin: Plugin = async ({ $, project, directory }) => {
  return {
    event: async ({ event }) => { },
    "tool.execute.before": async (input, output) => { },
    "tool.execute.after": async (input, output) => { },
    tool: { /* custom tools */ }
  };
};

export default MyPlugin;
```

## Agent Structure

```markdown
---
description: Brief description of the agent
mode: primary|subagent|all
model: anthropic/claude-sonnet-4-20250514
tools:
  read: true
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: ask
---

# Agent Name

System prompt instructions...
```

## Skill Structure

```markdown
---
name: skill-name
description: What the skill provides
license: MIT
---

## When to Apply This Skill

- Use when: [conditions]
- Don't use for: [exclusions]

## Knowledge Content

[Detailed guidance and best practices]
```

## Important Notes

### Plugin Export Pattern

OpenCode plugins **must use a default export only**:

```typescript
// CORRECT
const MyPlugin: Plugin = async (context) => { ... };
export default MyPlugin;

// WRONG - causes errors
export const MyPlugin: Plugin = async (context) => { ... };
export default MyPlugin;
```

### Hook Signatures

```typescript
// Event handler
event: async ({ event }) => {
  // event.type: string
  // event.data: unknown
}

// Before tool execution
"tool.execute.before": async (input, output) => {
  // input: { tool, sessionID, callID }
  // output: { args }
}

// After tool execution
"tool.execute.after": async (input, output) => {
  // input: { tool, sessionID, callID }
  // output: { title, output, metadata }
}
```

## Claude Code Migration

| Claude Code Hook | OpenCode Event |
|------------------|----------------|
| `PreToolUse` | `tool.execute.before` |
| `PostToolUse` | `tool.execute.after` |
| `SessionEnd` | `session.idle` |

## License

MIT
