import { SVGProps } from "react";

export const BlueAddIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx="12" cy="12" r="10" fill="#768BDD" />
            <path
                d="M13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8L11 11H8C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H11L11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16L13 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H13L13 8Z"
                fill="#3352CC"
            />
        </svg>
    )
}
