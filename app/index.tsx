import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);

            // Check onboarding status if user is logged in
            if (session?.user) {
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('onboarding_complete')
                    .eq('id', session.user.id)
                    .single();
                    
                setOnboardingComplete(userData?.onboarding_complete ?? false);
            }

            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);

            // Check onboarding status when auth state changes
            if (session?.user) {
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('onboarding_complete')
                    .eq('id', session.user.id)
                    .single();

                setOnboardingComplete(userData?.onboarding_complete ?? false);
            } else {
                setOnboardingComplete(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return null; // or a loading spinner
    }

    console.log(session, "session", onboardingComplete, "onboarding")

    // Redirect logic based on session and onboarding status
    if (!session) {
        return <Redirect href="/auth" />;
    }

    if (session && onboardingComplete === false) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}