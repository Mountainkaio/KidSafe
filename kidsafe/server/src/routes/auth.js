import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

function createToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function serializeUser(user) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};
}

authRouter.post("/register", async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res
			.status(400)
			.json({ message: "Nome, e-mail e senha são obrigatórios." });
	}

	if (password.length < 8) {
		return res
			.status(400)
			.json({ message: "A senha deve ter pelo menos 8 caracteres." });
	}

	const normalizedEmail = String(email).trim().toLowerCase();
	const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

	if (existingUser) {
		return res.status(409).json({ message: "Este e-mail já está em uso." });
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: { name: String(name).trim(), email: normalizedEmail, password: hashedPassword },
	});

	const token = createToken(user.id);

	return res.status(201).json({ token, user: serializeUser(user) });
});

authRouter.post("/login", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ message: "E-mail e senha são obrigatórios." });
	}

	const normalizedEmail = String(email).trim().toLowerCase();
	const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

	if (!user) {
		return res.status(401).json({ message: "E-mail ou senha inválidos." });
	}

	if (user.status === "SUSPENDED") {
		return res
			.status(403)
			.json({ message: "Esta conta está suspensa. Entre em contato com o suporte." });
	}

	const passwordMatches = await bcrypt.compare(password, user.password);

	if (!passwordMatches) {
		return res.status(401).json({ message: "E-mail ou senha inválidos." });
	}

	const token = createToken(user.id);

	return res.json({ token, user: serializeUser(user) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
	const user = await prisma.user.findUnique({ where: { id: req.userId } });

	if (!user) {
		return res.status(404).json({ message: "Usuário não encontrado." });
	}

	return res.json({ user: serializeUser(user) });
});
