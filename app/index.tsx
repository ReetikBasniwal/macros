import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return null; // or a loading spinner
    }
    console.log(session, "session")
    // Redirect based on session
    return <Redirect href={session ? "/tabs" : "/auth"} />;
}