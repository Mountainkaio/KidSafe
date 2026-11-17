import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();

// Todas as rotas daqui exigem privilégios de ADMIN
adminRouter.use(requireAdmin);

// Retorna estatísticas gerais para o painel de administrador
adminRouter.get("/stats", async (req, res) => {
	const totalUsers = await prisma.user.count();
	const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
	const totalResponsibles = await prisma.user.count({ where: { role: "RESPONSAVEL" } });
	const totalSuspended = await prisma.user.count({ where: { status: "SUSPENDED" } });
	const totalDevices = await prisma.device.count({ where: { status: "LINKED" } });

	return res.json({
		stats: {
			totalUsers,
			totalAdmins,
			totalResponsibles,
			totalSuspended,
			totalDevices,
		},
	});
});

// Lista todos os usuários cadastrados com seus dispositivos vinculados
adminRouter.get("/users", async (req, res) => {
	const users = await prisma.user.findMany({
		include: {
			devices: {
				select: {
					id: true,
					name: true,
					status: true,
					pairingCode: true,
					lastSeenAt: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});

	const serializedUsers = users.map((user) => ({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		status: user.status || "ACTIVE",
		createdAt: user.createdAt,
		devices: user.devices || [],
	}));

	return res.json({ users: serializedUsers });
});

// Atualiza dados de um usuário (nome, e-mail, função)
adminRouter.put("/users/:id", async (req, res) => {
	const userId = Number(req.params.id);
	const { name, email, role } = req.body;

	if (!name || !email) {
		return res.status(400).json({ message: "Nome e e-mail são obrigatórios." });
	}

	const existing = await prisma.user.findUnique({ where: { id: userId } });
	if (!existing) {
		return res.status(404).json({ message: "Usuário não encontrado." });
	}

	// Verifica se outro usuário já tem esse e-mail
	const emailTaken = await prisma.user.findFirst({
		where: { email, NOT: { id: userId } },
	});

	if (emailTaken) {
		return res.status(409).json({ message: "Este e-mail já está em uso por outro usuário." });
	}

	const updated = await prisma.user.update({
		where: { id: userId },
		data: {
			name: name.trim(),
			email: email.trim().toLowerCase(),
			role: role === "ADMIN" ? "ADMIN" : "RESPONSAVEL",
		},
		include: { devices: true },
	});

	return res.json({
		user: {
			id: updated.id,
			name: updated.name,
			email: updated.email,
			role: updated.role,
			status: updated.status,
			devices: updated.devices,
		},
	});
});

// Alterna o status do usuário entre ATIVO e SUSPENSO
adminRouter.post("/users/:id/toggle-status", async (req, res) => {
	const userId = Number(req.params.id);

	if (userId === req.userId) {
		return res.status(400).json({ message: "Você não pode suspender sua própria conta de administrador." });
	}

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		return res.status(404).json({ message: "Usuário não encontrado." });
	}

	const nextStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { status: nextStatus },
	});

	return res.json({
		user: {
			id: updated.id,
			name: updated.name,
			email: updated.email,
			role: updated.role,
			status: updated.status,
		},
	});
});

// Exclui a conta de um usuário e desvincula seus dispositivos
adminRouter.delete("/users/:id", async (req, res) => {
	const userId = Number(req.params.id);

	if (userId === req.userId) {
		return res.status(400).json({ message: "Você não pode excluir sua própria conta de administrador." });
	}

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		return res.status(404).json({ message: "Usuário não encontrado." });
	}

	// Desvincula dispositivos do usuário antes de deletar
	await prisma.device.updateMany({
		where: { userId },
		data: { userId: null, status: "PENDING" },
	});

	await prisma.user.delete({ where: { id: userId } });

	return res.json({ ok: true, deletedUserId: userId });
});
