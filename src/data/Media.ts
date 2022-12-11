import {AttachmentBuilder} from "discord.js";

export default class Media {
    public static guides = {
        playerReports: new AttachmentBuilder("assets/guide/PlayerReports.png", {name: "PlayerReportForm.png"}),
        suggestions: new AttachmentBuilder("assets/guide/Suggestions.png", {name: "SuggestionForm.png"}),
        bugReports: new AttachmentBuilder("assets/guide/BugReports.png", {name: "BugReportForm.png"})
    };

    public static priority = {
        High: new AttachmentBuilder("assets/priority/High.png", {name: "High.png"}),
        Medium: new AttachmentBuilder("assets/priority/Medium.png", {name: "Medium.png"}),
        Low: new AttachmentBuilder("assets/priority/Low.png", {name: "Low.png"}),
        None: new AttachmentBuilder("assets/priority/None.png", {name: "None.png"})
    };

    public static status = {
        Considered: new AttachmentBuilder("assets/status/Considered.png", {name: "Considered.png"}),
        Approved: new AttachmentBuilder("assets/status/Approved.png", {name: "Approved.png"}),
        Rejected: new AttachmentBuilder("assets/status/Rejected.png", {name: "Rejected.png"}),
        Known: new AttachmentBuilder("assets/status/Rejected.png", {name: "Known.png"}),
        NAB: new AttachmentBuilder("assets/status/Rejected.png", {name: "NAB.png"}),
        Fixed: new AttachmentBuilder("assets/status/Fixed.png", {name: "Fixed.png"})
    };
}