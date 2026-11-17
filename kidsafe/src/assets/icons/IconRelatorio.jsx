export default function IconRelatorio(props) {
	return (
		<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<rect width="48" height="48" rx="8" fill="var(--blue-bg)" />
			<path
				d="M24 12l12 21H12l12-21z"
				fill="var(--blue-primary)"
				strokeLinejoin="round"
			/>
			<rect x="22.6" y="21" width="2.8" height="7.5" rx="1.4" fill="var(--blue-bg)" />
			<circle cx="24" cy="31.5" r="1.6" fill="var(--blue-bg)" />
		</svg>
	);
}
