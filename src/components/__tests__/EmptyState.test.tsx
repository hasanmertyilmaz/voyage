import { fireEvent, render } from '@testing-library/react-native';

import { EmptyState } from '@/components/ui/EmptyState';

// No ThemeProvider is mounted, so useTheme() resolves to the default light
// palette via context — exactly what we want for an isolated render.
describe('EmptyState', () => {
  it('renders the title and message', () => {
    const { getByText } = render(
      <EmptyState title="No trips yet" message="Add your first trip." />,
    );
    expect(getByText('No trips yet')).toBeTruthy();
    expect(getByText('Add your first trip.')).toBeTruthy();
  });

  it('fires the action callback when the button is pressed', () => {
    const onAction = jest.fn();
    const { getByRole } = render(
      <EmptyState title="Empty" actionLabel="Add a trip" onAction={onAction} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
