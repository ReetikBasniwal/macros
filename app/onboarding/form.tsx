import MotivationsStep from '@/components/MotivationsStep';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

const TOTAL_STEPS = 4;

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const { weight_goal, diet_type, age, height, weight, sex, setField, reset } = useOnboardingStore();

    const canProceed = () => {
        switch (currentStep) {
            case 1: return weight_goal > 0 || diet_type > 0;
            case 2: return age > 0;
            case 3: return height > 0;
            case 4: return weight > 0;
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

        // Update user profile with onboarding data
        const { error } = await supabase
            .from('profiles')
            .update({
                weight_goal: weight_goal,
                diet_type: diet_type,
                age: age,
                height: height,
                weight: weight,
                sex: sex,
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
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>
                            What's your age?
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                    color: theme.text
                                }
                            ]}
                            onChangeText={(text) => setField('age', parseInt(text) || 0)}
                            value={age ? age.toString() : ''}
                            placeholder="Enter your age"
                            keyboardType="numeric"
                            placeholderTextColor={theme.icon}
                            autoFocus
                        />
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>
                            What's your height?
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
                                onChangeText={(text) => setField('height', parseFloat(text) || 0)}
                                value={height ? height.toString() : ''}
                                placeholder="Enter your height"
                                keyboardType="numeric"
                                placeholderTextColor={theme.icon}
                                autoFocus
                            />
                            <Text style={[styles.unit, { color: theme.icon }]}>cm</Text>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>
                            What's your weight?
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
                {[1, 2, 3, 4].map((step) => (
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
                        {currentStep === TOTAL_STEPS ? 'Complete' : 'Continue'}
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
