const fallbackData = [
	{ domain: "Instagram", visits: 5, tone: "dark" },
	{ domain: "YouTube", visits: 2, tone: "light" },
];

export default function AccessChart({ data, onOpenDetails }) {
	const displayData = data && data.length > 0 ? data : fallbackData;
	const maxValue = Math.max(...displayData.map((item) => item.visits), 1);

	return (
		<button
			type="button"
			className="access-card"
			onClick={onOpenDetails}
			aria-label="Abrir relatório detalhado de acessos"
		>
			<div className="access-card__header">
				<div>
					<p className="access-card__title">Quantidade de acesso</p>
					<span className="access-card__subtitle">
						Clique para ver detalhes
					</span>
				</div>
				<span className="access-card__badge">
					Ver detalhes
					<svg
						className="access-card__badge-icon"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</span>
			</div>

			<div className="access-card__chart">
				{displayData.map((item, index) => (
					<div key={item.domain || index} className="access-card__bar-wrapper">
						<div
							className={`access-card__bar access-card__bar--${
								item.tone || (index === 0 ? "dark" : "light")
							} ${item.visits === 0 ? "access-card__bar--zero" : ""}`}
							style={{
								height: `${
									item.visits > 0
										? Math.max((item.visits / maxValue) * 100, 14)
										: 10
								}%`,
							}}
							title={`${item.domain || "Site"}: ${item.visits} acessos`}
						>
							<span className="access-card__value">{item.visits}</span>
						</div>
					</div>
				))}
			</div>

			<div className="access-card__axis" />

			<div className="access-card__footer">
				<span className="access-card__footer-cta">
					Toque para abrir histórico completo →
				</span>
			</div>
		</button>
	);
}
