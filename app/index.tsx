import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

    useEffect(() => {
        // Get initial session with a timeout to prevent hanging
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await Promise.race([
                    supabase.auth.getSession(),
                    new Promise<{ data: { session: null }, error: any }>((_, reject) => 
                        setTimeout(() => reject(new Error('Session check timeout')), 2500)
                    )
                ]);

                if (error) throw error;
                
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
            } catch (error) {
                console.error("Error or timeout checking auth session:", error);
                // In case of error/timeout, we'll default to no session to let the user try logging in
                setSession(null); 
            } finally {
                setLoading(false);
            }
        };

        checkSession();

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
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    
    // Redirect logic based on session and onboarding status
    if (!session) {
        return <Redirect href="/auth" />;
    }

    if (session && onboardingComplete === false) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}