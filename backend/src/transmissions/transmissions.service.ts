import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransmissionDto } from './dto/create-transmission.dto';
import { UpdateTransmissionDto } from './dto/update-transmission.dto';

@Injectable()
export class TransmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransmissionDto) {
    return this.prisma.transmission.create({
      data: {
        subject: dto.subject,
        description: dto.description,
        notifyEmail: dto.notifyEmail || null,
        senderId: userId,
      },
    });
  }

  async findAllForUser(user: { id: string; role: string }) {
    if (user.role === 'OFFICER') {
      return this.prisma.transmission.findMany({
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { email: true } } },
      });
    }
    return this.prisma.transmission.findMany({
      where: { senderId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const transmission = await this.prisma.transmission.findUnique({
      where: { id },
      include: {
        sender: { select: { email: true } },
        tags: true,
        logEntries: {
          include: { officer: { select: { email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!transmission) throw new NotFoundException('Transmission not found');
    if (user.role === 'CREW' && transmission.senderId !== user.id) {
      throw new ForbiddenException('Not your transmission');
    }
    return transmission;
  }

  async update(id: string, dto: UpdateTransmissionDto) {
    const data: Record<string, unknown> = {};
    if (dto.alertLevel) data.alertLevel = dto.alertLevel;
    if (dto.status) data.status = dto.status;
    if (dto.tagNames) {
      data.tags = {
        set: [],
        connectOrCreate: dto.tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    return this.prisma.transmission.update({ where: { id }, data });
  }
}
