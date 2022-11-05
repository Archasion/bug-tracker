type SubmissionStatus = "approved" | "rejected" | "fixed" | "considered" | "implemented" | "none" | "known" | "nab";
type SuggestionStatus = "approved" | "rejected" | "considered" | "implemented" | "none";
type ContactEnquiry = "support" | "bugs" | "suggestions" | "feedback" | "other";
type PlayerReportStatus = "approved" | "rejected" | "considered" | "none" | "known";
type BugStatus = "approved" | "rejected" | "fixed" | "considered" | "none" | "known" | "nab";
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