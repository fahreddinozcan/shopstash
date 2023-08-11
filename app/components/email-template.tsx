import * as React from "react";
import { items } from "@/public/items";
import Image from "next/image";

type mailType =
  | "item-interest"
  | "shipment"
  | "items-to-rate"
  | "forgot-items-in-cart";

interface EmailTemplateProps {
  user: any;
  mail_type: mailType;
  itemsData?: string[];
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  user,
  mail_type,
  itemsData,
}) => {
  if (mail_type == "shipment") {
    return (
      <div>
        <h2>Hey, {user.firstName}!</h2>
        <p>
          We just wanted to let you know that we have shipped your items below.
          They will reach to you today.
        </p>
        {itemsData?.map((itemID) => {
          const item = items.find((item) => {
            console.log(item.id, itemID);
            return item.id == parseInt(itemID);
          });
          if (!item) {
            return (
              <div key="item">
                <p>ITEMS</p>
                {itemsData}
              </div>
            );
          }

          return <p key={item.id}>item.title</p>;
        })}
      </div>
    );
  } else if (mail_type == "item-interest") {
  } else if (mail_type == "items-to-rate") {
  } else if (mail_type == "forgot-items-in-cart") {
  }
};
