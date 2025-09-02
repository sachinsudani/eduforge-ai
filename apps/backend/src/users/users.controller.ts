import { Controller, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any) {
        const user = await this.usersService.findById(req.user.userId)
        if (!user) return null
        const { passwordHash, ...safe } = user as any
        return safe
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Admin)
    async getAllUsers() {
        const users = await this.usersService.findAll()
        return users.map((user: any) => {
            const { passwordHash, ...safe } = user
            return safe
        })
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Admin)
    async updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
        const user = await this.usersService.updateRole(id, body.role as UserRole)
        if (!user) return null
        const { passwordHash, ...safe } = user as any
        return safe
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Admin)
    async deleteUser(@Param('id') id: string) {
        await this.usersService.delete(id)
        return { message: 'User deleted successfully' }
    }
}
