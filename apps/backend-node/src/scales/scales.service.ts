import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseSemicolonList } from '../common/validators/semicolon-list.validator';
import { CreateScaleDto } from './dto/create-scale.dto';
import { CreateScaleSectionDto } from './dto/create-scale-section.dto';
import { CreateScaleTestDto } from './dto/create-scale-test.dto';

@Injectable()
export class ScalesService {
  constructor(private readonly prisma: PrismaService) {}

  listScales() {
    return this.prisma.scale.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        estimatedDurationMin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getScaleById(scaleId: string) {
    const scale = await this.prisma.scale.findUnique({
      where: { id: scaleId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
        },
        tests: {
          orderBy: [{ orderIndex: 'asc' }],
        },
      },
    });

    if (!scale) {
      throw new NotFoundException('Scale not found');
    }

    return scale;
  }

  async createScale(dto: CreateScaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const scale = await tx.scale.create({
        data: {
          code: dto.code?.trim(),
          name: dto.name.trim(),
          description: dto.description?.trim(),
          metadata: dto.metadata as Prisma.InputJsonValue,
          estimatedDurationMin: dto.estimatedDurationMin,
        },
      });

      await tx.scaleSection.create({
        data: {
          scaleId: scale.id,
          name: 'General',
          orderIndex: 0,
          isDefault: true,
        },
      });

      return scale;
    });
  }

  async createSection(scaleId: string, dto: CreateScaleSectionDto) {
    const scale = await this.prisma.scale.findUnique({ where: { id: scaleId } });

    if (!scale) {
      throw new NotFoundException('Scale not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.scaleSection.updateMany({
          where: { scaleId },
          data: { isDefault: false },
        });
      }

      return tx.scaleSection.create({
        data: {
          scaleId,
          name: dto.name.trim(),
          description: dto.description?.trim(),
          orderIndex: dto.orderIndex,
          isDefault: dto.isDefault ?? false,
        },
      });
    });
  }

  async createTest(scaleId: string, dto: CreateScaleTestDto) {
    const section = await this.prisma.scaleSection.findFirst({
      where: { id: dto.sectionId, scaleId },
    });

    if (!section) {
      throw new BadRequestException('Section does not belong to this scale');
    }

    const normalizedScoreValues = parseSemicolonList(dto.scoreValues).join(';');
    const normalizedScoreLabels = parseSemicolonList(dto.scoreLabels).join(';');

    return this.prisma.scaleTest.create({
      data: {
        scaleId,
        sectionId: dto.sectionId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        scoreValues: normalizedScoreValues,
        scoreLabels: normalizedScoreLabels,
        orderIndex: dto.orderIndex,
      },
    });
  }
}
