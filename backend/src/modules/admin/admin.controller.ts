import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Delete,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { UserRole } from "../../entity/user.entity";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("applications/:id")
  async getApplication(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.getApplication(id);
  }

  @Delete("applications/:id")
  async deleteApplication(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.deleteApplication(id);
  }

  @Get("statistics")
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Post("users")
  async createUser(
    @Body()
    body: {
      username: string;
      password: string;
      name: string;
      role: UserRole;
    }
  ) {
    return this.adminService.createUser(
      body.username,
      body.password,
      body.name,
      body.role
    );
  }
}
