import React from 'react';

export interface MacroItem {
    label: string;
    value: string | React.ReactNode;
    unit: string;
    icon?: React.ReactNode;
}

export interface MacroSectionData {
    calories: number | string;
    carbs: string;
    fat: string;
    protein: string;
    food: any;
    textColor: string;
}

export interface FoodDetailSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    onDelete?: (logId: string) => void;
    food: any;
    initialValues?: {
        portion?: string;
        unit?: string;
        mealType?: string;
        date?: string;
        logId?: string;
    };
}
