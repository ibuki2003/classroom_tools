export interface AuthorizationHeader {
  Authorization: string;
}

export interface DateObject {
  year: number;
  month: number;
  day: number;
}

export interface TimeObject {
  hours: number;
  minutes: number;
  seconds: number;
  nanos: number;
}

export interface UserProfile {
  id: string;
  name: Name;
  emailAddress: string;
  photoUrl: string;
  // permissions: GlobalPermission[];
  verifiedTeacher: boolean;
}
export interface Name {
  givenName: string;
  familyName: string;
  fullName: string;
}
