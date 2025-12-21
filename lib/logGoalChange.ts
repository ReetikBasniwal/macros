import { supabase } from './supabase';

interface LogGoalChangeParams {
  userId: string;
  macro: 'calories' | 'protein' | 'carbs' | 'fat';
  inputMode: 'absolute' | 'percent';
  oldValue: number | null;
  newValue: number;
  resolvedOldValue: number | null;
  resolvedNewValue: number;
  changeSource: 'onboarding' | 'manual' | 'auto_recalculation';
}

/**
 * Log a macro goal change to the macro_goal_history table
 */
export async function logGoalChange(params: LogGoalChangeParams): Promise<void> {
  const {
    userId,
    macro,
    inputMode,
    oldValue,
    newValue,
    resolvedOldValue,
    resolvedNewValue,
    changeSource,
  } = params;

  const { error } = await supabase.from('macro_goal_history').insert({
    user_id: userId,
    macro,
    input_mode: inputMode,
    old_value: oldValue,
    new_value: newValue,
    resolved_old_value: resolvedOldValue,
    resolved_new_value: resolvedNewValue,
    change_source: changeSource,
  });

  if (error) {
    console.error('Error logging goal change:', error);
    // Don't throw - logging failures shouldn't break the flow
  }
}

/**
 * Calculate resolved value (absolute) from percentage
 * For macros: protein/carbs = 4 cal/g, fat = 9 cal/g
 */
export function calculateResolvedValue(
  value: number,
  inputMode: 'absolute' | 'percent',
  calories: number,
  macroType: 'protein' | 'carbs' | 'fat'
): number {
  if (inputMode === 'absolute') {
    return value;
  }

  // Calculate calories from percentage
  const caloriesFromMacro = (calories * value) / 100;

  // Convert calories to grams based on macro type
  const caloriesPerGram = macroType === 'fat' ? 9 : 4;
  return Math.round(caloriesFromMacro / caloriesPerGram);
}

