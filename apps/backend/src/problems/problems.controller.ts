import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProblemsService } from "./problems.service";
import { ListProblemsQueryDto } from "./dto/list-problems.dto";

@Controller("problems")
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  list(@Query() query: ListProblemsQueryDto) {
    return this.problemsService.list(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.problemsService.findOne(id);
  }
}
