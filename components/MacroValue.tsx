import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { MacroBadge, MacroType } from './MacroBadge';

interface MacroValueProps {
    type: MacroType | 'calories';
    value: number | string;
    badgeSize?: number;
}

export function MacroValue({ type, value, badgeSize = 20 }: MacroValueProps) {
    const textColors: Record<string, string> = {
        carbs: 'text-sky-400',
        fat: 'text-green-500',
        protein: 'text-orange-500',
        calories: 'text-red-500'
    };

    const formatValue = (val: number | string) => {
        if (typeof val === 'string') return val;
        return val < 1 ? val.toFixed(1) : Math.round(val).toString();
    };

    return (
        <View className="flex-row items-center gap-1">
            {type === 'calories' ? (
                <Ionicons name="flame" size={badgeSize} color="#ef4444" />
            ) : (
                <MacroBadge type={type as MacroType} size={badgeSize} />
            )}
            <Text className={`font-semibold ${textColors[type]}`}>{formatValue(value)}</Text>
        </View>
    );
}
