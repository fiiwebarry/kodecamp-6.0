import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../../users/role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const contextFor = (user?: { role: Role }) =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as any;

  const guardWithRoles = (roles?: Role[]) => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);

    return new RolesGuard(reflector);
  };

  it('lets a route through when no roles are required', () => {
    expect(guardWithRoles(undefined).canActivate(contextFor())).toBe(true);
  });

  it('rejects an anonymous request to a role-protected route', () => {
    expect(() =>
      guardWithRoles([Role.ADMIN]).canActivate(contextFor()),
    ).toThrow(UnauthorizedException);
  });

  it('rejects a logged-in user without the required role', () => {
    expect(() =>
      guardWithRoles([Role.ADMIN]).canActivate(contextFor({ role: Role.USER })),
    ).toThrow(ForbiddenException);
  });

  it('allows a user holding the required role', () => {
    expect(
      guardWithRoles([Role.ADMIN]).canActivate(
        contextFor({ role: Role.ADMIN }),
      ),
    ).toBe(true);
  });
});
