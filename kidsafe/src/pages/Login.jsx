import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const data = await loginUser({ email: email.trim().toLowerCase(), password });
			login(data);
			if (data.user?.role === "ADMIN") {
				navigate("/admin");
			} else {
				navigate("/dashboard");
			}
		} catch (submitError) {
			setError(submitError.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="page">
			<div className="container">
				<span className="section-eyebrow">Conta</span>
				<h1 className="section-title">Entrar</h1>
				<p className="section-subtitle">
					Acesse o painel para gerenciar os dispositivos monitorados.
				</p>

				<form className="page__form" onSubmit={handleSubmit}>
					<label>
						E-mail
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>
					</label>

					<label>
						Senha
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
						/>
					</label>

					{error && <p role="alert">{error}</p>}

					<button
						type="submit"
						className="button button--primary"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Entrando..." : "Entrar"}
					</button>
				</form>

				<p className="page__aside-link">
					Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
				</p>
			</div>
		</section>
	);
}
