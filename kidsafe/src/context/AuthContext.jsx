import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(() => localStorage.getItem("kidsafe_token"));

	useEffect(() => {
		const storedUser = localStorage.getItem("kidsafe_user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}

		function handleUnauthorized() {
			setUser(null);
			setToken(null);
		}

		window.addEventListener("auth:unauthorized", handleUnauthorized);
		return () => {
			window.removeEventListener("auth:unauthorized", handleUnauthorized);
		};
	}, []);

	function login({ user: loggedUser, token: newToken }) {
		setUser(loggedUser);
		setToken(newToken);
		localStorage.setItem("kidsafe_token", newToken);
		localStorage.setItem("kidsafe_user", JSON.stringify(loggedUser));
	}

	function logout() {
		setUser(null);
		setToken(null);
		localStorage.removeItem("kidsafe_token");
		localStorage.removeItem("kidsafe_user");
	}

	return (
		<AuthContext.Provider value={{ user, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
