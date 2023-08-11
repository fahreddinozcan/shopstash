import * as React from "react";
import { items as itemInfo } from "@/public/items";
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
          const item = itemInfo.find((item) => {
            item.id.toString() === itemID;
          });
          if (!item)
            return (
              <div>
                <p>ITEMS</p>
              </div>
            );

          return (
            <li
              className="gap-3 w-[95%]  border-b border-neutral-300 dark:border-neutral-700 py-4 px-2 grid grid-flow-col grid-cols-min transition-all ease-in-out"
              key={item.id}
            >
              <div>
                <div className="z-30 flex  space-x-4 align-center">
                  <div className="relative h-full w-[4.5rem] cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                    <Image
                      className="h-full w-full object-cover "
                      width={68}
                      height={68}
                      alt={item.title}
                      src={item.image}
                    />
                  </div>
                </div>
              </div>

              <div className=" flex  flex-col text-base">
                <span className="leading-tight">{item.title}</span>
              </div>
              <div className="grid grid-flow-row grid-rows-1">
                <div className="flex  justify-end space-y-2 text-right text-m font-bold">
                  ${item.price}
                </div>
              </div>
            </li>
          );
        })}
      </div>
    );
  } else if (mail_type == "item-interest") {
  } else if (mail_type == "items-to-rate") {
  } else if (mail_type == "forgot-items-in-cart") {
  }
};
