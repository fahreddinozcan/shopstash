"use client";

import React, { createContext, useEffect, useState } from "react";

import { items } from "@/public/items";

import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: "https://careful-ladybug-31212.upstash.io",
    token: "AXnsACQgYjg5ZmZkYTUtZjg0OS00OTJmLTk4NGQtNWEzMDdlODdhNzg2N2VmNTNkYjkzZGUyNGU0N2FlODZmYTM0NmYwOTRkY2Y=",
});

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

interface CartContextProps {
    cartItemIds: number[];
    cart: Item[];
    addItem: (id: number) => Promise<void>;
    removeItem: (id: number) => Promise<void>;
    resetCart: () => {};
}

const CartContext = createContext<CartContextProps>({
    cartItemIds: [],
    cart: [],
    addItem: async (id: number) => {},
    removeItem: async (id: number) => {},
    resetCart: async () => {},
});

const mapIdsToObjects = (products: Item[], ids: string[]): Item[] => {
    const mappedItems: Item[] = [];
    for (const id of ids) {
        const product = products.find((p) => p.id === parseInt(id));
        if (product) {
            mappedItems.push(product);
        }
    }

    console.log("CART:");
    console.log(mappedItems);
    return mappedItems;
};

export const CartProvider: any = ({
    children,
    userId,
}: {
    children: any;
    userId: string;
}) => {
    const [cartItemIds, setCartItemIds] = useState<number[]>([]);
    let itemCount = 0;
    const [cart, setCart] = useState<Item[]>([]);
    // const [userId, setUserId] = useState("0");

    useEffect(() => {
        fetchCartItems();
    }, [itemCount]);

    const fetchCartItems = async () => {
        const itemIDs = await redis.smembers(`usercart:${userId}`);
        // console.log(itemIDs);
        setCart(mapIdsToObjects(items, itemIDs));
        setCartItemIds(itemIDs.map((id) => parseInt(id)));

        // console.log(itemIDs);
    };

    const addItem = async (id: number) => {
        console.log("ADD");
        const item = items.find((i) => i.id === id);

        if (!item || cartItemIds.includes(id)) return;

        const doesItemExist = cart?.find((i) => {
            item.id === i.id;
        });
        let newCartItems;

        if (!doesItemExist) {
            newCartItems = [...(cart || []), item];
            await redis.sadd(`usercart:${userId}`, id.toString());
            fetchCartItems();
        }
    };

    const removeItem = async (id: number) => {
        console.log("REMOVE");
        redis.srem(`usercart:${userId}`, id);
        fetchCartItems();
    };

    const resetCart = async () => {
        redis.del(`usercart:${userId}`);

        fetchCartItems();
    };

    return (
        <CartContext.Provider
            value={{
                addItem,
                removeItem,
                cartItemIds,
                resetCart,
                cart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
