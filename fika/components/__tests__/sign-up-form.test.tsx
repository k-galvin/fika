
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '../sign-up-form';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation');
jest.mock('@/lib/supabase/client');

const mockUseRouter = useRouter as jest.Mock;
const mockCreateClient = createClient as jest.Mock;

describe('SignUpForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements', () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('shows an error if passwords do not match', async () => {
    render(<SignUpForm />);
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const repeatPasswordInput = screen.getByLabelText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign up' });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(repeatPasswordInput, 'password456');
    await userEvent.click(signUpButton);

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('calls the signup function and redirects on successful signup', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: null });
    const mockPush = jest.fn();

    mockUseRouter.mockReturnValue({ push: mockPush });
    mockCreateClient.mockReturnValue({ auth: { signUp: mockSignUp } });

    render(<SignUpForm />);

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const repeatPasswordInput = screen.getByLabelText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign up' });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(repeatPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'testuser',
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success');
    });
  });

  it('shows an error message when signup fails', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      error: new Error('User already registered'),
    });
    mockCreateClient.mockReturnValue({ auth: { signUp: mockSignUp } });
    mockUseRouter.mockReturnValue({ push: jest.fn() });

    render(<SignUpForm />);

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const repeatPasswordInput = screen.getByLabelText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign up' });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(repeatPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'An account with this email already exists. Please log in instead.'
        )
      ).toBeInTheDocument();
    });
  });

  it('disables the button and shows loading text during submission', async () => {
    const mockSignUp = jest.fn(() => new Promise(() => {})); // a promise that never resolves
    mockCreateClient.mockReturnValue({ auth: { signUp: mockSignUp } });
    mockUseRouter.mockReturnValue({ push: jest.fn() });

    render(<SignUpForm />);

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const repeatPasswordInput = screen.getByLabelText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign up' });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(repeatPasswordInput, 'password123');
    await userEvent.click(signUpButton);

    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
      expect(screen.getByText('Creating an account...')).toBeInTheDocument();
    });
  });
});
