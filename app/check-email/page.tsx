import Link from "next/link";

export default function CheckEmailPage() {
    return (
        <main style={{ maxWidth: 520, margin: "0 auto", padding: "48px 20px"}}>
            <h1 style={{ fontSize: 32, marginBottom: 12 }}>Check your email</h1>

            <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6 , }}>
                We've sent you a confirmation link. Open your inbox and click the link to 
                activate your account.
            </p>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                opacity: 0.9,
              }}

            >
                <p style ={{margin: 0, lineHeight: 1.6 }}>
                    If you don't see it:
                    <br />. Check <b>Spam/Junk</b>
                    <br />. Wait 1-2  minutes
                    <br />. Make sure you typed the correct email
                </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap"}}>
                <Link href="/login">
                <button style={{ padding: "10px 14px", borderRadius: 10}}>
                    I confirmed - Go to login
                    </button>
                    </Link>



                    <Link href="/signup">
                    <button
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            opacity: 0.9,
                        }}
                        >
                            Use a different email
                        </button>
                 </Link>
            </div>

            <div style={{marginTop: 26, fontSize:14, opacity: 0.75}}>
                Tip: Once you confirm, come back and log in normally
            </div>
            </main>
            
    );
}