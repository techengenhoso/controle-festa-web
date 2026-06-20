import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
	ButtonHTMLAttributes<HTMLButtonElement> & {
		variant?: "primary" | "secondary" | "danger" | "ghost";
	}
>;

export function Button({
	children,
	className = "",
	variant = "primary",
	...props
}: ButtonProps) {
	return (
		<button
			className={`btn btn-${variant} ${className}`.trim()}
			type="button"
			{...props}
		>
			{children}
		</button>
	);
}
