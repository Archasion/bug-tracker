type SubmissionStatus = "Approved" | "Rejected" | "Fixed" | "Considered" | "Implemented" | "None" | "Known" | "NAB";
type SuggestionStatus = "Approved" | "Rejected" | "Considered" | "Implemented" | "None";
type ContactEnquiry = "support" | "bugs" | "suggestions" | "feedback" | "other";
type PlayerReportStatus = "Approved" | "Rejected" | "Considered" | "None" | "Known";
type BugStatus = "Approved" | "Rejected" | "Fixed" | "Considered" | "None" | "Known" | "NAB";
type Guide = "bug_reports" | "player_reports" | "suggestions";
type SubmissionType = "bugReports" | "playerReports" | "suggestions";
type BugPriority = "None" | "Low" | "Medium" | "High";

export {
    PlayerReportStatus,
    SubmissionStatus,
    SuggestionStatus,
    SubmissionType,
    ContactEnquiry,
    BugPriority,
    BugStatus,
    Guide
};