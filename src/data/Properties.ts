import clc from "cli-color";

export default class Properties {
    public static readonly cli = {
        modules: {
            select_menus: clc.yellow("(SELECT MENUS)"),
            commands: clc.blue("(COMMANDS)"),
            buttons: clc.magenta("(BUTTONS)"),
            modals: clc.red("(MODALS)")
        },
        listeners: {
            ready: clc.green("(READY)"),
            guildCreate: clc.green("(GUILD CREATE)"),
            guildDelete: clc.red("(GUILD DELETE)")
        },
        db: clc.cyan("(DATABASE)")
    };

    public static readonly colors = {
        default: 0x2F3136,
        success: 0x84F584,
        error: 0x202020,
        priority: {
            High: 0xe86864,
            Medium: 0xe89d3a,
            Low: 0x71d17f,
            None: 0x4a4a4a
        },
        status: {
            Approved: 0x437B4B,
            Rejected: 0xC74945,
            Known: 0xC74945,
            NAB: 0xC74945,
            Implemented: 0x5d97c9,
            Considered: 0xf2e65e,
            Fixed: 0x855dc9,
            None: 0x2F3136
        }
    };

    public static readonly users = {
        developers: [
            "556206370429599755" // Archasion
        ]
    };

    public static readonly channels = {
        bot: {
            support: "996440036205666344", // #support
            suggestions: "996440053557514261", // #suggestions
            bugs: "996440087921426512", // #bugs
            feedback: "996442097290858626", // #feedback
            other: "1002882056994439169" // #other
        }
    };

    public static readonly emojis = {
        thumbsUp: "1022924035530694666",
        thumbsDown: "1022924034322731090",
        approve: "1020437240578592831",
        reject: "1020431776667160647",
        known: "1038434140892168265",
        nab: "1038434142418903140",
        implemented: "1020437244210843661",
        considered: "1020437241853648938",
        fixed: "1020437242977714196",
        none: "1020448503484395592",
        edit: "1022926850412003401",
        inbox: "1022919621919121498",
        thread: "1022919624750280824"
    };
}