import { formatDuration } from "../../utils/format.js";

const fallbackWeekly = [
	{ domain: "youtube.com", seconds: 6 * 3600 + 28 * 60 },
	{ domain: "instagram.com", seconds: 21 * 3600 },
];

export default function AccessDetails({ data, weekly, onBack }) {
	const displayData = data && data.length > 0 ? data : [
		{ domain: "Instagram", visits: 5 },
		{ domain: "YouTube", visits: 2 },
	];
	const displayWeekly = weekly && weekly.length > 0 ? weekly : fallbackWeekly;
	const maxValue = Math.max(...displayData.map((item) => item.visits), 1);

	return (
		<div className="access-details">
			<button
				type="button"
				className="access-details__back"
				onClick={onBack}
				aria-label="Voltar"
			>
				←
			</button>

			<p className="access-card__title">Quantidade de acesso:</p>

			<div className="access-card__chart">
				{displayData.map((item, index) => (
					<div key={item.domain || index} className="access-card__bar-wrapper">
						<div
							className={`access-card__bar access-card__bar--${
								index === 0 ? "dark" : "light"
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

			<h3 className="access-details__subtitle">
				Sites mais acessados da semana:
			</h3>

			<ul className="access-details__list">
				{displayWeekly.map((site) => (
					<li key={site.domain}>
						<span className="access-details__site">{site.domain}</span>
						<span className="access-details__time">
							{formatDuration(site.seconds)}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
