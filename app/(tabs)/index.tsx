import { calculateResolvedValue } from '@/lib/logGoalChange';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DonutRings from '../../assets/DonutRings';
import { BottomSheet } from '../../components/BottomSheet';
import { MacroCard } from '../../components/MacroCard';
import { MealCard } from '../../components/MealCard';
import { MealItem } from '../../components/MealItem';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

interface FoodLog {
  id: string;
  food_name: string;
  brand: string | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  logged_date: string;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  protein_input_mode: 'absolute' | 'percent';
  carbs_input_mode: 'absolute' | 'percent';
  fat_input_mode: 'absolute' | 'percent';
}

export default function Index() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | null>(null);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Fetch user goals and food logs
  useEffect(() => {
    fetchDailyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = formatDate(selectedDate);

      // Fetch user profile with goals
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, protein_input_mode, carbs_input_mode, fat_input_mode')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Calculate resolved values for macros in percentage mode
        const resolvedProtein = profile.protein_input_mode === 'percent'
          ? calculateResolvedValue(profile.daily_protein_goal, 'percent', profile.daily_calorie_goal, 'protein')
          : profile.daily_protein_goal;
        const resolvedCarbs = profile.carbs_input_mode === 'percent'
          ? calculateResolvedValue(profile.daily_carbs_goal, 'percent', profile.daily_calorie_goal, 'carbs')
          : profile.daily_carbs_goal;
        const resolvedFat = profile.fat_input_mode === 'percent'
          ? calculateResolvedValue(profile.daily_fat_goal, 'percent', profile.daily_calorie_goal, 'fat')
          : profile.daily_fat_goal;

        setDailyGoals({
          calories: profile.daily_calorie_goal,
          protein: resolvedProtein,
          carbs: resolvedCarbs,
          fat: resolvedFat,
          protein_input_mode: profile.protein_input_mode,
          carbs_input_mode: profile.carbs_input_mode,
          fat_input_mode: profile.fat_input_mode,
        });
      }

      // Fetch food logs for selected date
      const { data: logs } = await supabase
        .from('food_logs')
        .select('id, food_name, brand, meal_type, calories, protein, carbs, fat, servings, logged_date')
        .eq('user_id', user.id)
        .eq('logged_date', dateStr)
        .order('logged_at', { ascending: true });

      if (logs) {
        setFoodLogs(logs as FoodLog[]);

        // Calculate totals
        const totals = logs.reduce(
          (acc, log) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein,
            carbs: acc.carbs + log.carbs,
            fat: acc.fat + log.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        setDailyTotals(totals);
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group food logs by meal type
  const mealsByType = {
    breakfast: foodLogs.filter((log) => log.meal_type === 'breakfast'),
    lunch: foodLogs.filter((log) => log.meal_type === 'lunch'),
    dinner: foodLogs.filter((log) => log.meal_type === 'dinner'),
    snack: foodLogs.filter((log) => log.meal_type === 'snack'),
  };

  // Calculate percentages for macros (capped at 100%)
  const proteinPercentage = dailyGoals && dailyGoals.protein > 0
    ? Math.min(100, Math.round((dailyTotals.protein / dailyGoals.protein) * 100))
    : 0;
  const carbsPercentage = dailyGoals && dailyGoals.carbs > 0
    ? Math.min(100, Math.round((dailyTotals.carbs / dailyGoals.carbs) * 100))
    : 0;
  const fatPercentage = dailyGoals && dailyGoals.fat > 0
    ? Math.min(100, Math.round((dailyTotals.fat / dailyGoals.fat) * 100))
    : 0;

  // Navigate to previous/next day
  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <ThemedView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <ScrollView className='flex-1 p-[2em] pl-3 pr-3' contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View className='' style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => changeDate('prev')}>
            <ThemedText type="default" style={styles.chev}>&lt;</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {formatDisplayDate(selectedDate)}
          </ThemedText>
          <TouchableOpacity style={styles.iconButton} onPress={() => changeDate('next')}>
            <ThemedText type="default" style={styles.chev}>&gt;</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <View style={styles.donutWrap}>
            <DonutRings 
              carbsPercent={carbsPercentage}
              fatPercent={fatPercentage}
              proteinPercent={proteinPercentage}
            />
            <View style={styles.centerOverlay}>
              <ThemedText type="default" style={styles.subText}>
                Of {dailyGoals?.calories.toLocaleString() || 0} Kcal
              </ThemedText>
              <ThemedText type="title" style={styles.kcal}>
                {dailyTotals.calories.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.macrosRow} className='mx-2'>
            <MacroCard
              title="Carbs"
              color="#4CAF50"
              percentage={carbsPercentage}
              current={`${Math.round(dailyTotals.carbs)}`}
              target={`${dailyGoals?.carbs || 0} g`}
              backgroundColor="#DCEEDC"
            />
            <MacroCard
              title="Fat"
              color="#00BCD4"
              percentage={fatPercentage}
              current={`${Math.round(dailyTotals.fat)}`}
              target={`${dailyGoals?.fat || 0} g`}
              backgroundColor="#D1F1F4"
            />
            <MacroCard
              title="Protein"
              color="#FF9800"
              percentage={proteinPercentage}
              current={`${Math.round(dailyTotals.protein)}`}
              target={`${dailyGoals?.protein || 0} g`}
              backgroundColor="#FEEACE"
            />
          </View>
        </View>

        <View className="pb-24" style={styles.mealsList}>
          <MealCard title="Breakfast" onAdd={() => { }}>
            {mealsByType.breakfast.length > 0 ? (
              mealsByType.breakfast.map((log) => (
                <MealItem
                  key={log.id}
                  name={log.food_name}
                  description={log.brand ? `${log.brand}${log.servings > 1 ? ` (${log.servings}x)` : ''}` : log.servings > 1 ? `${log.servings} servings` : ''}
                  calories={`${Math.round(log.calories)} cal`}
                />
              ))
            ) : null}
          </MealCard>

          <MealCard
            title="Lunch"
            onAdd={() => { }}
            emptyText="No lunch logged. Tap '+' to add food."
          >
            {mealsByType.lunch.map((log) => (
              <MealItem
                key={log.id}
                name={log.food_name}
                description={log.brand ? `${log.brand}${log.servings > 1 ? ` (${log.servings}x)` : ''}` : log.servings > 1 ? `${log.servings} servings` : ''}
                calories={`${Math.round(log.calories)} cal`}
              />
            ))}
          </MealCard>

          <MealCard
            title="Dinner"
            onAdd={() => { }}
            emptyText="No dinner logged. Tap '+' to add food."
          >
            {mealsByType.dinner.map((log) => (
              <MealItem
                key={log.id}
                name={log.food_name}
                description={log.brand ? `${log.brand}${log.servings > 1 ? ` (${log.servings}x)` : ''}` : log.servings > 1 ? `${log.servings} servings` : ''}
                calories={`${Math.round(log.calories)} cal`}
              />
            ))}
          </MealCard>

          <MealCard
            title="Snacks"
            onAdd={() => { }}
            emptyText="No snacks logged. Tap '+' to add food."
          >
            {mealsByType.snack.map((log) => (
              <MealItem
                key={log.id}
                name={log.food_name}
                description={log.brand ? `${log.brand}${log.servings > 1 ? ` (${log.servings}x)` : ''}` : log.servings > 1 ? `${log.servings} servings` : ''}
                calories={`${Math.round(log.calories)} cal`}
              />
            ))}
          </MealCard>
        </View>
      </ScrollView>



      <TouchableOpacity style={styles.fab} onPress={() => setIsSheetOpen(true)}>
        <Text className='text-white text-5xl'>+</Text>
      </TouchableOpacity>

      <BottomSheet isVisible={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <ThemedText type="title">Add Item</ThemedText>
        <ThemedText>Select an option to add to your daily log.</ThemedText>
        {/* Placeholder content */}
        <View style={{ height: 200 }} />
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingBottom: 10, minHeight: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, textAlign: 'center' },
  chev: { fontSize: 18 },
  centerArea: { alignItems: 'center', marginTop: 8 },
  donutWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  centerOverlay: { position: 'absolute', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  flameBg: { width: 40, height: 40, borderRadius: 100, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginBottom: 0 },
  subText: { fontSize: 14, color: '#777' },
  kcal: { fontSize: 40, fontWeight: '700' },
  macrosRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  mealsList: { marginTop: 16, gap: 12 },
  fab: { position: 'absolute', right: 25, bottom: 100, width: 60, height: 60, borderRadius: 32, backgroundColor: '#32B8C6', alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
