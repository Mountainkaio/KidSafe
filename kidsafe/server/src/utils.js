import crypto from "node:crypto";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem O/0/I/1, evita confusão

export function generatePairingCode(length = 6) {
	let code = "";
	for (let i = 0; i < length; i++) {
		code += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
	}
	return code;
}

export function generateDeviceToken() {
	return crypto.randomBytes(32).toString("hex");
}

export function todayKey() {
	return new Date().toISOString().slice(0, 10); // "2026-09-13"
}

export function isRecentlySeen(lastSeenAt, thresholdMs = 90 * 1000) {
	if (!lastSeenAt) return false;
	return Date.now() - new Date(lastSeenAt).getTime() < thresholdMs;
}
