import { MacroBadge } from '@/components/MacroBadge';
import { MacroSectionData } from '@/types/foodDetail';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export const SERVING_UNITS = ['g', 'oz', 'ml', 'cup', 'tbsp', 'tsp', 'Cancel'];

export const getMacroSections = ({
    calories,
    carbs,
    fat,
    protein,
    food,
    textColor
}: MacroSectionData) => [
    {
        title: "Calories & Macros",
        items: [
            {
                label: "Calories",
                value: `${calories}`,
                unit: "kcal",
                icon: <Ionicons className='-ml-1' name="flame" size={30} color="#ef4444" />
            },
            {
                label: "Carbohydrates",
                value: carbs,
                unit: "g",
                icon: <MacroBadge type="carbs" size={24} fontSize={12} />
            },
            {
                label: "Fat",
                value: fat,
                unit: "g",
                icon: <MacroBadge type="fat" size={24} fontSize={12} />
            },
            {
                label: "Protein",
                value: protein,
                unit: "g",
                icon: <MacroBadge type="protein" size={24} fontSize={12} />
            }
        ],
        headerStyle: "pt-2"
    },
    {
        title: "Carbohydrates",
        items: [
            { label: "Fiber", value: food.fiber ? `${food.fiber}` : "9.86", unit: "g" },
            { label: "Sugars", value: "-", unit: "" },
            { label: "Added Sugars", value: "0", unit: "g" },
            { label: "Sugar Alcohols", value: "-", unit: "" }
        ]
    },
    {
        title: "Lipids",
        items: [
            { label: "Trans Fat", value: "0", unit: "g" },
            { label: "Saturated Fat", value: "0.9", unit: "g" },
            { label: "Monounsaturated Fat", value: "-", unit: "" },
            { label: "Polyunsaturated Fat", value: "-", unit: "" },
            { label: "Cholesterol", value: "0", unit: "mg" }
        ]
    },
    {
            title: "Minerals",
            items: [
                { label: "Calcium", value: "-", unit: "" },
                { label: "Chloride", value: "-", unit: "" },
                { label: "Iron", value: "2.02", unit: "mg" },
                { label: "Magnesium", value: "-", unit: "" },
                { label: "Phosphorus", value: "-", unit: "" },
                { label: "Sodium", value: "3.54", unit: "mg" },
                { label: "Zinc", value: "2.26", unit: "mg" },
                { label: "Chromium", value: "-", unit: "" },
                { label: "Copper", value: "-", unit: "" },
                { label: "Iodine", value: "-", unit: "" },
                { label: "Manganese", value: "-", unit: "" },
                { label: "Molybdenum", value: "-", unit: "" },
                { label: "Selenium", value: "-", unit: "" }
            ]
    },
    {
            title: "Vitamins",
            items: [
                { label: "Vitamin A", value: "-", unit: "" },
                { label: "Vitamin E", value: "-", unit: "" },
                { label: "Vitamin D", value: "-", unit: "" },
                { label: "Vitamin C", value: "-", unit: "" },
                { label: "Thiamin", value: "-", unit: "" },
                { label: "Riboflavin", value: "-", unit: "" },
                { label: "Niacin", value: "-", unit: "" },
                { label: "Pantothenic Acid", value: "-", unit: "" },
                { label: "Vitamin B6", value: "-", unit: "" },
                { label: "Biotin", value: "-", unit: "" },
                { label: "Folate", value: "-", unit: "" },
                { label: "Vitamin B12", value: "-", unit: "" },
                { label: "Vitamin K", value: "-", unit: "" }
            ]
    },
    {
            title: "Other",
            items: [
                { label: "Alcohol", value: <Ionicons name="lock-closed" size={14} color={textColor} />, unit: "" },
                { label: "Caffeine", value: <Ionicons name="lock-closed" size={14} color={textColor} />, unit: "" },
                { label: "Water", value: <Ionicons name="lock-closed" size={14} color={textColor} />, unit: "" }
            ]
    }
];
