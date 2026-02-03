"use client";

import { useSearchParams } from "next/navigation";

export default function LoginClient() {
    const searchparams = useSearchParams();
    const next = searchparams.get("next");

    return (
        <div>
            <h1>Log in</h1>
            {next && <p>You will be redirected to {next}</p>}
            {/* Your supabase login UI here */}
        </div>
    );
}
