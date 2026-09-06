import { Controller } from '@nestjs/common';
import { WeeksService } from './weeks.service.js';

@Controller('weeks')
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}
}
