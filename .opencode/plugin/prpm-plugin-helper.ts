/**
 * PRPM Plugin Helper
 *
 * A meta-plugin that helps with OpenCode plugin development:
 * - Event debugging and logging
 * - Plugin validation
 * - Template scaffolding
 *
 * Configuration in opencode.json:
 * {
 *   "plugins": {
 *     "prpm-plugin-helper": {
 *       "debug": true,           // Enable event logging
 *       "logEvents": ["tool.*"], // Filter events to log (supports wildcards)
 *       "validateOnLoad": true   // Validate plugin structure on load
 *     }
 *   }
 * }
 */

import type { Plugin } from "@opencode-ai/plugin";

interface PluginConfig {
  debug?: boolean;
  logEvents?: string[];
  validateOnLoad?: boolean;
}

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

// Plugin templates for scaffolding
const PLUGIN_TEMPLATES = {
  basic: `export const MyPlugin = async ({ project, client, $, directory, worktree }) => {
  console.log('Plugin initialized for:', project.name);

  return {
    event: async ({ event }) => {
      // Handle all events
      console.log('Event:', event.type);
    }
  };
};`,

  security: `export const SecurityPlugin = async ({ project }) => {
  const sensitivePatterns = [/\\.env$/, /\\.env\\..+$/, /credentials\\.json$/, /\\.secret$/];

  const isSensitive = (path) => sensitivePatterns.some(p => p.test(path));

  return {
    'tool.execute.before': async (input, output) => {
      const filePath = output.args?.filePath || output.args?.path;

      if (filePath && isSensitive(filePath)) {
        throw new Error(\`Blocked: Cannot access sensitive file \${filePath}\`);
      }
    }
  };
};`,

  notification: `export const NotifyPlugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        // macOS notification
        await $\`osascript -e 'display notification "Session complete" with title "OpenCode"'\`;

        // Alternative: Linux (notify-send)
        // await $\`notify-send "OpenCode" "Session complete"\`;
      }
    },

    'tool.execute.after': async (result) => {
      if (result.duration > 10000) {
        await $\`osascript -e 'display notification "Long operation completed: \${result.tool}" with title "OpenCode"'\`;
      }
    }
  };
};`,

  "custom-tool": `import { tool } from "@opencode-ai/plugin";

export const CustomToolPlugin = async (ctx) => {
  return {
    tool: {
      myCustomTool: tool({
        description: "Description of what this tool does",
        args: {
          input: tool.schema.string(),
          options: tool.schema.object({
            verbose: tool.schema.boolean().optional(),
          }).optional(),
        },
        async execute(args, ctx) {
          const { input, options } = args;

          // Tool implementation
          const result = \`Processed: \${input}\`;

          if (options?.verbose) {
            console.log('Verbose output:', result);
          }

          return result;
        },
      }),
    },
  };
};`,

  logging: `export const LoggingPlugin = async ({ project, directory }) => {
  const logFile = \`\${directory}/.opencode-logs/\${Date.now()}.log\`;
  const logs = [];

  const log = (entry) => {
    const line = \`[\${new Date().toISOString()}] \${JSON.stringify(entry)}\`;
    logs.push(line);
    console.log(line);
  };

  return {
    event: async ({ event }) => {
      log({ type: event.type, data: event.data });
    },

    'tool.execute.before': async (input, output) => {
      log({ phase: 'before', tool: input.tool, args: output.args });
    },

    'tool.execute.after': async (result) => {
      log({ phase: 'after', tool: result.tool, duration: result.duration, success: result.success });
    }
  };
};`,
};

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

export const PRPMPluginHelper: Plugin = async (context) => {
  const { project, client, $, directory } = context;

  // Get configuration (would come from opencode.json in practice)
  const config: PluginConfig = {
    debug: process.env.PRPM_PLUGIN_DEBUG === "true",
    logEvents: ["*"],
    validateOnLoad: true,
  };

  console.log(`[PRPM Plugin Helper] Initialized for ${project?.name || directory}`);

  if (config.debug) {
    console.log("[PRPM Plugin Helper] Debug mode enabled");
    console.log("[PRPM Plugin Helper] Available events:", Object.values(OPENCODE_EVENTS).flat());
  }

  return {
    // General event handler for debugging
    event: async ({ event }) => {
      if (config.debug && matchesFilter(event.type, config.logEvents || ["*"])) {
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

            case "templates":
              console.log("\n=== Available Plugin Templates ===");
              Object.keys(PLUGIN_TEMPLATES).forEach((name) => {
                console.log(`  - ${name}`);
              });
              console.log('\nUse /create-plugin <template> to scaffold');
              break;

            case "debug:on":
              console.log("[PRPM] Debug mode enabled");
              break;

            case "debug:off":
              console.log("[PRPM] Debug mode disabled");
              break;
          }
        }
      }
    },

    // Tool execution hooks for debugging
    "tool.execute.before": async (input, output) => {
      if (config.debug) {
        console.log(`[PRPM Debug] Tool Before: ${input.tool}`, output.args);
      }
    },

    "tool.execute.after": async (result) => {
      if (config.debug) {
        console.log(
          `[PRPM Debug] Tool After: ${result.tool} (${result.duration}ms, ${result.success ? "success" : "failed"})`
        );
      }
    },
  };
};

// Export templates for use by other plugins/commands
export { PLUGIN_TEMPLATES, OPENCODE_EVENTS };

export default PRPMPluginHelper;
