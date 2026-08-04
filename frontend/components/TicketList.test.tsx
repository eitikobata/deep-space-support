import { render, screen, fireEvent } from '@testing-library/react';
import { TicketList } from './TicketList';
import { Transmission } from '@/lib/api';

const tickets: Transmission[] = [
  {
    id: '1',
    subject: 'Test A',
    description: '',
    alertLevel: 'BLUE_ALERT',
    status: 'ACTIVE',
    senderId: 's',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('TicketList', () => {
  it('shows an empty state when there are no tickets', () => {
    render(<TicketList tickets={[]} />);
    expect(screen.getByText(/No transmissions logged yet/i)).toBeInTheDocument();
  });

  it('renders a ticket row and calls onSelect with its id when clicked', () => {
    const onSelect = jest.fn();
    render(<TicketList tickets={tickets} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Test A'));

    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
