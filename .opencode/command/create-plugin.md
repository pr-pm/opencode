---
template: |
  Create a new OpenCode plugin with the following specifications:

  Plugin name: $1
  Template type: $2

  Available templates:
  - basic: Simple event handler plugin
  - security: File access protection plugin
  - notification: Desktop notification plugin
  - custom-tool: Plugin with custom tool registration
  - logging: Event logging plugin

  If no template specified, use 'basic'.

  Generate the plugin in .opencode/plugin/$1.ts with:
  1. Full TypeScript types
  2. Proper error handling
  3. Configuration options
  4. Helpful comments
  5. A test example

  After creating, explain how to test and enable the plugin.
description: Scaffold a new OpenCode plugin from templates
agent: plugin-builder
---

# Create Plugin Command

Scaffolds a new OpenCode plugin with best practices and proper structure.

## Usage

```
/create-plugin <name> [template]
```

## Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| `basic` | Simple event handler | Learning, general purpose |
| `security` | File access protection | Block sensitive files |
| `notification` | Desktop notifications | Alert on events |
| `custom-tool` | Tool registration | Extend capabilities |
| `logging` | Event logging | Debugging, analytics |

## Examples

```
/create-plugin my-plugin              # Basic plugin
/create-plugin env-guard security     # Security plugin
/create-plugin alerts notification    # Notification plugin
/create-plugin lint-tool custom-tool  # Custom tool plugin
```
