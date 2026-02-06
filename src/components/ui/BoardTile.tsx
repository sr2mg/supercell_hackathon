import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BoardTileProps extends HTMLAttributes<HTMLDivElement> {
    color?: "pink" | "yellow" | "blue" | "green" | "orange" | "lavender" | "white";
}

const BoardTile = forwardRef<HTMLDivElement, BoardTileProps>(
    ({ className, color = "white", children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex aspect-square flex-col items-center justify-between border-2 border-black p-2 text-center text-xs font-bold sm:text-sm",
                    {
                        "bg-hot-pink": color === "pink",
                        "bg-sunny-yellow": color === "yellow",
                        "bg-bright-blue": color === "blue",
                        "bg-teal-green": color === "green",
                        "bg-coral-orange": color === "orange",
                        "bg-lavender": color === "lavender",
                        "bg-paper-white": color === "white",
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
BoardTile.displayName = "BoardTile";

export { BoardTile };
