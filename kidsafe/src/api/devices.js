import { apiRequest } from "./client.js";

export function getAllDevices() {
	return apiRequest("/api/devices");
}

export function renameDevice(id, name) {
	return apiRequest(`/api/devices/${id}/name`, {
		method: "PUT",
		body: JSON.stringify({ name }),
	});
}

export function linkDevice(pairingCode, childAgeGroup, blockedRatings) {
	const payload =
		typeof pairingCode === "object"
			? pairingCode
			: { pairingCode, childAgeGroup, blockedRatings };

	return apiRequest("/api/devices/link", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateAgeRatings({ childAgeGroup, blockedRatings, deviceId }) {
	return apiRequest("/api/devices/age-ratings", {
		method: "PUT",
		body: JSON.stringify({ childAgeGroup, blockedRatings, deviceId }),
	});
}

export function unlinkDevice(deviceId) {
	return apiRequest("/api/devices/unlink", {
		method: "POST",
		body: JSON.stringify({ deviceId }),
	});
}

export function getMyDevice(deviceId) {
	const query = deviceId ? `?deviceId=${deviceId}` : "";
	return apiRequest(`/api/devices/me${query}`);
}

export function getUsageSummary(deviceId) {
	const query = deviceId ? `?deviceId=${deviceId}` : "";
	return apiRequest(`/api/devices/usage-summary${query}`);
}

export function setLockScreen(lock, deviceId) {
	return apiRequest("/api/devices/lock", {
		method: "POST",
		body: JSON.stringify({ lock, deviceId }),
	});
}

export function sendMessage(content, deviceId) {
	return apiRequest("/api/devices/message", {
		method: "POST",
		body: JSON.stringify({ content, deviceId }),
	});
}

export function addBlockedSite(url, category = "Geral", deviceId) {
	return apiRequest("/api/devices/blocked-sites", {
		method: "POST",
		body: JSON.stringify({ url, category, deviceId }),
	});
}

export function removeBlockedSite(id, deviceId) {
	const query = deviceId ? `?deviceId=${deviceId}` : "";
	return apiRequest(`/api/devices/blocked-sites/${id}${query}`, {
		method: "DELETE",
	});
}

export function moveBlockedSiteCategory(id, category, deviceId) {
	return apiRequest(`/api/devices/blocked-sites/${id}/category`, {
		method: "PUT",
		body: JSON.stringify({ category, deviceId }),
	});
}

export function addCategory(name, deviceId) {
	return apiRequest("/api/devices/categories", {
		method: "POST",
		body: JSON.stringify({ name, deviceId }),
	});
}

export function removeCategory(name, deviceId) {
	const query = deviceId ? `?deviceId=${deviceId}` : "";
	return apiRequest(`/api/devices/categories/${encodeURIComponent(name)}${query}`, {
		method: "DELETE",
	});
}

export function addBlockedKeyword(word, deviceId) {
	return apiRequest("/api/devices/blocked-keywords", {
		method: "POST",
		body: JSON.stringify({ word, deviceId }),
	});
}

export function removeBlockedKeyword(id, deviceId) {
	const query = deviceId ? `?deviceId=${deviceId}` : "";
	return apiRequest(`/api/devices/blocked-keywords/${id}${query}`, {
		method: "DELETE",
	});
}

export function updateSchedule({
	start,
	end,
	days,
	scheduledBreaks,
	breakUsageMinutes,
	breakDurationMinutes,
	deviceId,
}) {
	return apiRequest("/api/devices/schedule", {
		method: "PUT",
		body: JSON.stringify({
			start,
			end,
			days,
			scheduledBreaks,
			breakUsageMinutes,
			breakDurationMinutes,
			deviceId,
		}),
	});
}

export function setExtensionEnabled(enabled, deviceId) {
	return apiRequest("/api/devices/extension-toggle", {
		method: "POST",
		body: JSON.stringify({ enabled, deviceId }),
	});
}