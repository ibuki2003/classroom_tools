import { AnnouncementState, Announcement } from "./@types";
import { AuthorizationHeader } from "@/apis/@types";

export interface Methods {
  get: {
    query?: {
      announcementStates?: AnnouncementState;
      orderBy?: string;
      pageSize?: number;
      pageToken?: string;
    };
    resBody: {
      announcements?: Announcement[];
      nextPageToken?: string;
    };
    reqHeaders: AuthorizationHeader;
  };
}
