import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';

@Injectable()
export class LogEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(user: { id: string; role: string }, dto: CreateLogEntryDto) {
    if (user.role !== 'OFFICER') {
      throw new ForbiddenException('Only officers can respond to transmissions');
    }
    return this.prisma.logEntry.create({
      data: {
        body: dto.body,
        transmissionId: dto.transmissionId,
        officerId: user.id,
      },
    });
  }
}
