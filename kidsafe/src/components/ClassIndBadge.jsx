import { FiSlash, FiCheck, FiLock } from "react-icons/fi";
import { CLASSIND_RATINGS } from "../data/classIndData.js";

export default function ClassIndBadge({
	ratingId,
	size = "medium", // small | medium | large
	isBlocked = false,
	isClickable = false,
	onClick = null,
	showLabel = false,
	showStatus = false,
}) {
	const rating =
		CLASSIND_RATINGS.find((r) => r.id === String(ratingId).toUpperCase()) || {
			id: ratingId,
			code: ratingId,
			label: `${ratingId} anos`,
			fullName: `Classificação ${ratingId}`,
			bgColor: "#4b5563",
			textColor: "#ffffff",
			borderColor: "#374151",
		};

	return (
		<div
			className={`classind-badge-wrapper ${isClickable ? "is-clickable" : ""} ${
				isBlocked ? "is-blocked" : "is-allowed"
			}`}
			onClick={isClickable && onClick ? () => onClick(rating.id) : undefined}
			title={`${rating.fullName}${
				isBlocked ? " (Bloqueado no dispositivo)" : " (Permitido)"
			}`}
			role={isClickable ? "button" : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={
				isClickable && onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onClick(rating.id);
							}
					  }
					: undefined
			}
		>
			<div
				className={`classind-icon classind-icon--${size} ${
					isBlocked ? "classind-icon--blocked" : ""
				}`}
				style={{
					backgroundColor: rating.bgColor,
					color: rating.textColor,
					borderColor: rating.borderColor,
				}}
			>
				<span className="classind-code">{rating.code}</span>
				{isBlocked && (
					<span className="classind-block-overlay" aria-label="Bloqueado">
						<FiSlash className="classind-slash-icon" />
					</span>
				)}
			</div>

			{showLabel && (
				<div className="classind-info">
					<span className="classind-label">{rating.label}</span>
					{showStatus && (
						<span
							className={`classind-status-tag ${
								isBlocked ? "classind-status-tag--blocked" : "classind-status-tag--allowed"
							}`}
						>
							{isBlocked ? (
								<>
									<FiLock style={{ marginRight: "3px" }} /> Bloqueado
								</>
							) : (
								<>
									<FiCheck style={{ marginRight: "3px" }} /> Liberado
								</>
							)}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
