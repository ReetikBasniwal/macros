
import React from 'react';
import { Text, View } from 'react-native';
import { MacroValue } from './MacroValue';

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
                <MacroValue type="calories" value={calories} badgeSize={16} />
                <MacroValue type="carbs" value={carbs} badgeSize={16} />
                <MacroValue type="fat" value={fat} badgeSize={16} />
                <MacroValue type="protein" value={protein} badgeSize={16} />
            </View>
        </View>
    );
}
