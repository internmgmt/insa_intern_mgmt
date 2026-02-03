import { UserRole } from '../common/enums/user-role.enum';

export const DEFAULT_COORDINATOR_ROLE: UserRole = UserRole.UNIVERSITY;
export const TEMP_PASSWORD_LENGTH = 12;
export const COORDINATOR_PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export const COORDINATOR_EMAIL_SUBJECT = 'INSA Coordinator Account Created';
export const COORDINATOR_EMAIL_TEMPLATE_KEY = 'coordinator_account_credentials';

export const UNIVERSITY_NAME_EXISTS = 'UNIVERSITY_NAME_EXISTS';
export const UNIVERSITY_NOT_FOUND = 'UNIVERSITY_NOT_FOUND';

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  maxLimit: 100,
};
