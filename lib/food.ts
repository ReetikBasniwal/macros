import { supabase } from "./supabase";

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_size: number;
    serving_unit: string;
}

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

export async function fetchRecentFoods() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: recentData, error } = await supabase
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
        .eq("user_id", user.id)
        .order("last_logged_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Fetch recents error:", error);
        return [];
    }

    return recentData;
}

export async function upsertRecentFood(food: any) {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    // Handle both direct generic food object or food with generic_foods attached
    const foodId = food.generic_food_id || food.id;
    const foodName = food.food_name || food.name;

    const { error } = await supabase.rpc("upsert_recent_food", {
        p_user_id: data.user.id,
        p_generic_food_id: foodId,
        p_food_name: foodName,
        p_source_type: "generic",
    });

    if (error) {
        console.log("RPC error:", error);
    }
}
