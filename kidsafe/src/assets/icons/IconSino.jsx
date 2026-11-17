export default function IconSino(props) {
	return (
		<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<rect width="48" height="48" rx="8" fill="var(--blue-bg)" />
			<path
				d="M24 13c-3.9 0-7 3.1-7 7v4.5c0 1.4-.5 2.7-1.5 3.8l-1 1.1c-.6.7-.1 1.8.8 1.8h17.4c.9 0 1.4-1.1.8-1.8l-1-1.1c-1-1.1-1.5-2.4-1.5-3.8V20c0-3.9-3.1-7-7-7z"
				fill="var(--blue-primary)"
			/>
			<path
				d="M21 32.5a3 3 0 0 0 6 0"
				stroke="var(--blue-primary)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}
