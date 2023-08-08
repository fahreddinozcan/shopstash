"use client";

import { useClerk } from "@clerk/nextjs";
import { useContext } from "react";
import CartContext from "./cart/CartContext";

export default function SignOutButton() {
    const { cartItemIds } = useContext(CartContext);
    const { signOut } = useClerk();

    return (
        <>
            <button
                onClick={() => {
                    if (cartItemIds.length > 1) {
                        fetch("/api/send");
                    }
                    signOut();
                }}
                className="mr-5"
            >
                Sign Out
            </button>
        </>
    );
}
