import { Colors } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Theme = (typeof Colors)['light'];

type DailyGoalsStepProps = {
    theme: Theme;
};

export default function DailyGoalsStep({ theme }: DailyGoalsStepProps) {
    const { daily_goals } = useOnboardingStore();
    const router = useRouter();

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.title, { color: theme.text }]}>
                Your Daily Goals
            </Text>
            <View style={styles.goalsContainer}>
                {daily_goals.map((item) => (
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
                                    <Text style={[styles.goalLabel, { color: theme.icon }]}>{item.label}</Text>
                                    <Text style={[styles.goalValue, { color: theme.text }]}>
                                        {item.value}{item.unit ? item.unit : ''}
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
                ))}
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
