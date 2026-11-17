const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export async function apiRequest(path, options = {}) {
	const token = localStorage.getItem("kidsafe_token");

	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});

	if (response.status === 401 && token) {
		localStorage.removeItem("kidsafe_token");
		localStorage.removeItem("kidsafe_user");
		window.dispatchEvent(new Event("auth:unauthorized"));
	}

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(data.message || "Algo deu errado. Tente novamente.");
	}

	return data;
}
