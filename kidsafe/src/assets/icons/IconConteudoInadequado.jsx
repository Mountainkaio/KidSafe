export default function IconConteudoInadequado(props) {
	return (
		<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<rect width="48" height="48" rx="8" fill="var(--blue-bg)" />
			<circle cx="24" cy="24" r="10" fill="#dc2626" />
			<line
				x1="17.5"
				y1="17.5"
				x2="30.5"
				y2="30.5"
				stroke="var(--blue-bg)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
	);
}
