import ActivityLevelStep from '@/components/ActivityLevelStep';
import BiometricsStep from '@/components/BiometricsStep';
import DailyGoalsStep from '@/components/DailyGoalsStep';
import GoalSettingStep from '@/components/GoalSettingStep';
import MotivationsStep from '@/components/MotivationsStep';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

const TOTAL_STEPS = 5;

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const { weight_goal, diet_type, goal_setting_preference, age, height, weight, sex, activity_level, daily_goals, setField, reset } = useOnboardingStore();

    const canProceed = () => {
        switch (currentStep) {
            case 1: return weight_goal > 0 || diet_type > 0;
            case 2: return goal_setting_preference !== '';
            case 3: return age > 0;
            case 4: return activity_level > 0;
            case 5: return true;
            case 6: return weight > 0;
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    async function completeOnboarding() {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert('Error', 'No user found');
            setLoading(false);
            return;
        }

        // Map weight_goal from number to schema text value
        const weightGoalMap: Record<number, string> = {
            1: 'lose',
            2: 'gain',
            3: 'maintain',
        };
        const mappedWeightGoal = weight_goal > 0 ? weightGoalMap[weight_goal] : null;

        // Map diet_type from number to schema text value
        const dietTypeMap: Record<number, string> = {
            1: 'low_carb',
            2: 'high_protein',
            3: 'keto',
            4: 'none', // Balanced Diet maps to 'none'
        };
        const mappedDietType = diet_type > 0 ? dietTypeMap[diet_type] : null;

        // Map activity_level from number to schema text value
        // Schema has 4 levels, code has 5 - map 5 to 'very_active'
        const activityLevelMap: Record<number, string> = {
            1: 'sedentary',
            2: 'light',
            3: 'active',
            4: 'very_active',
            5: 'very_active', // Extra Active maps to very_active
        };
        const mappedActivityLevel = activity_level > 0 ? activityLevelMap[activity_level] : null;

        // Convert sex to lowercase to match schema
        const mappedSex = sex ? sex.toLowerCase() : null;

        // Extract daily goals from store
        const calorieGoal = daily_goals.find(g => g.label === 'Calories')?.value || 2000;
        const proteinGoal = daily_goals.find(g => g.label === 'Protein')?.value || 150;
        const carbsGoal = daily_goals.find(g => g.label === 'Carbs')?.value || 200;
        const fatGoal = daily_goals.find(g => g.label === 'Fat')?.value || 67;

        // Update user profile with onboarding data
        const { error } = await supabase
            .from('profiles')
            .update({
                weight_goal: mappedWeightGoal,
                diet_type: mappedDietType,
                age: age > 0 ? age : null,
                height_cm: height > 0 ? height : null,
                current_weight_kg: weight > 0 ? weight : null,
                sex: mappedSex,
                activity_level: mappedActivityLevel,
                daily_calorie_goal: calorieGoal,
                daily_protein_goal: proteinGoal,
                daily_carbs_goal: carbsGoal,
                daily_fat_goal: fatGoal,
                onboarding_complete: true,
            })
            .eq('id', user.id);

        if (error) {
            Alert.alert('Error', error.message);
            setLoading(false);
            return;
        }

        // Reset store and navigate to main app
        reset();
        router.replace('/(tabs)' as any);
        setLoading(false);
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <MotivationsStep />;
            case 2:
                return <GoalSettingStep />;
            case 3:
                return (
                    <BiometricsStep />
                );
            case 4:
                return <ActivityLevelStep />;
            case 5:
                return (
                    <DailyGoalsStep theme={theme} />
                );
            case 6:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>
                            What&apos;s your weight?
                        </Text>
                        <View style={styles.inputWithUnit}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: theme.border,
                                        color: theme.text,
                                        flex: 1,
                                    }
                                ]}
                                onChangeText={(text) => setField('weight', parseFloat(text) || 0)}
                                value={weight ? weight.toString() : ''}
                                placeholder="Enter your weight"
                                keyboardType="numeric"
                                placeholderTextColor={theme.icon}
                                autoFocus
                            />
                            <Text style={[styles.unit, { color: theme.icon }]}>kg</Text>
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Back button at top left */}
            <Pressable
                style={styles.backButton}
                onPress={handleBack}
            >
                <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
            </Pressable>

            {/* Progress dots */}
            <View style={styles.progressContainer}>
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                    <View
                        key={step}
                        style={[
                            styles.progressDot,
                            {
                                backgroundColor: step === currentStep ? theme.tint : theme.border
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Step content */}
            <View style={styles.content}>
                {renderStep()}
            </View>

            {/* Continue button */}
            <View style={styles.buttonContainer}>
                <Pressable
                    style={[
                        styles.continueButton,
                        { backgroundColor: theme.tint },
                        (!canProceed() || loading) && styles.buttonDisabled
                    ]}
                    disabled={!canProceed() || loading}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentStep === TOTAL_STEPS ? 'Finish Setup' : 'Continue'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    backIcon: {
        fontSize: 28,
        fontWeight: '400',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 40,
    },
    progressDot: {
        width: 24,
        height: 6,
        borderRadius: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    stepContainer: {
        gap: 24,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'left',
    },
    input: {
        height: 64,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 24,
        textAlign: 'center',
        fontWeight: '600',
    },
    inputWithUnit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    unit: {
        fontSize: 20,
        fontWeight: '600',
    },
    sexContainer: {
        gap: 16,
    },
    sexButton: {
        height: 64,
        borderWidth: 2,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sexButtonText: {
        fontSize: 20,
        fontWeight: '700',
    },
    buttonContainer: {
        width: '100%',
    },
    continueButton: {
        width: '100%',
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
