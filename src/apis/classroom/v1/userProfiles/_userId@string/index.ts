import { UserProfile, AuthorizationHeader } from "@/apis/@types";

export interface Methods {
  get: {
    reqHeaders: AuthorizationHeader;
    resBody: UserProfile;
  };
}
