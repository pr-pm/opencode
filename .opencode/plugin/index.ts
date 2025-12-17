/**
 * PRPM Plugin Helper
 *
 * A meta-plugin that helps with OpenCode plugin development:
 * - Event debugging and logging
 * - Plugin validation
 * - Template scaffolding
 */

import type { Plugin } from "@opencode-ai/plugin";

interface PluginConfig {
  debug: boolean;
  logEvents: string[];
}

// Plugin templates for scaffolding
const PLUGIN_TEMPLATES: Record<string, string> = {
  basic: `import type { Plugin } from "@opencode-ai/plugin";

const MyPlugin: Plugin = async ({ project, directory }) => {
  console.log('Plugin initialized for:', project?.name || directory);

  return {
    event: async ({ event }) => {
      console.log('Event:', event.type);
    },
  };
};

export default MyPlugin;`,

  security: `import type { Plugin } from "@opencode-ai/plugin";

const SecurityPlugin: Plugin = async () => {
  const sensitivePatterns = [/\\.env$/, /\\.env\\..+$/, /credentials\\.json$/, /\\.secret$/];
  const isSensitive = (path: string) => sensitivePatterns.some(p => p.test(path));

  return {
    "tool.execute.before": async (input, output) => {
      const filePath = output.args?.filePath || output.args?.path;
      if (filePath && isSensitive(filePath)) {
        throw new Error(\`Blocked: Cannot access sensitive file \${filePath}\`);
      }
    },
  };
};

export default SecurityPlugin;`,

  notification: `import type { Plugin } from "@opencode-ai/plugin";

const NotifyPlugin: Plugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        // macOS notification
        await $\`osascript -e 'display notification "Session complete" with title "OpenCode"'\`;
        // Linux: await $\`notify-send "OpenCode" "Session complete"\`;
      }
    },
  };
};

export default NotifyPlugin;`,

  "custom-tool": `import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";

const CustomToolPlugin: Plugin = async () => {
  return {
    tool: {
      myCustomTool: tool({
        description: "Description of what this tool does",
        args: {
          input: tool.schema.string(),
          verbose: tool.schema.boolean().optional(),
        },
        async execute(args) {
          const result = \`Processed: \${args.input}\`;
          if (args.verbose) console.log('Verbose:', result);
          return result;
        },
      }),
    },
  };
};

export default CustomToolPlugin;`,

  logging: `import type { Plugin } from "@opencode-ai/plugin";

const LoggingPlugin: Plugin = async ({ directory }) => {
  const log = (entry: unknown) => {
    console.log(\`[\${new Date().toISOString()}] \${JSON.stringify(entry)}\`);
  };

  return {
    event: async ({ event }) => {
      log({ type: event.type, data: event.data });
    },
    "tool.execute.before": async (input, output) => {
      log({ phase: 'before', tool: input.tool, args: output.args });
    },
    "tool.execute.after": async (input, output) => {
      log({ phase: 'after', tool: input.tool, title: output.title });
    },
  };
};

export default LoggingPlugin;`,
};

// All available OpenCode events for reference
const OPENCODE_EVENTS = {
  command: ["command.executed"],
  file: ["file.edited", "file.watcher.updated"],
  installation: ["installation.updated"],
  lsp: ["lsp.client.diagnostics", "lsp.updated"],
  message: [
    "message.part.removed",
    "message.part.updated",
    "message.removed",
    "message.updated",
  ],
  permission: ["permission.replied", "permission.updated"],
  server: ["server.connected"],
  session: [
    "session.created",
    "session.compacted",
    "session.deleted",
    "session.diff",
    "session.error",
    "session.idle",
    "session.status",
    "session.updated",
  ],
  todo: ["todo.updated"],
  tool: ["tool.execute.before", "tool.execute.after"],
  tui: ["tui.prompt.append", "tui.command.execute", "tui.toast.show"],
} as const;

/**
 * Check if an event type matches a filter pattern (supports wildcards)
 */
function matchesFilter(eventType: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern === "*") return true;
    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix + ".");
    }
    return eventType === pattern;
  });
}

/**
 * Format event data for logging
 */
function formatEvent(event: { type: string; data?: unknown }): string {
  const { type, data } = event;
  const dataStr = data ? ` ${JSON.stringify(data).slice(0, 100)}...` : "";
  return `[PRPM Debug] ${type}${dataStr}`;
}

const PRPMPluginHelper: Plugin = async (context) => {
  const { project, directory } = context;

  const config: PluginConfig = {
    debug: process.env.PRPM_PLUGIN_DEBUG === "true",
    logEvents: ["*"],
  };

  console.log(`[PRPM Plugin Helper] Initialized for ${project?.name || directory}`);

  if (config.debug) {
    console.log("[PRPM Plugin Helper] Debug mode enabled");
    console.log("[PRPM Plugin Helper] Available events:", Object.values(OPENCODE_EVENTS).flat());
  }

  return {
    // General event handler for debugging
    event: async ({ event }) => {
      if (config.debug && matchesFilter(event.type, config.logEvents)) {
        console.log(formatEvent(event));
      }

      // Handle special PRPM commands
      if (event.type === "tui.command.execute") {
        const command = (event.data as { command?: string })?.command;

        if (command?.startsWith("prpm:")) {
          const subCommand = command.slice(5);

          switch (subCommand) {
            case "events":
              console.log("\n=== Available OpenCode Events ===");
              Object.entries(OPENCODE_EVENTS).forEach(([category, events]) => {
                console.log(`\n${category}:`);
                events.forEach((e) => console.log(`  - ${e}`));
              });
              break;

            case "debug:on":
              config.debug = true;
              console.log("[PRPM] Debug mode enabled");
              break;

            case "debug:off":
              config.debug = false;
              console.log("[PRPM] Debug mode disabled");
              break;

            case "templates":
              console.log("\n=== Available Plugin Templates ===");
              Object.keys(PLUGIN_TEMPLATES).forEach((name) => {
                console.log(`  - ${name}`);
              });
              console.log("\nUse prpm:template:<name> to view a template");
              break;

            default:
              // Handle prpm:template:<name> commands
              if (subCommand.startsWith("template:")) {
                const templateName = subCommand.slice(9);
                const template = PLUGIN_TEMPLATES[templateName];
                if (template) {
                  console.log(`\n=== Template: ${templateName} ===\n`);
                  console.log(template);
                  console.log("\n=== End Template ===");
                } else {
                  console.log(`[PRPM] Unknown template: ${templateName}`);
                  console.log("Available templates:", Object.keys(PLUGIN_TEMPLATES).join(", "));
                }
              }
              break;
          }
        }
      }
    },

    // Tool execution hooks for debugging
    // Signature: (input: {tool, sessionID, callID}, output: {args}) => Promise<void>
    "tool.execute.before": async (input, output) => {
      if (config.debug) {
        console.log(`[PRPM Debug] Tool Before: ${input.tool}`, output.args);
      }
    },

    // Signature: (input: {tool, sessionID, callID}, output: {title, output, metadata}) => Promise<void>
    "tool.execute.after": async (input, output) => {
      if (config.debug) {
        console.log(`[PRPM Debug] Tool After: ${input.tool} - ${output.title}`);
      }
    },
  };
};

export default PRPMPluginHelper;
