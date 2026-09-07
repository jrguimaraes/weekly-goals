import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Week } from '@prisma/client';
import { WeekSummaryResponse } from '../metrics/metrics.types.js';
import { CreateWeekDto } from './dto/create-week.dto.js';
import { ListWeeksQueryDto } from './dto/list-weeks-query.dto.js';
import { WeeksService } from './weeks.service.js';

@Controller('weeks')
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}

  @Post()
  async create(@Body() dto: CreateWeekDto): Promise<Week> {
    return this.weeksService.create(dto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string): Promise<Week> {
    return this.weeksService.activate(id);
  }

  @Get()
  async findAll(@Query() query: ListWeeksQueryDto): Promise<Week[]> {
    return this.weeksService.findAll(query);
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string): Promise<WeekSummaryResponse> {
    return this.weeksService.getSummary(id);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Week> {
    return this.weeksService.findById(id);
  }
}
