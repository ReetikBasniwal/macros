import { FoodItem, upsertRecentFood } from '@/lib/food';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { FoodEntrySummary } from './FoodEntrySummary';

interface FoodListItemProps {
    item: FoodItem;
    onPress?: (item: FoodItem) => void;
    index: number;
    length: number;
}

export const FoodListItem: React.FC<FoodListItemProps> = ({ item, onPress, index, length }) => {
    return (
        <Pressable
            onPress={async () => {
                if (onPress) {
                    onPress(item);
                } else {
                    await upsertRecentFood(item);
                    console.log("Added to recents:", item.name);
                }
            }}
            className={`flex-row items-center justify-between p-4 bg-white border-b border-gray-100 ${index === 0 ? 'rounded-t-3xl' : ''} ${index === length - 1 ? 'rounded-b-3xl' : ''}`}
        >
            <View className="flex-1">
                <FoodEntrySummary
                    name={item.name}
                    serving={`${item.serving_size}${item.serving_unit}`}
                    calories={item.calories}
                    carbs={item.carbs}
                    fat={item.fat}
                    protein={item.protein}
                />
            </View>

            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </Pressable>
    );
};
