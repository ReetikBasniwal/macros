import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,   // No header in auth screens
                animation: "slide_from_right", // Smooth transition (optional)
            }}
        />
    );
}