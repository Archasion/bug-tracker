import clc from "cli-color";

export default class Properties {
      public static readonly cli = {
            modules: {
                  commands: clc.blue("(COMMANDS)"),
                  buttons: clc.magenta("(BUTTONS)"),
                  modals: clc.red("(MODALS)")
            },
            db: clc.cyan("(DATABASE)")
      };

      public static readonly colors = {
            default: "#2F3136",
            success: "#84F584",
            error: "#202020",
            priority: {
                  high: "#e86864",
                  medium: "#e89d3a",
                  low: "#71d17f",
                  none: "#4a4a4a"
            },
            status: {
                  approved: "#437B4B",
                  rejected: "#C74945",
                  implemented: "#5d97c9",
                  considered: "#f2e65e",
                  fixed: "#855dc9"
            }
      };

      public static readonly users = {
            developers: [
                  "556206370429599755", // Archasion
                  // "697765709580599406" // Archasion 2
            ]
      };

      public static readonly channels = {
            bot: { // Channels related to the development / usage of the bot
                  support: "996440036205666344", // #support
                  suggestions: "996440053557514261", // #suggestions
                  bugs: "996440087921426512", // #bugs
                  feedback: "996442097290858626" // #feedback
            }
      };
}