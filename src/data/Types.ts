import {ColorResolvable, PermissionResolvable} from "discord.js";

type SubmissionStatus = "Approved" | "Rejected" | "Fixed" | "Considered" | "Implemented" | "None" | "Known" | "NAB";
type BugStatus = "Approved" | "Rejected" | "Fixed" | "Considered" | "None" | "Known" | "NAB";
type SuggestionStatus = "Approved" | "Rejected" | "Considered" | "Implemented" | "None";
type PlayerReportStatus = "Approved" | "Rejected" | "Considered" | "None" | "Known";

type SubmissionType = "bugReports" | "playerReports" | "suggestions";
type BugPriority = "None" | "Low" | "Medium" | "High";

type ContactEnquiry = "support" | "bugs" | "suggestions" | "feedback" | "other";
type Guide = "bug_reports" | "player_reports" | "suggestions";

type ClientProperties = {
    invitePermissions: PermissionResolvable
    colors: {
        default: ColorResolvable
        success: ColorResolvable
        error: ColorResolvable

        priority: {
            High: ColorResolvable
            Medium: ColorResolvable
            Low: ColorResolvable
            None: ColorResolvable
        }

        status: {
            Approved: ColorResolvable
            Rejected: ColorResolvable
            Known: ColorResolvable
            NAB: ColorResolvable
            Implemented: ColorResolvable
            Considered: ColorResolvable
            Fixed: ColorResolvable
            None: ColorResolvable
        }
    }

    users: {
        developers: string[]
    }

    channels: {
        contact: {
            support: string
            suggestions: string
            bugs: string
            feedback: string
            other: string
        }
    }
    emojis: {
        thumbsUp: string
        thumbsDown: string
        approve: string
        reject: string
        known: string
        nab: string
        implemented: string
        considered: string
        fixed: string
        none: string
        edit: string
        inbox: string
        thread: string
    }
}

export {
    PlayerReportStatus,
    SubmissionStatus,
    SuggestionStatus,
    SubmissionType,
    ContactEnquiry,
    BugPriority,
    ClientProperties,
    BugStatus,
    Guide
};