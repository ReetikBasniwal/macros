/**
 * Calculate daily calorie and macro goals based on user biometrics
 * Uses Mifflin-St Jeor equation for BMR calculation
 */

interface CalculateGoalsParams {
  age: number;
  height: number; // in cm
  weight: number; // in kg
  sex: string; // 'male' or 'female'
  activity_level: number; // 1-5
  weight_goal: number; // 1: lose, 2: gain, 3: maintain
  diet_type: number; // 1: low_carb, 2: high_protein, 3: keto, 4: none
}

interface CalculatedGoals {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<number, number> = {
  1: 1.2, // Sedentary
  2: 1.375, // Lightly Active
  3: 1.55, // Active
  4: 1.725, // Very Active
  5: 1.9, // Extra Active
};

/**
 * Weight goal adjustments (calorie deficit/surplus)
 */
const WEIGHT_GOAL_ADJUSTMENTS: Record<number, number> = {
  1: -500, // Lose weight: 500 cal deficit
  2: 500, // Gain weight: 500 cal surplus
  3: 0, // Maintain weight: no adjustment
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
function calculateBMR(age: number, height: number, weight: number, sex: string): number {
  const isMale = sex.toLowerCase() === 'male';
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return baseBMR + (isMale ? 5 : -161);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
function calculateTDEE(bmr: number, activityLevel: number): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return bmr * multiplier;
}

/**
 * Calculate macros with weight-based protein (fixed)
 * Diet type affects only carbs vs fat split
 */
function calculateMacrosWithFixedProtein(
  calories: number,
  weight: number,
  dietType: number
): { protein: number; carbs: number; fat: number } {
  const PROTEIN_CALS_PER_G = 4;
  const CARBS_CALS_PER_G = 4;
  const FAT_CALS_PER_G = 9;

  // Protein: fixed, weight-based (ideal for fat loss / recomposition)
  const protein = Math.round(weight * 2.0); // 2.0 g/kg
  const proteinCalories = protein * PROTEIN_CALS_PER_G;

  const remainingCalories = calories - proteinCalories;

  let carbsPercent: number;
  let fatPercent: number;

  switch (dietType) {
    case 1: // Low Carb
      carbsPercent = 0.25;
      fatPercent = 0.75;
      break;
    case 2: // High Protein
      carbsPercent = 0.45;
      fatPercent = 0.55;
      break;
    case 3: // Keto
      carbsPercent = 0.10;
      fatPercent = 0.90;
      break;
    case 4: // Balanced / None
    default:
      carbsPercent = 0.55;
      fatPercent = 0.45;
      break;
  }

  const carbs = Math.round((remainingCalories * carbsPercent) / CARBS_CALS_PER_G);
  const fat = Math.round((remainingCalories * fatPercent) / FAT_CALS_PER_G);

  return { protein, carbs, fat };
}

/**
 * Main function to calculate daily goals
 */
export function calculateDailyGoals(params: CalculateGoalsParams): CalculatedGoals {
  const { age, height, weight, sex, activity_level, weight_goal, diet_type } = params;

  // Validate inputs
  if (!age || !height || !weight || !sex || !activity_level) {
    // Return default values if data is incomplete
    return {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 67,
    };
  }

  // Calculate BMR
  const bmr = calculateBMR(age, height, weight, sex);

  // Calculate TDEE
  const tdee = calculateTDEE(bmr, activity_level);

  // Apply weight goal adjustment
  const adjustment = WEIGHT_GOAL_ADJUSTMENTS[weight_goal] || 0;
  const targetCalories = Math.round(tdee + adjustment);

  // Ensure minimum calories (1200 for safety)
  const calories = Math.max(1200, targetCalories);

  // Calculate macros (protein fixed by body weight)
  const macros = calculateMacrosWithFixedProtein(calories, weight, diet_type);

  return {
    calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
  };
}
