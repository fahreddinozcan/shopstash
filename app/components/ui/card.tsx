"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Rating } from "@mui/material";

import { useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { FaCartShopping } from "react-icons/fa6";
import CartContext from "../cart/CartContext";
import RateContext from "../context/RateContext";
import UserStateContext from "../context/UserStateContext";

import { useState } from "react";
import { User } from "lucide-react";
type cardProps = {
  id: number;
  title: string;
  image: string;
  description: string;
  company: string;
  price: number;
};

type cartContent = {
  [key: string]: number;
};

export default function CardComponent(props: { item: cardProps }) {
  const { item } = props;
  const { id, title, image, company } = item;

  const [value, setValue] = useState(2);

  const { addItem, removeItem, cartItems } = useContext(CartContext);
  const { itemRates, rateItem } = useContext(RateContext);

  return (
    <>
      <Card className="hover:shadow-lg transition duration-200">
        <Link href={`/products/${id}`}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <p>Card Content</p> */}

            <Image src={image} alt={title} width={300} height={300}></Image>

            <CardDescription>{company}</CardDescription>
          </CardContent>
        </Link>
        <CardFooter>
          <div className="grid grid-rows-2">
            <Rating
              name="simple-controlled"
              value={parseInt(itemRates[id - 1])}
              readOnly
            />
            <CartButton
              id={id}
              cartItems={cartItems}
              addItem={addItem}
              removeItem={removeItem}
            />
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

const CartButton = ({
  id,
  cartItems,
  addItem,
  removeItem,
}: {
  id: number;
  cartItems: cartContent;
  addItem: (id: number) => Promise<void>;
  removeItem: (id: number, force: boolean) => Promise<void>;
}) => {
  const itemExists: boolean = cartItems?.hasOwnProperty(id);
  const { triggerEvent } = useContext(UserStateContext);
  return (
    <button
      className={`${
        itemExists ? "bg-red-400 text-black" : "bg-cyan-500 text-black"
      } rounded-full px-4 py-2 flex items-center justify-center gap-3 transition-all duration-300`}
      onClick={() => {
        if (itemExists) {
          removeItem(id, true);
          triggerEvent("remove-from-cart", id);
        } else {
          addItem(id);
          triggerEvent("add-to-cart", id);
        }
      }}
    >
      <p className="text-sm font-bold">
        {itemExists ? "Remove from Cart" : "Add to Cart"}
      </p>
      <FaCartShopping size="25" />
    </button>
  );
};
