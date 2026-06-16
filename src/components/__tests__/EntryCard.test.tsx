import { fireEvent, render } from '@testing-library/react-native';

import { EntryCard } from '@/components/EntryCard';
import type { Entry } from '@/types/entry';

const entry: Entry = {
  id: '1',
  userId: 'u1',
  title: 'Sunset in Lisbon',
  notes: '',
  latitude: 38.7,
  longitude: -9.1,
  placeName: 'Lisbon, Portugal',
  photoUrl: null,
  photoPath: null,
  weather: { temperatureC: 24, weatherCode: 0, capturedAt: '' },
  tripDate: '2026-06-16',
  createdAt: '',
  updatedAt: '',
};

describe('EntryCard', () => {
  it('shows the title and place name', () => {
    const { getByText } = render(<EntryCard entry={entry} units="metric" />);
    expect(getByText('Sunset in Lisbon')).toBeTruthy();
    expect(getByText(/Lisbon, Portugal/)).toBeTruthy();
  });

  it('calls onPress with the entry', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<EntryCard entry={entry} units="metric" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(entry);
  });
});
