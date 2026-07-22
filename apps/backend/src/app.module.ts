import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { ProblemsModule } from "./problems/problems.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { NotesModule } from "./notes/notes.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { ContestsModule } from "./contests/contests.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { JobsModule } from "./jobs/jobs.module";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProblemsModule,
    ReviewsModule,
    NotesModule,
    IntegrationsModule,
    ContestsModule,
    DashboardModule,
    StatisticsModule,
    JobsModule,
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
