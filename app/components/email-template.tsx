import * as React from "react";

type mailType =
  | "item-interest"
  | "shipment"
  | "items-to-rate"
  | "forgot-items-in-cart";

interface EmailTemplateProps {
  user: any;
  mail_type: mailType;
  items?: string[];
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  user,
  mail_type,
  items,
}) => {
  if (mail_type == "shipment") {
    return (
      <div>
        <h1>Hey, {user.firstName}!</h1>
        <p>
          We just wanted to let you know that we have shipped your items below.
          They will reach to you today.
        </p>
      </div>
    );
  } else if (mail_type == "item-interest") {
  } else if (mail_type == "items-to-rate") {
  } else if (mail_type == "forgot-items-in-cart") {
  }
};
