import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

interface MealCardProps {
    title: string;
    onAdd?: () => void;
    children?: React.ReactNode;
    emptyText?: string;
    style?: ViewStyle;
}

export function MealCard({ title, onAdd, children, emptyText, style }: MealCardProps) {
    const isEmpty = !children && !!emptyText;
    const backgroundColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View className="rounded-2xl border p-3" style={{ backgroundColor, borderColor }}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
                <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
                    <ThemedText>+</ThemedText>
                </TouchableOpacity>
            </View>
            {isEmpty ? (
                <ThemedText type="default" style={styles.emptyText}>{emptyText}</ThemedText>
            ) : (
                children
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 18 },
    addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    emptyText: { marginTop: 8, color: '#777', textAlign: 'center' },
});
