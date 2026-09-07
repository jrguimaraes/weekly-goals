import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, WeekReport } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { REPORT_SCHEMA_VERSION, ReportSnapshot } from './reports.types.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persiste o snapshot imutável do relatório da semana.
   * Suporta injeção de transação para fechamento atômico.
   */
  async create(
    weekId: string,
    snapshot: ReportSnapshot,
    version = REPORT_SCHEMA_VERSION,
    tx?: Prisma.TransactionClient,
  ): Promise<WeekReport> {
    const db = tx ?? this.prisma;

    const existing = await db.weekReport.findUnique({
      where: { weekId },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um relatório gerado para a semana "${weekId}".`,
      );
    }

    return db.weekReport.create({
      data: {
        weekId,
        version,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Consulta o relatório persistido de uma semana por weekId.
   */
  async findByWeekId(weekId: string): Promise<WeekReport> {
    const report = await this.prisma.weekReport.findUnique({
      where: { weekId },
    });

    if (!report) {
      throw new NotFoundException(
        `Relatório da semana "${weekId}" não encontrado.`,
      );
    }

    return report;
  }
}
