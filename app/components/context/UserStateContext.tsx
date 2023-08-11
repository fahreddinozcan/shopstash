"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import CartContext from "../cart/CartContext";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://careful-ladybug-31212.upstash.io",
  token:
    "AXnsACQgYjg5ZmZkYTUtZjg0OS00OTJmLTk4NGQtNWEzMDdlODdhNzg2N2VmNTNkYjkzZGUyNGU0N2FlODZmYTM0NmYwOTRkY2Y=",
});

type stateType =
  | "none"
  | "sign-up"
  | "sign-in"
  | "items-in-cart"
  | "blank-cart";
type eventType =
  | "sign-up"
  | "sign-in"
  | "sign-out"
  | "view-item"
  | "add-to-cart"
  | "remove-from-cart"
  | "cart-emptied"
  | "rate"
  | "checkout";

type mailType = 'item-interest' | 'shipment' | 'items-to-rate' | 'forgot-items-in-cart'
interface UserStateContextProps {
  userState: stateType;
  triggerEvent: (event: eventType, id?: number, cart?: Item[]) => Promise<void>;
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

const UserStateContext = createContext<UserStateContextProps>({
  userState: "none",
  triggerEvent: async (event, id, cart) => {},
});

export const UserStateProvider: any = ({
  children,
  userId,
  user,
}: {
  children: any;
  userId: string;
  user: any;
}) => {
  let itemCount = 0;
  useEffect(() => {
    // fetchItemRates();
  }, [itemCount]);

  const [userState, setUserState] = useState<stateType>("none");
  const { cart, cartItems } = useContext(CartContext);
  const { toast } = useToast();

  const triggerEvent = async (event: eventType, id?: number, cart?: Item[]) => {
    console.log(`EVENT: ${event}`);
    if (event === "view-item" && id) {
      redis.sadd(`interested-in:${userId}`, id);

      toast({
        title: "Scheduled",
        description: `Item with ID: ${id} is viewed! If it doesn't get added to cart in a day, notification will be sent!`,
      });

      fetch("/api/setSchedule", {
        method: "POST",
        body: JSON.stringify({
          mail_type: 'item-interest',
          delay: "10s",
          user: {
            userID: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            emailAddress: user.emailAddress,
          },
        }),
      });
    } else if (event === "add-to-cart" && id) {
      const interestedIn: number[] = await redis.smembers(
        `interested-in:${userId}`
      );

      if (interestedIn.includes(id)) {
        const newInterestedIn = interestedIn.filter((item) => {
          console.log(item, id);
          return item != id;
        });
        console.log(newInterestedIn);
        if (newInterestedIn.length !== 0) {
          toast({
            title: "Edited Schedule",
            description: `Item with ID: ${id} is viewed!. Here's the items that user is interested in but haven't added to cart: ${newInterestedIn.join(
              ""
            )}`,
          });
        } else {
          console.log("HERE");
          toast({
            title: "Removed Schedule",
            description: `Item with ID: ${id} is viewed!. Unscheduling the interest items mail.`,
          });
          fetch("/api/setSchedule", {
            method: "DELETE",
            body: JSON.stringify({
              mail_type: 'item-interest',
              user: {
                userID: userId,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                emailAddress: user.emailAddress,
              },
            }),
          });
        }

        redis.srem(`interested-in:${userId}`, id.toString());
      }
      setUserState("items-in-cart");
    } else if (event === "cart-emptied") {
      setUserState("blank-cart");
      fetch("/api/setSchedule", {
        method: "DELETE",
        body: JSON.stringify({
          mail_type: 'forgot-items-in-cart',
          user: {
            userID: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            emailAddress: user.emailAddress,
          },
        }),
      });
    } else if (event === "rate" && id) {
      const itemsToBeRated = await redis.smembers(`to-be-rated:${userId}`);

      if (!itemsToBeRated) return;

      const newToBeRated = itemsToBeRated.filter((item) => {
        console.log(item, id);
        return item != id.toString();
      });

      if (newToBeRated.length === 0) {
        console.log("ABORT MAIL!");
        toast({
          title: "Removed Schedule",
          description: `Item with ID: ${id} is rated. There's no item-to-be-rated. Aborting the scheduled mail`,
        });
        fetch("/api/setSchedule", {
          method: "DELETE",
          body: JSON.stringify({
            mail_type: 'items-to-rate',
            user: {
              userID: userId,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              emailAddress: user.emailAddress,
            },
          }),
        });
      } else {
        console.log(newToBeRated);

        redis.srem(`to-be-rated:${userId}`, id);

        toast({
          title: "Scheduled",
          description: `Item with ID: ${id} is rated. And it's removed from the to-be-rated. New Items to rate are: ${newToBeRated.join(
            " "
          )}`,
        });
      }
    } else if (event === "checkout" && cart) {
      const itemIDs = cart?.map((item) => item.id);
      console.log(cart);
      toast({
        title: "Scheduled",
        description:
          "A 'Your items are shipped!' mail is scheduled with a delay of 24h. ",
      });
      console.log(user);
      fetch("/api/setSchedule", {
        method: "POST",
        body: JSON.stringify({
          mail_type: 'shipment',
          items: itemIDs,
          delay: "10s",
          user: {
            userID: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            emailAddress: user.emailAddress,
          },
        }),
      });

      toast({
        title: "Scheduled",
        description: `A 'You forgot to rate items!' mail is scheduled with a delay of 24h. The items are: ${itemIDs.join(
          " "
        )} `,
      });
      fetch("/api/setSchedule", {
        method: "POST",
        body: JSON.stringify({
          mail_type: "items-to-rate",
          items: itemIDs,
          delay: "10s",
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            emailAddress: user.emailAddress,
          },
        }),
      });

      redis.sadd(`to-be-rated:${userId}`, ...itemIDs);
    }

    if (userState === "items-in-cart" && cart) {
      if (event === "sign-out") {
        const itemIDs = cart?.map((item) => item.id);
        toast({
          title: "Scheduled",
          description:
            "A 'you forgot some items in your cart' mail is scheduled with a delay of 24h. ",
        });

        fetch("/api/setSchedule", {
          method: "POST",
          body: JSON.stringify({
            mail_type: 'forgot-items-in-cart',
            items: itemIDs,
            delay: "10s",
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              emailAddress: user.emailAddress,
            },
          }),
        });
      }
    }
  };

  return (
    <UserStateContext.Provider value={{ userState, triggerEvent }}>
      {children}
    </UserStateContext.Provider>
  );
};

export default UserStateContext;
