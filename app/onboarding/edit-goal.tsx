import { Colors } from '@/constants/theme';
import { calculateResolvedValue, logGoalChange } from '@/lib/logGoalChange';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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

  // Get calorie goal for percentage calculations
  const calorieGoal = useMemo(
    () => daily_goals.find((g) => g.label === 'Calories')?.value || 2000,
    [daily_goals]
  );

  const isCalories = goal?.label === 'Calories';
  const currentInputMode = goal?.input_mode || 'absolute';
  const [relativeToCalories, setRelativeToCalories] = useState(currentInputMode === 'percent');
  
  // Initialize amount based on current goal value and input mode
  const initialAmount = useMemo(() => {
    if (!goal) return '';
    if (currentInputMode === 'percent' && !isCalories) {
      // Convert absolute value to percentage for display
      const macroType = goal.label.toLowerCase() as 'protein' | 'carbs' | 'fat';
      const caloriesPerGram = macroType === 'fat' ? 9 : 4;
      const caloriesFromMacro = goal.value * caloriesPerGram;
      const percentage = Math.round((caloriesFromMacro / calorieGoal) * 100);
      return String(percentage);
    }
    return String(goal.value);
  }, [goal, currentInputMode, isCalories, calorieGoal]);
  
  const [amount, setAmount] = useState(initialAmount);

  // Update amount when toggling between absolute and percentage
  useEffect(() => {
    if (!goal || isCalories) return;
    
    const currentAmount = parseFloat(amount);
    if (Number.isNaN(currentAmount)) return;

    if (relativeToCalories) {
      // Converting from absolute to percentage
      const macroType = goal.label.toLowerCase() as 'protein' | 'carbs' | 'fat';
      const caloriesPerGram = macroType === 'fat' ? 9 : 4;
      const caloriesFromMacro = currentAmount * caloriesPerGram;
      const percentage = Math.round((caloriesFromMacro / calorieGoal) * 100);
      setAmount(String(percentage));
    } else {
      // Converting from percentage to absolute
      const macroType = goal.label.toLowerCase() as 'protein' | 'carbs' | 'fat';
      const resolved = calculateResolvedValue(currentAmount, 'percent', calorieGoal, macroType);
      setAmount(String(resolved));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relativeToCalories]); // Only run when toggle changes

  const formattedTitle = goal?.label === 'Calories'
    ? 'Edit Calorie Goal'
    : `Edit ${goal?.label ?? 'Goal'}`;

  // Calculate resolved value (absolute) for display
  const resolvedValue = useMemo(() => {
    if (!goal || !amount) return null;
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed)) return null;

    if (isCalories || !relativeToCalories) {
      return parsed;
    }

    const macroType = goal.label.toLowerCase() as 'protein' | 'carbs' | 'fat';
    return calculateResolvedValue(parsed, 'percent', calorieGoal, macroType);
  }, [amount, relativeToCalories, goal, calorieGoal, isCalories]);

  const onSave = async () => {
    if (!goal) {
      router.back();
      return;
    }

    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed)) {
      return;
    }

    const inputMode = (isCalories || !relativeToCalories) ? 'absolute' : 'percent';
    const oldValue = goal.value;
    const oldInputMode = goal.input_mode || 'absolute';

    // Calculate resolved values
    const resolvedOldValue = oldInputMode === 'percent' && !isCalories
      ? calculateResolvedValue(oldValue, 'percent', calorieGoal, goal.label.toLowerCase() as 'protein' | 'carbs' | 'fat')
      : oldValue;
    const resolvedNewValue = inputMode === 'percent' && !isCalories
      ? calculateResolvedValue(parsed, 'percent', calorieGoal, goal.label.toLowerCase() as 'protein' | 'carbs' | 'fat')
      : parsed;

    // Update store
    updateDailyGoal(goal.label, parsed, inputMode);

    // Only log change to history if onboarding is complete AND value actually changed
    // During onboarding, changes are only logged when onboarding is completed
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if onboarding is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      // Only log if onboarding is complete AND value actually changed
      if (profile?.onboarding_complete && (oldValue !== parsed || oldInputMode !== inputMode)) {
        const macroMap: Record<string, 'calories' | 'protein' | 'carbs' | 'fat'> = {
          'Calories': 'calories',
          'Protein': 'protein',
          'Carbs': 'carbs',
          'Fat': 'fat',
        };

        await logGoalChange({
          userId: user.id,
          macro: macroMap[goal.label] || 'calories',
          inputMode,
          oldValue,
          newValue: parsed,
          resolvedOldValue,
          resolvedNewValue,
          changeSource: 'manual',
        });
      }
    }

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
                Amount {relativeToCalories && !isCalories ? '(%)' : goal?.unit ? `(${goal.unit})` : ''}
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
              placeholder={relativeToCalories && !isCalories 
                ? `e.g. ${goal ? Math.round((goal.value / (goal.label === 'Protein' || goal.label === 'Carbs' ? calorieGoal / 4 : calorieGoal / 9)) * 100) : 30}%`
                : goal?.unit ? `e.g. ${goal.value}` : 'e.g. 2000'}
              placeholderTextColor={theme.icon}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            {relativeToCalories && !isCalories && resolvedValue !== null && (
              <Text style={[styles.helper, { color: theme.icon, marginTop: 4 }]}>
                ≈ {resolvedValue} {goal?.unit} ({Math.round((resolvedValue * (goal?.label === 'Fat' ? 9 : 4) / calorieGoal) * 100)}% of calories)
              </Text>
            )}
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


