import React from 'react';
import { Text, View } from 'react-native';

export type MacroType = 'carbs' | 'fat' | 'protein';

interface MacroBadgeProps {
  type: MacroType;
  size?: number;
  fontSize?: number;
}

export function MacroBadge({ type, size = 20, fontSize = 10 }: MacroBadgeProps) {
  const config = {
    carbs: { color: 'bg-sky-500', label: 'C' },
    fat: { color: 'bg-green-500', label: 'F' },
    protein: { color: 'bg-orange-500', label: 'P' },
  };

  const { color, label } = config[type];

  return (
    <View 
      className={`${color} items-center justify-center rounded-full`}
      style={{ width: size, height: size }}
    >
      <Text className="text-white font-bold" style={{ fontSize }}>{label}</Text>
    </View>
  );
}
