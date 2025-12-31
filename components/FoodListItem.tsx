import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_size: number;
    serving_unit: string;
}

interface FoodListItemProps {
    item: FoodItem;
    onPress?: (item: FoodItem) => void;
}

export const FoodListItem: React.FC<FoodListItemProps> = ({ item, onPress }) => {
    return (
        <Pressable
            onPress={() => onPress?.(item)}
            className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100"
        >
            <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-0.5">{item.name}</Text>
                <View className="flex-row items-center gap-1 border h-fit">
                    <Text className="text-gray-500 text-lg border">{item.serving_size}</Text>
                    <Text className="text-gray-500 text-lg border">{item.serving_unit}</Text>
                </View>

                <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="flame" size={16} color="#ef4444" />
                        <Text className="font-semibold text-gray-900">{item.calories}</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">C</Text>
                        </View>
                        <Text className="font-semibold text-gray-900">{item.carbs}</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="w-5 h-5 rounded-full bg-sky-400 items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">F</Text>
                        </View>
                        <Text className="font-semibold text-gray-900">{item.fat}</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="w-5 h-5 rounded-full bg-orange-400 items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">P</Text>
                        </View>
                        <Text className="font-semibold text-gray-900">{Math.ceil(item.protein)}</Text>
                    </View>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </Pressable>
    );
};
