import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native'
import { Colors } from '../constants/theme'
import { supabase } from '../lib/supabase'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const colorScheme = useColorScheme() ?? 'light'
    const theme = Colors[colorScheme]

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!session) Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.appName, { color: theme.tint }]}>macros</Text>
                <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                    <View style={[
                        styles.inputWrapper,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        }
                    ]}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={theme.icon}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text }
                            ]}
                            onChangeText={(text) => setEmail(text)}
                            value={email}
                            placeholder="Enter your email"
                            autoCapitalize={'none'}
                            keyboardType="email-address"
                            placeholderTextColor={theme.icon}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                    <View style={[
                        styles.inputWrapper,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        }
                    ]}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={theme.icon}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text }
                            ]}
                            onChangeText={(text) => setPassword(text)}
                            value={password}
                            secureTextEntry={true}
                            placeholder="Enter your password"
                            autoCapitalize={'none'}
                            placeholderTextColor={theme.icon}
                        />
                    </View>
                </View>

                {/* Sign In Button */}
                <Pressable
                    style={[
                        styles.button,
                        styles.buttonOutline,
                        { borderColor: theme.tint },
                        loading && styles.buttonDisabled
                    ]}
                    disabled={loading}
                    onPress={() => signInWithEmail()}
                >
                    <Text style={[styles.buttonText, { color: theme.tint }]}>Sign In</Text>
                </Pressable>

                {/* Sign Up Button */}
                <Pressable
                    style={[
                        styles.button,
                        { backgroundColor: theme.tint },
                        loading && styles.buttonDisabled
                    ]}
                    disabled={loading}
                    onPress={() => signUpWithEmail()}
                >
                    <Text style={[styles.buttonTextOutline, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>Sign Up</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 180,
    },
    header: {
        marginBottom: 40,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -1.5,
    },
    formContainer: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    button: {
        width: '100%',
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonOutline: {
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    buttonTextOutline: {
        fontSize: 16,
        fontWeight: '700',
    },
    buttonPressed: {
        opacity: 0.9,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
})