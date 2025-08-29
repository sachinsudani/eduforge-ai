import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'
import { ContentService } from './content.service'
import { CreateContentDto } from './dto/create-content.dto'
import { UpdateContentDto } from './dto/update-content.dto'

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    // public published content
    @Get('published')
    async listPublished() {
        return this.contentService.findPublished()
    }

    // instructor/admin only
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Instructor)
    @Get('mine')
    async listMine(@Req() req: any) {
        return this.contentService.findMine(req.user.userId)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Instructor)
    @Post()
    async create(@Req() req: any, @Body() dto: CreateContentDto) {
        return this.contentService.create(req.user.userId, dto)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Instructor)
    @Patch(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateContentDto) {
        return this.contentService.update(req.user.userId, id, dto)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Instructor)
    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        return this.contentService.remove(req.user.userId, id)
    }
}
