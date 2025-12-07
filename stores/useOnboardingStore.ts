import { create } from "zustand";

interface OnboardingState {
  age: string;
  height: string;
  weight: string;
  sex: string;

  // actions
  setField: (key: string, value: any) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  age: "",
  height: "",
  weight: "",
  sex: "",

  setField: (key, value) => set((state) => ({ ...state, [key]: value })),

  reset: () =>
    set({
      age: "",
      height: "",
      weight: "",
      sex: "",
    }),
}));