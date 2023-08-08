"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import DeleteItemButton from "./delete-item-button";
import { items } from "@/public/items";
import { useContext } from "react";
import { FaCartShopping } from "react-icons/fa6";

import Link from "next/link";
import Image from "next/image";
import CartContext from "./CartContext";
import RateContext from "../context/RateContext";

type Item = {
    id: number;
    title: string;
    image: string;
    description: string;
    company: string;
    price: number;
};

const mapIdsToObjects = (products: Item[], ids: number[]): Item[] => {
    const mappedItems: Item[] = [];
    for (const id of ids) {
        const product = products.find((p) => p.id === id);
        if (product) {
            mappedItems.push(product);
        }
    }
    return mappedItems;
};

export default function Cart() {
    const { removeItem, resetCart, cart } = useContext(CartContext);
    const { resetItemRates } = useContext(RateContext);
    return (
        <>
            <Sheet>
                <SheetTrigger className="border border-gray-400 p-2 rounded-md">
                    <FaCartShopping size="30" />
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                            <div>
                                <p className="text-3xl mb-6">My Cart</p>
                            </div>
                
                            
                        </SheetTitle>
                        {!cart || cart.length === 0 ? (
                            <div className="mt-20 flex  flex-col items-center justify-center ">
                                <FaCartShopping size="75" />
                                <p className="mt-6 text-center text-2xl font-bold">
                                    Your cart is empty.
                                </p>
                            </div>
                        ) : (
                            <div className="flex h-full flex-col justify-between  p-1">
                                
                                
                                <ul className="flex-grow-overflow-auto-py4">
                                    {cart.map((item) => {
                                        return (
                                            
                                            <li
                                                className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                                                key={item.id}
                                            >
                                                <div className="relative flex flex-col shrink-0 w-full h-full justify-between px-1 py-4 ">
                                                    <div className="absolute z-40 -mt-2 ml-[55px]">
                                                        <DeleteItemButton
                                                            deleteItem={
                                                                removeItem
                                                            }
                                                            item={item}
                                                        />
                                                    </div>
                                                    <Link
                                                        href={`products/${item.id}`}
                                                        className="z-30 flex  space-x-4 align-center"
                                                    >
                                                        <div className="relative h-full w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                                            <Image
                                                                className="h-full w-full object-cover "
                                                                width={64}
                                                                height={64}
                                                                alt={item.title}
                                                                src={item.image}
                                                            />
                                                        </div>

                                                        <div className=" flex  flex-col text-base">
                                                            <span className="leading-tight">
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                        <div className=" flex-1 h-16 flex-col justify-between">
                                                            <div className="flex  justify-end space-y-2 text-right text-m font-bold">
                                                                {item.price}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </li>
                                            
                                           
                                        );
                                    })}
                                </ul>
                                <div className="flex align-center justify-center mt-10" key="reset">
                                                <button
                                                className="rounded-full bg-black box-border w-36 h-8 mb-4 self-auto"
                                                    onClick={() => {
                                                        resetCart();
                                                    }}
                                                >
                                                    <p className="text-white box-content">RESET CART</p>
                                                    
                                                </button>
                                    </div>
                            </div>
                        )}
                        
                        <button
                                onClick={() => {
                                    resetItemRates();
                                }}
                            >
                                RESET RATES
                            </button>
                            <button
                                onClick={async () => {
                                    fetch("/api/send");
                                }}
                            >
                                Send Mail
                            </button>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </>
    );
}
