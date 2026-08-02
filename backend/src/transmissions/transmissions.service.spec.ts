import { Test } from '@nestjs/testing';
import { TransmissionsService } from './transmissions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransmissionsService', () => {
  let service: TransmissionsService;
  let prisma: { transmission: Record<string, jest.Mock> };

  beforeEach(async () => {
    prisma = {
      transmission: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [TransmissionsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(TransmissionsService);
  });

  // Note: OFFICER-only authorization for update() is enforced by RolesGuard
  // at the controller level (@Roles('OFFICER') on TransmissionsController.update),
  // not inside the service. See roles.guard.spec.ts for that behavior.

  it('maps provided fields onto the Prisma update call', async () => {
    prisma.transmission.update.mockResolvedValue({ id: 't1', status: 'RESOLVED' });

    const result = await service.update('t1', { status: 'RESOLVED' });

    expect(prisma.transmission.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'RESOLVED' },
    });
    expect(result).toEqual({ id: 't1', status: 'RESOLVED' });
  });

  it('creates a transmission for the current user', async () => {
    prisma.transmission.create.mockResolvedValue({ id: 't1' });

    const result = await service.create('user-1', {
      subject: 'Test',
      description: 'Testing',
    });

    expect(prisma.transmission.create).toHaveBeenCalledWith({
      data: { subject: 'Test', description: 'Testing', notifyEmail: null, senderId: 'user-1' },
    });
    expect(result).toEqual({ id: 't1' });
  });

  it('persists notifyEmail when provided', async () => {
    prisma.transmission.create.mockResolvedValue({ id: 't2' });

    await service.create('user-1', {
      subject: 'Test',
      description: 'Testing',
      notifyEmail: 'crew@station.com',
    });

    expect(prisma.transmission.create).toHaveBeenCalledWith({
      data: {
        subject: 'Test',
        description: 'Testing',
        notifyEmail: 'crew@station.com',
        senderId: 'user-1',
      },
    });
  });
});
