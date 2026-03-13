import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpsertSessionTestResultDto } from './dto/upsert-session-test-result.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  listSessions(@CurrentUser() user: AuthUser) {
    return this.sessionsService.listSessions(user.sub);
  }

  @Get(':sessionId')
  getSession(@CurrentUser() user: AuthUser, @Param('sessionId') sessionId: string) {
    return this.sessionsService.getSessionById(user.sub, sessionId);
  }

  @Post()
  createSession(@CurrentUser() user: AuthUser, @Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(user.sub, dto);
  }

  @Put(':sessionId/tests/:scaleTestId')
  upsertTestResult(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Param('scaleTestId') scaleTestId: string,
    @Body() dto: UpsertSessionTestResultDto,
  ) {
    return this.sessionsService.upsertTestResult(user.sub, sessionId, scaleTestId, dto);
  }

  @Patch(':sessionId/complete')
  completeSession(@CurrentUser() user: AuthUser, @Param('sessionId') sessionId: string) {
    return this.sessionsService.completeSession(user.sub, sessionId);
  }
}
