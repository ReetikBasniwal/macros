import { MEAL_LABELS, MEAL_ORDER } from '@/constants/food';
import { formatDisplayDate } from '@/lib/date';
import { calculateResolvedValue } from '@/lib/logGoalChange';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DonutRings from '../../assets/DonutRings';
import { AddFoodSheet } from '../../components/AddFoodSheet';
import { FoodDetailSheet } from '../../components/FoodDetailSheet';
import { MacroCard } from '../../components/MacroCard';
import { FoodLog, MealCard } from '../../components/MealCard';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

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
  
  // Detail sheet state
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [detailSheetFood, setDetailSheetFood] = useState<any>(null);
  const [detailSheetInitialValues, setDetailSheetInitialValues] = useState<any>(null);

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
        .select('id, generic_food_id, food_name, brand, meal_type, calories, protein, carbs, fat, fiber, servings, logged_date, portion, portion_unit')
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
  const mealsByType = MEAL_ORDER.reduce((acc, meal) => {
    acc[meal] = foodLogs.filter((log) => log.meal_type === meal);
    return acc;
  }, {} as Record<typeof MEAL_ORDER[number], FoodLog[]>);


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

  const handleMealPress = (log: FoodLog) => {
    const servings = log.servings || 1;
    const baseFood = {
      id: log.generic_food_id,
      name: log.food_name,
      brand: log.brand,
      serving_size: log.portion / servings,
      serving_unit: log.portion_unit,
      calories: log.calories / servings,
      protein: log.protein / servings,
      carbs: log.carbs / servings,
      fat: log.fat / servings,
      fiber: (log.fiber || 0) / servings,
    };

    setDetailSheetFood(baseFood);
    setDetailSheetInitialValues({
      portion: log.portion.toString(),
      unit: log.portion_unit,
      mealType: log.meal_type,
      date: log.logged_date,
      logId: log.id,
    });
    setIsDetailSheetOpen(true);
  };

  const handleLogSave = (updatedLog: FoodLog) => {
    setIsDetailSheetOpen(false);
    // Update foodLogs locally
    setFoodLogs(currentLogs => {
      const exists = currentLogs.some(log => log.id === updatedLog.id);
      let newLogs: FoodLog[];
      if (exists) {
        if (updatedLog.logged_date === formatDate(selectedDate)) {
          newLogs = currentLogs.map(log => log.id === updatedLog.id ? updatedLog : log);
        } else {
          newLogs = currentLogs.filter(log => log.id !== updatedLog.id);
        }
      } else {
        if (updatedLog.logged_date === formatDate(selectedDate)) {
          newLogs = [...currentLogs, updatedLog];
        } else {
          newLogs = currentLogs;
        }
      }
      
      // Recalculate totals
      const totals = newLogs.reduce(
        (acc, log) => ({
             calories: acc.calories + log.calories,
             protein: acc.protein + log.protein,
             carbs: acc.carbs + log.carbs,
             fat: acc.fat + log.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      setDailyTotals(totals);

      return newLogs;
    });
  };

  const handleLogDelete = async (logId: string) => {
    setIsDetailSheetOpen(false);
    
    // Optimistic update
    setFoodLogs(currentLogs => {
      const newLogs = currentLogs.filter(log => log.id !== logId);
      
      // Recalculate totals
      const totals = newLogs.reduce(
        (acc, log) => ({
             calories: acc.calories + log.calories,
             protein: acc.protein + log.protein,
             carbs: acc.carbs + log.carbs,
             fat: acc.fat + log.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      setDailyTotals(totals);

      return newLogs;
    });

    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting log:', error);
        // We could revert state here if needed, but for now we'll just log
        fetchDailyData(); // Refresh to be safe
      }
    } catch (error) {
      console.error('Error in handleLogDelete:', error);
      fetchDailyData();
    }
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
              <ThemedText type="title" style={styles.kcal}>
                {dailyTotals.calories.toLocaleString()}
              </ThemedText>
              <ThemedText type="default" style={styles.subText}>
                Of {dailyGoals?.calories.toLocaleString() || 0} Kcal
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
          {MEAL_ORDER.map((meal) => {
            const items = mealsByType[meal] ?? [];

            if ((meal === 'pre_workout' || meal === 'post_workout') 
              && items.length === 0) {
              return null;
            }

            return (
              <MealCard
                key={meal}
                title={MEAL_LABELS[meal]}
                meals={items}
                onAdd={() => { }}
                onMealPress={handleMealPress}
                emptyText="No meals logged"
              />
            );
          })}
        </View>
      </ScrollView>



      <TouchableOpacity style={styles.fab} onPress={() => setIsSheetOpen(true)}>
        <Text className='text-white text-5xl'>+</Text>
      </TouchableOpacity>

      <AddFoodSheet isVisible={isSheetOpen} onClose={() => setIsSheetOpen(false)} onFoodAdd={handleLogSave} />
      
      <FoodDetailSheet
        visible={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        onSave={handleLogSave}
        onDelete={handleLogDelete}
        food={detailSheetFood}
        initialValues={detailSheetInitialValues}
      />
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
