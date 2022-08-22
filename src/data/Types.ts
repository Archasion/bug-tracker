type SubmissionStatus = "approved" | "rejected" | "fixed" | "considered" | "implemented";
type ContactEnquiry = "support" | "bugs" | "suggestions" | "feedback" | "other";
type BugStatus = "approved" | "rejected" | "fixed" | "considered";
type Guide = "bugreports" | "playerreports" | "suggestions";
type SubmissionType = "bugs" | "reports" | "suggestions";
type BugPriority = "none" | "low" | "medium" | "high";

export { 
      SubmissionStatus,
      SubmissionType,
      ContactEnquiry,
      BugPriority, 
      BugStatus,
      Guide
};