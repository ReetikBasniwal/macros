import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { MacroBadge } from './MacroBadge';

interface FoodEntrySummaryProps {
    name: string;
    brand?: string;
    serving: string;
    calories: number | string;
    carbs: number | string;
    fat: number | string;
    protein: number | string;
    textColor?: string;
    secondaryTextColor?: string;
    nameSize?: 'lg' | 'xl';
}

export function FoodEntrySummary({
    name,
    brand,
    serving,
    calories,
    carbs,
    fat,
    protein,
    textColor = '#111827',
    secondaryTextColor = '#6b7280',
    nameSize = 'lg'
}: FoodEntrySummaryProps) {
    const formatValue = (value: number | string) => {
        if (typeof value === 'string') return value;
        return value < 1 ? value.toFixed(1) : Math.round(value).toString();
    };

    return (
        <View>
            <Text 
                className={`${nameSize === 'xl' ? 'text-xl' : 'text-lg'} font-bold mb-1`} 
                style={{ color: textColor }} 
                numberOfLines={2}
            >
                {name}
            </Text>
            <Text className="text-base mb-1" style={{ color: secondaryTextColor }}>
                {brand ? `${brand}. ` : ''}{serving}
            </Text>
            
            <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                    <Ionicons name="flame" size={16} color="#ef4444" />
                    <Text className="font-semibold" style={{ color: "#ef4444" }}>{Math.round(Number(calories))}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <MacroBadge type="carbs" />
                    <Text className="font-semibold text-sky-400">{formatValue(carbs)}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <MacroBadge type="fat" />
                    <Text className="font-semibold text-green-500">{formatValue(fat)}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <MacroBadge type="protein" />
                    <Text className="font-semibold text-orange-500">{formatValue(protein)}</Text>
                </View>
            </View>
        </View>
    );
}
