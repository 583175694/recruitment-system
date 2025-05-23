import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApplicationStatus } from '../../entity/student.entity';
import { UserRole } from '../../entity/user.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('applications/:id/status')
  async updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ApplicationStatus; reviewComments?: string },
  ) {
    return this.adminService.updateApplicationStatus(id, body.status, body.reviewComments);
  }

  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Post('users')
  async createUser(
    @Body() body: { username: string; password: string; name: string; role: UserRole },
  ) {
    return this.adminService.createUser(
      body.username,
      body.password,
      body.name,
      body.role,
    );
  }
} 