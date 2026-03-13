import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionStatus, SessionTestStatus } from '@prisma/client';
import { parseSemicolonList } from '../common/validators/semicolon-list.validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpsertSessionTestResultDto } from './dto/upsert-session-test-result.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        scale: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getSessionById(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: {
        scale: {
          include: {
            sections: { orderBy: { orderIndex: 'asc' } },
            tests: { orderBy: { orderIndex: 'asc' } },
          },
        },
        testResults: {
          orderBy: { orderIndex: 'asc' },
          include: {
            scaleTest: {
              select: {
                id: true,
                name: true,
                sectionId: true,
                scoreValues: true,
                scoreLabels: true,
              },
            },
          },
        },
      },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    const scale = await this.prisma.scale.findUnique({
      where: { id: dto.scaleId },
      include: {
        tests: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!scale || !scale.isActive) {
      throw new BadRequestException('Scale not found or inactive');
    }
    if (scale.tests.length === 0) {
      throw new BadRequestException('Scale has no tests');
    }

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          userId,
          patientId: dto.patientId.trim(),
          scaleId: dto.scaleId,
          status: SessionStatus.in_progress,
          startedAt: new Date(),
          generalComments: dto.generalComments?.trim(),
        },
      });

      await tx.sessionTestResult.createMany({
        data: scale.tests.map((test) => ({
          sessionId: session.id,
          scaleTestId: test.id,
          orderIndex: test.orderIndex,
          status: SessionTestStatus.pending,
        })),
      });

      return session;
    });
  }

  async upsertTestResult(
    userId: string,
    sessionId: string,
    scaleTestId: string,
    dto: UpsertSessionTestResultDto,
  ) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.status === SessionStatus.completed || session.status === SessionStatus.cancelled) {
      throw new BadRequestException('Session is closed');
    }

    const scaleTest = await this.prisma.scaleTest.findUnique({
      where: { id: scaleTestId },
      select: { id: true, scaleId: true, scoreValues: true, orderIndex: true },
    });
    if (!scaleTest || scaleTest.scaleId !== session.scaleId) {
      throw new BadRequestException('Scale test does not belong to this session scale');
    }

    if (dto.scoreValue !== undefined) {
      const allowedValues = parseSemicolonList(scaleTest.scoreValues).map((item) => Number(item));
      if (!allowedValues.includes(dto.scoreValue)) {
        throw new BadRequestException('scoreValue is not allowed for this test');
      }
    }

    const existing = await this.prisma.sessionTestResult.findUnique({
      where: {
        sessionId_scaleTestId: {
          sessionId,
          scaleTestId,
        },
      },
    });

    const resultStatus: SessionTestStatus =
      dto.status ??
      (dto.scoreValue !== undefined ? SessionTestStatus.completed : existing?.status ?? SessionTestStatus.pending);

    return this.prisma.sessionTestResult.upsert({
      where: {
        sessionId_scaleTestId: {
          sessionId,
          scaleTestId,
        },
      },
      create: {
        sessionId,
        scaleTestId,
        scoreValue: dto.scoreValue,
        notes: dto.notes?.trim(),
        transcriptText: dto.transcriptText?.trim(),
        audioUrl: dto.audioUrl?.trim(),
        durationSec: dto.durationSec,
        status: resultStatus,
        orderIndex: existing?.orderIndex ?? scaleTest.orderIndex,
      },
      update: {
        scoreValue: dto.scoreValue,
        notes: dto.notes?.trim(),
        transcriptText: dto.transcriptText?.trim(),
        audioUrl: dto.audioUrl?.trim(),
        durationSec: dto.durationSec,
        status: resultStatus,
      },
    });
  }

  async completeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: { testResults: true },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.status === SessionStatus.completed) {
      return session;
    }

    await this.prisma.sessionTestResult.updateMany({
      where: {
        sessionId,
        status: SessionTestStatus.pending,
      },
      data: {
        status: SessionTestStatus.skipped,
      },
    });

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.completed,
        endedAt: new Date(),
      },
    });
  }
}
