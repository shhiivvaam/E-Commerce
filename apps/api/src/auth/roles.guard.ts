import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest<{ user?: { role?: { name: RoleType } } }>();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('Access denied');
        }

        const hasRole = requiredRoles.includes(user.role.name);
        if (!hasRole) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }

        return true;
    }
}
