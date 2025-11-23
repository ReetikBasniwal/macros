import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface MealItemProps {
    name: string;
    description: string;
    calories: string;
}

export function MealItem({ name, description, calories }: MealItemProps) {
    return (
        <View style={styles.row}>
            <View>
                <ThemedText type="defaultSemiBold">{name}</ThemedText>
                <ThemedText type="default" style={styles.muted}>{description}</ThemedText>
            </View>
            <ThemedText type="default">{calories}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    muted: { color: '#777', fontSize: 13 },
});
