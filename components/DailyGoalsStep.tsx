import { Colors } from '@/constants/theme';
import { calculateResolvedValue } from '@/lib/logGoalChange';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Theme = (typeof Colors)['light'];

type DailyGoalsStepProps = {
    theme: Theme;
};

export default function DailyGoalsStep({ theme }: DailyGoalsStepProps) {
    const { 
        daily_goals, 
        goal_setting_preference, 
        age,
        height,
        weight,
        sex,
        activity_level,
        weight_goal,
        diet_type,
        recalculateGoals 
    } = useOnboardingStore();
    const router = useRouter();

    // Recalculate goals when component mounts or when relevant data changes if auto mode is selected
    useEffect(() => {
        if (goal_setting_preference === 'auto') {
            recalculateGoals();
        }
    }, [goal_setting_preference, age, height, weight, sex, activity_level, weight_goal, diet_type, recalculateGoals]);

    // Get calorie goal for calculating resolved values
    const calorieGoal = useMemo(
        () => daily_goals.find((g) => g.label === 'Calories')?.value || 2000,
        [daily_goals]
    );

    // Helper function to get display value (resolved if percentage mode)
    const getDisplayValue = (item: typeof daily_goals[0]) => {
        if (item.label === 'Calories' || item.input_mode === 'absolute') {
            return item.value;
        }
        
        // Calculate resolved value for percentage mode
        const macroType = item.label.toLowerCase() as 'protein' | 'carbs' | 'fat';
        return calculateResolvedValue(item.value, 'percent', calorieGoal, macroType);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.title, { color: theme.text }]}>
                Your Daily Goals
            </Text>
            <View style={styles.goalsContainer}>
                {daily_goals.map((item) => {
                    const displayValue = getDisplayValue(item);
                    const isPercentage = item.input_mode === 'percent' && item.label !== 'Calories';
                    
                    return (
                        <View key={item.label} style={[styles.goalCard, { backgroundColor: theme.card }]}>
                            <View style={[styles.accent, { backgroundColor: theme.tint }]} />
                            <View style={styles.goalContent}>
                                <View style={styles.goalLeft}>
                                    <View style={[styles.iconWrapper, { backgroundColor: theme.tint + '1A' }]}>
                                        <MaterialIcons name={
                                            item.label === 'Calories' ? 'local-fire-department' :
                                            item.label === 'Protein' ? 'fitness-center' :
                                            item.label === 'Carbs' ? 'grain' : 'water-drop'
                                        } size={22} color={theme.tint} />
                                    </View>
                                    <View>
                                        <Text style={[styles.goalLabel, { color: theme.icon }]}>
                                            {item.label}
                                            {isPercentage && (
                                                <Text style={[styles.percentageIndicator, { color: theme.icon }]}>
                                                    {' '}({item.value}%)
                                                </Text>
                                            )}
                                        </Text>
                                        <Text style={[styles.goalValue, { color: theme.text }]}>
                                            {displayValue}{item.unit ? item.unit : ''}
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    style={[styles.editButton, { backgroundColor: theme.tint + '33' }]}
                                    onPress={() => router.push({ pathname: '/onboarding/edit-goal' as any, params: { label: item.label } })}
                                >
                                    <Text style={[styles.editButtonText, { color: theme.tint }]}>Edit</Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 24
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'left',
    },
    goalsContainer: {
        gap: 14,
    },
    goalCard: {
        borderRadius: 16,
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 3,
    },
    accent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 6,
    },
    goalContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
    },
    goalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 22,
    },
    goalLabel: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.8,
    },
    percentageIndicator: {
        fontSize: 12,
        fontWeight: '400',
        opacity: 0.6,
    },
    goalValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
