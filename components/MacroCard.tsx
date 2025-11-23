import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

interface MacroCardProps {
    title: string;
    color: string;
    percentage: number;
    current: string | number;
    target: string;
    style?: ViewStyle;
    backgroundColor?: string;
}

export function MacroCard({ title, color, percentage, current, target, style, backgroundColor }: MacroCardProps) {
    return (
        <View style={[styles.card, { backgroundColor }, style]}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
                <View style={[styles.thumb, { left: `${percentage}%` }]} />
            </View>
            <View style={styles.footer}>
                <ThemedText type="default">{current}</ThemedText>
                <ThemedText type="default">{target}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, padding: 12, borderRadius: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 12, color: '#333' },
    track: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 12, marginVertical: 8, position: 'relative' },
    fill: { height: '100%', borderRadius: 12 },
    thumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
    footer: { flexDirection: 'row', justifyContent: 'space-between' },
});
