import { DateObject, TimeObject } from "@/apis/@types";
export type CourseWorkState =
  | "COURSE_WORK_STATE_UNSPECIFIED"
  | "PUBLISHED"
  | "DRAFT"
  | "DELETED";

export interface CourseWork {
  courseId: string;
  id: string;
  title: string;
  description?: string;
  // materials: Material[];
  state: CourseWorkState;
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: DateObject;
  dueTime?: TimeObject;
  scheduledTime?: string;
  maxPoints: number;
  // workType: CourseWorkType;
  associatedWithDeveloper: boolean;
  // assigneeMode: AssigneeMode;
  // individualStudentsOptions: IndividualStudentsOptions;
  // submissionModificationMode: SubmissionModificationMode;
  creatorUserId: string;
  topicId: string;

  // Union field details can be only one of the following:
  // assignment?: Assignment;
  // multipleChoiceQuestion?: MultipleChoiceQuestion;
}
