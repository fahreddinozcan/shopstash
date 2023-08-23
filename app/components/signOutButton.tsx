"use client";

import { useClerk } from "@clerk/nextjs";
import { useContext } from "react";
import CartContext from "./context/CartContext";
import UserStateContext from "./context/UserStateContext";

export default function SignOutButton() {
  // const { cartItems } = useContext(CartContext);
  const { triggerEvent } = useContext(UserStateContext);

  const { signOut } = useClerk();

  return (
    <>
      <button
        onClick={() => {
          triggerEvent("sign-out");
          signOut();
        }}
        className="mr-5"
      >
        Sign Out
      </button>
    </>
  );
}
