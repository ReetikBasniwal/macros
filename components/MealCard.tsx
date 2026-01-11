import { MEAL_ORDER } from '@/constants/food';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MacroValue } from './MacroValue';
import { MealItem } from './MealItem';
import { ThemedText } from './themed-text';

export interface FoodLog {
    id: string;
    food_name: string;
    brand: string | null;
    meal_type: typeof MEAL_ORDER[number];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servings: number;
    portion: number;
    portion_unit: string;
    logged_date: string;
}

interface MealCardProps {
    title: string;
    meals: FoodLog[];
    onAdd?: () => void;
    emptyText?: string;
    style?: ViewStyle;
}

export function MealCard({
    title,
    meals,
    onAdd,
    emptyText,
    style,
}: MealCardProps) {
    const isEmpty = meals.length === 0;
    const backgroundColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View className="rounded-2xl border p-3" style={[{ backgroundColor, borderColor }, style]}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
                <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
                    <ThemedText style={{ fontSize: 24 }}>+</ThemedText>
                </TouchableOpacity>
            </View>
            {isEmpty ? (
                !!emptyText && <ThemedText type="default" style={styles.emptyText}>{emptyText}</ThemedText>
            ) : (
                <>
                    {meals.map((log) => (
                        <MealItem
                            key={log.id}
                            name={log.food_name}
                            brand={log.brand}
                            serving={log.servings > 1 ? `${log.servings} servings` : `${log.portion }${log.portion_unit}`}
                            calories={log.calories}
                            carbs={log.carbs}
                            fat={log.fat}
                            protein={log.protein}
                        />
                    ))}
                    <View className={`flex-row flex gap-3 pt-3 pb-1`}>
                        {meals.length > 0 && (
                            <>
                                <Text className='-mr-1'>Total: </Text>
                                <MacroValue type="calories" badgeSize={16}
                                    value={meals.reduce((total, log) => total + log.calories, 0)}
                                />
                                <MacroValue type="carbs" badgeSize={16}
                                    value={meals.reduce((total, log) => total + log.carbs, 0)}
                                />
                                <MacroValue type="fat" badgeSize={16}
                                    value={meals.reduce((total, log) => total + log.fat, 0)}
                                />
                                <MacroValue type="protein" badgeSize={16}
                                    value={meals.reduce((total, log) => total + log.protein, 0)}
                                />
                            </>
                        )}
                    </View>
                </>
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
