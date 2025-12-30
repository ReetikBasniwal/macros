import { supabase } from "@/lib/supabase";
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { ThemedText } from './themed-text';

interface AddFoodSheetProps {
    isVisible: boolean;
    onClose: () => void;
}

export const AddFoodSheet: React.FC<AddFoodSheetProps> = ({ isVisible, onClose }) => {
    useEffect(() => {
        searchGenericFoods("ba").then((res) => {
            console.log("Search result:", res);
        });
    }, []);

    return (
        <BottomSheet isVisible={isVisible} onClose={onClose}>
            <ThemedText type="title">Add Item</ThemedText>
            <ThemedText>Select an option to add to your daily log.</ThemedText>
            {/* Placeholder content - you can add food logging UI here */}
            <View style={{ height: 200 }} />
        </BottomSheet>
    );
};

export async function searchGenericFoods(query: string) {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from("generic_foods")
        .select(
            "id, name, calories, protein, carbs, fat, fiber, serving_size, serving_unit, source"
        )
        .ilike("name", `%${query}%`)
        .order("name")
        .limit(10);

    if (error) {
        console.error("Search error:", error);
        return [];
    }

    return data;
}