"use client";

import { useRouter } from "next/navigation";
import { items } from "@/public/items";
import { useContext } from "react";
import Image from "next/image";
import CartContext from "@/app/components/cart/CartContext";
import CartButton from "@/app/components/cartButton";
import Cart from "@/app/components/cart/cart";

const getItem = (id: string) => {
    const item = items.find((i) => i.id === parseInt(id));
    return item;
};

export default function Product({ params }: { params: { id: string } }) {
    const { addItem, removeItem, cartItemIds } = useContext(CartContext);
    const item = getItem(params.id);

    // const { cart } = useContext(CartContext);

    if (!item) {
        <Cart />;
        return <div>Item not found!</div>;
    }

    return (
        <div className="container max-w-screen-xl mx-auto px-4 bg-white py-10">
            <div className="grid mb-10 justify-end">
                <Cart />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-5">
                <aside>
                    <div className="border border-gray-200 shadow-sm p-3 text-center rounded mb-5">
                        <Image
                            className="object-cover inline-block"
                            src={item?.image}
                            alt="Product title"
                            width="340"
                            height="340"
                        />
                    </div>
                </aside>
                <main>
                    <h2 className="font-semibold text-2xl mb-4">
                        {item.title}
                    </h2>

                    <p className="mb-4 font-semibold text-xl">${item.price}</p>

                    <p className="mb-20 text-gray-500 ">{item.description}</p>

                    <div className="flex flex-wrap gap-2 mb-5">
                        <CartButton
                            id={parseInt(params.id)}
                            addItem={addItem}
                            removeItem={removeItem}
                            cartItemIds={cartItemIds}
                        />
                    </div>

                    <ul className="mb-5">
                        <li className="mb-1">
                            {" "}
                            <b className="font-medium w-36 inline-block">
                                Seller / Brand:
                            </b>
                            <span className="text-gray-500">
                                {item.company}
                            </span>
                        </li>
                    </ul>
                </main>
            </div>

            {/* <NewReview /> */}
            <hr />
        </div>
    );
}
