import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Role } from '../../users/role.enum';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

/**
 * Pulls the user that JwtStrategy.validate() attached to the request.
 * Only meaningful on routes protected by JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
