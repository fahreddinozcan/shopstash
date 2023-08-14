import { EmailTemplate } from "@/app/components/email-template";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { items as ItemOrigins } from "@/public/items";

// export const runtime = "edge";
// export const dynamic = "force-dynamic";

const redis = new Redis({
  url: "https://careful-ladybug-31212.upstash.io",
  token:
    "AXnsACQgYjg5ZmZkYTUtZjg0OS00OTJmLTk4NGQtNWEzMDdlODdhNzg2N2VmNTNkYjkzZGUyNGU0N2FlODZmYTM0NmYwOTRkY2Y=",
});

const RESEND_API_KEY = "re_8VuzdNyz_Ncja9WYPJNjEXdiWrY1mNoDY";

const resend = new Resend(RESEND_API_KEY);

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

  let itemsData;
  if (mail_type === "shipment") {
    itemsData = items.map((itemID: string) => {
      return ItemOrigins.find((i) => i.id.toString() == itemID);
    });
  } else {
    itemsData = redis.smembers(`${mail_type}:${user.userID}`);
  }

  //   await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${RESEND_API_KEY}`,
  //     },
  //     body: JSON.stringify({
  //       from: "ShopStash <onboarding@resend.dev>",
  //       to: [user.emailAddress],
  //       subject: mailSubject[mail_type as mailType],
  //       react: EmailTemplate({ user, mail_type }),
  //     }),
  //   });
  const data = await resend.emails.send({
    from: "ShopStash <onboarding@resend.dev>",
    to: [user.emailAddress],
    subject: mailSubject[mail_type as mailType],
    react: EmailTemplate({ user, mail_type, itemsData }),
    text: "text",
  });

  return NextResponse.json("OK");
}
