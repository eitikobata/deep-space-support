import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LogEntriesService } from './log-entries.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('log-entries')
export class LogEntriesController {
  constructor(private logEntriesService: LogEntriesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLogEntryDto) {
    return this.logEntriesService.create(user, dto);
  }
}
