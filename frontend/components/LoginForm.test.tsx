import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders the crew variant with its own heading', () => {
    render(<LoginForm variant="crew" onLogin={jest.fn()} />);
    expect(screen.getByText('Crew Login')).toBeInTheDocument();
  });

  it('renders the officer variant with its own heading', () => {
    render(<LoginForm variant="officer" onLogin={jest.fn()} />);
    expect(screen.getByText('Officer Login')).toBeInTheDocument();
  });

  it('calls onLogin with the typed email and password on submit', async () => {
    const onLogin = jest.fn().mockResolvedValue(undefined);
    render(<LoginForm variant="crew" onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'crew1@station.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /authenticate/i }));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('crew1@station.com', 'senha123'));
  });

  it('shows a link to switch to the other portal', () => {
    render(<LoginForm variant="crew" onLogin={jest.fn()} />);
    expect(screen.getByText(/Switch to Officer Deck/i)).toBeInTheDocument();
  });
});
