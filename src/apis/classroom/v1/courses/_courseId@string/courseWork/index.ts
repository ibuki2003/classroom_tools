import { AuthorizationHeader } from "@/apis/@types";
import { CourseWork, CourseWorkState } from "./@type";
export interface Methods {
  get: {
    reqHeaders: AuthorizationHeader;
    query?: {
      courseWorkStates?: CourseWorkState;
      orderBy?: string;
      pageSize?: number;
      pageToken?: string;
    };
    resBody: {
      courseWork?: CourseWork[];
      nextPageToken?: string;
    };
  };
}
