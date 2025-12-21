import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function OnboardingWelcome() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <Text style={[styles.appName, { color: theme.tint }]}>macros</Text>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Welcome to Macros
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.icon }]}>
                        Let's set up your profile to personalize your nutrition tracking experience
                    </Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Pressable
                    style={[styles.button, { backgroundColor: theme.tint }]}
                    onPress={() => router.push('/onboarding/form' as any)}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 100,
        paddingBottom: 50,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 60,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
    },
    textContainer: {
        gap: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        width: '100%',
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
