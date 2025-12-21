import { Colors } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

export default function BiometricsStep() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { sex, weight, height, age, setField } = useOnboardingStore();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: theme.text }]}>Let&apos;s calculate your energy needs</Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>This helps us create your personalized plan.</Text>

            <View style={styles.form}>
                {/* Sex Selector */}
                <View>
                    <Text style={[styles.label, { color: theme.icon }]}>Sex</Text>
                    <View style={[styles.sexContainer, { backgroundColor: theme.card }]}>
                        <Pressable
                            style={[
                                styles.sexButton,
                                sex === 'Male' && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => setField('sex', 'Male')}
                        >
                            <Text style={[
                                styles.sexButtonText,
                                { color: sex === 'Male' ? theme.background : theme.icon }
                            ]}>Male</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.sexButton,
                                sex === 'Female' && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => setField('sex', 'Female')}
                        >
                            <Text style={[
                                styles.sexButtonText,
                                { color: sex === 'Female' ? theme.background : theme.icon }
                            ]}>Female</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Weight Input */}
                <View>
                    <Text style={[styles.label, { color: theme.icon }]}>Weight</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: 'transparent' }]}
                            placeholder="e.g., 70"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={weight ? weight.toString() : ''}
                            onChangeText={(text) => setField('weight', parseFloat(text) || 0)}
                        />
                        <Text style={[styles.unit, { color: theme.icon }]}>kg</Text>
                    </View>
                </View>

                {/* Height Input */}
                <View>
                    <Text style={[styles.label, { color: theme.icon }]}>Height</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: 'transparent' }]}
                            placeholder="e.g., 175"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={height ? height.toString() : ''}
                            onChangeText={(text) => setField('height', parseFloat(text) || 0)}
                        />
                        <Text style={[styles.unit, { color: theme.icon }]}>cm</Text>
                    </View>
                </View>

                {/* Age Input */}
                <View>
                    <Text style={[styles.label, { color: theme.icon }]}>Age</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: 'transparent' }]}
                            placeholder="e.g., 30"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={age ? age.toString() : ''}
                            onChangeText={(text) => setField('age', parseInt(text) || 0)}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'left',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'left',
        marginBottom: 24,
    },
    form: {
        gap: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    sexContainer: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 8,
        padding: 4,
        gap: 4,
    },
    sexButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    sexButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        position: 'relative',
        height: 56,
    },
    input: {
        flex: 1,
        height: '100%',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    unit: {
        position: 'absolute',
        right: 16,
        top: 18,
        fontSize: 16,
    },
});
