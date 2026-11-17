const statusEl = document.getElementById("status");
const badgeEl = document.getElementById("badge");

const CLASSIND_LIST = [
	{ id: "L", code: "L", bg: "#00a859", text: "#ffffff" },
	{ id: "10", code: "10", bg: "#009fe3", text: "#ffffff" },
	{ id: "12", code: "12", bg: "#ffcc00", text: "#111111" },
	{ id: "14", code: "14", bg: "#f37021", text: "#ffffff" },
	{ id: "16", code: "16", bg: "#ed1c24", text: "#ffffff" },
	{ id: "18", code: "18", bg: "#111111", text: "#ffffff" },
];

const AGE_LABELS = {
	"0-9": "Até 9 anos",
	"10-11": "10 a 11 anos",
	"12-13": "12 a 13 anos",
	"14-16": "14 a 16 anos",
	"14-15": "14 a 16 anos",
};

chrome.storage.local.get(
	["pairingCode", "config", "blockedRatings", "childAgeGroup"],
	({ pairingCode, config, blockedRatings, childAgeGroup }) => {
		if (!pairingCode) {
			statusEl.textContent = "Iniciando dispositivo...";
			return;
		}

		const isLinked = config && config.status === "LINKED";
		if (isLinked) {
			badgeEl.textContent = "Protegido";
			badgeEl.className = "status-pill status-pill--online";

			const ratings =
				blockedRatings ||
				config.blockedRatings ||
				["12", "14", "16", "18"];
			const ageKey = childAgeGroup || config.childAgeGroup || "10-11";
			const ageLabel = AGE_LABELS[ageKey] || ageKey;

			let html = `
				<div class="hint" style="text-align: left; font-weight: 600; color: #15803d; margin-bottom: 6px;">
					Conectado à conta do responsável
				</div>
				<div class="age-info">
					<span>Faixa etária configurada:</span>
					<strong>${ageLabel}</strong>
				</div>

				<div class="section-title">Classificação Indicativa (ClassInd)</div>
				<div class="classind-grid">
			`;

			CLASSIND_LIST.forEach((item) => {
				const isBlocked = ratings.includes(item.id);
				html += `
					<div class="classind-item">
						<div class="classind-icon ${isBlocked ? "classind-icon--blocked" : ""}" style="background-color: ${item.bg}; color: ${item.text};">
							${item.code}
						</div>
						<span class="classind-status ${isBlocked ? "classind-status--blocked" : "classind-status--allowed"}">
							${isBlocked ? "Bloq." : "Ok"}
						</span>
					</div>
				`;
			});

			html += `
				</div>
				<p class="hint" style="margin-top: 12px; font-size: 0.75rem;">
					Tags HTML de idade verificadas automaticamente em todos os sites.
				</p>
			`;

			statusEl.innerHTML = html;
			return;
		}

		badgeEl.textContent = "Aguardando";
		badgeEl.className = "status-pill status-pill--pending";

		statusEl.innerHTML = `
			<p class="hint">Digite este código no painel do responsável para vincular este dispositivo:</p>
			<p class="code">${pairingCode}</p>
			<p class="hint">A tela perguntará a idade da criança para calibrar as classificações indicativas antes de concluir.</p>
		`;
	}
);
