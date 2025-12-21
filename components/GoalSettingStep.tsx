import { Colors } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function GoalSettingStep() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { goal_setting_preference, setField } = useOnboardingStore();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>
                How would you like to set your goals?
            </Text>

            <View style={styles.optionsContainer}>
                {/* Auto-generate option */}
                <Pressable
                    style={[
                        styles.optionCard,
                        {
                            backgroundColor: goal_setting_preference === 'auto'
                                ? `${theme.tint}20`
                                : theme.card,
                            borderColor: goal_setting_preference === 'auto'
                                ? theme.tint
                                : theme.border,
                        }
                    ]}
                    onPress={() => setField('goal_setting_preference', 'auto')}
                >
                    <View style={styles.optionContent}>
                        <View style={[
                            styles.iconContainer,
                            {
                                backgroundColor: goal_setting_preference === 'auto'
                                    ? theme.tint
                                    : theme.border
                            }
                        ]}>
                            <Ionicons
                                name="sparkles"
                                size={24}
                                color={goal_setting_preference === 'auto' ? theme.background : theme.text}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>
                                Generate them for me
                            </Text>
                            <Text style={[styles.optionDescription, { color: theme.icon }]}>
                                Personalized goals based on your data.
                            </Text>
                        </View>
                        <View style={[
                            styles.radioOuter,
                            { borderColor: goal_setting_preference === 'auto' ? theme.tint : theme.border }
                        ]}>
                            {goal_setting_preference === 'auto' && (
                                <View style={[styles.radioInner, { backgroundColor: theme.tint }]} />
                            )}
                        </View>
                    </View>
                </Pressable>

                {/* Manual option */}
                <Pressable
                    style={[
                        styles.optionCard,
                        {
                            backgroundColor: goal_setting_preference === 'manual'
                                ? `${theme.tint}20`
                                : theme.card,
                            borderColor: goal_setting_preference === 'manual'
                                ? theme.tint
                                : theme.border,
                        }
                    ]}
                    onPress={() => setField('goal_setting_preference', 'manual')}
                >
                    <View style={styles.optionContent}>
                        <View style={[
                            styles.iconContainer,
                            {
                                backgroundColor: goal_setting_preference === 'manual'
                                    ? theme.tint
                                    : theme.border
                            }
                        ]}>
                            <Ionicons
                                name="options"
                                size={24}
                                color={goal_setting_preference === 'manual' ? theme.background : theme.text}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>
                                I&apos;ll set them myself
                            </Text>
                            <Text style={[styles.optionDescription, { color: theme.icon }]}>
                                Full manual control over your targets.
                            </Text>
                        </View>
                        <View style={[
                            styles.radioOuter,
                            { borderColor: goal_setting_preference === 'manual' ? theme.tint : theme.border }
                        ]}>
                            {goal_setting_preference === 'manual' && (
                                <View style={[styles.radioInner, { backgroundColor: theme.tint }]} />
                            )}
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'left',
    },
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    optionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
