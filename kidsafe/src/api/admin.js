import { apiRequest } from "./client.js";

export function getAdminStats() {
	return apiRequest("/api/admin/stats");
}

export function getAdminUsers() {
	return apiRequest("/api/admin/users");
}

export function updateAdminUser(id, data) {
	return apiRequest(`/api/admin/users/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export function toggleUserStatus(id) {
	return apiRequest(`/api/admin/users/${id}/toggle-status`, {
		method: "POST",
	});
}

export function deleteAdminUser(id) {
	return apiRequest(`/api/admin/users/${id}`, {
		method: "DELETE",
	});
}
