# Using Upstash Redis and Clerk for Session Store

One of the main use cases of Redis is storing and managing user sessions to maintain the state across requests in web applications. This can be achieved in various ways, and some of the recent serverless tools provides us amazing ways to make it even easier than ever.

### Project Description

In this blogpost, we will use [Clerk](https://clerk.com), Next.js and Upstash Redis to build a session store for a shopping application. Here are the features to be implemented in this project:

- Users will be able to perform sign-up, sign-in and sign-out actions.
- Each user can add, remove items to their unique carts. Also changing item quantities in cart and checking out is possible.

This project has some other features related to QStash and Upstash Ratelimit:

* Certain actions within the application will initiate events, leading to the scheduling of emails through QStash. These emails will subsequently be dispatched by Resend. For instance, upon checking out, a shipping confirmation email is scheduled to be sent 24 hours later. Similarly, after purchasing an item, users will receive a prompt after a certain period, encouraging them to rate their purchase.
* Users also have the option to rate items. All rating data is meticulously stored in appropriate data structures on Upstash Redis. To ensure a balanced flow of user interactions and prevent any potential misuse, the rating event is governed by the rate-limiting capabilities of Upstash Ratelimit.

### Demo

You can see the deployed demo of the project [here](https://shopstash.vercel.app/).

You can also reach the Github repository of this project [here](https://github.com/upstash/examples)

### Creating the Next.js Application

Open a new terminal window, and create the application with prompt below:

```
npx create-next-app@latest
```

This will ask you for the project options, and you'll have your Next.js project template ready.

```text
npx create-next-app@latest
Need to install the following packages:
  create-next-app@13.4.18
Ok to proceed? (y) y
✔ What is your project named? shopstash
✔ Would you like to use TypeScript? No / -> Yes
✔ Would you like to use ESLint? No / -> Yes
✔ Would you like to use Tailwind CSS? No / -> Yes
✔ Would you like to use `src/` directory? -> No / Yes
✔ Would you like to use App Router? (recommended) No / -> Yes
✔ Would you like to customize the default import alias? -> No / Yes
Creating a new Next.js app in /Users/***/shopstash.
```

### Integrating Clerk

Adding Clerk to a project is fairly simple. We'll use Clerk's Next.js SDK for prebuilt components and hooks. First, lets install it:

```
npm install clerk@nextjs
```

Then, we'll create our application on [Clerk dashboard](https://dashboard.clerk.com/). You can do the the configuration for required sign-up info, based on your choice. Once you create the app, the necessary credentials will be prompted. We'll copy these to `.env.local` file. Here's an example:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_********
CLERK_SECRET_KEY=sk_test_********
```

We'll also configure the paths for the Clerk in the '.env.local' file.

```text
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Now, to use the active session and user contexts, we'll wrap the root layout with `<ClerkProvider>`. Deeper into this tutorial, we'll also implement the `Header` component.

```tsx layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-white">
          <Header />
          <main className="container bg-white">
            <div className="flex items-start justify-center min-h-screen  ">
              <div className="mt-5">{children}</div>
            </div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

Now, Clerk is installed on our project. The next step is to decide which pages to hide behind the authentication. We'll perform this operation in the `middleware.tsx` file placed in the root folder.

```tsx middleware.tsx
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

With this, the whole application is protected. If you try to access any page without signing in, you'll be redirected to the index page for authentication.

At this point, our app needs the sign-up and sign-in pages. We're going to provide the navigation to these files from the Header and this component will be rendered based on the active user. If there's an active user, then user will be able to sign-out and see their profile. Else, sign-in and sign-up routes will be shown.

```tsx Header.tsx
import { auth, UserButton, useClerk } from "@clerk/nextjs";

const Header = () => {
  const { userId } = auth();
  const { signOut } = useClerk();

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
              <Link
                href="/sign-in"
                className="text-gray-300 hover:text-white mr-5"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-gray-300 hover:text-white mr-5"
              >
                Sign Up
              </Link>
            </>
          )}

          {userId && (
            <>
              <button
                onClick={() => {
                  signOut();
                }}
                className="mr-5"
              >
                Sign Out
              </button>
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
```

Here's the state of the header without an active user:

![Header](images/header.png)

The final step is to build the necessary routes for the user actions. For this project, we'll use the builtin Clerk sign-up/sign-in components, but you can also create customized page design for unique user signing flows. For sign-up, we're going to create the `app/sign-in/[[...sign-up]]/page.tsx` route.

```tsx app/sign-in/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <>
      <SignUp />
    </>
  );
};
export default SignUpPage;
```

Sign up page is almost identical to sign in, and we'll implement it in a similar path.

```tsx app/sign-in/[[...sign-up]]/page.tsx
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <>
      <SignIn />
    </>
  );
};
export default SignInPage;
```

With the successful integration of Clerk into our project, we are now primed to advance further. The active user feature is in place, setting the stage for us to establish a unique session store on Redis for each distinct user. Our strategy involves retrieving the user ID from Clerk and subsequently storing the session data for said user on Upstash Redis. To illustrate the process, let's consider building a shopping cart. Here, every individual session will retain its respective cart item data.

First and foremost, we need to conceptualize what constitutes a cart item. This will serve as our blueprint as we craft the rest of the application. If you're looking to populate your application with a diverse range of items, tools like ChatGPT can be invaluable. Alternatively, a more direct approach would involve sourcing them from the GitHub repository associated with this example. And, of course, to truly bring your frontend to life, you'll need to design or source suitable image for each item.

```tsx public/items.tsx
export const items = [
  {
    id: 1,
    title: "Elegant Leather Watch",
    image: "/images/1.png",
    description: "A sophisticated leather watch for all occasions.",
    company: "Timepiece Creations",
    price: 99.99,
  },
];
```

### Implementing Shopping Cart

In a typical shopping application, a user's cart should be accessible from multiple sections. This allows the relevant components to render based on the cart's contents. For instance, whether you're on an individual item's detail page or viewing a list of all items, you should be able to see if a product is already in your cart. Here's a sneak peek of how our example will appear:

![Shop Index](images/shop-index.png)

To make this possible, we're going to use the React Context API, offering access to necessary cart operations (like adding items, removing them, or resetting the cart) on a semi-global scale.

To set up the connection to Upstash Redis, we'll copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` values from the Console and paste them into your `.env` file.

```text .env
UPSTASH_REDIS_REST_URL=<YOUR_URL>
UPSTASH_REDIS_REST_TOKEN=<YOUR_TOKEN>
```

Our Cart Context will be placed in the `app/context/CartContext.tsx` file. We'll wrap this context around the main application, enabling us to use the methods it provides. Here's a quick rundown of the capabilities:

* Users can add items to their cart and adjust quantities.
* Items can be removed from the cart.
* Entire carts can be reset.
* There's also a checkout feature.
Here's an overarching view of the context API. We'll break down and implement each method step by step.

```tsx contexts/CartContext.tsx
interface CartContextProps {
  cart: Item[];
  cartItems: cartContent;
  addItem: (id: number) => Promise<void>;
  checkout: () => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  resetCart: () => {};
}

type cartContent = {
  [key: string]: number;
};

const CartContext = createContext<CartContextProps>({
  cart: [],
  cartItemIDs: {},
  addItem: async (id: number) => {},
  checkout: async () => {},
  removeItem: async (id: number) => {},
  resetCart: async () => {},
});

const mapIdsToObjects = (
  products: Item[],
  cartItemsIDs: cartContent
): Item[] => {
  const mappedItems: Item[] = [];
  for (const id of Object.keys(cartItemIDs)) {
    const product = products.find((p) => p.id === parseInt(id));
    if (product && cartItems?.hasOwnProperty(id)) {
      mappedItems.push(product);
    }
  }

  return mappedItems;
};

export const CartProvider: any = ({
  children,
  userId,
}: {
  children: any;
  userId: string;
}) => {
  let itemCount = 0;
  const [cart, setCart] = useState<Item[]>([]);
  const [cartItemIDs, setCartItemIDs] = useState<cartContent>({});

  useEffect(() => {
    fetchCartItems();
  }, []);

  //On the page load, the cart data will be retrieved from Upstash Redis, and the state will be edited
  const fetchCartItems = async () => {
    const flatitems = await redis.hgetall(`user:${userId}`);

    setCartItemIDs(flatitems as cartContent);
    setCart(mapIdsToObjects(items, flatitems as cartContent));
  };

  const addItem = async (id: number) => {
    /// to be implemented further in the blog
  };

  const removeItem = async (id: number, force: boolean = false) => {
    /// to be implemented further in the blog
  };

  //The cart will be resetted by deleting the related key from Redis DB, and setting the state to empty objects.
  const resetCart = async () => {
    redis.del(`user:${userId}`);
    setCart([]);
    setCartItemIDs({});
  };

  const checkout = async () => {
    resetCart();
  };

  return (
    <CartContext.Provider
      value={{
        addItem,
        removeItem,
        cartItems,
        checkout,
        resetCart,
        cart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
```

Here's how the algorithm works in the higher overview. 
* The cart, treated as a session store, will be hold in a hash on Upstash Redis. The unique identifier for this hash will be based on the user's ID, so each user will have a cart named in the format of `cart:<USER_ID>`.
* When saving cart data to the Redis hash, we'll use item IDs as keys and the quantity of each item as values. Thanks to Redis's built-in commands, modifying the cart becomes a breeze.
* On the client side, the cart will be managed as a state consisting of an array of Item objects. When a page is loaded, the `useEffect` hook fetches the cart data from Upstash Redis. Should there be any alterations to the cart, all relevant components get rerendered.
* Redis's straightforward data structures simplify the implementation of `addItem` and `removeItem` functionalities. By deploying the `redis.hincrby()` command, we can handle tasks ranging from adding or removing items to adjusting item quantities within the cart. This utility underscores Redis's prowess. 
* For the `resetCart` function, we'll just delette the hash's key from the Upstash database using `redis.del()`.

Now that you've grasped the cart's conceptual outline, it's time to roll up our sleeves and get into the  core methods.

### Add Item to Cart

From Redis hash's viewpoint, adding an item or augmenting its quantity employs the same command. The `hincrby` command either creates the key and sets its value to 1 or amplifies the relevant value based on the `increment` parameter of command.

On the client-side, we'll mirror these actions by either introducing a fresh item or tweaking the quantity in the cart's state. 

```tsx
const addItem = async (id: number) => {
    
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const doesItemExist = cart.some((i) => {
      return id === i.id;
    });

    let newCart: Item[];

    if (!doesItemExist) {

      newCart = [...(cart || []), item];
      redis.hincrby(`user:${userId}`, id.toString(), 1);

      //We create an item in the state object with the given id, and set the quantity to 1.
      const newCartItemIDs = { ...cartItems, [id]: 1 };

      setCartItemIDs(newCartItemIDs);
      setCart(newCart);
    } else {
      const item = items.find((i) => i.id === id);

      //This item currently exists in the state object as key, so we increase the value by 1.
      const updatedItemQuantities = {
        ...cartItems,
        [id]: cartItems[id] + 1,
      };

      setCartItems(updatedItemQuantities);
      redis.hincrby(`user:${userId}`, id.toString(), 1);
    }
  };
```

### Removing Item from the Cart

Removing is similar to the adding operation. You can decrease a hash value using `hincrby`, by giving the `increment` parameter as `-1`. 

```tsx
const removeItem = async (id: number, force: boolean = false) => {
    const doesItemExist = cart.some((i) => {
      return id === i.id;
    });

    if (!doesItemExist) return;

    if (cartItems[id] === 1 || force) {
      const newCart: Item[] = cart.filter((item: { id: number }) => {
        return item.id !== id;
      });

      // Creating the new state object for cart 
      const newCartItems = { ...cartItems };
      delete newCartItems[id];

      //Removing the item from Upstash Redis hashset.
      redis.hdel(`user:${userId}`, id.toString());

      setCart(newCart);
      setCartItems(newCartItems);

    } else if (cartItems[id] > 1) {
      const updatedItemQuantities = {
        ...cartItems,
        [id]: cartItems[id] - 1,
      };

      setCartItems(updatedItemQuantities);
      redis.hincrby(`user:${userId}`, id.toString(), -1);
    }
  };
```

The cart functionality is now in place, complete with all essential methods. It's seamlessly integrated throughout the project with global access. Here's a look at two illustrative use cases for this feature:

* **Index Page**: Here, all the items are displayed. Unique buttons accompany each item, letting you add them to your cart. If a product is already nestled in your cart, you'll have the option to remove it.

* We'll use `shadcnui` React UI library, and build a modal/sheet that consolidates all the items in the cart on single page. This space isn't just for browsing; you can modify item quantities as needed.  And if you're feeling changeable, the options to reset the cart or proceed to checkout are right there.

### Index Page

A point of note: items on the index page are showcased exclusively for active, signed-in users. First, we fetch the user data from Clerk, post which the corresponding components spring to life.

```tsx app/index.tsx
import { currentUser } from "@clerk/nextjs";
import CardComponent from "./components/ui/card";
import Cart from "./components/cart/cart";
import { items } from "@/public/items";

export default async function Home() {
    const user = await currentUser();

    //If there's no active user, we simply ask user to sign in. 
    if (!user)
        return (
            <div>
                <h1 className="text-2xl font-semibold mt-10">
                    Please sign in to start shopping!
                </h1>
            </div>
        );
    //If user has signed in, we render the shop items and the cart.
    return (
        <div className="">
            <div className="flex items-center justify-between mb-5 mt-5 align-center">
                <h1 className="text-2xl mb-5 align-center">
                    Welcome to shop,
                    <span className=" font-bold"> {user?.firstName}</span>
                </h1>
                <div className="flex align-self-begin justify-self-begin">
                    <Cart />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {items.map((item) => {
                    return <CardComponent item={item} key={item.id} />;
                })}
            </div>
        </div>
    );
}
```

In the card component, we'll just retrieve the necessary functions and objects CartContext.

```tsx
export default function CardComponent(props: { item: cardProps }) {
  const { item } = props;
  const { id, title, image, company } = item;
  const { addItem, removeItem, cartItems } = useContext(CartContext);
  
  return (
    <>
      <Card className="hover:shadow-lg transition duration-200">
        <Link href={`/products/${id}`}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Image src={image} alt={title} width={300} height={300}></Image>
            <CardDescription>{company}</CardDescription>
          </CardContent>
        </Link>
        <CardFooter>
          <div className="grid grid-rows-2">
            <CartButton
              id={id}
              cartItems={cartItems}
              addItem={addItem}
              removeItem={removeItem}
            />
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
```

The important component here is the cart button, where you can add or remove the item from the cart. This button will be rendered using the current state of the cart. 

```tsx 
const CartButton = ({
  id,
  cartItems,
  addItem,
  removeItem,
}: {
  id: number;
  cartItems: cartContent;
  addItem: (id: number) => Promise<void>;
  removeItem: (id: number, force: boolean) => Promise<void>;
}) => {
  const itemExists: boolean = cartItems?.hasOwnProperty(id);
  const { triggerEvent } = useContext(UserStateContext);
  return (
    <button
      className={`${
        itemExists ? "bg-red-400 text-black" : "bg-cyan-500 text-black"
      } rounded-full px-4 py-2 flex items-center justify-center gap-3 transition-all duration-300`}
      onClick={() => {
        if (itemExists) {
          removeItem(id, true);
        } else {
          addItem(id);
        }
      }}
    >
      <p className="text-sm font-bold">
        {itemExists ? "Remove from Cart" : "Add to Cart"}
      </p>
      <FaCartShopping size="25" />
    </button>
  );
};
```

Now that our cart's state is dynamic, it can prompt specific component renderings based on its current status. Next, we'll introduce a dedicated cart component. This space will serve as the epicenter for viewing the entirety of the cart's contents, making quantity adjustments, or hitting the reset button.

We're turning to the [shadcn/ui sheet component](https://ui.shadcn.com/docs/components/sheet) as our base, with plans to personalize its interior.

In scenarios where the cart stands vacant, the component paints a clear picture of the situation:

![Empty cart](images/cart-empty.png)

However, as items trickle into the cart, they become readily visible in this component. Not only can you see your selections, but you also have the freedom to tweak quantities or gauge the collective value of your items.

![Cart](images/cart.png)

For a full walkthrough of this component's creation, take a look below. If you're hunting for minutiae, like button configurations, I'd recommend heading over to our GitHub repository, where the entirety of the codebase is at your use.

```tsx
export default function Cart() {
  const { addItem, removeItem, resetCart, cart, cartItems, checkout } =
    useContext(CartContext);
  cart.sort((a: Item, b: Item) => {
    return a.id - b.id;
  });
  return (
    <>
      <Sheet>
        <SheetTrigger className="border border-gray-400 p-2 rounded-md">
          <FaCartShopping size="30" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <div className="">
                <p className="text-3xl mb-6">My Cart</p>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="h-[100%] flex flex-col justify-end align-end">
            {!cart || cart.length === 0 ? (
              <div className="h-full mt-20 flex  flex-col items-center justify-start ">
                <FaCartShopping size="75" />
                <p className="mt-6 text-center text-2xl font-bold">
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <div className="flex  flex-col justify-between  py-4 h-[100%]  ">
                <ul className="h-[78.7%] w-[100%] overflow-scroll ">
                  {cart.map((item) => {
                    return (
                      <li
                        className="gap-3 w-[95%]  border-b border-neutral-300 dark:border-neutral-700 py-4 px-2 grid grid-flow-col grid-cols-min transition-all ease-in-out"
                        key={item.id}
                      >
                        <div>
                          <Link
                            href={`products/${item.id}`}
                            className="z-30 flex  space-x-4 align-center"
                          >
                            <div className="relative h-full w-[4.5rem] cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                              <Image
                                className="h-full w-full object-cover "
                                width={68}
                                height={68}
                                alt={item.title}
                                src={item.image}
                              />
                            </div>
                          </Link>
                          <div className="relative  mt-[-77px] ml-[60px]">
                            <DeleteItemButton
                              deleteItem={removeItem}
                              id={item.id}
                            />
                          </div>
                        </div>

                        <div className=" flex  flex-col text-base">
                          <span className="leading-tight">{item.title}</span>
                        </div>
                        <div className="grid grid-flow-row grid-rows-2">
                          <div className="flex  justify-end space-y-2 text-right text-m font-bold">
                            ${item.price}
                          </div>

                          <QuantityButton
                            addItem={addItem}
                            removeItem={removeItem}
                            id={item.id}
                            quantity={cartItems[item.id]}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div
                  className="flex flex-col align-center justify-center  gap-6 "
                  key="reset"
                >
                  <div className="flex justify-between border-t border-b border-neutral-500 py-4">
                    <p className="font-bold">TOTAL</p>
                    <p>
                      $
                      {cart
                        .reduce(
                          (acc, item) => acc + cartItems[item.id] * item.price,
                          0
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-center flex-row gap-4">
                    <button
                      className="rounded-full bg-black box-border px-4 py-2 mb-4  "
                      onClick={() => {
                        resetCart();
                      }}
                    >
                      <p className="text-white box-content font-bold">
                        RESET CART
                      </p>
                    </button>
                    <button
                      className="rounded-full bg-blue-500 box-border px-4 py-2 mb-4"
                      onClick={() => {
                        checkout();
                      }}
                    >
                      <p className="text-white box-content font-bold">
                        CHECKOUT
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

With that final snippet of code, our project reaches its conclusion. We've successfully journeyed from concept to implementation, bringing our cart feature to life using the power of Upstash Redis and the flexibility of the shadcn/ui library.

### Conclusion

The combination of Clerk for user management and Upstash Redis for efficient data storage has been instrumental in the creation of our dynamic cart system. Together, they've formed the backbone of our application, ensuring both security and performance. This project stands as a testament to the sheer prowess of these tools and the potential that can be unlocked when they're synergistically combined.

Here are some suggestions for further improvements on this project:

* **User Experience:** While we've established a robust and functional cart, delving deeper into user interface enhancements—animations, feedback loops, or even detailed product previews—could provide an even more seamless user journey.

* **Performance:** With the foundational use of Upstash Redis, we can further delve into advanced caching strategies, perhaps integrating service workers for improved load times and a richer offline experience.

* **Features:** Expanding the cart's capabilities with wishlists, tailored product recommendations based on current cart contents, or a system for applying promotional codes could elevate the shopping experience.

* **Integration:** There's potential to integrate payment gateways for a smooth checkout process or even interface with third-party inventory or CRM systems for a comprehensive eCommerce solution.

Thank you for following along this development adventure. . We're eager to hear your feedback and would love to see the innovations you might bring to this foundational structure! Should you have any questions or problems about this project, feel free to get in contact with me at fahreddin@upstash.com. 