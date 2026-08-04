import { sortByUrgency, sortNewestFirst } from './sort';
import { Transmission } from './api';

function makeTicket(overrides: Partial<Transmission>): Transmission {
  return {
    id: overrides.id ?? 'id',
    subject: 'Subject',
    description: 'Description',
    alertLevel: 'BLUE_ALERT',
    status: 'ACTIVE',
    senderId: 'sender-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('sortByUrgency', () => {
  it('puts RED_ALERT before YELLOW_ALERT before BLUE_ALERT', () => {
    const tickets = [
      makeTicket({ id: 'blue', alertLevel: 'BLUE_ALERT' }),
      makeTicket({ id: 'red', alertLevel: 'RED_ALERT' }),
      makeTicket({ id: 'yellow', alertLevel: 'YELLOW_ALERT' }),
    ];

    const result = sortByUrgency(tickets).map((t) => t.id);

    expect(result).toEqual(['red', 'yellow', 'blue']);
  });

  it('breaks ties within the same alert level by most recent first', () => {
    const tickets = [
      makeTicket({ id: 'older', alertLevel: 'RED_ALERT', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeTicket({ id: 'newer', alertLevel: 'RED_ALERT', createdAt: '2026-01-03T00:00:00.000Z' }),
    ];

    const result = sortByUrgency(tickets).map((t) => t.id);

    expect(result).toEqual(['newer', 'older']);
  });

  it('does not mutate the original array', () => {
    const tickets = [makeTicket({ id: 'a', alertLevel: 'BLUE_ALERT' }), makeTicket({ id: 'b', alertLevel: 'RED_ALERT' })];
    const original = [...tickets];

    sortByUrgency(tickets);

    expect(tickets).toEqual(original);
  });
});

describe('sortNewestFirst', () => {
  it('orders tickets by createdAt descending, ignoring alert level', () => {
    const tickets = [
      makeTicket({ id: 'oldest', alertLevel: 'RED_ALERT', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeTicket({ id: 'newest', alertLevel: 'BLUE_ALERT', createdAt: '2026-01-05T00:00:00.000Z' }),
      makeTicket({ id: 'middle', alertLevel: 'YELLOW_ALERT', createdAt: '2026-01-03T00:00:00.000Z' }),
    ];

    const result = sortNewestFirst(tickets).map((t) => t.id);

    expect(result).toEqual(['newest', 'middle', 'oldest']);
  });
});
