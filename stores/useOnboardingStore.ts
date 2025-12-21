import { calculateDailyGoals } from "@/lib/calculateGoals";
import { create } from "zustand";

type Goal = {
  label: string;
  value: number;
  unit?: string;
  input_mode?: 'absolute' | 'percent'; // Track if value is absolute or percentage
};

interface OnboardingState {
  weight_goal: number;
  diet_type: number;
  goal_setting_preference: string; // 'auto' or 'manual'
  age: number;
  height: number;
  weight: number;
  sex: string;
  activity_level: number; // 1-5 mapped via ACTIVITY_LEVELS config
  daily_goals: Goal[];

  // actions
  setField: (key: string, value: any) => void;
  updateDailyGoal: (label: string, value: number, input_mode?: 'absolute' | 'percent') => void;
  recalculateGoals: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  weight_goal: 0,
  diet_type: 0,
  goal_setting_preference: '',
  age: 0,
  height: 0,
  weight: 0,
  sex: "",
  activity_level: 0,
  daily_goals: [
    { label: 'Calories', value: 2000, input_mode: 'absolute' },
    { label: 'Protein', value: 150, unit: 'g', input_mode: 'absolute' },
    { label: 'Carbs', value: 200, unit: 'g', input_mode: 'absolute' },
    { label: 'Fat', value: 67, unit: 'g', input_mode: 'absolute' },
  ],

  setField: (key, value) => set((state) => ({ ...state, [key]: value })),

  updateDailyGoal: (label, value, input_mode = 'absolute') =>
    set((state) => ({
      ...state,
      daily_goals: state.daily_goals.map((goal) =>
        goal.label === label ? { ...goal, value, input_mode } : goal
      ),
    })),

  recalculateGoals: () =>
    set((state) => {
      // Only recalculate if auto mode is selected and all required data is available
      if (
        state.goal_setting_preference === 'auto' &&
        state.age > 0 &&
        state.height > 0 &&
        state.weight > 0 &&
        state.sex &&
        state.activity_level > 0 &&
        state.weight_goal > 0 &&
        state.diet_type > 0
      ) {
        const calculated = calculateDailyGoals({
          age: state.age,
          height: state.height,
          weight: state.weight,
          sex: state.sex,
          activity_level: state.activity_level,
          weight_goal: state.weight_goal,
          diet_type: state.diet_type,
        });

        return {
          ...state,
          daily_goals: [
            { label: 'Calories', value: calculated.calories, input_mode: 'absolute' },
            { label: 'Protein', value: calculated.protein, unit: 'g', input_mode: 'absolute' },
            { label: 'Carbs', value: calculated.carbs, unit: 'g', input_mode: 'absolute' },
            { label: 'Fat', value: calculated.fat, unit: 'g', input_mode: 'absolute' },
          ],
        };
      }
      return state;
    }),

  reset: () =>
    set({
      weight_goal: 0,
      diet_type: 0,
      goal_setting_preference: '',
      age: 0,
      height: 0,
      weight: 0,
      sex: "",
      activity_level: 0,
      daily_goals: [
        { label: 'Calories', value: 2000, input_mode: 'absolute' },
        { label: 'Protein', value: 150, unit: 'g', input_mode: 'absolute' },
        { label: 'Carbs', value: 200, unit: 'g', input_mode: 'absolute' },
        { label: 'Fat', value: 67, unit: 'g', input_mode: 'absolute' },
      ],
    }),
}));