import { CourseState, Course } from "./@types";
import { AuthorizationHeader } from "../../../@types";

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
      cources: Course[];
      nextPageToken: string;
    };
    reqHeaders: AuthorizationHeader;
  };
}
