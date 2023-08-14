import * as React from "react";
import { items } from "@/public/items";
import Image from "next/image";
import { Img } from "@react-email/img";

type mailType =
  | "item-interest"
  | "shipment"
  | "items-to-rate"
  | "forgot-items-in-cart";

interface EmailTemplateProps {
  user: any;
  mail_type: mailType;
  itemsData?: Item[];
}
type Item = {
  id: number;
  title: string;
  image: string;
  description: string;
  company: string;
  price: number;
  rateValue: number;
  rateCount: number;
};

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  user,
  mail_type,
  itemsData,
}) => {
  if (mail_type == "shipment" && itemsData) {
    //
    return (
      <div className="container">
        <h1>Shipping Notification</h1>
        <p>Your order has been shipped and will be arriving soon!</p>
        <h2>Order Details</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {itemsData.map((item, index) => (
              <tr key={index}>
                <td>
                  <Img src={item.image} alt={item.title} width="100" />
                </td>
                <td>{item.title}</td>
                <td>${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Thank you for choosing us! If you have any questions or concerns,
          please contact our support team.
        </p>
      </div>
    );
  } else if (mail_type == "item-interest") {
    // return (
    //   <div>
    //     <h2>Hey, {user.firstName}!</h2>
    //     <p>Check out these items, you may be interested in them:</p>
    //     {itemsData?.map((itemID) => {
    //       const item = items.find((item) => {
    //         console.log(item.id, itemID);
    //         return item.id == parseInt(itemID);
    //       });
    //       if (!item) {
    //         return (
    //           <div key="item">
    //             <p>ITEMS</p>
    //             {itemsData}
    //           </div>
    //         );
    //       }
    //       return <p key={item.id}>{item.title}</p>;
    //     })}
    //   </div>
    // );
  } else if (mail_type == "items-to-rate") {
  } else if (mail_type == "forgot-items-in-cart") {
  }
};
