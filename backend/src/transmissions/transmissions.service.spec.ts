import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
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

  it('only lets officers update a transmission', async () => {
    await expect(
      service.update('some-id', { id: 'user-1', role: 'CREW' }, { status: 'RESOLVED' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates a transmission for the current user', async () => {
    prisma.transmission.create.mockResolvedValue({ id: 't1' });

    const result = await service.create('user-1', {
      subject: 'Test',
      description: 'Testing',
    });

    expect(prisma.transmission.create).toHaveBeenCalledWith({
      data: { subject: 'Test', description: 'Testing', senderId: 'user-1' },
    });
    expect(result).toEqual({ id: 't1' });
  });
});
