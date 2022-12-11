import Media from "./Media";

export default class Guides {
    public static readonly bug_reports = {
        title: "How to Report Bugs",
        description: "Want to report a bug? Here's how to do it!\n\nAll you need to do is use the command provided in the example, fill out the form and submit the bug report!",
        example: "submit",
        attachmentName: "BugReportForm.png",
        attachmentFiles: [Media.guides.bugReports]
    };

    public static readonly player_reports = {
        title: "How to Report Players",
        description: "Want to report a player? Here's how to do it!\n\nAll you need to do is use the command provided in the example, fill out the form and submit the player report!",
        example: "submit",
        attachmentName: "PlayerReportForm.png",
        attachmentFiles: [Media.guides.playerReports]
    };

    public static readonly suggestions = {
        title: "How to Submit Suggestions",
        description: "Want to suggest something? Here's how to do it!\n\nAll you need to do is use the command provided in the example, fill out the form and submit the suggestion!",
        example: "submit",
        attachmentName: "SuggestionForm.png",
        attachmentFiles: [Media.guides.suggestions]
    };
}