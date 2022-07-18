export default class Properties {
      public static readonly colors: { [key: string]: any } = {
            default: 0x2F3136,
            success: 0x84F584,
            error: 0x202020,
            priority: {
                  high: 0xe86864,
                  medium: 0xe89d3a,
                  low: 0x71d17f,
                  none: 0x4a4a4a
            },
            status: {
                  approved: 0x437B4B,
                  rejected: 0xC74945,
                  implemented: 0x5d97c9,
                  considered: 0xf2e65e,
                  fixed: 0x855dc9
            }
      }

      public static readonly users: { [key: string]: string[] } = {
            developers: [
                  "556206370429599755", // Archasion
                  // "697765709580599406" // Archasion 2
            ]
      }

      public static readonly channels: { [key: string]: any } = {
            bot: { // Channels related to the development / usage of the bot
                  support: "996440036205666344", // #support
                  suggestions: "996440053557514261", // #suggestions
                  bugs: "996440087921426512", // #bugs
                  feedback: "996442097290858626" // #feedback
            }
      }
}