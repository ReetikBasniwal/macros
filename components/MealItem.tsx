import React from 'react';
import { StyleSheet, View } from 'react-native';
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

export function MealItem({ name, brand, serving, calories, carbs, fat, protein }: MealItemProps) {
    return (
        <View style={styles.row} className='pt-2 pb-6'>
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
        </View>
    );
}

const styles = StyleSheet.create({
    row: { borderBottomWidth: 1, borderBottomColor: '#EEE' },
});
