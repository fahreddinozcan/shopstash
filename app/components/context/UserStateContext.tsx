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
    } else if (event === "add-to-cart" && id) {
      const interestedIn: number[] = await redis.smembers(
        `interested-in:${userId}`
      );

      console.log(interestedIn);
      console.log(typeof id, id);
      console.log(typeof id.toString(), typeof interestedIn[0], id);
      console.log(interestedIn.includes(id), id, interestedIn);

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
        }

        redis.srem(`interested-in:${userId}`, id.toString());
      }
      setUserState("items-in-cart");
    } else if (event === "cart-emptied") {
      setUserState("blank-cart");
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

      // console.log('Remove from to be rated!')
      // TODO: remove the item from the to be rated items
    } else if (event === "checkout") {
      if (!cart) return;
      const itemIDs = cart?.map((item) => item.id);
      console.log(cart);
      toast({
        title: "Scheduled",
        description:
          "A 'Your items are shipped!' mail is scheduled with a delay of 24h. ",
      });
      fetch("/api/setSchedule", {
        method: "POST",
        body: JSON.stringify({
          mail_type: event,
          items: itemIDs,
          delay: "10s",
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            emailAddress: user.primaryEmailAddress,
          },
        }),
      });

      toast({
        title: "Scheduled",
        description: `A 'You forgot to rate items!' mail is scheduled with a delay of 24h. The items are: ${itemIDs.join(
          " "
        )} `,
      });

      redis.sadd(`to-be-rated:${userId}`, ...itemIDs);
      // TODO: add a shipping mail to 1 day delay
      toast({
        title: "Scheduled",
        description:
          "A 'Your items are shipped!' mail is scheduled with a delay of 24h. ",
      });
    }

    if (userState === "items-in-cart") {
      if (event === "sign-out") {
        console.log("HEY! COME BACK!");
        toast({
          title: "Scheduled",
          description:
            "A 'you forgot some items in your cart' mail is scheduled with a delay of 24h. ",
        });
        fetch("/api/send", { method: "POST" });
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
