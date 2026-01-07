import { useDebounce } from '@/hooks/useDebounce';
import { fetchRecentFoods, searchGenericFoods, upsertRecentFood } from '@/lib/food';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { FoodDetailSheet } from './FoodDetailSheet';
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
    const [selectedFood, setSelectedFood] = useState<any | null>(null);

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

    const handleFoodSelect = (food: any) => {
        // If it's a recent item, it might be wrapped in generic_foods or have different structure
        // Normalize it here if needed
        console.log(food, "food");
        setSelectedFood(food);
    };

    const handleSaveEntry = async (entry: any) => {
        // Here you would save to Supabase
        console.log("Saving entry:", entry);
        
        // Add to recents if not already there (optional, handled by backend usually)
        await upsertRecentFood(entry);

        setSelectedFood(null);
        onClose();
    };

    if(selectedFood){
        return (
            <FoodDetailSheet
                visible={!!selectedFood}
                food={selectedFood}
                onClose={() => setSelectedFood(null)}
                onSave={handleSaveEntry}
            />
        )
    }

    return (
        <>
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
                                        onPress={handleFoodSelect} 
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
                                            onPress={handleFoodSelect} 
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
                    <View className="flex-1 flex-row items-center justify-center bg-white/90 border border-gray-200/50 rounded-full h-16 px-4 shadow-xl" 
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
                        <Ionicons name="search-outline" size={24} color="#6b7280" />
                        <TextInput
                            placeholder="What are you eating?"
                            className="flex-1 text-lg text-gray-900"
                            placeholderTextColor="#9ca3af"
                            value={query}
                            onChangeText={setQuery}
                            style={{ 
                                height: 40,
                                paddingVertical: 0,
                                lineHeight: 22,
                                transform: [{ translateY: -2 }],
                            }}
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
        </>
    );
};



