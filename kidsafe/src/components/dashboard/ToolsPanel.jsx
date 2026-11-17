import { useState } from "react";
import MessageModal from "./MessageModal.jsx";
import BlockedSitesModal from "./BlockedSitesModal.jsx";
import BlockedKeywordsModal from "./BlockedKeywordsModal.jsx";
import LockConfirmModal from "./LockConfirmModal.jsx";
import PauseExtensionModal from "./PauseExtensionModal.jsx";
import AgeRatingsModal from "./AgeRatingsModal.jsx";
import ClassIndBadge from "../ClassIndBadge.jsx";
import { CLASSIND_RATINGS } from "../../data/classIndData.js";

export default function ToolsPanel({ device, onDeviceUpdated }) {
	const [openTool, setOpenTool] = useState(null);

	const blockedRatings = Array.isArray(device?.blockedRatings)
		? device.blockedRatings
		: (device?.blockedRatings || "12,14,16,18")
				.split(",")
				.map((r) => r.trim())
				.filter(Boolean);

	return (
		<div className="tools-panel">
			<ul className="tools-panel__list">
				<li>
					<button type="button" onClick={() => setOpenTool("mensagem")}>
						Mensagem de aviso
					</button>
				</li>
				<li>
					<button type="button" onClick={() => setOpenTool("sites")}>
						Gerenciar sites e categorias bloqueadas
					</button>
				</li>
				<li>
					<button type="button" onClick={() => setOpenTool("palavras")}>
						Palavras-chave bloqueadas
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => setOpenTool("classind")}
						className="tools-panel__btn-classind"
					>
						<div className="tools-panel__btn-classind-header">
							<span>Classificação Indicativa (ClassInd)</span>
							<span className="tools-panel__badge-count">
								{blockedRatings.length} bloqueada(s)
							</span>
						</div>
						<div className="tools-panel__classind-badges">
							{CLASSIND_RATINGS.map((rating) => (
								<ClassIndBadge
									key={rating.id}
									ratingId={rating.id}
									size="small"
									isBlocked={blockedRatings.includes(rating.id)}
								/>
							))}
						</div>
					</button>
				</li>
				<li>
					<button type="button" onClick={() => setOpenTool("bloquear")}>
						{device?.lockScreen ? "Desbloquear tela" : "Bloquear tela"}
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => setOpenTool("pausar")}
						style={
							device?.extensionEnabled === false
								? { opacity: 0.6 }
								: undefined
						}
					>
						{device?.extensionEnabled === false
							? "Retomar extensão"
							: "Pausar extensão"}
					</button>
				</li>
			</ul>

			{openTool === "mensagem" && (
				<MessageModal
					deviceId={device?.id}
					onClose={() => setOpenTool(null)}
				/>
			)}

			{openTool === "sites" && (
				<BlockedSitesModal
					sites={device?.blockedSites || []}
					categories={device?.customCategories || ["Geral"]}
					deviceId={device?.id}
					device={device}
					onClose={() => setOpenTool(null)}
					onChanged={(updated) =>
						onDeviceUpdated({ ...device, ...updated })
					}
				/>
			)}

			{openTool === "palavras" && (
				<BlockedKeywordsModal
					keywords={device?.blockedKeywords || []}
					deviceId={device?.id}
					device={device}
					onClose={() => setOpenTool(null)}
					onChanged={(blockedKeywords) =>
						onDeviceUpdated({ ...device, blockedKeywords })
					}
				/>
			)}

			{openTool === "classind" && (
				<AgeRatingsModal
					device={device}
					deviceId={device?.id}
					onClose={() => setOpenTool(null)}
					onChanged={(updated) =>
						onDeviceUpdated({ ...device, ...updated })
					}
				/>
			)}

			{openTool === "bloquear" && (
				<LockConfirmModal
					currentlyLocked={device?.lockScreen}
					deviceId={device?.id}
					onClose={() => setOpenTool(null)}
					onChanged={onDeviceUpdated}
				/>
			)}

			{openTool === "pausar" && (
				<PauseExtensionModal
					currentlyEnabled={device?.extensionEnabled !== false}
					deviceId={device?.id}
					onClose={() => setOpenTool(null)}
					onChanged={onDeviceUpdated}
				/>
			)}
		</div>
	);
}