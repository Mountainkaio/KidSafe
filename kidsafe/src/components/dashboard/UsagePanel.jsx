import { formatDuration } from "../../utils/format.js";

const CIRCLE_CIRCUMFERENCE = 251.2; // 2 * PI * 40
const DAILY_LIMIT_SECONDS = 4 * 3600; // referência só para desenhar o anel

const fallbackApps = [
	{ domain: "Instagram", seconds: 3 * 3600, tone: "dark" },
	{ domain: "YouTube", seconds: 54 * 60, tone: "light" },
];

export default function UsagePanel({ apps, totalSeconds }) {
	const displayApps = apps && apps.length > 0 ? apps : fallbackApps;
	const displayTotal =
		totalSeconds ??
		displayApps.reduce((sum, app) => sum + app.seconds, 0);

	const usedFraction = Math.min(displayTotal / DAILY_LIMIT_SECONDS, 1);
	const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - usedFraction);

	return (
		<div className="usage-card">
			<div className="usage-card__header">
				<div>
					<p className="usage-card__label">Tempo de uso hoje:</p>
					<p className="usage-card__time">{formatDuration(displayTotal)}</p>
				</div>

				<svg className="usage-card__ring" viewBox="0 0 100 100">
					<circle cx="50" cy="50" r="40" className="usage-card__ring-track" />
					<circle
						cx="50"
						cy="50"
						r="40"
						className="usage-card__ring-progress"
						strokeDasharray={CIRCLE_CIRCUMFERENCE}
						strokeDashoffset={dashOffset}
					/>
				</svg>
			</div>

			<ul className="usage-card__apps">
				{displayApps.map((app, index) => (
					<li key={app.domain}>
						<span
							className={`usage-card__dot usage-card__dot--${
								app.tone || (index === 0 ? "dark" : "light")
							}`}
						/>
						<span className="usage-card__app-name">{app.domain}</span>
						<span className="usage-card__app-time">
							{formatDuration(app.seconds)}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
