import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
    direction?: "left" | "right";
}

const Callout = forwardRef<HTMLDivElement, CalloutProps>(
    ({ className, direction = "left", ...props }, ref) => {
        return (
            <div className={cn("relative mx-4 my-4", className)}>
                <div
                    ref={ref}
                    className="relative z-10 rounded-2xl border-2 border-black bg-white p-4"
                    {...props}
                />
                {/* Tail */}
                <div
                    className={cn(
                        "absolute -bottom-3 h-6 w-6 border-b-2 border-r-2 border-black bg-white",
                        {
                            "left-8 rotate-45": direction === "left",
                            "right-8 rotate-45": direction === "right",
                        }
                    )}
                />
            </div>
        );
    }
);
Callout.displayName = "Callout";

export { Callout };
