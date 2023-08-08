import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import CartProvider from "./components/cart/CartContext";
import { GlobalProvider } from "./GlobalProvider";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ShopStash",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <GlobalProvider>
                <html lang="en">
                    <body className="bg-white">
                        <Header />
                        <main className="container bg-white">
                            <div className="flex items-start justify-center min-h-screen  ">
                                <div className="mt-5">{children}</div>
                            </div>
                        </main>
                        <Toaster />
                    </body>
                </html>
            </GlobalProvider>
        </ClerkProvider>
    );
}
