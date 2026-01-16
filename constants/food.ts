export const MEAL_ORDER = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "pre_workout",
    "post_workout",
] as const;

export const MEAL_LABELS: Record<typeof MEAL_ORDER[number], string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    pre_workout: "Pre-Workout",
    post_workout: "Post-Workout",
};

export const MEAL_TYPES = MEAL_ORDER.map(meal => ({
    label: MEAL_LABELS[meal],
    value: meal
}));
