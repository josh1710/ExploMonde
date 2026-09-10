import { pays } from "./data.js";
import { creerCarte, afficherDetail } from "./ui.js";

const formulaire = document.querySelector("#formulaire-recherche");
const champRecherche = document.querySelector("#recherche-pays");
const filtreRegion = document.querySelector("#filtre-region");
const listePays = document.querySelector("#liste-pays");
const statutResultats = document.querySelector("#statut-resultats");
const detailPays = document.querySelector("#detail-pays");

function afficherPays(liste) {
    const fragment = document.createDocumentFragment();

    liste.forEach((paysActuel) => {
        fragment.append(creerCarte(paysActuel));
    });

    listePays.replaceChildren(fragment);

    const pluriel = liste.length > 1 ? "pays trouvés" : "pays trouvé";
    statutResultats.textContent = `${liste.length} ${pluriel}`;
}

function filtrerPays() {
    const regionSelectionnee = filtreRegion.value;
    const recherche = champRecherche.value.trim().toLowerCase();

    return pays.filter((paysActuel) => {
        const correspondARegion =
            regionSelectionnee === "" ||
            paysActuel.region === regionSelectionnee;

        const correspondARecherche =
            paysActuel.nom.toLowerCase().includes(recherche);

        return correspondARegion && correspondARecherche;
    });
}

function actualiserResultats() {
    const resultats = filtrerPays();
    afficherPays(resultats);
}

function ouvrirDetail(carte) {
    const codePays = carte.dataset.code;

    const paysSelectionne = pays.find(
        (paysActuel) => paysActuel.code === codePays
    );

    if (paysSelectionne) {
        afficherDetail(paysSelectionne, detailPays);
    }
}

formulaire.addEventListener("submit", (evenement) => {
    evenement.preventDefault();
    actualiserResultats();
});

filtreRegion.addEventListener("change", actualiserResultats);

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

afficherPays(pays);