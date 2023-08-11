import { EmailTemplate } from "@/app/components/email-template";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const RESEND_API_KEY = "re_8VuzdNyz_Ncja9WYPJNjEXdiWrY1mNoDY";

// const resend = new Resend(RESEND_API_KEY);

type mailType =
  | "item-interest"
  | "shipment"
  | "items-to-rate"
  | "forgot-items-in-cart";
export async function POST(request: Request) {
  const mailSubject: Record<mailType, string> = {
    "item-interest": "Item Interest",
    shipment: "Your items are shipped!",
    "forgot-items-in-cart": "Come back!",
    "items-to-rate": "Would you like to rate your purchase?",
  };
  const body = await request.text();
  const { mail_type, items, user } = JSON.parse(body);

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "ShopStash <onboarding@resend.dev>",
      to: [user.emailAddress],
      subject: mailSubject[mail_type as mailType],
      react: EmailTemplate({ user, mail_type }),
    }),
  });
  //   const data = await resend.emails.send({
  //     from: "Acme <onboarding@resend.dev>",
  //     to: [user.emailAddress],
  //     subject: mailSubject[mail_type as mailType],
  //     react: EmailTemplate({ user, mail_type }),
  //     text: "text",
  //   });

  return NextResponse.json("OK");
}
