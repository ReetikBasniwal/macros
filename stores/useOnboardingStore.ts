import { create } from "zustand";

interface OnboardingState {
  weight_goal: number;
  diet_type: number;
  age: number;
  height: number;
  weight: number;
  sex: string;

  // actions
  setField: (key: string, value: any) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  weight_goal: 0,
  diet_type: 0,
  age: 0,
  height: 0,
  weight: 0,
  sex: "",

  setField: (key, value) => set((state) => ({ ...state, [key]: value })),

  reset: () =>
    set({
      weight_goal: 0,
      diet_type: 0,
      age: 0,
      height: 0,
      weight: 0,
      sex: "",
    }),
}));