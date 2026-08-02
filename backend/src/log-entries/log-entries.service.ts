import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';

@Injectable()
export class LogEntriesService {
  private readonly logger = new Logger(LogEntriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: { id: string; role: string }, dto: CreateLogEntryDto) {
    const logEntry = await this.prisma.logEntry.create({
      data: {
        body: dto.body,
        transmissionId: dto.transmissionId,
        officerId: user.id,
      },
    });

    // Fire-and-forget: notify the crew member who asked to be notified, if any.
    // Never lets a webhook/email hiccup fail the actual log-entry response.
    this.notifyIfRequested(dto.transmissionId, logEntry.body).catch((err) => {
      this.logger.warn(`Response notification webhook failed: ${err.message}`);
    });

    return logEntry;
  }

  private async notifyIfRequested(transmissionId: string, responseBody: string) {
    const webhookUrl = process.env.N8N_RESPONSE_WEBHOOK_URL;
    if (!webhookUrl) return;

    const transmission = await this.prisma.transmission.findUnique({
      where: { id: transmissionId },
      select: { subject: true, notifyEmail: true },
    });
    if (!transmission?.notifyEmail) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notify_email: transmission.notifyEmail,
        subject: transmission.subject,
        response_body: responseBody,
      }),
    });
  }
}
