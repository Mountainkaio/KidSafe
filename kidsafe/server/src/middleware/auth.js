import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

export function requireAuth(req, res, next) {
	const header = req.headers.authorization;

	if (!header || !header.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Token não informado." });
	}

	const token = header.replace("Bearer ", "");

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = payload.userId;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Token inválido ou expirado." });
	}
}

export async function requireAdmin(req, res, next) {
	requireAuth(req, res, async () => {
		try {
			const user = await prisma.user.findUnique({ where: { id: req.userId } });
			if (!user || user.role !== "ADMIN") {
				return res.status(403).json({ message: "Acesso restrito para administradores." });
			}
			req.user = user;
			next();
		} catch (err) {
			return res.status(500).json({ message: "Erro de autorização." });
		}
	});
}
