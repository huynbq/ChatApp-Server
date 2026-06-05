import { Request } from 'express';
import { CurrentUser } from './current-user';

export type RequestWithUser = Request & {
  user: CurrentUser;
};
