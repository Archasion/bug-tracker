type SubmissionStatus = "approved" | "rejected" | "fixed" | "considered" | "implemented" | "none";
type SuggestionStatus = "approved" | "rejected" | "considered" | "implemented" | "none";
type ContactEnquiry = "support" | "bugs" | "suggestions" | "feedback" | "other";
type PlayerReportStatus = "approved" | "rejected" | "considered" | "none";
type BugStatus = "approved" | "rejected" | "fixed" | "considered" | "none";
type Guide = "bug_reports" | "player_reports" | "suggestions";
type SubmissionType = "bugs" | "reports" | "suggestions";
type BugPriority = "none" | "low" | "medium" | "high";

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