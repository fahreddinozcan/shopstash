import { EmailTemplate } from "@/app/components/email-template";
import { NextResponse } from "next/server";
import { Resend } from "resend";

// export const runtime = "edge";
export async function GET() {
    const resend = new Resend("re_8VuzdNyz_Ncja9WYPJNjEXdiWrY1mNoDY");
    try {
        resend.emails.send({
            from: "ShopStash <onboarding@resend.dev>",
            to: ["fahreddin@upstash.com"],
            subject: "Come back!",
            react: EmailTemplate({ firstName: "Fahreddin" }),
            text: "selam",
        });

        return NextResponse.json("sent!");
    } catch (error) {
        return NextResponse.json("Error!");
    }
}
