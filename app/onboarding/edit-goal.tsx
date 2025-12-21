import { Colors } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, useColorScheme } from 'react-native';

export default function EditGoalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { label: rawLabel } = useLocalSearchParams<{ label?: string }>();
  const label = typeof rawLabel === 'string' ? rawLabel : '';

  const { daily_goals, updateDailyGoal } = useOnboardingStore();
  const goal = useMemo(
    () => daily_goals.find((g) => g.label === label),
    [daily_goals, label]
  );

  const [relativeToCalories, setRelativeToCalories] = useState(false);
  const [amount, setAmount] = useState(goal ? String(goal.value) : '');

  const formattedTitle = goal?.label === 'Calories'
    ? 'Edit Calorie Goal'
    : `Edit ${goal?.label ?? 'Goal'}`;

  const onSave = () => {
    if (!goal) {
      router.back();
      return;
    }

    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed)) {
      return;
    }

    updateDailyGoal(goal.label, parsed);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={18} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{formattedTitle}</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {goal?.label !== 'Calories' && (
            <>
              <View style={styles.rowBetween}>
                <Text style={[styles.label, { color: theme.text }]}>Relative to Calorie Goal</Text>
                <Switch
                  value={relativeToCalories}
                  onValueChange={setRelativeToCalories}
                  thumbColor={relativeToCalories ? theme.tint : '#f4f3f4'}
                  trackColor={{ false: '#394B4B', true: theme.tint + '66' }}
                />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.text }]} />
            </>
          )}

          <View style={styles.inputBlock}>
            <View style={styles.rowBetween}>
              <Text style={[styles.label, { color: theme.text }]}>
                Amount {goal?.unit ? `(${goal.unit})` : ''}
              </Text>
              <Text style={[styles.helper, { color: theme.icon }]}>Required</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder={goal?.unit ? `e.g. ${goal.value}` : 'e.g. 2000'}
              placeholderTextColor={theme.icon}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, { backgroundColor: theme.tint, opacity: amount ? 1 : 0.6 }]}
          disabled={!amount}
          onPress={onSave}
        >
          <Text style={[styles.saveText, { color: theme.background }]}>Save Goal</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  inputBlock: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  input: {
    height: 64,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '800',
  },
  footer: {
    width: '100%',
  },
  saveButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '800',
  },
});


