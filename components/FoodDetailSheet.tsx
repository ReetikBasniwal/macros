import { MEAL_TYPES } from '@/constants/food';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ActionSheetIOS, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FoodEntrySummary } from './FoodEntrySummary';
import { MacroBadge } from './MacroBadge';

interface FoodDetailSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    food: any;
}

export function FoodDetailSheet({ visible, onClose, onSave, food }: FoodDetailSheetProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    
    const [portion, setPortion] = useState(food?.serving_size?.toString() || "70");
    const [unit, setUnit] = useState(food?.serving_unit || "g");
    const [mealType, setMealType] = useState(food?.meal_type || "breakfast");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        if (Platform.OS === 'android') {
             setShowDatePicker(false);
        }
        setDate(currentDate);
    };

    if (!food) return null;

    // Derived values based on portion
    const factor = (parseFloat(portion) || 0) / (food.serving_size || 100); 
    const calories = Math.round((food.calories || 0) * factor);
    const carbs = ((food.carbs || 0) * factor).toFixed(1);
    const fat = ((food.fat || 0) * factor).toFixed(1);
    const protein = ((food.protein || 0) * factor).toFixed(1);

    // Dynamic styles
    const secondaryBg = isDark ? '#2c2c2e' : '#f0f0f0';
    const textColor = themeColors.text;
    const secondaryText = themeColors.icon;

    async function handleAddToMeal() {
        const { data } = await supabase.auth.getUser();
        console.log(data, "user data");
        if (!data?.user) return;
        const servings = (parseFloat(portion) || 0) / (food.serving_size || 100);
        const fiber = food.fiber ? (food.fiber * servings) : 0;

        const { error } = await supabase
            .from("food_logs")
            .insert({
                user_id: data.user.id,
                generic_food_id: food.id,
                food_name: food.name,
                source_type: "generic",
                meal_type: mealType,
                portion: parseFloat(portion),
                portion_unit: unit,
                servings, // This stores the multiple of the serving size
                calories: calories,
                protein: parseFloat(protein),
                carbs: parseFloat(carbs),
                fat: parseFloat(fat),
                fiber: fiber,
                logged_at: date.toISOString(), // Use selected date
            });

        if (error) {
            console.log("Food log error:", error);
        } else {
            console.log("Food logged successfully");
            onSave({ ...food, portion, mealType, date }); // Call original onSave to close/update UI
            onClose(); 
        }
    }

    const handleUnitPress = () => {
        const options = ['g', 'oz', 'ml', 'cup', 'tbsp', 'tsp', 'Cancel'];
        const cancelButtonIndex = 6;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({
                options,
                cancelButtonIndex,
                title: 'Select Unit'
            }, (buttonIndex: number) => {
                if (buttonIndex !== cancelButtonIndex) {
                    setUnit(options[buttonIndex]);
                }
            });
        } else {
            const current = options.indexOf(unit);
            const next = current === -1 ? 0 : (current + 1) % (options.length - 1);
            setUnit(options[next]);
        }
    };

    const handleMealTypePress = () => {
        const options = [...MEAL_TYPES.map(m => m.label), 'Cancel'];
        const cancelButtonIndex = options.length - 1;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({
                options,
                cancelButtonIndex,
                title: 'Select Meal Type'
            }, (buttonIndex: number) => {
                if (buttonIndex !== cancelButtonIndex) {
                    setMealType(MEAL_TYPES[buttonIndex].value);
                }
            });
        } else {
            const currentIndex = MEAL_TYPES.findIndex(m => m.value === mealType);
            const nextIndex = (currentIndex + 1) % MEAL_TYPES.length;
            setMealType(MEAL_TYPES[nextIndex].value);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 pt-6">
                    <TouchableOpacity 
                        onPress={onClose}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: secondaryBg }}
                    >
                        <Ionicons name="close" size={24} color={textColor} />
                    </TouchableOpacity>

                    <Text className="text-lg font-bold" style={{ color: textColor }}>Edit Food Entry</Text>

                    <TouchableOpacity 
                        onPress={handleAddToMeal}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: themeColors.tint }}
                    >
                        <Ionicons name="checkmark" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4">
                    {/* Food Summary Card */}
                    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: themeColors.card }}>
                        <FoodEntrySummary
                            name={food.name}
                            brand={food.brand}
                            serving={`${portion}${unit}`}
                            calories={calories}
                            carbs={parseFloat(carbs)}
                            fat={parseFloat(fat)}
                            protein={parseFloat(protein)}
                            textColor={textColor}
                            secondaryTextColor={secondaryText}
                            nameSize="xl"
                        />
                    </View>

                    {/* Settings Section */}
                    <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center justify-between p-4 border-b" 
                            style={{ borderColor: themeColors.border }}
                        >
                            <Text className="font-semibold text-lg" style={{ color: textColor }}>Date</Text>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-lg" style={{ color: secondaryText }}>
                                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={secondaryText} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleMealTypePress}
                            className="flex-row items-center justify-between p-4 border-b" 
                            style={{ borderColor: themeColors.border }}
                        >
                            <Text className="font-semibold text-lg" style={{ color: textColor }}>Meal Type</Text>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-lg" style={{ color: secondaryText }}>
                                    {MEAL_TYPES.find(m => m.value === mealType)?.label || "Breakfast"}
                                </Text>
                                <Ionicons name="chevron-expand" size={20} color={secondaryText} />
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: themeColors.border }}>
                            <Text className="font-semibold text-lg" style={{ color: textColor }}>Portion</Text>
                            <View className="flex-row items-center gap-2">
                                <View className="rounded-lg px-3 py-2 min-w-[60px] flex items-center justify-center" style={{ backgroundColor: secondaryBg }}>
                                    <TextInput 
                                        value={portion}
                                        onChangeText={(text) => {
                                            if (!text.includes('-')) {
                                                setPortion(text);
                                            }
                                        }}
                                        keyboardType="numeric"
                                        className="text-lg font-semibold text-center p-0"
                                        textAlign="center"
                                        style={{
                                            color: textColor,
                                            // iOS specific fix to ensure text is centered if there's any default height behavior
                                            lineHeight: 22, 
                                        }}
                                        placeholderTextColor={secondaryText}
                                    />
                                </View>
                                <TouchableOpacity 
                                    onPress={handleUnitPress}
                                    className="rounded-lg px-3 py-2 flex-row items-center gap-1" 
                                    style={{ backgroundColor: secondaryBg }}
                                >
                                    <Text className="text-lg font-semibold" style={{ color: textColor }}>{unit}</Text>
                                    <Ionicons name="chevron-expand" size={14} color={secondaryText} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity className="flex-row items-center justify-between p-4">
                            <Text className="font-semibold text-lg" style={{ color: textColor }}>Accuracy</Text>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-lg" style={{ color: secondaryText }}>Accurate</Text>
                                <Ionicons name="chevron-expand" size={20} color={secondaryText} />
                            </View>
                        </TouchableOpacity>
                    </View>



                    {/* Calories & Macros Header */}
                    <View className="px-2 pt-2 pb-1">
                        <Text className="text-xl font-bold" style={{ color: textColor }}>Calories & Macros</Text>
                    </View>

                    {/* Macros List */}
                    <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <MacroRow 
                            icon={<Ionicons className='-ml-1' name="flame" size={30} color="#ef4444" />}
                            label="Calories"
                            value={`${calories}`}
                            unit="kcal"
                            themeColors={themeColors}
                            secondaryText={secondaryText}
                        />
                        <MacroRow 
                            icon={
                                <MacroBadge type="carbs" size={24} fontSize={12} />
                            }
                            label="Carbohydrates"
                            value={carbs}
                            unit="g"
                            themeColors={themeColors}
                            secondaryText={secondaryText}
                        />
                        <MacroRow 
                            icon={
                                <MacroBadge type="fat" size={24} fontSize={12} />
                            }
                            label="Fat"
                            value={fat}
                            unit="g"
                            themeColors={themeColors}
                            secondaryText={secondaryText}
                        />
                        <MacroRow 
                            icon={
                                <MacroBadge type="protein" size={24} fontSize={12} />
                            }
                            label="Protein"
                            value={protein}
                            unit="g"
                            isLast
                            themeColors={themeColors}
                            secondaryText={secondaryText}
                        />
                    </View>



                    {/* Carbohydrates Header */}
                    <View className="px-2 pt-4 pb-1">
                        <Text className="text-xl font-bold" style={{ color: textColor }}>Carbohydrates</Text>
                    </View>

                    {/* Carbohydrates List */}
                    <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <MacroRow label="Fiber" value={food.fiber ? `${food.fiber}` : "9.86"} unit="g" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Sugars" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Added Sugars" value="0" unit="g" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Sugar Alcohols" value="-" unit="" isLast themeColors={themeColors} secondaryText={secondaryText} />
                    </View>

                    {/* Lipids Header */}
                    <View className="px-2 pt-4 pb-1">
                        <Text className="text-xl font-bold" style={{ color: textColor }}>Lipids</Text>
                    </View>

                    {/* Lipids List */}
                     <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <MacroRow label="Trans Fat" value="0" unit="g" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Saturated Fat" value="0.9" unit="g" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Monounsaturated Fat" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Polyunsaturated Fat" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Cholesterol" value="0" unit="mg" isLast themeColors={themeColors} secondaryText={secondaryText} />
                    </View>

                    {/* Minerals Header */}
                    <View className="px-2 pt-4 pb-1">
                        <Text className="text-xl font-bold" style={{ color: textColor }}>Minerals</Text>
                    </View>

                     {/* Minerals List */}
                     <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <MacroRow label="Calcium" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Chloride" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Iron" value="2.02" unit="mg" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Magnesium" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Phosphorus" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Sodium" value="3.54" unit="mg" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Zinc" value="2.26" unit="mg" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Chromium" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Copper" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Iodine" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Manganese" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Molybdenum" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Selenium" value="-" unit="" isLast themeColors={themeColors} secondaryText={secondaryText} />
                    </View>

                    {/* Vitamins Header */}
                    <View className="px-2 pt-4 pb-1">
                        <Text className="text-xl font-bold" style={{ color: textColor }}>Vitamins</Text>
                    </View>

                     {/* Vitamins List */}
                     <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <MacroRow label="Vitamin A" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Vitamin E" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Vitamin D" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Vitamin C" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Thiamin" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Riboflavin" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Niacin" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Pantothenic Acid" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Vitamin B6" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Biotin" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Folate" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Vitamin B12" value="-" unit="" themeColors={themeColors} secondaryText={secondaryText} />
                        <MacroRow label="Vitamin K" value="-" unit="" isLast themeColors={themeColors} secondaryText={secondaryText} />
                    </View>

                    {/* Other Header */}
                    <View className="px-2 pt-4 pb-1">
                        <Text className="text-xl font-bold" style={{ color: textColor }}>Other</Text>
                    </View>

                     {/* Other List */}
                     <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                        <MacroRow 
                            label="Alcohol" 
                            value={<Ionicons name="lock-closed" size={14} color={textColor} />} 
                            unit="" 
                            themeColors={themeColors} 
                            secondaryText={secondaryText} 
                        />
                         <MacroRow 
                            label="Caffeine" 
                            value={<Ionicons name="lock-closed" size={14} color={textColor} />} 
                            unit="" 
                            themeColors={themeColors} 
                            secondaryText={secondaryText} 
                        />
                         <MacroRow 
                            label="Water" 
                            value={<Ionicons name="lock-closed" size={14} color={textColor} />} 
                            unit="" 
                            isLast
                            themeColors={themeColors} 
                            secondaryText={secondaryText} 
                        />
                    </View>
                    
                    <View className="mt-8 mb-6">
                        <TouchableOpacity 
                            className="w-full py-4 rounded-full items-center border"
                            style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
                        >
                            <Text className="font-medium text-base" style={{ color: themeColors.tint }}>Customize</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Goal Impact */}
                    <View className="rounded-2xl p-6 mb-8 items-center border" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                        <Text className="text-lg font-bold mb-2" style={{ color: textColor }}>Goal Impact</Text>
                        <Text className="text-center mb-4" style={{ color: secondaryText }}>Review the impact of this food entry on your goals.</Text>
                        <TouchableOpacity className="w-full py-3 rounded-full items-center" style={{ backgroundColor: themeColors.tint }}>
                            <Text className="text-white font-bold text-base">Unlock with Foodnoms+</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="h-24" /> 
                </ScrollView>

                {/* Floating Bottom Bar */}
                <View className="absolute bottom-8 left-0 right-0 flex items-center justify-center pointer-events-none">
                    <View 
                        className="rounded-full px-6 py-3 flex-row items-center gap-8 shadow-2xl border pointer-events-auto"
                        style={{ 
                            backgroundColor: themeColors.card, 
                            borderColor: themeColors.border,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 10,
                            elevation: 5
                        }}
                    >
                        <TouchableOpacity className="items-center justify-center">
                            <Ionicons name="trash-outline" size={26} color={secondaryText} />
                        </TouchableOpacity>
                        <View className="w-px h-6" style={{ backgroundColor: themeColors.border }} />
                        <TouchableOpacity className="items-center justify-center">
                            <Ionicons name="share-outline" size={26} color={secondaryText} />
                        </TouchableOpacity>
                        <View className="w-px h-6" style={{ backgroundColor: themeColors.border }} />
                        <TouchableOpacity className="items-center justify-center">
                            <Ionicons name="ellipsis-horizontal" size={26} color={secondaryText} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Picker Overlay */}
                {Platform.OS === 'ios' && showDatePicker && (
                    <View className="absolute inset-0 bg-black/60 z-50 justify-end">
                        <View className="pb-8 rounded-t-3xl bg-[#1c1c1e] items-center">
                            {/* Picker Header */}
                            <View className="flex-row items-center justify-between p-4 w-full">
                                <TouchableOpacity 
                                    onPress={() => setShowDatePicker(false)}
                                    className="w-8 h-8 items-center justify-center rounded-full bg-[#3a3a3c]"
                                >
                                    <Ionicons name="close" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                                
                                <View className="flex-row bg-[#2c2c2e] rounded-lg p-1">
                                    <View className="bg-[#636366] px-4 py-1.5 rounded-md shadow-sm">
                                        <Text className="text-white font-semibold text-sm">Date</Text>
                                    </View>
                                    <View className="px-4 py-1.5 justify-center">
                                        <Text className="text-[#8e8e93] font-medium text-sm">Date & Time</Text>
                                    </View>
                                </View>
                                
                                <View className="w-8" /> 
                            </View>
                            
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                onChange={onDateChange}
                                themeVariant="dark"
                                textColor="white"
                                style={{ height: 200, width: '100%' }}
                            />
                            
                            <TouchableOpacity 
                                onPress={() => {
                                    setDate(new Date());
                                }}
                                className="mt-2 py-3 bg-[#2c2c2e] rounded-full items-center w-32"
                            >
                                <Text className="text-white text-base font-medium">Today</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>
        </Modal>
    );
}

function MacroRow({ 
    icon, 
    label, 
    value, 
    unit, 
    isLast,
    themeColors,
    secondaryText
}: { 
    icon?: React.ReactNode, 
    label: string, 
    value: string | React.ReactNode, 
    unit: string, 
    isLast?: boolean,
    themeColors: any,
    secondaryText: string
}) {
    return (
        <View className={`flex-row items-center justify-between p-4 border-b`} style={{ borderColor: isLast ? 'transparent' : themeColors.border }}>
            <View className="flex-row items-center gap-3">
                {icon && <>{icon}</>}
                <Text className="font-medium text-base" style={{ color: themeColors.text }}>{label}</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
                {typeof value === 'string' ? (
                     <Text className="text-base font-semibold" style={{ color: themeColors.text }}>{value}</Text>
                ) : (
                    value
                )}
                {unit ? <Text className="text-sm" style={{ color: secondaryText }}>{unit}</Text> : null}
            </View>
        </View>
    );
}
