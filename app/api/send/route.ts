import { EmailTemplate } from "@/app/components/email-template";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_5iAiYax1_CX86PMxCGEP5SKV4eZCWJbZy");

export async function handler(req: NextRequest, res: NextResponse) {
    try {
        const data = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "fahreddin@upstash.com",
            subject: "Hello world",
            html: "<p>SELAM</p>",
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error });
    }
}
