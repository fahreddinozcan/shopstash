import { EmailTemplate } from "@/app/components/email-template";
import { verifySignature } from "@upstash/qstash/nextjs";
import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default verifySignature(POST);

const RESEND_API_KEY = "re_8VuzdNyz_Ncja9WYPJNjEXdiWrY1mNoDY";

async function POST() {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: "ShopStash <onboarding@resend.dev>",
            to: ["fahreddin@upstash.com"],
            subject: "Come back!",
            react: EmailTemplate({ firstName: "Fahreddin" }),
            text: "selam",
        }),
    });

    if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
    }

    return NextResponse.json("ERROR!");
}

export const config = {
    api: {
        bodyParser: false,
    },
};
