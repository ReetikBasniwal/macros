import { ACTIVITY_LEVELS } from '@/constants/activityLevels';
import { Colors } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function ActivityLevelStep() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { activity_level, setField } = useOnboardingStore();

    return (
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>
                    How physically active are you?
                </Text>

                <View style={styles.optionsContainer}>
                    {ACTIVITY_LEVELS.map((level) => {
                        const isSelected = activity_level === level.value;
                        return (
                            <Pressable
                                key={level.value}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: isSelected 
                                            ? `rgba(${colorScheme === 'dark' ? '34, 211, 238' : '35, 197, 215'}, 0.2)` 
                                            : colorScheme === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.05)' 
                                                : 'rgba(0, 0, 0, 0.03)',
                                        borderColor: isSelected 
                                            ? `rgba(${colorScheme === 'dark' ? '34, 211, 238' : '35, 197, 215'}, 0.5)` 
                                            : 'transparent',
                                    },
                                ]}
                                onPress={() => setField('activity_level', level.value)}
                            >
                                <View style={styles.optionContent}>
                                    <Text style={[styles.optionLabel, { color: theme.text }]}>
                                        {level.label}
                                    </Text>
                                    <Text style={[styles.optionDescription, { color: theme.icon }]}>
                                        {level.description}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    {
                                        borderColor: isSelected ? theme.tint : theme.border,
                                    },
                                    isSelected && { backgroundColor: theme.tint },
                                ]}>
                                    {isSelected && (
                                        <View style={styles.radioDot} />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    stepContainer: {
        gap: 24,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'left',
        letterSpacing: -0.5,
        lineHeight: 38,
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
        gap: 16,
    },
    optionContent: {
        flex: 1,
        gap: 4,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
    },
    optionDescription: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
});

