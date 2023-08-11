import { NextResponse } from "next/server";

import { EmailTemplate } from "@/app/components/email-template";
import { auth } from "@clerk/nextjs";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://careful-ladybug-31212.upstash.io",
  token:
    "AXnsACQgYjg5ZmZkYTUtZjg0OS00OTJmLTk4NGQtNWEzMDdlODdhNzg2N2VmNTNkYjkzZGUyNGU0N2FlODZmYTM0NmYwOTRkY2Y=",
});

export async function POST(request: Request) {
  const body = await request.text();
  const { mail_type, delay, user, items } = JSON.parse(body);

  const APP_URL = "https://shopstash.vercel.app/api/send";
  const QSTASH_TOKEN =
    "eyJVc2VySUQiOiJmOTAzN2EwNS1jYWE2LTRhZjctYTVhOS1jNWM1NWZkY2UyMGMiLCJQYXNzd29yZCI6IjFhMTg1NmNkOGFlYjQ2YWZiMmRmOWJhNzQ1ODMxNTIxIn0=";
  const res = await fetch(`https://qstash.upstash.io/v1/publish/${APP_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QSTASH_TOKEN}`,
      "Upstash-Delay": delay,
    },
    body: JSON.stringify({
      mail_type,
      user,
    }),
  });

  redis.set(`${mail_type}:${user.ID}`, res);
  console.log(res);

  return NextResponse.json("OK");
}

export async function DELETE(request: Request) {
  const body = await request.text();
  const { mail_type, delay, user, items } = JSON.parse(body);

  const MESSAGE_ID = redis.get(`${mail_type}:${user.ID}`);

  const QSTASH_TOKEN =
    "eyJVc2VySUQiOiJmOTAzN2EwNS1jYWE2LTRhZjctYTVhOS1jNWM1NWZkY2UyMGMiLCJQYXNzd29yZCI6IjFhMTg1NmNkOGFlYjQ2YWZiMmRmOWJhNzQ1ODMxNTIxIn0=";
  const res = await fetch(
    `https://qstash.upstash.io/v1/messages/${MESSAGE_ID}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${QSTASH_TOKEN}`,
      },
    }
  );

  return NextResponse.json("OK");
}
