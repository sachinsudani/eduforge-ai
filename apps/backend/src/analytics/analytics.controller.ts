import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'
import { AnalyticsService } from './analytics.service'

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Role(UserRole.Admin)
  async getAnalytics() {
    return this.analyticsService.getAnalytics()
  }
}
