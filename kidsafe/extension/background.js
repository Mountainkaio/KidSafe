const API_URL = "http://localhost:3333";
const SYNC_ALARM = "kidsafe-sync";
const EVENT_SYNC_THROTTLE_MS = 15000;
let lastEventSync = 0;

/* ---------- Domínios e padrões de conteúdo adulto (18+) ---------- */
const ADULT_DOMAINS_18 = [
	"pornhub.com",
	"rule34.xxx",
	"xvideos.com",
	"xnxx.com",
	"redtube.com",
	"youporn.com",
	"chaturbate.com",
	"onlyfans.com",
	"xhamster.com",
	"brazzers.com",
	"spankbang.com",
	"tube8.com",
	"stripchat.com",
	"livejasmin.com",
	"cam4.com",
	"nhentai.net",
	"hentaihaven.xxx",
	"rule34.paheal.net",
	"gelbooru.com",
	"danbooru.donmai.us",
	"e-hentai.org",
];

/* ---------- Inicialização de estado padrão ---------- */
async function initDefaultStorage() {
	const stored = await chrome.storage.local.get([
		"blockedRatings",
		"childAgeGroup",
		"extensionEnabled",
		"blockedSites",
	]);
	const updates = {};
	if (!stored.blockedRatings || stored.blockedRatings.length === 0) {
		updates.blockedRatings = ["10", "12", "14", "16", "18"];
	}
	if (!stored.childAgeGroup) {
		updates.childAgeGroup = "10-11";
	}
	if (stored.extensionEnabled === undefined) {
		updates.extensionEnabled = true;
	}
	if (Object.keys(updates).length > 0) {
		await chrome.storage.local.set(updates);
	}
	await updateBlockingRules(
		stored.blockedSites || [],
		updates.blockedRatings || stored.blockedRatings || ["10", "12", "14", "16", "18"]
	);
}

initDefaultStorage();

/* ---------- Registro do dispositivo ---------- */

async function ensureRegistered() {
	const { deviceToken } = await chrome.storage.local.get("deviceToken");
	if (deviceToken) return;

	const response = await fetch(`${API_URL}/api/devices/register`, {
		method: "POST",
	});
	const data = await response.json();

	await chrome.storage.local.set({
		deviceId: data.deviceId,
		deviceToken: data.deviceToken,
		pairingCode: data.pairingCode,
	});
}

function startAlarm() {
	// 0.5 = 30s (válido em extensão descompactada/em desenvolvimento;
	// o Chrome empacotado arredonda para 1 min)
	try {
		chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 0.5 });
	} catch {
		chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 1 });
	}
}

chrome.runtime.onInstalled.addListener(async () => {
	await ensureRegistered();
	startAlarm();
	syncNow();
});

chrome.runtime.onStartup.addListener(() => {
	startAlarm();
	syncNow();
});

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === SYNC_ALARM) syncNow();
});

// Enquanto a criança navega, os eventos de aba disparam sync com
// throttle — assim mensagens e bloqueios chegam em segundos.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === "loading") throttledSync();
});
chrome.tabs.onActivated.addListener(() => throttledSync());
chrome.webNavigation.onCommitted.addListener(() => throttledSync());

function throttledSync() {
	if (Date.now() - lastEventSync < EVENT_SYNC_THROTTLE_MS) return;
	lastEventSync = Date.now();
	syncNow();
}

/* ---------- Sincronização com a API ---------- */

async function syncNow() {
	const { deviceToken } = await chrome.storage.local.get("deviceToken");
	if (!deviceToken) return;

	accumulateElapsed(Date.now());
	await flushUsage(deviceToken);

	try {
		const response = await fetch(`${API_URL}/api/devices/config`, {
			headers: { "X-Device-Token": deviceToken },
		});
		if (!response.ok) return;
		const config = await response.json();

		if (config.extensionEnabled === false) {
			// Extensão pausada pelo responsável: remove bloqueios,
			// mas mantém heartbeat (status online) e envio de mensagens.
			await updateBlockingRules([], []);
			breakActive = false;
			continuousUsageSeconds = 0;
			await chrome.storage.local.set({
				config,
				extensionEnabled: false,
				lockScreen: false,
				outOfSchedule: false,
				scheduledBreakActive: false,
				breakEndTime: 0,
				blockedKeywords: [],
				blockedSites: [],
				blockedRatings: [],
				childAgeGroup: config.childAgeGroup || "10-11",
			});
			await checkMessages(deviceToken);
			return;
		}

		const outOfSchedule = !isWithinSchedule(config);
		const ratings = config.blockedRatings || ["10", "12", "14", "16", "18"];

		await chrome.storage.local.set({
			config,
			extensionEnabled: true,
			lockScreen: Boolean(config.lockScreen),
			outOfSchedule,
			scheduledBreakActive: breakActive,
			breakEndTime: breakEndTime,
			blockedKeywords: config.blockedKeywords || [],
			blockedSites: config.blockedSites || [],
			blockedRatings: ratings,
			childAgeGroup: config.childAgeGroup || "10-11",
		});

		await updateBlockingRules(config.blockedSites || [], ratings);
		await checkMessages(deviceToken);
	} catch (error) {
		// sem conexão com o servidor — mantém o último estado salvo
	}
}

async function checkMessages(deviceToken) {
	const response = await fetch(`${API_URL}/api/devices/messages`, {
		headers: { "X-Device-Token": deviceToken },
	});
	if (!response.ok) return;
	const data = await response.json();

	const texts = data.messages || [];
	if (texts.length === 0) return;

	// A mensagem é exibida pela extensão (content.js), não como
	// notificação do navegador. Guarda a mais recente.
	const { lastMessageId = 0 } = await chrome.storage.local.get("lastMessageId");
	const id = lastMessageId + texts.length;
	await chrome.storage.local.set({
		lastMessage: { id, text: texts[texts.length - 1] },
		lastMessageId: id,
	});
}

/* ---------- Bloqueio de sites (declarativeNetRequest) ---------- */

function extractDomain(url) {
	if (!url) return "";
	try {
		const withProto = url.includes("://") ? url : `https://${url}`;
		return new URL(withProto).hostname.replace(/^www\./, "").toLowerCase();
	} catch (error) {
		return url.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "").toLowerCase();
	}
}

async function updateBlockingRules(blockedSites = [], blockedRatings) {
	const { blockedRuleIds = [] } = await chrome.storage.local.get("blockedRuleIds");

	let ratings = blockedRatings;
	if (!ratings) {
		const stored = await chrome.storage.local.get("blockedRatings");
		ratings = stored.blockedRatings || ["10", "12", "14", "16", "18"];
	}
	const block18 = ratings.includes("18");

	const siteDomains = (blockedSites || [])
		.map(extractDomain)
		.filter((domain) => domain && domain.length > 0);

	const allBlockedDomains = new Set(siteDomains);
	if (block18) {
		ADULT_DOMAINS_18.forEach((d) => allBlockedDomains.add(d));
	}

	const newRules = [];
	let ruleId = 1;

	for (const domain of allBlockedDomains) {
		// Redireciona a página principal (main_frame) para a tela de bloqueio padrão do KidSafe
		newRules.push({
			id: ruleId++,
			priority: 2,
			action: {
				type: "redirect",
				redirect: { extensionPath: "/blocked.html" },
			},
			condition: {
				urlFilter: `||${domain}^`,
				resourceTypes: ["main_frame"],
			},
		});

		// Bloqueia frames e sub-recursos caso o domínio seja embutido em outro site
		newRules.push({
			id: ruleId++,
			priority: 1,
			action: { type: "block" },
			condition: {
				urlFilter: `||${domain}^`,
				resourceTypes: ["sub_frame", "stylesheet", "script", "image", "media", "websocket", "xmlhttprequest"],
			},
		});
	}

	// Regras para qualquer domínio com TLD .xxx quando 18 estiver bloqueado
	if (block18) {
		newRules.push({
			id: ruleId++,
			priority: 3,
			action: {
				type: "redirect",
				redirect: { extensionPath: "/blocked.html" },
			},
			condition: {
				regexFilter: "^https?://([^/]+\\.)*xxx(:[0-9]+)?(/.*)?$",
				resourceTypes: ["main_frame"],
			},
		});
		newRules.push({
			id: ruleId++,
			priority: 2,
			action: { type: "block" },
			condition: {
				regexFilter: "^https?://([^/]+\\.)*xxx(:[0-9]+)?(/.*)?$",
				resourceTypes: ["sub_frame", "stylesheet", "script", "image", "media", "websocket", "xmlhttprequest"],
			},
		});
	}

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: blockedRuleIds,
		addRules: newRules,
	});

	await chrome.storage.local.set({ blockedRuleIds: newRules.map((rule) => rule.id) });
}

/* Interceptador prévio via webNavigation para redirecionamento instantâneo */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
	if (details.frameId !== 0) return; // apenas janela/aba principal
	const {
		blockedSites = [],
		blockedRatings = ["10", "12", "14", "16", "18"],
		extensionEnabled = true,
	} = await chrome.storage.local.get([
		"blockedSites",
		"blockedRatings",
		"extensionEnabled",
	]);

	if (extensionEnabled === false) return;

	const domain = extractDomain(details.url);
	if (!domain) return;

	// 1. Site bloqueado explicitamente
	const isSiteBlocked = blockedSites.some((s) => {
		const b = extractDomain(s);
		return b && (domain === b || domain.endsWith("." + b));
	});

	// 2. Classificação 18+ por TLD .xxx ou plataforma adulta conhecida
	const is18Blocked =
		blockedRatings.includes("18") &&
		(domain.endsWith(".xxx") ||
			domain.endsWith(".adult") ||
			domain.endsWith(".porn") ||
			domain.endsWith(".sex") ||
			ADULT_DOMAINS_18.some((adult) => domain === adult || domain.endsWith("." + adult)));

	// 3. Palavras-chave de alto risco no caminho ou parâmetros da URL conforme as idades bloqueadas
	let isKeywordBlockedInUrl = false;
	const urlLower = (details.url || "").toLowerCase();

	if (blockedRatings.includes("18")) {
		const adultKws = ["rule34", "rule 34", "pornhub", "xvideos", "xnxx", "redtube", "hentai", "onlyfans", "stripchat"];
		if (adultKws.some((kw) => urlLower.includes(kw))) {
			isKeywordBlockedInUrl = true;
		}
	}
	if (blockedRatings.includes("14")) {
		const betKws = ["tigrinho", "fortune tiger", "cassino online", "blaze apostas"];
		if (betKws.some((kw) => urlLower.includes(kw))) {
			isKeywordBlockedInUrl = true;
		}
	}

	if (isSiteBlocked || is18Blocked || isKeywordBlockedInUrl) {
		chrome.tabs.update(details.tabId, {
			url: chrome.runtime.getURL("/blocked.html"),
		});
	}
});

/* ---------- Horário permitido ----------
   O bloqueio por horário só vale nos DIAS SELECIONADOS.
   Em dia não selecionado, a navegação é livre. */
function isWithinSchedule(config) {
	if (!config.scheduleStart || !config.scheduleEnd) return true;

	const days = (config.scheduleDays || "0,1,2,3,4,5,6").split(",").map(Number);
	const now = new Date();

	// Dia não selecionado = fora da regra de horário (livre)
	if (!days.includes(now.getDay())) return true;

	const [startH, startM] = config.scheduleStart.split(":").map(Number);
	const [endH, endM] = config.scheduleEnd.split(":").map(Number);
	const nowMinutes = now.getHours() * 60 + now.getMinutes();

	return nowMinutes >= startH * 60 + startM && nowMinutes <= endH * 60 + endM;
}

/* ---------- Uso: tempo por domínio, visitas e pausas programadas ---------- */

let pendingUsage = {};
let currentDomain = null;
let lastTick = Date.now();
let continuousUsageSeconds = 0;
let breakActive = false;
let breakEndTime = 0;

async function checkBreakCycle(elapsedSeconds) {
	const { config, scheduledBreakActive, breakEndTime: storedEndTime } =
		await chrome.storage.local.get([
			"config",
			"scheduledBreakActive",
			"breakEndTime",
		]);

	if (
		!config ||
		!config.scheduledBreaks ||
		config.extensionEnabled === false
	) {
		if (breakActive || scheduledBreakActive) {
			breakActive = false;
			breakEndTime = 0;
			continuousUsageSeconds = 0;
			await chrome.storage.local.set({
				scheduledBreakActive: false,
				breakEndTime: 0,
			});
		}
		continuousUsageSeconds = 0;
		return;
	}

	const usageLimitSec = (config.breakUsageMinutes || 15) * 60;
	const breakDurationSec = (config.breakDurationMinutes || 5) * 60;

	if (breakActive || scheduledBreakActive) {
		const targetEnd = storedEndTime || breakEndTime;
		if (Date.now() >= targetEnd) {
			breakActive = false;
			breakEndTime = 0;
			continuousUsageSeconds = 0;
			await chrome.storage.local.set({
				scheduledBreakActive: false,
				breakEndTime: 0,
			});
		}
		return;
	}

	if (currentDomain) {
		continuousUsageSeconds += elapsedSeconds;
		if (continuousUsageSeconds >= usageLimitSec) {
			breakActive = true;
			breakEndTime = Date.now() + breakDurationSec * 1000;
			await chrome.storage.local.set({
				scheduledBreakActive: true,
				breakEndTime: breakEndTime,
				breakDurationMinutes: config.breakDurationMinutes || 5,
			});
		}
	}
}

function accumulateElapsed(now) {
	const elapsedSeconds = Math.min((now - lastTick) / 1000, 5 * 60);
	if (currentDomain && elapsedSeconds > 0) {
		pendingUsage[currentDomain] = pendingUsage[currentDomain] || {
			seconds: 0,
			visits: 0,
		};
		pendingUsage[currentDomain].seconds += elapsedSeconds;
	}
	if (elapsedSeconds > 0) {
		checkBreakCycle(elapsedSeconds);
	}
	lastTick = now;
}

function setCurrentDomain(url) {
	accumulateElapsed(Date.now());
	currentDomain = url ? extractDomain(url) : null;
}

async function flushUsage(deviceToken) {
	const entries = Object.entries(pendingUsage);
	pendingUsage = {};

	for (const [domain, usage] of entries) {
		if (usage.seconds < 1 && usage.visits < 1) continue;

		await fetch(`${API_URL}/api/devices/usage`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Device-Token": deviceToken,
			},
			body: JSON.stringify({
				domain,
				seconds: Math.round(usage.seconds),
				visits: usage.visits,
			}),
		});
	}
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
	try {
		const tab = await chrome.tabs.get(tabId);
		setCurrentDomain(tab.url);
	} catch (error) {
		setCurrentDomain(null);
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.url && tab.active) {
		setCurrentDomain(changeInfo.url);
	}
});

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) {
		setCurrentDomain(null);
	}
});

chrome.webNavigation.onCommitted.addListener((details) => {
	if (details.frameId !== 0) return;
	const domain = extractDomain(details.url);
	if (!domain) return;

	pendingUsage[domain] = pendingUsage[domain] || { seconds: 0, visits: 0 };
	pendingUsage[domain].visits += 1;
});