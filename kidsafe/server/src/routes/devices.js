import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDevice } from "../middleware/device.js";
import {
	generatePairingCode,
	generateDeviceToken,
	todayKey,
	isRecentlySeen,
} from "../utils.js";

export const devicesRouter = Router();

function serializeDevice(device) {
	const customCategories = device.customCategories
		? device.customCategories.split(",").map((c) => c.trim()).filter(Boolean)
		: ["Geral"];
	if (!customCategories.includes("Geral")) {
		customCategories.unshift("Geral");
	}

	return {
		id: device.id,
		name: device.name,
		status: device.status,
		lockScreen: device.lockScreen,
		extensionEnabled: device.extensionEnabled,
		scheduleStart: device.scheduleStart,
		scheduleEnd: device.scheduleEnd,
		scheduleDays: device.scheduleDays,
		scheduledBreaks: device.scheduledBreaks,
		breakUsageMinutes: device.breakUsageMinutes || 15,
		breakDurationMinutes: device.breakDurationMinutes || 5,
		customCategories,
		childAgeGroup: device.childAgeGroup || "6-10",
		blockedRatings: device.blockedRatings
			? device.blockedRatings.split(",").map((r) => r.trim()).filter(Boolean)
			: ["12", "14", "16", "18"],
		lastSeenAt: device.lastSeenAt,
		online: isRecentlySeen(device.lastSeenAt),
		blockedSites: device.blockedSites || [],
		blockedKeywords: device.blockedKeywords || [],
	};
}

async function findDeviceIncludingLists(where) {
	return prisma.device.findFirst({
		where,
		include: { blockedSites: true, blockedKeywords: true },
	});
}

function resolveDeviceId(req) {
	return (
		req.query?.deviceId ||
		req.body?.deviceId ||
		req.headers["x-device-id"] ||
		req.params?.deviceId ||
		null
	);
}

async function getUsersDevice(userId, deviceId = null) {
	if (deviceId) {
		const dev = await prisma.device.findFirst({
			where: { id: Number(deviceId), userId },
			include: { blockedSites: true, blockedKeywords: true },
		});
		if (dev) return dev;
	}
	return prisma.device.findFirst({
		where: { userId },
		include: { blockedSites: true, blockedKeywords: true },
		orderBy: { lastSeenAt: "desc" },
	});
}

/* ---------- Rotas usadas pela EXTENSÃO (autenticadas por deviceToken) ---------- */

// Chamado uma única vez, quando a extensão é instalada.
devicesRouter.post("/register", async (req, res) => {
	let pairingCode;
	let isUnique = false;

	// gera um código até encontrar um que ainda não está em uso
	while (!isUnique) {
		pairingCode = generatePairingCode();
		const existing = await prisma.device.findUnique({ where: { pairingCode } });
		isUnique = !existing;
	}

	const deviceToken = generateDeviceToken();

	const device = await prisma.device.create({
		data: { pairingCode, deviceToken },
	});

	return res.status(201).json({
		deviceId: device.id,
		pairingCode: device.pairingCode,
		deviceToken: device.deviceToken,
	});
});

// A extensão consulta periodicamente sua configuração (bloqueios,
// horário, tela bloqueada) e reporta que está on-line.
devicesRouter.get("/config", requireDevice, async (req, res) => {
	const device = await findDeviceIncludingLists({ id: req.device.id });

	await prisma.device.update({
		where: { id: device.id },
		data: { lastSeenAt: new Date() },
	});

	return res.json({
		status: device.status,
		lockScreen: device.lockScreen,
		scheduleStart: device.scheduleStart,
		scheduleEnd: device.scheduleEnd,
		scheduleDays: device.scheduleDays,
		scheduledBreaks: device.scheduledBreaks,
		breakUsageMinutes: device.breakUsageMinutes || 15,
		breakDurationMinutes: device.breakDurationMinutes || 5,
		blockedSites: device.blockedSites.map((site) => site.url),
		blockedKeywords: device.blockedKeywords.map((keyword) => keyword.word),
		blockedRatings: device.blockedRatings
			? device.blockedRatings.split(",").map((r) => r.trim()).filter(Boolean)
			: ["12", "14", "16", "18"],
		childAgeGroup: device.childAgeGroup || "6-10",
		extensionEnabled: device.extensionEnabled,
	});
});

// A extensão busca mensagens de aviso pendentes e as marca como entregues.
devicesRouter.get("/messages", requireDevice, async (req, res) => {
	const messages = await prisma.message.findMany({
		where: { deviceId: req.device.id, delivered: false },
		orderBy: { createdAt: "asc" },
	});

	if (messages.length > 0) {
		await prisma.message.updateMany({
			where: { id: { in: messages.map((message) => message.id) } },
			data: { delivered: true },
		});
	}

	return res.json({ messages: messages.map((message) => message.content) });
});

// A extensão reporta tempo de uso e visitas por domínio, uma vez por dia.
devicesRouter.post("/usage", requireDevice, async (req, res) => {
	const { domain, seconds = 0, visits = 0 } = req.body;

	if (!domain) {
		return res.status(400).json({ message: "Domínio é obrigatório." });
	}

	const date = todayKey();

	const usageLog = await prisma.usageLog.upsert({
		where: {
			deviceId_domain_date: { deviceId: req.device.id, domain, date },
		},
		update: {
			seconds: { increment: seconds },
			visits: { increment: visits },
		},
		create: { deviceId: req.device.id, domain, date, seconds, visits },
	});

	return res.json({ usageLog });
});

/* ---------- Rotas usadas pelo PAINEL WEB (autenticadas por JWT) ---------- */

// Lista todos os dispositivos vinculados ao usuário
devicesRouter.get("/", requireAuth, async (req, res) => {
	const devices = await prisma.device.findMany({
		where: { userId: req.userId },
		include: { blockedSites: true, blockedKeywords: true },
		orderBy: { createdAt: "asc" },
	});

	return res.json({ devices: devices.map(serializeDevice) });
});

// Altera o nome de um dispositivo para melhor organização
devicesRouter.put("/:id/name", requireAuth, async (req, res) => {
	const { name } = req.body;
	const deviceId = Number(req.params.id);

	if (!name || !name.trim()) {
		return res.status(400).json({ message: "Nome do dispositivo é obrigatório." });
	}

	const device = await prisma.device.findFirst({
		where: { id: deviceId, userId: req.userId },
	});

	if (!device) {
		return res.status(404).json({ message: "Dispositivo não encontrado." });
	}

	const updated = await prisma.device.update({
		where: { id: deviceId },
		data: { name: name.trim() },
		include: { blockedSites: true, blockedKeywords: true },
	});

	return res.json({ device: serializeDevice(updated) });
});

devicesRouter.post("/link", requireAuth, async (req, res) => {
	const { pairingCode, childAgeGroup = "6-10", blockedRatings } = req.body;

	if (!pairingCode) {
		return res.status(400).json({ message: "Informe o código de acesso." });
	}

	const device = await prisma.device.findUnique({
		where: { pairingCode: pairingCode.toUpperCase() },
	});

	if (!device) {
		return res.status(404).json({ message: "Código não encontrado." });
	}

	if (device.status === "LINKED" && device.userId !== req.userId) {
		return res
			.status(409)
			.json({ message: "Este código já está vinculado a outra conta." });
	}

	let newName = device.name;
	if (newName === "Dispositivo") {
		const count = await prisma.device.count({ where: { userId: req.userId } });
		newName = `Dispositivo ${count + 1}`;
	}

	let ratingsStr = blockedRatings;
	if (Array.isArray(ratingsStr)) {
		ratingsStr = ratingsStr.join(",");
	} else if (!ratingsStr && childAgeGroup) {
		if (childAgeGroup === "0-9") ratingsStr = "10,12,14,16,18";
		else if (childAgeGroup === "10-11") ratingsStr = "12,14,16,18";
		else if (childAgeGroup === "12-13") ratingsStr = "14,16,18";
		else if (childAgeGroup === "14-16" || childAgeGroup === "14-15") ratingsStr = "16,18";
		else ratingsStr = "12,14,16,18";
	}

	const updatedDevice = await prisma.device.update({
		where: { id: device.id },
		data: {
			userId: req.userId,
			status: "LINKED",
			name: newName,
			childAgeGroup: childAgeGroup || "6-10",
			blockedRatings: ratingsStr !== undefined ? ratingsStr : "12,14,16,18",
		},
		include: { blockedSites: true, blockedKeywords: true },
	});

	return res.json({ device: serializeDevice(updatedDevice) });
});

devicesRouter.put("/age-ratings", requireAuth, async (req, res) => {
	const { childAgeGroup, blockedRatings } = req.body;
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	let ratingsStr = blockedRatings;
	if (Array.isArray(ratingsStr)) {
		ratingsStr = ratingsStr.join(",");
	}

	const updateData = {};
	if (childAgeGroup !== undefined) updateData.childAgeGroup = childAgeGroup;
	if (ratingsStr !== undefined) updateData.blockedRatings = ratingsStr;

	const updated = await prisma.device.update({
		where: { id: device.id },
		data: updateData,
		include: { blockedSites: true, blockedKeywords: true },
	});

	return res.json({ device: serializeDevice(updated) });
});

devicesRouter.post("/unlink", requireAuth, async (req, res) => {
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	await prisma.device.update({
		where: { id: device.id },
		data: { userId: null, status: "PENDING" },
	});

	return res.json({ ok: true, unlinkedDeviceId: device.id });
});

devicesRouter.get("/me", requireAuth, async (req, res) => {
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.json({ device: null });
	}

	return res.json({ device: serializeDevice(device) });
});

devicesRouter.post("/lock", requireAuth, async (req, res) => {
	const { lock } = req.body;
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const updatedDevice = await prisma.device.update({
		where: { id: device.id },
		data: { lockScreen: Boolean(lock) },
		include: { blockedSites: true, blockedKeywords: true },
	});

	return res.json({ device: serializeDevice(updatedDevice) });
});

devicesRouter.post("/message", requireAuth, async (req, res) => {
	const { content } = req.body;

	if (!content || !content.trim()) {
		return res.status(400).json({ message: "Escreva uma mensagem." });
	}

	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const message = await prisma.message.create({
		data: { content: content.trim(), deviceId: device.id },
	});

	return res.status(201).json({ message });
});

function normalizeSiteUrl(url) {
	const raw = url.trim().toLowerCase();
	try {
		const withProtocol = raw.includes("://") ? raw : `https://${raw}`;
		return new URL(withProtocol).hostname.replace(/^www\./, "");
	} catch {
		return raw.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
	}
}

devicesRouter.post("/blocked-sites", requireAuth, async (req, res) => {
	const { url, category = "Geral" } = req.body;

	if (!url || !url.trim()) {
		return res.status(400).json({ message: "Informe a URL do site." });
	}

	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	await prisma.blockedSite.create({
		data: {
			url: normalizeSiteUrl(url),
			category: (category || "Geral").trim(),
			deviceId: device.id,
		},
	});

	const blockedSites = await prisma.blockedSite.findMany({
		where: { deviceId: device.id },
	});

	return res.status(201).json({ blockedSites });
});

devicesRouter.delete("/blocked-sites/:id", requireAuth, async (req, res) => {
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	await prisma.blockedSite.deleteMany({
		where: { id: Number(req.params.id), deviceId: device.id },
	});

	const blockedSites = await prisma.blockedSite.findMany({
		where: { deviceId: device.id },
	});

	return res.json({ blockedSites });
});

devicesRouter.put("/blocked-sites/:id/category", requireAuth, async (req, res) => {
	const { category } = req.body;
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	if (!category || !category.trim()) {
		return res.status(400).json({ message: "Categoria é obrigatória." });
	}

	await prisma.blockedSite.updateMany({
		where: { id: Number(req.params.id), deviceId: device.id },
		data: { category: category.trim() },
	});

	const blockedSites = await prisma.blockedSite.findMany({
		where: { deviceId: device.id },
	});

	return res.json({ blockedSites });
});

devicesRouter.post("/categories", requireAuth, async (req, res) => {
	const { name } = req.body;
	if (!name || !name.trim()) {
		return res.status(400).json({ message: "Nome da categoria é obrigatório." });
	}

	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);
	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const existingCats = device.customCategories
		? device.customCategories.split(",").map((c) => c.trim()).filter(Boolean)
		: ["Geral"];

	const newCat = name.trim();
	if (!existingCats.includes(newCat)) {
		existingCats.push(newCat);
		await prisma.device.update({
			where: { id: device.id },
			data: { customCategories: existingCats.join(",") },
		});
	}

	return res.status(201).json({ customCategories: existingCats });
});

devicesRouter.delete("/categories/:name", requireAuth, async (req, res) => {
	const name = decodeURIComponent(req.params.name).trim();
	if (name === "Geral") {
		return res.status(400).json({ message: "A categoria padrão Geral não pode ser excluída." });
	}

	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);
	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const existingCats = device.customCategories
		? device.customCategories.split(",").map((c) => c.trim()).filter(Boolean)
		: ["Geral"];

	const filtered = existingCats.filter((c) => c !== name);

	await prisma.blockedSite.updateMany({
		where: { deviceId: device.id, category: name },
		data: { category: "Geral" },
	});

	await prisma.device.update({
		where: { id: device.id },
		data: { customCategories: filtered.join(",") },
	});

	const blockedSites = await prisma.blockedSite.findMany({
		where: { deviceId: device.id },
	});

	return res.json({ customCategories: filtered, blockedSites });
});

devicesRouter.post("/blocked-keywords", requireAuth, async (req, res) => {
	const { word } = req.body;

	if (!word || !word.trim()) {
		return res.status(400).json({ message: "Informe a palavra-chave." });
	}

	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	await prisma.blockedKeyword.create({
		data: { word: word.trim().toLowerCase(), deviceId: device.id },
	});

	const blockedKeywords = await prisma.blockedKeyword.findMany({
		where: { deviceId: device.id },
	});

	return res.status(201).json({ blockedKeywords });
});

devicesRouter.delete("/blocked-keywords/:id", requireAuth, async (req, res) => {
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	await prisma.blockedKeyword.deleteMany({
		where: { id: Number(req.params.id), deviceId: device.id },
	});

	const blockedKeywords = await prisma.blockedKeyword.findMany({
		where: { deviceId: device.id },
	});

	return res.json({ blockedKeywords });
});

devicesRouter.put("/schedule", requireAuth, async (req, res) => {
	const {
		start,
		end,
		days,
		scheduledBreaks,
		breakUsageMinutes,
		breakDurationMinutes,
	} = req.body;

	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const updatedDevice = await prisma.device.update({
		where: { id: device.id },
		data: {
			scheduleStart: start,
			scheduleEnd: end,
			scheduleDays: Array.isArray(days) ? days.join(",") : device.scheduleDays,
			scheduledBreaks: Boolean(scheduledBreaks),
			breakUsageMinutes:
				breakUsageMinutes !== undefined
					? Number(breakUsageMinutes)
					: device.breakUsageMinutes,
			breakDurationMinutes:
				breakDurationMinutes !== undefined
					? Number(breakDurationMinutes)
					: device.breakDurationMinutes,
		},
		include: { blockedSites: true, blockedKeywords: true },
	});

	return res.json({ device: serializeDevice(updatedDevice) });
});

devicesRouter.post("/extension-toggle", requireAuth, async (req, res) => {
	const { enabled } = req.body;
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const updatedDevice = await prisma.device.update({
		where: { id: device.id },
		data: { extensionEnabled: Boolean(enabled) },
		include: { blockedSites: true, blockedKeywords: true },
	});

	return res.json({ device: serializeDevice(updatedDevice) });
});

devicesRouter.get("/usage-summary", requireAuth, async (req, res) => {
	const targetId = resolveDeviceId(req);
	const device = await getUsersDevice(req.userId, targetId);

	if (!device) {
		return res.status(404).json({ message: "Nenhum dispositivo vinculado." });
	}

	const date = todayKey();

	const todayLogs = await prisma.usageLog.findMany({
		where: { deviceId: device.id, date },
		orderBy: { seconds: "desc" },
	});

	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);

	const weekLogs = await prisma.usageLog.findMany({
		where: { deviceId: device.id, createdAt: { gte: weekAgo } },
	});

	const weeklyTotals = {};
	for (const log of weekLogs) {
		weeklyTotals[log.domain] = (weeklyTotals[log.domain] || 0) + log.seconds;
	}
	const weekly = Object.entries(weeklyTotals)
		.map(([domain, seconds]) => ({ domain, seconds }))
		.sort((a, b) => b.seconds - a.seconds)
		.slice(0, 5);

	return res.json({
		today: {
			totalSeconds: todayLogs.reduce((sum, log) => sum + log.seconds, 0),
			apps: todayLogs.map((log) => ({ domain: log.domain, seconds: log.seconds })),
		},
		accessCounts: todayLogs
			.map((log) => ({ domain: log.domain, visits: log.visits }))
			.sort((a, b) => b.visits - a.visits)
			.slice(0, 6),
		weekly,
	});
});