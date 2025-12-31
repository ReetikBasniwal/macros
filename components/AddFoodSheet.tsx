import { supabase } from "@/lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { FoodListItem } from './FoodListItem';
import { ThemedText } from './themed-text';

interface AddFoodSheetProps {
    isVisible: boolean;
    onClose: () => void;
}

export const AddFoodSheet: React.FC<AddFoodSheetProps> = ({ isVisible, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    async function handleSearch(text: string) {
        setQuery(text);

        if (text.length < 2) {
            setResults([]);
            return;
        }

        const data = await searchGenericFoods(text);
        console.log(data, "data")
        setResults(data);
    }

    return (
        <BottomSheet isVisible={isVisible} onClose={onClose}>
            <ThemedText type="title">Add Item</ThemedText>
            <ThemedText>Select an option to add to your daily log.</ThemedText>
            {/* Placeholder content - you can add food logging UI here */}
            <View className="mt-4">
                {results.length > 0 ? (
                    <FlatList
                        className="rounded-3xl"
                        data={results}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <FoodListItem 
                                item={item} 
                                onPress={(food) => console.log("Selected food:", food)} 
                            />
                        )}
                    />
                ) : (
                    <ThemedText>No results found.</ThemedText>
                )}
            </View>
            {/* Search and Scan Input - Glassy Look */}
            <View className="absolute bottom-10 left-4 right-4 flex-row items-center gap-3">
                <View className="flex-1 flex-row items-center bg-white/90 border border-gray-200/50 rounded-full h-14 px-4 shadow-xl" 
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
                    <Ionicons name="search-outline" size={24} color="#6b7280" />
                    <TextInput
                        placeholder="What did you eat?"
                        className="flex-1 ml-3 text-lg text-gray-900"
                        placeholderTextColor="#9ca3af"
                        value={query}
                        onChangeText={handleSearch}
                    />
                    <TouchableOpacity>
                        <Ionicons name="mic-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    className="w-14 h-14 bg-white/90 border border-gray-200/50 rounded-full items-center justify-center shadow-xl"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}
                >
                    <Ionicons name="barcode-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
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