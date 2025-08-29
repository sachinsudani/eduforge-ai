import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE_KEY } from '../decorators/roles.decorator'
import { UserRole } from '../enums/role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.getAllAndOverride<UserRole | undefined>(ROLE_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRole) return true
        const request = context.switchToHttp().getRequest()
        const user = request.user as { role?: UserRole } | undefined
        if (!user || !user.role) return false
        return user.role === requiredRole
    }
}
