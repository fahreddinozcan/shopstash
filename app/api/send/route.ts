import { EmailTemplate } from "@/app/components/email-template";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_8VuzdNyz_Ncja9WYPJNjEXdiWrY1mNoDY");

export const runtime = "edge";
export async function GET() {
    try {
        const data = await resend.emails.send({
            from: "ShopStash <onboarding@resend.dev>",
            to: ["fahreddin@upstash.com"],
            subject: "Come back!",
            react: EmailTemplate({ firstName: "Fahreddin" }),
            text: "selam",
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error });
    }
}
