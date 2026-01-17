import { MEAL_TYPES } from '@/constants/food';
import { getMacroSections, SERVING_UNITS } from '@/constants/foodDetail';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { FoodDetailSheetProps, MacroItem } from '@/types/foodDetail';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ActionSheetIOS, Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FoodEntrySummary } from './FoodEntrySummary';

export function FoodDetailSheet({ visible, onClose, onSave, onDelete, food, initialValues }: FoodDetailSheetProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    
    // Reset state when food or initialValues change
    React.useEffect(() => {
        if (visible) {
             setPortion(initialValues?.portion || food?.serving_size?.toString() || "70");
             setUnit(initialValues?.unit || food?.serving_unit || "g");
             setMealType(initialValues?.mealType || food?.meal_type || "breakfast");
             setDate(initialValues?.date ? new Date(initialValues.date) : new Date());
        }
    }, [visible, food, initialValues]);

    const [portion, setPortion] = useState(initialValues?.portion || food?.serving_size?.toString() || "70");
    const [unit, setUnit] = useState(initialValues?.unit || food?.serving_unit || "g");
    const [mealType, setMealType] = useState(initialValues?.mealType || food?.meal_type || "breakfast");
    const [date, setDate] = useState(initialValues?.date ? new Date(initialValues.date) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

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

        const logData = {
            user_id: data.user.id,
            generic_food_id: food.id,
            food_name: food.name,
            brand: food.brand, // Ensure brand is preserved
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
            logged_date: date.toISOString().split('T')[0], // Ensure logged_date is set if not auto-generated
        };

        let result;
        let error;

        if (initialValues?.logId) {
             const { data: updatedData, error: updateError } = await supabase
                .from("food_logs")
                .update(logData)
                .eq('id', initialValues.logId)
                .select()
                .single();
             result = updatedData;
             error = updateError;
        } else {
             const { data: insertedData, error: insertError } = await supabase
                .from("food_logs")
                .insert(logData)
                .select()
                .single();
             result = insertedData;
             error = insertError;
        }

        if (error) {
            console.log("Food log error:", error);
        } else {
            console.log("Food logged successfully");
            onSave(result); // Pass the full log object back
            onClose(); 
        }
    }

    const handleUnitPress = () => {
        const options = SERVING_UNITS;
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
            setModalVisible(true)
        }
    };

    const handleDelete = () => {
        if (!initialValues?.logId || !onDelete) return;

        Alert.alert(
            "Delete Entry",
            "Are you sure you want to delete this food entry?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        onDelete(initialValues.logId!);
                        onClose();
                    }
                }
            ]
        );
    };

    const macroSections = getMacroSections({
        calories,
        carbs,
        fat,
        protein,
        food,
        textColor
    });

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
                        <Modal
                            transparent={true}
                            visible={isModalVisible}
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <Pressable
                                className="flex-1 justify-end bg-black/60"
                                onPress={() => setModalVisible(false)}
                            >
                                <View
                                    className="rounded-t-3xl p-6"
                                    style={{ backgroundColor: themeColors.background, paddingBottom: 40 }}
                                >
                                    <View className="items-center mb-4">
                                        <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                                    </View>

                                    <Text className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
                                        Select Meal Type
                                    </Text>

                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        {MEAL_TYPES.map((item) => {
                                            const isSelected = mealType === item.value;
                                            return (
                                                <TouchableOpacity
                                                    key={item.value}
                                                    className="py-4 flex-row justify-between items-center border-b"
                                                    style={{ borderColor: themeColors.border }}
                                                    onPress={() => {
                                                        setMealType(item.value);
                                                        setModalVisible(false);
                                                    }}
                                                >
                                                    <Text
                                                        className="text-lg"
                                                        style={{
                                                            color: isSelected ? themeColors.tint : themeColors.text,
                                                            fontWeight: isSelected ? '700' : '400'
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                    {isSelected && (
                                                        <Ionicons name="checkmark-circle" size={22} color={themeColors.tint} />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>

                                    <TouchableOpacity
                                        className="mt-4 py-4 rounded-2xl items-center"
                                        style={{ backgroundColor: themeColors.border }}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text className="font-bold text-lg" style={{ color: themeColors.text }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        </Modal>
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



                    {macroSections.map((section) => (
                        <MacroSection
                            key={section.title}
                            title={section.title}
                            items={section.items}
                            themeColors={themeColors}
                            secondaryText={secondaryText}
                            headerStyle={section.headerStyle}
                        />
                    ))}
                    
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
                <View 
                    className="absolute bottom-8 left-0 right-0 flex items-center justify-center"
                    pointerEvents="box-none"
                >
                    <View 
                        className="rounded-full px-6 py-3 flex-row items-center gap-8 shadow-2xl border"
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
                        {initialValues?.logId && (
                            <>
                                <TouchableOpacity 
                                    onPress={handleDelete}
                                    className="items-center justify-center"
                                >
                                    <Ionicons name="trash-outline" size={26} color={secondaryText} />
                                </TouchableOpacity>
                                <View className="w-px h-6" style={{ backgroundColor: themeColors.border }} />
                            </>
                        )}
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



function MacroSection({ 
    title, 
    items, 
    themeColors, 
    secondaryText,
    headerStyle = "pt-4"
}: { 
    title: string; 
    items: MacroItem[]; 
    themeColors: any; 
    secondaryText: string;
    headerStyle?: string;
}) {
    return (
        <View>
            <View className={`px-2 ${headerStyle} pb-1`}>
                <Text className="text-xl font-bold" style={{ color: themeColors.text }}>{title}</Text>
            </View>
            <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: themeColors.card }}>
                {items.map((item, index) => (
                    <MacroRow 
                        key={item.label}
                        icon={item.icon}
                        label={item.label} 
                        value={item.value} 
                        unit={item.unit} 
                        isLast={index === items.length - 1} 
                        themeColors={themeColors} 
                        secondaryText={secondaryText} 
                    />
                ))}
            </View>
        </View>
    );
}
