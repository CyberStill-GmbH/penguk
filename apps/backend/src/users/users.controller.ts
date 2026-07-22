import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthUser } from "../commom/types/auth-user.type";

@Controller("users")
export class UsersController {
  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  getMe(@Req() req: { user: AuthUser }) {
    return req.user;
  }
}
