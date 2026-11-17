import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Hero from "../components/Hero.jsx";
import ArticlesSection from "../components/ArticlesSection.jsx";
import ParentScenarioSimulator from "../components/ParentScenarioSimulator.jsx";
import Coverage from "../components/Coverage.jsx";
import RiskPolicies from "../components/RiskPolicies.jsx";
import Origin from "../components/Origin.jsx";

export default function Home() {
	const { user } = useAuth();

	if (user) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<>
			<Hero />
			<ArticlesSection />
			<ParentScenarioSimulator />
			<Coverage />
			<RiskPolicies />
			<Origin />
		</>
	);
}
