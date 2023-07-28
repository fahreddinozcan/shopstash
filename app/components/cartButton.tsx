import { FaCartShopping } from "react-icons/fa6";

const CartButton = ({
    id,
    cartItemIds,
    addItem,
    removeItem,
}: {
    id: number;
    cartItemIds: number[];
    addItem: (id: number) => Promise<void>;
    removeItem: (id: number) => Promise<void>;
}) => {
    return (
        <button
            className={`${
                cartItemIds.includes(id)
                    ? "bg-red-400 text-black"
                    : "bg-cyan-500 text-black"
            } rounded-full px-4 py-2 flex items-center justify-center gap-3 transition-all duration-300`}
            onClick={() => {
                cartItemIds.includes(id)
                    ? console.log("YES")
                    : console.log("NO");
                cartItemIds.includes(id) ? removeItem(id) : addItem(id);
            }}
        >
            <p className="text-sm font-bold">
                {cartItemIds.includes(id) ? "Remove from Cart" : "Add to Cart"}
            </p>
            <FaCartShopping size="25" />
        </button>
    );
};

export default CartButton;
