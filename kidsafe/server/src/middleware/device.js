import { prisma } from "../prisma.js";

// Autentica requisições vindas da extensão (não do painel web).
// A extensão se identifica pelo deviceToken gerado no registro.
export async function requireDevice(req, res, next) {
	const token = req.headers["x-device-token"];

	if (!token) {
		return res.status(401).json({ message: "Token do dispositivo não informado." });
	}

	const device = await prisma.device.findUnique({ where: { deviceToken: token } });

	if (!device) {
		return res.status(401).json({ message: "Dispositivo não reconhecido." });
	}

	req.device = device;
	next();
}
