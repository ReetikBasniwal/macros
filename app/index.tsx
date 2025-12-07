import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return null; // or a loading spinner
    }

    console.log(session, "session")

    // Redirect based on session
    // Using 'as any' temporarily until Expo Router regenerates typed routes
    return <Redirect href={session ? "/(tabs)" as any : "/auth"} />;
}