import { supabase } from '@/lib/supabase';
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
    index: number;
    length: number;
}

export const FoodListItem: React.FC<FoodListItemProps> = ({ item, onPress, index, length }) => {
    return (
        <Pressable
            onPress={async () => {
                await upsertRecentFood(item);
                console.log("Added to recents:", item.name);
            }}
            className= {`flex-row items-center justify-between p-4 bg-white border-b border-gray-100 ${index === 0 && 'rounded-t-3xl'} ${index === length - 1 && 'rounded-b-3xl'}`}
        >
            <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
                <View className="flex-row items-center gap-2">
                    <View className="h-8 justify-center">
                        <Text className="text-gray-500 text-lg" numberOfLines={1}>{item.serving_size}{item.serving_unit}</Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="flame" size={16} color="#ef4444" />
                        <Text className="font-semibold text-gray-900">{item.calories}</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="w-5 h-5 rounded-full bg-sky-400 items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">C</Text>
                        </View>
                        <Text className="font-semibold text-gray-900">{item.carbs < 1 ? item.carbs.toFixed(1) : Math.round(item.carbs)}</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">F</Text>
                        </View>
                        <Text className="font-semibold text-gray-900">{item.fat < 1 ? item.fat.toFixed(1) : Math.round(item.fat)}</Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <View className="w-5 h-5 rounded-full bg-orange-400 items-center justify-center">
                            <Text className="text-white text-[10px] font-bold">P</Text>
                        </View>
                        <Text className="font-semibold text-gray-900">{item.protein < 1 ? item.protein.toFixed(1) : Math.round(item.protein)}</Text>
                    </View>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </Pressable>
    );
};

async function upsertRecentFood(food: any) {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const { error } = await supabase.rpc("upsert_recent_food", {
        p_user_id: data.user.id,
        p_generic_food_id: food.id,
        p_food_name: food.name,
        p_source_type: "generic",
    });

    if (error) {
        console.log("RPC error:", error);
    }
}
