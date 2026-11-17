import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logoKidSafe from "../assets/logo-kidsafe.jpg";

export default function Header() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		function handleScroll() {
			setScrolled(window.scrollY > 15);
		}
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (user) {
		// No dashboard e no admin, o header padrão não é exibido (possuem topbar própria)
		if (location.pathname === "/dashboard" || location.pathname === "/admin") {
			return null;
		}

		// Ao navegar para qualquer outra página estando logado (ex.: links do footer)
		return (
			<header className={`header header--logged ${scrolled ? "header--scrolled" : ""}`}>
				<div className="container header__inner">
					<Link to="/dashboard" className="header__logo">
						<img
							src={logoKidSafe}
							alt="Logotipo KidSafe"
							className="header__logo-img"
						/>
						KidSafe
					</Link>

					<div className="header__actions">
						<Link
							to="/dashboard"
							className="button button--primary header__back-dashboard-btn"
						>
							← Voltar ao Painel de Gerenciamento
						</Link>
						<span className="header__greeting">
							Olá, <strong>{user?.name || "Usuário"}</strong>
						</span>
						<button
							type="button"
							className="button button--secondary"
							onClick={logout}
						>
							Sair
						</button>
					</div>
				</div>
			</header>
		);
	}

	function handleNavClick(sectionId, event) {
		if (location.pathname === "/") {
			if (event) event.preventDefault();
			if (!sectionId || sectionId === "top") {
				window.scrollTo({ top: 0, behavior: "smooth" });
				window.history.pushState(null, "", "/");
				return;
			}
			const element = document.getElementById(sectionId);
			if (element) {
				const headerOffset = 90;
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
				window.scrollTo({
					top: offsetPosition,
					behavior: "smooth",
				});
				window.history.pushState(null, "", `/#${sectionId}`);
			}
		}
	}

	return (
		<header className={`header ${scrolled ? "header--scrolled" : ""}`}>
			<div className="container header__inner">
				<Link
					to="/"
					className="header__logo"
					onClick={(e) => handleNavClick("top", e)}
				>
					<img
						src={logoKidSafe}
						alt="Logotipo KidSafe"
						className="header__logo-img"
					/>
					KidSafe
				</Link>

				<nav className="header__nav">
					<ul>
						<li>
							<Link to="/" onClick={(e) => handleNavClick("top", e)}>
								Início
							</Link>
						</li>
						<li>
							<a
								href="/#artigos"
								onClick={(e) => handleNavClick("artigos", e)}
							>
								Artigos
							</a>
						</li>
						<li>
							<a
								href="/#quiz-cenarios"
								onClick={(e) => handleNavClick("quiz-cenarios", e)}
							>
								Quiz de Cenários
							</a>
						</li>
						<li>
							<a
								href="/#protecao"
								onClick={(e) => handleNavClick("protecao", e)}
							>
								Proteção
							</a>
						</li>
						<li>
							<Link to="/ajuda">Ajuda</Link>
						</li>
					</ul>
				</nav>

				<div className="header__actions">
					<Link
						to="/ajuda/instalacao"
						className="header__extension-btn"
						title="Instalar Extensão KidSafe"
					>
						Instalar extensão
					</Link>

					<Link to="/login">Entrar</Link>
					<Link to="/cadastro" className="header__cta">
						Criar conta
					</Link>
				</div>
			</div>
		</header>
	);
}
