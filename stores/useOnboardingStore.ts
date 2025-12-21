import { create } from "zustand";

type Goal = {
  label: string;
  value: number;
  unit?: string;
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
  updateDailyGoal: (label: string, value: number) => void;
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
    { label: 'Calories', value: 2000 },
    { label: 'Protein', value: 150, unit: 'g' },
    { label: 'Carbs', value: 200, unit: 'g' },
    { label: 'Fat', value: 67, unit: 'g' },
  ],

  setField: (key, value) => set((state) => ({ ...state, [key]: value })),

  updateDailyGoal: (label, value) =>
    set((state) => ({
      ...state,
      daily_goals: state.daily_goals.map((goal) =>
        goal.label === label ? { ...goal, value } : goal
      ),
    })),

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
        { label: 'Calories', value: 2000 },
        { label: 'Protein', value: 150, unit: 'g' },
        { label: 'Carbs', value: 200, unit: 'g' },
        { label: 'Fat', value: 67, unit: 'g' },
      ],
    }),
}));