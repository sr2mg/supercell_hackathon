import { SVGProps } from "react";

interface PlayerTokenProps extends SVGProps<SVGSVGElement> {
    color: string;
}

export function PlayerToken({ color, ...props }: PlayerTokenProps) {
    return (
        <svg
            viewBox="0 0 132 129"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M66 2.5C101.125 2.5 129.5 30.3122 129.5 64.5C129.5 98.6878 101.125 126.5 66 126.5C30.8754 126.5 2.5 98.6878 2.5 64.5C2.5 30.3122 30.8754 2.5 66 2.5Z"
                fill="white"
                stroke="black"
                strokeWidth="5"
            />
            <path
                d="M66 11.5C96.1628 11.5 120.5 35.2913 120.5 64.5C120.5 93.7087 96.1628 117.5 66 117.5C35.8372 117.5 11.5 93.7087 11.5 64.5C11.5 35.2913 35.8372 11.5 66 11.5Z"
                fill={color}
                stroke="black"
                strokeWidth="5"
            />
        </svg>
    );
}
