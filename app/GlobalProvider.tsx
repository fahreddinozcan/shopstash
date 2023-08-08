import { CartProvider } from "./components/cart/CartContext";
import { RateProvider } from "./components/context/RateContext";
import { auth } from "@clerk/nextjs";

export function GlobalProvider({ children }: { children: any }) {
    const { userId } = auth();
    return (
        <CartProvider userId={userId}>
            <RateProvider userId={userId}>{children}</RateProvider>
        </CartProvider>
    );
}
