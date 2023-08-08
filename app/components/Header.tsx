import Link from "next/link";
import { auth, UserButton } from "@clerk/nextjs";
import Cart from "./cart/cart";
import SignOutButton from "./signOutButton";

const Header = () => {
    const { userId } = auth();

    console.log(userId);

    return (
        <>
            <nav className="bg-teal-500 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/">
                        <div className="text-lg uppercase font-bold text-white">
                            ShopStash
                        </div>
                    </Link>
                </div>
                <div className="text-white flex items-center">
                    {!userId && (
                        <>
                            {/* <Cart /> */}
                            {/* <Link
                                href="dashboard"
                                className="text-gray-300 hover:text-white mr-5"
                            >
                                Dashboard
                            </Link> */}
                            {/* <Link
                                href="register"
                                className="text-gray-300 hover:text-white mr-5"
                            >
                                Send Mail
                            </Link> */}
                            {/* <button
                                onClick={async () => {
                                    fetch("/api/send");
                                }}
                            >
                                Send Mail
                            </button> */}

                            <Link
                                href="sign-in"
                                className="text-gray-300 hover:text-white mr-5"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="sign-up"
                                className="text-gray-300 hover:text-white mr-5"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}

                    {userId && (
                        <>
                            <SignOutButton />
                            <Link
                                href="profile"
                                className="text-gray-100 hover:text-white mr-6"
                            >
                                Profile
                            </Link>
                        </>
                    )}
                    <div className="ml-auto">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;
