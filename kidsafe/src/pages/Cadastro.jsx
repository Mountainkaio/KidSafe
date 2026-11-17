import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cadastro() {
	const [name, setName] = useState("");
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
			const data = await registerUser({ name, email, password });
			login(data);
			navigate("/dashboard");
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
				<h1 className="section-title">Criar conta de responsável</h1>
				<p className="section-subtitle">
					Crie sua conta para instalar a extensão e gerenciar os
					dispositivos monitorados.
				</p>

				<form className="page__form" onSubmit={handleSubmit}>
					<label>
						Nome
						<input
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</label>

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
							minLength={8}
							required
						/>
					</label>

					{error && <p role="alert">{error}</p>}

					<button
						type="submit"
						className="button button--primary"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Criando conta..." : "Criar conta"}
					</button>
				</form>

				<p className="page__aside-link">
					Já tem conta? <Link to="/login">Entrar</Link>
				</p>
			</div>
		</section>
	);
}
