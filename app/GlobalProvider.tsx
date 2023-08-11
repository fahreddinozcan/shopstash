import { CartProvider } from "./components/cart/CartContext";
import { RateProvider } from "./components/context/RateContext";
import { UserStateProvider } from "./components/context/UserStateContext";
import { auth, currentUser } from "@clerk/nextjs";

export async function GlobalProvider({ children }: { children: any }) {
  const { userId } = auth();
  const user = await currentUser();
  return (
    <UserStateProvider
      userId={userId}
      user={
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              emailAddress: user.emailAddresses[0],
            }
          : {
              firstName: "none",
              lastName: "none",
              username: "none",
              emailAddress: "none",
            }
      }
    >
      <CartProvider userId={userId}>
        <RateProvider userId={userId}>{children}</RateProvider>
      </CartProvider>
    </UserStateProvider>
  );
}
