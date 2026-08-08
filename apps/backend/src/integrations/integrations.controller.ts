import { Controller, Post, Param, Body, UseGuards, Req } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { ConnectIntegrationDto } from "./dto/connect-integration-dto";
import { Request } from "express";

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

@Controller("integrations")
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post("connect")
  connect(@Req() req: RequestWithUser, @Body() dto: ConnectIntegrationDto) {
    return this.integrationsService.connectIntegration(
      req.user.userId,
      dto.platform,
      dto.handle,
    );
  }

  @Post(":id/sync")
  sync(@Req() req: RequestWithUser, @Param("id") id: string) {
    return this.integrationsService.triggerSync(req.user.userId, id);
  }
}
