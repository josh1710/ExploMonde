import {
    chercherPays,
    chercherPaysParRegion
} from "./api.js";

import {
    creerCarte,
    afficherDetail
} from "./ui.js";

const formulaire = document.querySelector("#formulaire-recherche");
const champRecherche = document.querySelector("#recherche-pays");
const filtreRegion = document.querySelector("#filtre-region");
const listePays = document.querySelector("#liste-pays");
const statutResultats = document.querySelector("#statut-resultats");
const boutonReessayer = document.querySelector("#bouton-reessayer");
const detailPays = document.querySelector("#detail-pays");

let paysAffiches = [];
let minuterieRecherche;
let derniereRequete = null;
let numeroRequete = 0;

function afficherChargement() {
    listePays.replaceChildren();
    listePays.setAttribute("aria-busy", "true");

    statutResultats.textContent = "Chargement des pays…";
    boutonReessayer.hidden = true;
    detailPays.hidden = true;
}

function afficherSucces(resultats) {
    const fragment = document.createDocumentFragment();

    resultats.forEach((pays) => {
        fragment.append(creerCarte(pays));
    });

    paysAffiches = resultats;

    listePays.replaceChildren(fragment);
    listePays.setAttribute("aria-busy", "false");
    boutonReessayer.hidden = true;

    if (resultats.length === 0) {
        statutResultats.textContent = "Aucun pays trouvé.";
        return;
    }

    const texte = resultats.length > 1
        ? "pays trouvés"
        : "pays trouvé";

    statutResultats.textContent =
        `${resultats.length} ${texte}`;
}

function afficherErreur(erreur) {
    paysAffiches = [];

    listePays.replaceChildren();
    listePays.setAttribute("aria-busy", "false");

    if (erreur.statut === 401) {
        statutResultats.textContent =
            "La clé API est invalide ou expirée.";
    } else if (erreur.statut === 403) {
        statutResultats.textContent =
            "L’API refuse la requête. Vérifiez les origines autorisées.";
    } else {
        statutResultats.textContent =
            "Impossible de contacter l’API. Vérifiez votre connexion.";
    }

    boutonReessayer.hidden = false;
    detailPays.hidden = true;

    console.error(erreur);
}

async function executerRequete(requete) {
    const numeroActuel = ++numeroRequete;
    derniereRequete = requete;

    afficherChargement();

    try {
        const resultats = await requete();

        if (numeroActuel !== numeroRequete) {
            return;
        }

        afficherSucces(resultats);
    } catch (erreur) {
        if (numeroActuel !== numeroRequete) {
            return;
        }

        afficherErreur(erreur);
    }
}

function chargerRegionSelectionnee() {
    const region = filtreRegion.value;

    executerRequete(() => {
        return chercherPaysParRegion(region);
    });
}

function rechercherDepuisLeChamp() {
    const recherche = champRecherche.value.trim();

    if (recherche === "") {
        chargerRegionSelectionnee();
        return;
    }

    executerRequete(() => {
        return chercherPays(recherche);
    });
}

function ouvrirDetail(carte) {
    const codePays = carte.dataset.code;

    const paysSelectionne = paysAffiches.find((pays) => {
        return pays.code === codePays;
    });

    if (paysSelectionne) {
        afficherDetail(paysSelectionne, detailPays);
    }
}

champRecherche.addEventListener("input", () => {
    clearTimeout(minuterieRecherche);

    minuterieRecherche = setTimeout(() => {
        rechercherDepuisLeChamp();
    }, 300);
});

formulaire.addEventListener("submit", (evenement) => {
    evenement.preventDefault();

    clearTimeout(minuterieRecherche);
    rechercherDepuisLeChamp();
});

filtreRegion.addEventListener("change", () => {
    champRecherche.value = "";
    chargerRegionSelectionnee();
});

boutonReessayer.addEventListener("click", () => {
    if (derniereRequete) {
        executerRequete(derniereRequete);
    }
});

listePays.addEventListener("click", (evenement) => {
    const carte = evenement.target.closest(".country-card");

    if (carte && listePays.contains(carte)) {
        ouvrirDetail(carte);
    }
});

listePays.addEventListener("keydown", (evenement) => {
    const carte = evenement.target.closest(".country-card");

    if (
        carte &&
        (evenement.key === "Enter" || evenement.key === " ")
    ) {
        evenement.preventDefault();
        ouvrirDetail(carte);
    }
});

chargerRegionSelectionnee();