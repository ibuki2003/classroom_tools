export type AnnouncementState =
  | "ANNOUNCEMENT_STATE_UNSPECIFIED"
  | "PUBLISHED"
  | "DRAFT"
  | "DELETED";

export interface Announcement {
  courseId: string;
  id: string;
  text: string;
  // "materials": Material[];
  state: AnnouncementState;
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  scheduledTime: string;
  // "assigneeMode": AssigneeMode;
  // "individualStudentsOptions": IndividualStudentsOptions;
  creatorUserId: string;
}
