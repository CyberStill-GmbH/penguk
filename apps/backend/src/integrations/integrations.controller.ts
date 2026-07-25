import { Controller, Post, Param, Body, UseGuards, Req } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { ConnectIntegrationDto } from "./dto/connect-integration-dto";

@Controller("integrations")
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post("connect")
  async connect(@Req() req: any, @Body() dto: ConnectIntegrationDto) {
    return this.integrationsService.connectIntegration(req.user.userId, dto.platform, dto.handle);
  }

  @Post(":id/sync")
  async sync(@Param("id") id: string) {
    return this.integrationsService.triggerSync(id);
  }
}
