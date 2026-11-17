import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Ajuda from "./pages/Ajuda.jsx";
import GuiaInstalacao from "./pages/GuiaInstalacao.jsx";
import Faq from "./pages/Faq.jsx";
import Suporte from "./pages/Suporte.jsx";
import ReportarProblema from "./pages/ReportarProblema.jsx";
import Privacidade from "./pages/Privacidade.jsx";
import Termos from "./pages/Termos.jsx";
import RiscoConteudoInadequado from "./pages/RiscoConteudoInadequado.jsx";
import RiscoContatoDesconhecidos from "./pages/RiscoContatoDesconhecidos.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";

export default function App() {
	const location = useLocation();

	useEffect(() => {
		if (location.hash) {
			const id = location.hash.replace("#", "");
			const scrollToElement = () => {
				const element = document.getElementById(id);
				if (element) {
					const headerOffset = 90;
					const elementPosition = element.getBoundingClientRect().top;
					const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
					window.scrollTo({
						top: offsetPosition,
						behavior: "smooth",
					});
				}
			};

			scrollToElement();
			const timer = setTimeout(scrollToElement, 150);
			return () => clearTimeout(timer);
		}
	}, [location.pathname, location.hash]);

	return (
		<>
			<Header />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/ajuda" element={<Ajuda />} />
					<Route path="/ajuda/instalacao" element={<GuiaInstalacao />} />
					<Route path="/ajuda/perguntas-frequentes" element={<Faq />} />
					<Route path="/suporte" element={<Suporte />} />
					<Route path="/suporte/reportar" element={<ReportarProblema />} />
					<Route path="/privacidade" element={<Privacidade />} />
					<Route path="/termos" element={<Termos />} />
					<Route
						path="/riscos/conteudo-inadequado"
						element={<RiscoConteudoInadequado />}
					/>
					<Route
						path="/riscos/contato-desconhecidos"
						element={<RiscoContatoDesconhecidos />}
					/>
					<Route path="/login" element={<Login />} />
					<Route path="/cadastro" element={<Cadastro />} />
					<Route
						path="/dashboard"
						element={
							<RequireAuth>
								<Dashboard />
							</RequireAuth>
						}
					/>
					<Route
						path="/admin"
						element={
							<RequireAdmin>
								<Admin />
							</RequireAdmin>
						}
					/>
				</Routes>
			</main>
			<Footer />
		</>
	);
}
