import { Pressable, StyleSheet } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/useHaptics';
import type { Units } from '@/store/slices/settingsSlice';
import type { Entry } from '@/types/entry';

import { EntryCard } from './EntryCard';
import { Text } from './ui/Text';

interface SwipeableEntryCardProps {
  entry: Entry;
  units: Units;
  onPress?: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}

export function SwipeableEntryCard({ entry, units, onPress, onDelete }: SwipeableEntryCardProps) {
  const theme = useTheme();
  const { notify } = useHaptics();

  const renderRightActions = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Delete ${entry.title}`}
      onPress={() => {
        notify();
        onDelete(entry);
      }}
      style={[styles.action, { backgroundColor: theme.danger }]}
    >
      <Text style={styles.actionText}>Delete</Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      <EntryCard entry={entry} units={units} onPress={onPress} />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
    marginLeft: Spacing.sm,
    borderRadius: Radius.lg,
  },
  actionText: { color: '#FFFFFF', fontWeight: '700' },
});
