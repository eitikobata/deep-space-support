import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LogEntriesService } from './log-entries.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('log-entries')
export class LogEntriesController {
  constructor(private logEntriesService: LogEntriesService) {}

  @Post()
  @Roles('OFFICER')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLogEntryDto) {
    return this.logEntriesService.create(user, dto);
  }
}
