export enum RequestStatus {
  Active = 'active',
  Archived = 'archived',
}

export interface Request {
  id: string;
  text: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
  anonymousAuthorId: string;
}
