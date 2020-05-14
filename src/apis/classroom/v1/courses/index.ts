import { CourseState, Course } from "./@types";
import { AuthorizationHeader } from "@/apis/@types";

export interface Methods {
  get: {
    query?: {
      studentId?: string;
      teacherId?: string;
      courseStates?: CourseState;
      pageSize?: number;
      pageToken?: string;
    };
    resBody: {
      courses?: Course[];
      nextPageToken?: string;
    };
    reqHeaders: AuthorizationHeader;
  };
}
