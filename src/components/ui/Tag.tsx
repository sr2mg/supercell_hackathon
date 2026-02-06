import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TagProps extends HTMLAttributes<HTMLDivElement> {
    color?: "pink" | "yellow" | "blue" | "green" | "orange" | "lavender" | "white";
}

const Tag = forwardRef<HTMLDivElement, TagProps>(
    ({ className, color = "white", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border-2 border-black px-3 py-1 font-sans text-sm font-bold text-black",
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
            />
        );
    }
);
Tag.displayName = "Tag";

export { Tag };
