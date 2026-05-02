
import { render, screen } from '@testing-library/react';
import { UpdatePasswordForm } from '../update-password-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: jest.fn(),
    },
  }),
}));

describe('UpdatePasswordForm', () => {
  it('renders form elements', () => {
    render(<UpdatePasswordForm />);

    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save new password' })).toBeInTheDocument();
  });
});
