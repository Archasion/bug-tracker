import mongoose, {Schema} from "mongoose";

const guildSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    submissions: {
        type: Object,
        bugReports: Object,
        playerReports: Object,
        suggestions: Object,
        default: {
            bugReports: {},
            playerReports: {},
            suggestions: {}
        }
    },
    channels: {
        type: Object,
        submissions: {
            type: Object,
            bugReports: String,
            playerReports: String,
            suggestions: String,
            archive: {
                type: Object,
                bugReports: String,
                playerReports: String,
                suggestions: String
            }
        },
        botUpdates: String,
        default: {
            submissions: {
                bugReports: null,
                playerReports: null,
                suggestions: null,
                archive: {
                    bugReports: null,
                    playerReports: null,
                    suggestions: null
                }
            },
            botUpdates: null
        }
    },
    settings: {
        type: Object,
        notifyOnStatusChange: Boolean,
        autoDelete: Array,
        autoRoles: Array,
        threads: {
            bugReports: Boolean,
            playerReports: Boolean
        },
        default: {
            notifyOnStatusChange: false,
            autoDelete: [],
            joinRoles: [],
            threads: {
                bugReports: false,
                playerReports: false
            }
        }
    },
    roles: {
        type: Object,
        reviewer: String,
        admin: String,
        default: {
            reviewer: null,
            admin: null
        }
    }
}, {
    versionKey: false,
    minimize: false
});

export default mongoose.model("Guilds", guildSchema);