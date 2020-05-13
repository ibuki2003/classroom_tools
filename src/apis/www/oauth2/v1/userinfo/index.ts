import { AuthorizationHeader } from "../../../../@types";
export interface Methods {
  get: {
    reqHeaders: AuthorizationHeader;
    resBody: {
      email: string;
      family_name: string;
      gender: string;
      given_name: string;
      hd: string;
      id: string;
      link: string;
      locale: string;
      name: string;
      picture: string;
      verified_email: boolean;
    };
  };
}
