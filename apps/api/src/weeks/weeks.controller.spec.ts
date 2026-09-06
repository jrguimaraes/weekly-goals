import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WeeksController } from './weeks.controller.js';
import { WeeksService } from './weeks.service.js';

describe('WeeksController', () => {
  let controller: WeeksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeksController],
      providers: [
        {
          provide: WeeksService,
          useValue: {
            findAll: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeeksController>(WeeksController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
