(function () {
	function injectOverlay(title, description, dismissible = false) {
		if (document.getElementById("kidsafe-overlay")) return;

		const overlay = document.createElement("div");
		overlay.id = "kidsafe-overlay";
		overlay.style.cssText = `
			position: fixed;
			inset: 0;
			z-index: 2147483647;
			background: #111827;
			color: #ffffff;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			padding: 24px;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		`;

		const iconWrapper = document.createElement("div");
		iconWrapper.style.cssText = "margin-bottom: 20px; color: #ef4444;";
		iconWrapper.innerHTML = `
			<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
				<line x1="12" y1="8" x2="12" y2="12"/>
				<line x1="12" y1="16" x2="12.01" y2="16"/>
			</svg>
		`;

		const heading = document.createElement("h1");
		heading.textContent = title;
		heading.style.cssText = "font-size: 1.8rem; font-weight: 700; margin-bottom: 12px; color: #ffffff;";

		const text = document.createElement("p");
		text.textContent = description;
		text.style.cssText = "color: #9ca3af; max-width: 420px; font-size: 1.1rem; line-height: 1.5; margin: 0;";

		overlay.appendChild(iconWrapper);
		overlay.appendChild(heading);
		overlay.appendChild(text);

		if (dismissible) {
			const button = document.createElement("button");
			button.textContent = "OK";
			button.style.cssText = `
				margin-top: 24px;
				padding: 10px 32px;
				background: #2563eb;
				color: #ffffff;
				border: none;
				border-radius: 8px;
				font-size: 1rem;
				font-weight: 600;
				cursor: pointer;
			`;
			button.addEventListener("click", removeOverlay);
			overlay.appendChild(button);
		} else if (title === "Site bloqueado" || title === "Conteúdo bloqueado") {
			const button = document.createElement("button");
			button.textContent = "Voltar";
			button.style.cssText = `
				margin-top: 24px;
				padding: 10px 32px;
				background: #2563eb;
				color: #ffffff;
				border: none;
				border-radius: 8px;
				font-size: 1rem;
				font-weight: 600;
				cursor: pointer;
			`;
			button.addEventListener("click", () => {
				if (window.history.length > 1) {
					window.history.back();
				} else {
					window.location.href = "https://www.google.com";
				}
			});
			overlay.appendChild(button);
			document.documentElement.style.overflow = "hidden";
		} else {
			document.documentElement.style.overflow = "hidden";
		}

		document.documentElement.appendChild(overlay);
	}

	function removeOverlay() {
		const overlay = document.getElementById("kidsafe-overlay");
		if (overlay) {
			overlay.remove();
			document.documentElement.style.overflow = "";
		}
	}

	function normalizeDomain(url) {
		if (!url) return "";
		try {
			const withProto = url.includes("://") ? url : `https://${url}`;
			return new URL(withProto).hostname.replace(/^www\./, "").toLowerCase();
		} catch {
			return url.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "").toLowerCase();
		}
	}

	function isBlockedSite(blockedSites) {
		const current = normalizeDomain(location.href);
		if (!current) return false;
		return (blockedSites || []).some((site) => {
			const domain = normalizeDomain(site);
			if (!domain) return false;
			return current === domain || current.endsWith("." + domain);
		});
	}

	/* ---------- Detecção de Classificação Indicativa e Palavras-chave no HTML ---------- */

	const CLASSIND_INFO = {
		L: { bg: "#00a859", text: "#ffffff", name: "Classificação Livre (Todas as idades)" },
		"10": { bg: "#009fe3", text: "#ffffff", name: "Não recomendado para menores de 10 anos" },
		"12": { bg: "#ffcc00", text: "#111111", name: "Não recomendado para menores de 12 anos" },
		"14": { bg: "#f37021", text: "#ffffff", name: "Não recomendado para menores de 14 anos" },
		"16": { bg: "#ed1c24", text: "#ffffff", name: "Não recomendado para menores de 16 anos" },
		"18": { bg: "#111111", text: "#ffffff", name: "Não recomendado para menores de 18 anos" },
	};

	const CLASSIND_KEYWORDS = {
		"18": [
			"porn",
			"porno",
			"pornô",
			"pornografia",
			"xxx",
			"sexo",
			"sex",
			"hentai",
			"rule34",
			"rule 34",
			"erotic",
			"erotico",
			"erótico",
			"erótica",
			"erotismo explícito",
			"nudez",
			"nudes",
			"onlyfans",
			"xvideos",
			"pornhub",
			"xnxx",
			"redtube",
			"camgirl",
			"stripchat",
			"chaturbate",
			"fetiche",
			"fetish",
			"orgia",
			"blowjob",
			"gangbang",
			"nsfw",
			"sex shop",
			"prostituição",
			"acompanhantes adultas",
			"putaria",
			"vazados 18",
			"pack de fotos íntimas",
			"deepfake porn",
			"conteúdo adulto",
			"adult content",
			"mature 18+",
			"18+ only",
			"cocaína",
			"heroína",
			"crack",
			"metanfetamina",
			"snuff",
			"gore",
			"suicídio",
			"como se suicidar",
			"automutilação grave",
			"pedofilia",
		],
		"16": [
			"violência extrema",
			"tortura",
			"mutilação",
			"sangue e vísceras",
			"assassinato",
			"execução",
			"chacina",
			"massacre",
			"porte de armas",
			"tráfico de drogas",
			"armas de fogo",
			"fuzil",
			"pistola 9mm",
			"estupro",
			"abuso sexual",
			"nudez explícita",
			"conteúdo sexual",
			"cenas de sexo",
			"maconha",
			"cannabis",
			"baseado",
			"drogas ilícitas",
		],
		"14": [
			"apostas online",
			"cassino online",
			"jogos de azar",
			"jogo do bicho",
			"tigrinho",
			"fortune tiger",
			"blaze apostas",
			"bet365",
			"betano",
			"sportingbet",
			"bingo online",
			"roleta online",
			"caça-níqueis",
			"bebida alcoólica",
			"cerveja",
			"vodka",
			"whisky",
			"cigarro",
			"tabaco",
			"vape",
			"pod eletrônico",
			"cigarro eletrônico",
			"narguilé",
			"balada adulta",
			"strip club",
			"insinuação sexual",
			"arma branca",
			"morte violenta",
		],
		"12": [
			"palavrões",
			"linguagem imprópria",
			"linguagem ofensiva",
			"luta sangrenta",
			"violência moderada",
			"terror psicológico",
			"pânico",
			"assombração",
			"espiritismo macabro",
			"bullying agressivo",
			"depressão severa",
			"ansiedade extrema",
		],
		"10": [
			"angústia infantil",
			"pesadelo aterrorizante",
			"monstros assustadores",
			"perigo extremo para crianças",
			"terror infantil",
			"creepypasta pesada",
			"lenda urbana macabra",
		],
	};

	function matchKeywordInText(text, keyword) {
		if (!text || !keyword) return false;
		const lowerText = text.toLowerCase();
		const lowerKw = keyword.toLowerCase().trim();
		if (!lowerKw) return false;

		// Palavras curtas (<= 4 letras) ou palavras alfanuméricas únicas:
		// usa fronteira de palavra para evitar falso-positivo (ex: "bet" em "alphabet", "xxx" em "triplex")
		if (lowerKw.length <= 4 || (/^[a-z0-9]+$/i.test(lowerKw) && lowerKw.length <= 5)) {
			const escaped = lowerKw.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
			const regex = new RegExp("(?:^|[^a-zA-Z0-9À-ÿ])" + escaped + "(?:$|[^a-zA-Z0-9À-ÿ])", "i");
			return regex.test(lowerText);
		}

		// Expressões compostas ou termos longos e específicos (ex: "rule 34", "jogos de azar", "onlyfans")
		return lowerText.includes(lowerKw);
	}

	function scanContentTagsForKeywords(activeBlockedRatings, customBlockedKeywords = []) {
		// Coleta todos os elementos que possuem atributo "content"
		// (<meta name="keywords" content="...">, <meta name="description" content="...">, etc)
		const contentElements = document.querySelectorAll("[content]");
		const targets = [];

		for (let i = 0; i < contentElements.length; i++) {
			const el = contentElements[i];
			const contentVal = el.getAttribute("content");
			if (contentVal && contentVal.trim()) {
				const tagDesc =
					el.getAttribute("name") ||
					el.getAttribute("property") ||
					el.getAttribute("http-equiv") ||
					el.getAttribute("itemprop") ||
					"content";
				targets.push({
					source: `<meta ${tagDesc} content="...">`,
					text: contentVal.trim(),
				});
			}
		}

		// Adiciona o <title> da página
		if (document.title && document.title.trim()) {
			targets.push({
				source: "<title>",
				text: document.title.trim(),
			});
		}

		// Adiciona trecho inicial do body caso já esteja presente
		if (document.body && document.body.innerText) {
			targets.push({
				source: "Texto da página",
				text: document.body.innerText.slice(0, 15000),
			});
		}

		// 1. Checa palavras-chave específicas conforme as faixas de idade bloqueadas (18, 16, 14, 12, 10)
		const ratingPriority = ["18", "16", "14", "12", "10"];
		for (const ratingId of ratingPriority) {
			if (activeBlockedRatings.includes(ratingId)) {
				const keywords = CLASSIND_KEYWORDS[ratingId] || [];
				for (const target of targets) {
					for (const kw of keywords) {
						if (matchKeywordInText(target.text, kw)) {
							return {
								isRating: true,
								rating: ratingId,
								keyword: kw,
								source: target.source,
								raw: `Palavra-chave "${kw}" identificada na tag content (${target.source})`,
							};
						}
					}
				}
			}
		}

		// 2. Checa palavras-chave customizadas cadastradas pelo responsável
		if (customBlockedKeywords && customBlockedKeywords.length > 0) {
			for (const target of targets) {
				for (const kw of customBlockedKeywords) {
					if (matchKeywordInText(target.text, kw)) {
						return {
							isCustom: true,
							keyword: kw,
							source: target.source,
							raw: `Palavra-chave personalizada "${kw}" identificada na tag content (${target.source})`,
						};
					}
				}
			}
		}

		return null;
	}

	function containsBlockedKeyword(keywords) {
		if (!keywords || keywords.length === 0) return false;

		// 1. Checa tags de content (<meta content="...">)
		const contentElements = document.querySelectorAll("[content]");
		for (let i = 0; i < contentElements.length; i++) {
			const val = contentElements[i].getAttribute("content");
			if (val) {
				const matched = keywords.some((kw) => matchKeywordInText(val, kw));
				if (matched) return true;
			}
		}

		// 2. Checa <title>
		if (document.title) {
			const matched = keywords.some((kw) => matchKeywordInText(document.title, kw));
			if (matched) return true;
		}

		// 3. Checa texto do corpo da página
		if (document.body && document.body.innerText) {
			const bodySnippet = document.body.innerText.slice(0, 25000);
			const matched = keywords.some((kw) => matchKeywordInText(bodySnippet, kw));
			if (matched) return true;
		}

		return false;
	}

	const KNOWN_ADULT_PATTERNS = [
		"pornhub",
		"rule34",
		"xvideos",
		"xnxx",
		"redtube",
		"youporn",
		"chaturbate",
		"onlyfans",
		"brazzers",
		"xhamster",
		"spankbang",
		"tube8",
		"stripchat",
		"livejasmin",
		"cam4",
		"hentai",
		"gelbooru",
		"danbooru",
		"e-hentai",
		"nhentai",
	];

	function isAdultDomain(hostname) {
		if (!hostname) return false;
		const clean = hostname.toLowerCase().replace(/^www\./, "");
		if (
			clean.endsWith(".xxx") ||
			clean.endsWith(".adult") ||
			clean.endsWith(".porn") ||
			clean.endsWith(".sex")
		) {
			return true;
		}
		return KNOWN_ADULT_PATTERNS.some((pattern) => clean.includes(pattern));
	}

	function parseRatingValue(val) {
		if (!val) return null;
		const raw = String(val).trim().toUpperCase();

		// 18+ / Adult / RTA
		if (
			raw === "18" ||
			raw.startsWith("18") ||
			raw.includes("18+") ||
			raw.includes("18 ANOS") ||
			raw.includes("MENORES DE 18") ||
			raw.includes("RTA") ||
			raw.includes("TV-MA") ||
			raw.includes("NC-17") ||
			raw === "R" ||
			raw === "ADULT" ||
			raw === "MATURE" ||
			raw.includes("PORN") ||
			raw.includes("XXX") ||
			raw.includes("EROTIC") ||
			raw.includes("SEX")
		) {
			return "18";
		}

		// 16+
		if (
			raw === "16" ||
			raw.startsWith("16") ||
			raw.includes("16+") ||
			raw.includes("16 ANOS") ||
			raw.includes("MENORES DE 16") ||
			raw.includes("MA-15+") ||
			raw.includes("15+")
		) {
			return "16";
		}

		// 14+ / PG-13 / TV-14
		if (
			raw === "14" ||
			raw.startsWith("14") ||
			raw.includes("14+") ||
			raw.includes("14 ANOS") ||
			raw.includes("MENORES DE 14") ||
			raw.includes("PG-13") ||
			raw.includes("TV-14") ||
			raw.includes("13+")
		) {
			return "14";
		}

		// 12+ / 12A / PG-12
		if (
			raw === "12" ||
			raw.startsWith("12") ||
			raw.includes("12+") ||
			raw.includes("12 ANOS") ||
			raw.includes("MENORES DE 12") ||
			raw.includes("12A") ||
			raw.includes("PG-12")
		) {
			return "12";
		}

		// 10+ / PG / TV-PG
		if (
			raw === "10" ||
			raw.startsWith("10") ||
			raw.includes("10+") ||
			raw.includes("10 ANOS") ||
			raw.includes("MENORES DE 10") ||
			raw === "PG" ||
			raw.includes("TV-PG")
		) {
			return "10";
		}

		// Livre / L
		if (
			raw === "L" ||
			raw === "LIVRE" ||
			raw.includes("LIVRE") ||
			raw === "G" ||
			raw.includes("TV-G") ||
			raw.includes("TV-Y") ||
			raw.includes("GENERAL") ||
			raw === "0"
		) {
			return "L";
		}

		return null;
	}

	function findRatingInJsonLd(obj) {
		if (!obj || typeof obj !== "object") return null;
		if (obj.contentRating) return String(obj.contentRating);
		if (obj.typicalAgeRange) return String(obj.typicalAgeRange);
		if (obj.mpaaRating) return String(obj.mpaaRating);
		if (Array.isArray(obj)) {
			for (const item of obj) {
				const res = findRatingInJsonLd(item);
				if (res) return res;
			}
		}
		for (const key of Object.keys(obj)) {
			if (typeof obj[key] === "object") {
				const res = findRatingInJsonLd(obj[key]);
				if (res) return res;
			}
		}
		return null;
	}

	function detectPageRating(activeBlockedRatings = ["10", "12", "14", "16", "18"], customBlockedKeywords = []) {
		const currentHost = location.hostname ? location.hostname.toLowerCase() : "";

		// 1. Verificação imediata por domínio e TLD (.xxx ou sites adultos conhecidos)
		if (isAdultDomain(currentHost)) {
			return {
				rating: "18",
				raw: currentHost.endsWith(".xxx")
					? "Domínio restrito para maiores de 18 anos (.xxx)"
					: "Site com conteúdo adulto (18+)",
				source: `Identificação automática por classificação indicativa (${currentHost})`,
			};
		}

		// 2. Metatags explícitas de classificação indicativa (rating, RTA, ClassInd, etc)
		const metaElements = document.getElementsByTagName("meta");
		for (let i = 0; i < metaElements.length; i++) {
			const el = metaElements[i];
			const name = (el.getAttribute("name") || "").toLowerCase().trim();
			const prop = (el.getAttribute("property") || "").toLowerCase().trim();
			const equiv = (el.getAttribute("http-equiv") || "").toLowerCase().trim();
			const itemProp = (el.getAttribute("itemprop") || "").toLowerCase().trim();
			const content = (el.getAttribute("content") || el.getAttribute("value") || el.innerText || "").trim();

			if (!content) continue;

			const isRatingTag =
				name.includes("rating") ||
				name.includes("classind") ||
				name.includes("classificacao") ||
				name.includes("age") ||
				name.includes("adult") ||
				prop.includes("rating") ||
				prop.includes("classind") ||
				prop.includes("age") ||
				equiv.includes("rating") ||
				equiv.includes("pics-label") ||
				itemProp.includes("rating") ||
				itemProp.includes("contentrating");

			if (isRatingTag) {
				const parsed = parseRatingValue(content);
				if (parsed) {
					return {
						rating: parsed,
						raw: content,
						source: `<meta ${name ? `name="${name}"` : prop ? `property="${prop}"` : `http-equiv="${equiv}"`}>`,
					};
				}
			}

			// Verificação direta no conteúdo da metatag (RTA, Adult, etc)
			const upper = content.toUpperCase();
			if (
				upper.includes("RTA-5042") ||
				upper.includes("RESTRICTED TO ADULTS") ||
				upper === "RTA" ||
				upper === "ADULT"
			) {
				return {
					rating: "18",
					raw: content,
					source: '<meta name="rating" content="RTA/adult">',
				};
			}
		}

		// 3. IDENTIFICAÇÃO DE PALAVRAS-CHAVE EM TAGS DE "CONTENT" CONFORME AS IDADES BLOQUEADAS
		const keywordMatch = scanContentTagsForKeywords(activeBlockedRatings, customBlockedKeywords);
		if (keywordMatch) {
			if (keywordMatch.isRating) {
				return {
					rating: keywordMatch.rating,
					raw: keywordMatch.raw,
					source: `${keywordMatch.source} (Termo: "${keywordMatch.keyword}")`,
					matchedKeyword: keywordMatch.keyword,
				};
			}
			if (keywordMatch.isCustom) {
				return {
					isCustom: true,
					keyword: keywordMatch.keyword,
					source: keywordMatch.source,
					raw: keywordMatch.raw,
				};
			}
		}

		// 4. Schema.org (JSON-LD)
		const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
		for (const script of jsonLdScripts) {
			try {
				const data = JSON.parse(script.textContent);
				const found = findRatingInJsonLd(data);
				if (found) {
					const parsed = parseRatingValue(found);
					if (parsed) return { rating: parsed, raw: found, source: "Schema.org JSON-LD" };
				}
			} catch {}
		}

		// 5. Elementos com itemprop="contentRating" ou data-rating
		const dataRatingEls = document.querySelectorAll(
			'[data-rating], [data-age-rating], [data-content-rating], [data-classind], [itemprop="contentRating"]'
		);
		for (let i = 0; i < dataRatingEls.length; i++) {
			const el = dataRatingEls[i];
			const val =
				el.getAttribute("data-rating") ||
				el.getAttribute("data-age-rating") ||
				el.getAttribute("data-content-rating") ||
				el.getAttribute("data-classind") ||
				el.getAttribute("content") ||
				el.innerText;
			if (val && val.trim()) {
				const parsed = parseRatingValue(val);
				if (parsed) return { rating: parsed, raw: val.trim(), source: "Atributo HTML data-rating" };
			}
		}

		// 6. Declarações legais de maioridade e avisos (18 U.S.C. 2257 / RTA)
		const title = (document.title || "").toUpperCase();
		if (
			title.includes("RULE34") ||
			title.includes("PORNHUB") ||
			title.includes("XVIDEOS") ||
			title.includes("XNXX")
		) {
			return {
				rating: "18",
				raw: "Conteúdo adulto restrito para menores de 18 anos",
				source: "Título da página",
			};
		}

		if (document.body) {
			const bodySnippet = (document.body.innerText || "").slice(0, 15000);
			if (
				bodySnippet.includes("18 U.S.C. 2257") ||
				bodySnippet.includes("18 U.S.C. § 2257") ||
				bodySnippet.includes("18 USC 2257") ||
				bodySnippet.includes("RTA-5042") ||
				bodySnippet.includes("Restricted to Adults") ||
				bodySnippet.includes("I am 18 years or older") ||
				bodySnippet.includes("I am at least 18 years old") ||
				bodySnippet.includes("Eu tenho 18 anos ou mais") ||
				bodySnippet.includes("para maiores de 18 anos")
			) {
				return {
					rating: "18",
					raw: "Declaração legal de conteúdo restrito para maiores de 18 anos (18 U.S.C. 2257)",
					source: "Aviso de maioridade na página",
				};
			}
		}

		return null;
	}

	function injectClassIndOverlay(detected) {
		if (document.getElementById("kidsafe-overlay")) return;

		const info = CLASSIND_INFO[detected.rating] || {
			bg: "#ed1c24",
			text: "#ffffff",
			name: `Classificação ${detected.rating}`,
		};

		const overlay = document.createElement("div");
		overlay.id = "kidsafe-overlay";
		overlay.style.cssText = `
			position: fixed;
			inset: 0;
			z-index: 2147483647;
			background: #0f172a;
			color: #ffffff;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			padding: 24px;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		`;

		const badge = document.createElement("div");
		badge.style.cssText = `
			width: 72px;
			height: 72px;
			border-radius: 14px;
			background-color: ${info.bg};
			color: ${info.text};
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2.2rem;
			font-weight: 900;
			margin-bottom: 24px;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
			border: 3px solid rgba(255, 255, 255, 0.2);
		`;
		badge.textContent = detected.rating;

		const heading = document.createElement("h1");
		heading.textContent = "Conteúdo bloqueado por classificação indicativa";
		heading.style.cssText = "font-size: 1.7rem; font-weight: 700; margin-bottom: 12px; color: #ffffff;";

		const sub = document.createElement("p");
		sub.textContent = `Este site foi bloqueado porque possui ${info.name}, restrita pelas configurações de segurança da sua família.`;
		sub.style.cssText = "color: #cbd5e1; max-width: 480px; font-size: 1.1rem; line-height: 1.5; margin: 0 0 16px 0;";

		const tagSourcePill = document.createElement("div");
		tagSourcePill.style.cssText = `
			background: #1e293b;
			border: 1px solid #334155;
			padding: 8px 16px;
			border-radius: 9999px;
			font-size: 0.85rem;
			color: #94a3b8;
			margin-bottom: 24px;
		`;
		tagSourcePill.textContent = detected.matchedKeyword
			? `Identificado em tag de conteúdo (content): ${detected.source}`
			: `Identificado via tag HTML de idade: ${detected.source} ("${detected.raw}")`;

		const button = document.createElement("button");
		button.textContent = "Voltar";
		button.style.cssText = `
			padding: 12px 36px;
			background: #2563eb;
			color: #ffffff;
			border: none;
			border-radius: 10px;
			font-size: 1rem;
			font-weight: 600;
			cursor: pointer;
			transition: background 0.2s ease;
		`;
		button.addEventListener("click", () => {
			if (window.history.length > 1) {
				window.history.back();
			} else {
				window.location.href = "https://www.google.com";
			}
		});

		overlay.appendChild(badge);
		overlay.appendChild(heading);
		overlay.appendChild(sub);
		overlay.appendChild(tagSourcePill);
		overlay.appendChild(button);

		document.documentElement.style.overflow = "hidden";
		document.documentElement.appendChild(overlay);
	}

	let breakCountdownInterval = null;

	function formatRemaining(ms) {
		const totalSec = Math.max(0, Math.ceil(ms / 1000));
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
	}

	function injectBreakOverlay(breakEndTime) {
		let overlay = document.getElementById("kidsafe-break-overlay");
		if (overlay) return;

		overlay = document.createElement("div");
		overlay.id = "kidsafe-break-overlay";
		overlay.style.cssText = `
			position: fixed;
			inset: 0;
			z-index: 2147483647;
			background: #111827;
			color: #ffffff;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			padding: 24px;
			font-family: system-ui, sans-serif;
		`;

		const heading = document.createElement("h1");
		heading.textContent = "Hora de uma pausa!";
		heading.style.cssText = "font-size: 1.8rem; margin-bottom: 12px; color: #60a5fa;";

		const text = document.createElement("p");
		text.textContent =
			"Pausa programada pelo responsável. Descanse a visão, levante-se e beba um copo d'água.";
		text.style.cssText = "color: #9ca3af; max-width: 400px; margin-bottom: 20px;";

		const timerBox = document.createElement("div");
		timerBox.style.cssText = `
			background: #1f2937;
			padding: 16px 28px;
			border-radius: 12px;
			border: 1px solid #374151;
		`;

		const timerLabel = document.createElement("div");
		timerLabel.textContent = "Desbloqueio automático em:";
		timerLabel.style.cssText = "font-size: 0.875rem; color: #9ca3af; margin-bottom: 6px;";

		const timerValue = document.createElement("div");
		timerValue.id = "kidsafe-break-countdown";
		timerValue.textContent = formatRemaining((breakEndTime || 0) - Date.now());
		timerValue.style.cssText = "font-size: 2rem; font-weight: 700; color: #ffffff;";

		timerBox.appendChild(timerLabel);
		timerBox.appendChild(timerValue);

		overlay.appendChild(heading);
		overlay.appendChild(text);
		overlay.appendChild(timerBox);

		document.documentElement.style.overflow = "hidden";
		document.documentElement.appendChild(overlay);

		if (breakCountdownInterval) clearInterval(breakCountdownInterval);
		breakCountdownInterval = setInterval(() => {
			const remainingMs = (breakEndTime || 0) - Date.now();
			const el = document.getElementById("kidsafe-break-countdown");
			if (el) {
				el.textContent = formatRemaining(remainingMs);
			}
			if (remainingMs <= 0) {
				removeBreakOverlay();
			}
		}, 1000);
	}

	function removeBreakOverlay() {
		if (breakCountdownInterval) {
			clearInterval(breakCountdownInterval);
			breakCountdownInterval = null;
		}
		const overlay = document.getElementById("kidsafe-break-overlay");
		if (overlay) {
			overlay.remove();
			document.documentElement.style.overflow = "";
		}
	}

	function applyState({
		lockScreen,
		outOfSchedule,
		scheduledBreakActive,
		breakEndTime,
		blockedKeywords,
		blockedSites,
		blockedRatings,
		extensionEnabled,
	}) {
		// Extensão pausada pelo responsável: nada é aplicado
		if (extensionEnabled === false) {
			removeOverlay();
			removeBreakOverlay();
			return;
		}

		if (lockScreen) {
			removeBreakOverlay();
			injectOverlay(
				"Dispositivo bloqueado",
				"O responsável bloqueou a tela deste dispositivo."
			);
			return;
		}

		if (outOfSchedule) {
			removeBreakOverlay();
			injectOverlay(
				"Fora do horário permitido",
				"A navegação está disponível apenas no horário configurado pelo responsável."
			);
			return;
		}

		if (scheduledBreakActive && (!breakEndTime || Date.now() < breakEndTime)) {
			removeOverlay();
			injectBreakOverlay(breakEndTime);
			return;
		} else {
			removeBreakOverlay();
		}

		// Reforço do bloqueio de sites (além das regras do navegador)
		if (isBlockedSite(blockedSites)) {
			injectOverlay(
				"Site bloqueado",
				"Este site foi bloqueado pelo responsável."
			);
			return;
		}

		// Bloqueio por Classificação Indicativa Brasileira via tags HTML de idade e palavras-chave em tags content
		const activeBlockedRatings =
			Array.isArray(blockedRatings) && blockedRatings.length > 0
				? blockedRatings
				: ["10", "12", "14", "16", "18"];

		const detected = detectPageRating(activeBlockedRatings, blockedKeywords || []);
		if (detected) {
			if (detected.isCustom) {
				injectOverlay(
					"Conteúdo bloqueado",
					`Esta página contém a palavra-chave restrita "${detected.keyword}" identificada na tag de conteúdo (${detected.source}).`
				);
				return;
			}
			if (activeBlockedRatings.includes(detected.rating)) {
				injectClassIndOverlay(detected);
				return;
			}
		}

		if (blockedKeywords && blockedKeywords.length > 0) {
			if (containsBlockedKeyword(blockedKeywords)) {
				injectOverlay(
					"Conteúdo bloqueado",
					"Esta página contém uma palavra-chave restrita identificada no conteúdo ou metadados pelo responsável."
				);
				return;
			}
		}

		removeOverlay();
	}

	function showMessage(text) {
		// Modal da extensão (não é notificação do navegador)
		const existing = document.getElementById("kidsafe-message");
		if (existing) existing.remove();

		const overlay = document.createElement("div");
		overlay.id = "kidsafe-message";
		overlay.style.cssText = `
			position: fixed;
			inset: 0;
			z-index: 2147483647;
			background: rgba(17, 24, 39, 0.92);
			display: flex;
			align-items: center;
			justify-content: center;
			font-family: system-ui, sans-serif;
		`;

		const card = document.createElement("div");
		card.style.cssText = `
			background: #ffffff;
			color: #111827;
			border-radius: 12px;
			padding: 24px;
			max-width: 380px;
			text-align: center;
		`;

		const title = document.createElement("h2");
		title.textContent = "Mensagem do responsável";
		title.style.cssText = "font-size: 1.1rem; margin-bottom: 12px;";

		const body = document.createElement("p");
		body.textContent = text;
		body.style.cssText = "color: #374151; margin-bottom: 20px;";

		const button = document.createElement("button");
		button.textContent = "OK";
		button.style.cssText = `
			padding: 10px 32px;
			background: #2563eb;
			color: #ffffff;
			border: none;
			border-radius: 8px;
			font-size: 1rem;
			cursor: pointer;
		`;
		button.addEventListener("click", () => overlay.remove());

		card.appendChild(title);
		card.appendChild(body);
		card.appendChild(button);
		overlay.appendChild(card);
		document.documentElement.appendChild(overlay);
	}

	let isRatingBlocked = false;

	function checkAndBlockFast() {
		if (isRatingBlocked) return true;
		chrome.storage.local.get(
			["blockedRatings", "blockedKeywords", "extensionEnabled"],
			({ blockedRatings, blockedKeywords, extensionEnabled }) => {
				if (extensionEnabled === false) return;
				const activeRatings =
					Array.isArray(blockedRatings) && blockedRatings.length > 0
						? blockedRatings
						: ["10", "12", "14", "16", "18"];

				const detected = detectPageRating(activeRatings, blockedKeywords || []);
				if (detected) {
					if (detected.isCustom) {
						isRatingBlocked = true;
						injectOverlay(
							"Conteúdo bloqueado",
							`Esta página contém a palavra-chave restrita "${detected.keyword}" identificada na tag de conteúdo (${detected.source}).`
						);
						return;
					}
					if (activeRatings.includes(detected.rating)) {
						isRatingBlocked = true;
						injectClassIndOverlay(detected);
						return;
					}
				}

				if (blockedKeywords && blockedKeywords.length > 0) {
					if (containsBlockedKeyword(blockedKeywords)) {
						isRatingBlocked = true;
						injectOverlay(
							"Conteúdo bloqueado",
							"Esta página contém uma palavra-chave restrita identificada pelo responsável."
						);
					}
				}
			}
		);
	}

	function loadStateAndApply() {
		chrome.storage.local.get(
			[
				"lockScreen",
				"outOfSchedule",
				"scheduledBreakActive",
				"breakEndTime",
				"blockedKeywords",
				"blockedSites",
				"blockedRatings",
				"childAgeGroup",
				"extensionEnabled",
				"lastMessage",
				"lastShownMessageId",
			],
			(state) => {
				applyState(state);

				const lastShownMessageId = state.lastShownMessageId || 0;
				if (state.lastMessage && state.lastMessage.id !== lastShownMessageId) {
					chrome.storage.local.set({ lastShownMessageId: state.lastMessage.id });
					showMessage(state.lastMessage.text);
				}
			}
		);
	}

	// 1. Verificação no milissegundo zero em document_start
	checkAndBlockFast();

	// 2. Observação do DOM em tempo real conforme as tags chegam pelo stream HTML
	try {
		const observer = new MutationObserver(() => {
			if (isRatingBlocked) {
				observer.disconnect();
				return;
			}
			checkAndBlockFast();
		});

		observer.observe(document.documentElement || document, {
			childList: true,
			subtree: true,
		});
	} catch (e) {}

	// 3. Execução completa com leitura do storage
	loadStateAndApply();
	document.addEventListener("DOMContentLoaded", () => {
		loadStateAndApply();
		checkAndBlockFast();
	});
	window.addEventListener("load", () => {
		loadStateAndApply();
		checkAndBlockFast();
	});
	// Rechecks para páginas com carregamento dinâmico
	setTimeout(loadStateAndApply, 400);
	setTimeout(loadStateAndApply, 1200);
	setTimeout(loadStateAndApply, 2500);

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== "local") return;
		isRatingBlocked = false;
		loadStateAndApply();
	});
})();