import {load} from "js-yaml";
import {readFileSync} from "fs";

type Properties = {
    colors: {
        default: 0x008EFF,
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
    },

    users: {
        developers: string[]
    },

    channels: {
        contact: {
            support: string,
            suggestions: string,
            bugs: string,
            feedback: string,
            other: string
        }
    },
    emojis: {
        thumbsUp: string,
        thumbsDown: string,
        approve: string,
        reject: string,
        known: string,
        nab: string,
        implemented: string,
        considered: string,
        fixed: string,
        none: string,
        edit: string,
        inbox: string,
        thread: string
    }
}

export default load(readFileSync("Properties.yaml", "utf8")) as Properties;