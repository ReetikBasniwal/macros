import { Colors } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function MotivationsStep() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { weight_goal, diet_type, setField } = useOnboardingStore();

    return (
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>
                    What are your motivations?
                </Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>
                    Select all that apply. This helps us personalize your plan.
                </Text>

                {/* Health Goals Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.icon }]}>
                        HEALTH GOALS
                    </Text>
                    <View style={styles.optionsContainer}>
                        {[
                            { label: 'Lose Weight', value: 1 },
                            { label: 'Gain Weight', value: 2 },
                            { label: 'Maintain Weight', value: 3 },
                        ].map((option) => (
                            <Pressable
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: weight_goal === option.value ? theme.tint : theme.border
                                    },
                                    weight_goal === option.value && styles.optionCardSelected
                                ]}
                                onPress={() => setField('weight_goal', weight_goal === option.value ? 0 : option.value)}
                            >
                                <Text style={[styles.optionLabel, { color: theme.text }]}>
                                    {option.label}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: weight_goal === option.value ? theme.tint : theme.border },
                                    weight_goal === option.value && { backgroundColor: theme.tint }
                                ]}>
                                    {weight_goal === option.value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Dietary Preferences Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.icon }]}>
                        DIETARY PREFERENCES
                    </Text>
                    <View style={styles.optionsContainer}>
                        {[
                            { label: 'Low Carb', value: 1 },
                            { label: 'High Protein', value: 2 },
                            { label: 'Keto', value: 3 },
                            { label: 'Balanced Diet', value: 4 },
                        ].map((option) => (
                            <Pressable
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: diet_type === option.value ? theme.tint : theme.border
                                    },
                                    diet_type === option.value && styles.optionCardSelected
                                ]}
                                onPress={() => setField('diet_type', diet_type === option.value ? 0 : option.value)}
                            >
                                <Text style={[styles.optionLabel, { color: theme.text }]}>
                                    {option.label}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: diet_type === option.value ? theme.tint : theme.border },
                                    diet_type === option.value && { backgroundColor: theme.tint }
                                ]}>
                                    {diet_type === option.value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    stepContainer: {
        gap: 24,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'left',
        marginTop: -12,
    },
    section: {
        gap: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
    },
    optionCardSelected: {
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
