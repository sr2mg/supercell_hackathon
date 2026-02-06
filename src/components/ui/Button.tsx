import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl border-2 border-black px-6 py-3 font-display font-bold text-black transition-all active:translate-y-0.5 active:shadow-none",
                    {
                        "bg-hot-pink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-hot-pink/90":
                            variant === "primary",
                        "bg-sunny-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-sunny-yellow/90":
                            variant === "secondary",
                        "bg-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black/5":
                            variant === "outline",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
