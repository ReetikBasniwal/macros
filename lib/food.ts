import { supabase } from "./supabase";

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
