import { Link } from "react-router-dom";
import {
	FiBookOpen,
	FiDownload,
	FiTarget,
	FiCheckSquare,
	FiShield,
	FiHelpCircle,
} from "react-icons/fi";
import logoKidSafe from "../assets/logo-kidsafe.jpg";

export default function Hero() {
	function handleScrollTo(sectionId, event) {
		if (event) event.preventDefault();
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

	return (
		<section id="top" className="hero hero--educational">
			<div className="container">
				<div className="hero__content-wrap">
					<img
						src={logoKidSafe}
						alt="Logotipo KidSafe"
						className="hero__brandmark"
					/>

					<div className="hero__tagline-badge">
						<FiBookOpen className="hero-badge-icon" />
						<span>Central de Apoio & Mentoria Digital</span>
					</div>

					<h1 className="hero__title">
						Um guia para pais e responsáveis{" "}
						<strong>orientarem</strong> seus filhos no mundo digital.
					</h1>

					<p className="hero__body">
						Menos estresse por telas e mais parceria. O KidSafe combina
						artigos práticos, orientações por faixa etária e
						uma extensão inteligente de navegação que atua como aliada da
						família — protegendo sem invadir a privacidade e promovendo autonomia saudável.
					</p>

					{/* BOTÕES DE AÇÃO HERO */}
					<div className="hero__actions">
						<a
							href="#artigos"
							className="button button--primary hero__main-cta"
							onClick={(e) => handleScrollTo("artigos", e)}
						>
							<FiBookOpen style={{ marginRight: "8px" }} />
							<span>Explorar Artigos</span>
						</a>

						<a
							href="#quiz-cenarios"
							className="button button--secondary hero__sec-cta"
							onClick={(e) => handleScrollTo("quiz-cenarios", e)}
						>
							<FiHelpCircle style={{ marginRight: "8px" }} />
							<span>Quiz de Cenários</span>
						</a>

						<Link
							to="/ajuda/instalacao"
							className="button hero__extension-download-cta"
							title="Baixar e Instalar a Extensão de Navegação KidSafe"
						>
							<FiDownload style={{ marginRight: "8px" }} />
							<span>Baixar Extensão KidSafe</span>
						</Link>
					</div>

					{/* DESTAQUES DIDÁTICOS (ESTILO CURSO EM VÍDEO) */}
					<div className="hero__features-row">
						<div className="hero__feature-item">
							<FiBookOpen className="hero__feature-icon" />
							<div>
								<strong>Artigos Gratuitos</strong>
								<p>Guias passo a passo</p>
							</div>
						</div>

						<div className="hero__feature-item">
							<FiTarget className="hero__feature-icon" />
							<div>
								<strong>Filtros por Idade</strong>
								<p>De 3 a 16 anos</p>
							</div>
						</div>

						<div className="hero__feature-item">
							<FiCheckSquare className="hero__feature-icon" />
							<div>
								<strong>Planos de Ação</strong>
								<p>Passo a passo para pais</p>
							</div>
						</div>

						<div className="hero__feature-item">
							<FiShield className="hero__feature-icon" />
							<div>
								<strong>Extensão Ativa</strong>
								<p>Filtros e pausas de tela</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
