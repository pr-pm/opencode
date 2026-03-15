---
template: |
  Create a new OpenCode agent with the following specifications:

  Agent name: $1
  Template type: $2

  Available templates:
  - primary: Main development agent with full access
  - plan: Analysis-only agent (no modifications)
  - review: Code review focused agent
  - docs: Documentation writing agent
  - security: Security audit agent
  - test: Test writing agent
  - custom: Bare template for custom configuration

  If no template specified, use 'custom'.

  Generate the agent in .opencode/agent/$1.md with:
  1. Appropriate YAML frontmatter (description, mode, tools, permissions)
  2. Clear system prompt with capabilities and guidelines
  3. Best practices for the agent type
  4. Example usage patterns

  After creating, explain how to invoke and test the agent.
description: Scaffold a new OpenCode agent from templates
agent: agent-builder
---

# Create Agent Command

Scaffolds a new OpenCode agent with best practices and proper structure.

## Usage

```
/create-agent <name> [template]
```

## Templates

| Template | Mode | Description | Use Case |
|----------|------|-------------|----------|
| `primary` | primary | Full-access development agent | Main coding assistant |
| `plan` | primary | Analysis-only, no modifications | Planning and investigation |
| `review` | subagent | Code review specialist | PR and code review |
| `docs` | subagent | Documentation writer | README, API docs |
| `security` | subagent | Security auditor | Vulnerability scanning |
| `test` | subagent | Test generator | Writing test suites |
| `custom` | subagent | Minimal template | Custom agents |

## Examples

```
/create-agent my-agent                # Custom agent template
/create-agent build primary           # Primary development agent
/create-agent analyzer plan           # Analysis-only agent
/create-agent reviewer review         # Code review agent
/create-agent doc-writer docs         # Documentation agent
/create-agent sec-check security      # Security audit agent
/create-agent tester test             # Test writing agent
```

## Generated Structure

Agents are created in `.opencode/agent/<name>.md` with:

1. **YAML Frontmatter**
   - description
   - mode (primary/subagent)
   - model (optional override)
   - tools configuration
   - permission settings

2. **System Prompt**
   - Agent identity and purpose
   - Capabilities section
   - Guidelines and constraints
   - Output format expectations

## After Creation

1. **For primary agents**: Press Tab in OpenCode to cycle between agents
2. **For subagents**: Use `@agent-name` to invoke in conversation
3. **Test with sample tasks** to verify behavior
4. **Iterate on prompt** based on performance
