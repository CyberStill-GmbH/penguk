import { Controller, Get, Post, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthUser } from "../commom/types/auth-user.type";
import { ExportsService } from "../exports/exports.service";

interface AuthenticatedRequest {
  user: AuthUser;
}

@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UsersController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get("me")
  getMe(@Req() req: { user: AuthUser }) {
    return req.user;
  }

  @Post("me/export")
  requestExport(@Req() req: AuthenticatedRequest) {
    return this.exportsService.requestExport(req.user.userId);
  }

  @Get("me/export/:id")
  getExportStatus(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.exportsService.getExportStatus(req.user.userId, id);
  }
}
