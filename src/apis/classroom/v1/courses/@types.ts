export type CourseState = "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED";
export interface Course {
  id: string;
  name: string;
  section: string;
  descriptionHeading: string;
  description: string;
  room: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: CourseState;
  alternateLink: string;
  teacherGroupEmail: string;
  courseGroupEmail: string;
  // "teacherFolder": DriveFolder;
  // "courseMaterialSets": CourseMaterialSet[];
  guardiansEnabled: boolean;
  calendarId: string;
}
