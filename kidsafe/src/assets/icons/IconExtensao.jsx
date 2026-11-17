export default function IconExtensao(props) {
	return (
		<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<rect width="48" height="48" rx="8" fill="var(--blue-bg)" />
			<path
				d="M24 14v20M14 24h20"
				stroke="var(--blue-primary)"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}
