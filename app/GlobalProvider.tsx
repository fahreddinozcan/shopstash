import { CartProvider } from "./components/cart/CartContext";

import { auth } from "@clerk/nextjs";
export function GlobalProvider({ children }: { children: any }) {
    const { userId } = auth();
    return <CartProvider userId={userId}>{children}</CartProvider>;
}
