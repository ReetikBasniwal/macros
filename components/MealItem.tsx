import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FoodEntrySummary } from './FoodEntrySummary';

interface MealItemProps {
    name: string;
    brand?: string | null;
    serving: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export function MealItem({ name, brand, serving, calories, carbs, fat, protein, onPress }: MealItemProps & { onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.row} className='pt-2 pb-6' onPress={onPress}>
            <FoodEntrySummary
                name={name}
                brand={brand || undefined}
                serving={serving}
                calories={calories}
                carbs={carbs}
                fat={fat}
                protein={protein}
                nameSize="lg"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: { borderBottomWidth: 1, borderBottomColor: '#EEE' },
});
