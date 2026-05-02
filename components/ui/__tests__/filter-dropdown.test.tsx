
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdown } from '../filter-dropdown';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('FilterDropdown', () => {
  it('renders and shows options on click', async () => {
    const user = userEvent.setup();
    render(
      <FilterDropdown
        title="City"
        options={['Los Angeles', 'New York']}
        filterKey="city"
      />
    );

    const trigger = screen.getByText('City');
    await user.click(trigger);

    expect(await screen.findByText('Los Angeles')).toBeInTheDocument();
    expect(await screen.findByText('New York')).toBeInTheDocument();
  });
});
