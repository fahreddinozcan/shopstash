"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";

import { FaCartShopping } from "react-icons/fa6";
import CartContext from "../cart/CartContext";
type cardProps = {
    id: number;
    title: string;
    image: string;
    description: string;
    company: string;
    price: number;
};

export default function CardComponent(props: { item: cardProps }) {
    const { item } = props;
    const { id, title, image, description, company, price } = item;

    const { addItem, removeItem, cartItemIds } = useContext(CartContext);

    const addToCartHandler = () => {};

    return (
        <>
            <Card className="hover:shadow-lg transition duration-200">
                <Link href={`/products/${id}`}>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* <p>Card Content</p> */}

                        <Image
                            src={image}
                            alt={title}
                            width={500}
                            height={500}
                        ></Image>

                        <CardDescription>{company}</CardDescription>
                    </CardContent>
                </Link>
                <CardFooter>
                    <CartButton
                        id={id}
                        cartItemIds={cartItemIds}
                        addItem={addItem}
                        removeItem={removeItem}
                    />
                    {/* {!cartItemIds.includes(id) ? (
                        <button
                            className="rounded-full bg-cyan-500 px-4 py-2 flex items-center justify-center gap-3"
                            onClick={() => {
                                addItem(id);
                            }}
                        >
                            <p className="text-sm font-bold">Add to Cart</p>
                            <FaCartShopping size="25" />
                        </button>
                    ) : (
                        <button
                            className="rounded-full bg-red-400 px-4 py-2 flex items-center justify-center gap-3"
                            onClick={() => removeItem(id)}
                        >
                            <p className="text-sm font-bold">
                                Remove from Cart
                            </p>
                            <FaCartShopping size="25" />
                        </button>
                    )} */}
                </CardFooter>
            </Card>
        </>
    );
}

const CartButton = ({
    id,
    cartItemIds,
    addItem,
    removeItem,
}: {
    id: number;
    cartItemIds: number[];
    addItem: (id: number) => Promise<void>;
    removeItem: (id: number) => Promise<void>;
}) => {
    return (
        <button
            className={`${
                cartItemIds.includes(id)
                    ? "bg-red-400 text-black"
                    : "bg-cyan-500 text-black"
            } rounded-full px-4 py-2 flex items-center justify-center gap-3 transition-all duration-300`}
            onClick={() => {
                cartItemIds.includes(id)
                    ? console.log("YES")
                    : console.log("NO");
                cartItemIds.includes(id) ? removeItem(id) : addItem(id);
            }}
        >
            <p className="text-sm font-bold">
                {cartItemIds.includes(id) ? "Remove from Cart" : "Add to Cart"}
            </p>
            <FaCartShopping size="25" />
        </button>
    );
};
