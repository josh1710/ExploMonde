import { API_KEY } from "./config.js";

const API_URL = "https://api.restcountries.com/countries/v5";

const CHAMPS = [
    "names.common",
    "capitals",
    "codes.alpha_2",
    "region",
    "population"
].join(",");

const nomsRegions = {
    Africa: "Afrique",
    Americas: "Amérique",
    Asia: "Asie",
    Europe: "Europe",
    Oceania: "Océanie",
    Antarctic: "Antarctique"
};

function obtenirCapitale(donnee) {
    if (!Array.isArray(donnee.capitals)) {
        return "Non renseignée";
    }

    const capitalePrincipale = donnee.capitals.find((capitale) => {
        return (
            capitale.primary === true ||
            capitale.attributes?.primary === true
        );
    });

    return (
        capitalePrincipale?.name ??
        donnee.capitals[0]?.name ??
        "Non renseignée"
    );
}

function normaliserPays(donnee) {
    return {
        nom: donnee.names?.common ?? "Nom inconnu",
        capitale: obtenirCapitale(donnee),
        region: nomsRegions[donnee.region] ?? donnee.region ?? "Inconnue",
        population: donnee.population ?? 0,
        code: donnee.codes?.alpha_2 ?? ""
    };
}

function creerAdresse(chemin, parametres = {}) {
    const adresse = new URL(`${API_URL}${chemin}`);

    adresse.searchParams.set("limit", "100");
    adresse.searchParams.set("response_fields", CHAMPS);

    Object.entries(parametres).forEach(([nom, valeur]) => {
        adresse.searchParams.set(nom, valeur);
    });

    return adresse;
}

async function effectuerRequete(adresse) {
    if (!API_KEY || API_KEY.includes("COLLE_ICI")) {
        throw new Error("La clé API n'est pas configurée.");
    }

    const reponse = await fetch(adresse, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${API_KEY}`
        }
    });

    const resultat = await reponse.json().catch(() => null);

    if (!reponse.ok) {
        const message =
            resultat?.errors?.[0]?.message ??
            `Erreur HTTP ${reponse.status}`;

        const erreur = new Error(message);
        erreur.statut = reponse.status;

        throw erreur;
    }

    const objets = resultat?.data?.objects;

    if (!Array.isArray(objets)) {
        throw new Error("La réponse de l'API est incorrecte.");
    }

    return objets
        .map(normaliserPays)
        .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export function chercherPays(nom) {
    const recherche = nom.trim();

    if (recherche === "") {
        return Promise.resolve([]);
    }

    const adresse = creerAdresse("/name", {
        q: recherche
    });

    return effectuerRequete(adresse);
}

export function chercherPaysParRegion(region) {
    const adresse = creerAdresse(
        `/region/${encodeURIComponent(region)}`
    );

    return effectuerRequete(adresse);
}