import { useDebounce } from '@/hooks/useDebounce';
import { searchGenericFoods } from '@/lib/food';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { FoodListItem } from './FoodListItem';
import { ThemedText } from './themed-text';

interface AddFoodSheetProps {
    isVisible: boolean;
    onClose: () => void;
}

export const AddFoodSheet: React.FC<AddFoodSheetProps> = ({ isVisible, onClose }) => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<any[]>([]);
    const [recents, setRecents] = useState<any[]>([]);

    useEffect(() => {
        if (isVisible) {
            loadRecents();
        }
    }, [isVisible]);

    async function loadRecents() {
        const data = await fetchRecentFoods();
        if (data) setRecents(data);
    }

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        searchGenericFoods(debouncedQuery).then(setResults);
    }, [debouncedQuery]);

    return (
        <BottomSheet isVisible={isVisible} onClose={onClose}>
            <ThemedText type="title">Add Item</ThemedText>
            <ThemedText>Select an option to add to your daily log.</ThemedText>
            
            <View className="mt-4 flex-1">
                {query.length >= 2 ? (
                    results.length > 0 ? (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                                <FoodListItem 
                                    index={index}
                                    length={results.length}
                                    item={item} 
                                    onPress={(food) => console.log("Selected food:", food)} 
                                />
                            )}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />
                    ) : (
                        <ThemedText>No results found.</ThemedText>
                    )
                ) : (
                    <>
                        <View className="mb-2 mt-2">
                            <Text className="text-xl font-bold tracking-wider">Smart Suggestions</Text>
                        </View>
                        {recents.length > 0 ? (
                            <FlatList
                                data={recents}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => (
                                    <FoodListItem 
                                        index={index}
                                        length={recents.length}
                                        item={item.generic_foods} 
                                        onPress={(food) => console.log("Selected recent:", food)} 
                                    />
                                )}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            />
                        ) : (
                            <ThemedText className="text-gray-400 mt-2 italic">No recent items.</ThemedText>
                        )}
                    </>
                )}
            </View>
            {/* Search and Scan Input - Glassy Look */}
            <View className="absolute bottom-10 left-4 right-4 flex-row items-center gap-3">
                <View className="flex-1 flex-row items-center bg-white/90 border border-gray-200/50 rounded-full h-14 px-4 shadow-xl" 
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
                    <Ionicons name="search-outline" size={24} color="#6b7280" />
                    <TextInput
                        placeholder="What are you eating?"
                        className="flex-1 ml-3 text-lg text-gray-900 text-start"
                        placeholderTextColor="#9ca3af"
                        value={query}
                        onChangeText={setQuery}
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

export async function fetchRecentFoods() {
    const { data, error } = await supabase
        .from("recent_foods")
        .select(
            `
      id,
      food_name,
      generic_food_id,
      last_logged_at,
      generic_foods (
        id,
        name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        serving_size,
        serving_unit
      )
      `
        )
        .order("last_logged_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Fetch recents error:", error);
        return [];
    }

    return data;
}
