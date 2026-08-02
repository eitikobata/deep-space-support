import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransmissionsService } from './transmissions.service';
import { CreateTransmissionDto } from './dto/create-transmission.dto';
import { UpdateTransmissionDto } from './dto/update-transmission.dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transmissions')
export class TransmissionsController {
  constructor(private transmissionsService: TransmissionsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTransmissionDto) {
    return this.transmissionsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.transmissionsService.findAllForUser(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.transmissionsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('OFFICER')
  update(@Param('id') id: string, @Body() dto: UpdateTransmissionDto) {
    return this.transmissionsService.update(id, dto);
  }
}
