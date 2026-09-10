function formaterPopulation(population) {
    return new Intl.NumberFormat("fr-FR").format(population);
}

function creerInformation(titre, valeur) {
    const paragraphe = document.createElement("p");
    const libelle = document.createElement("strong");

    libelle.textContent = `${titre} :`;
    paragraphe.append(libelle, ` ${valeur}`);

    return paragraphe;
}

export function creerCarte(pays) {
    const article = document.createElement("article");
    const titre = document.createElement("h3");

    article.classList.add("country-card");
    article.dataset.code = pays.code;
    article.tabIndex = 0;
    article.setAttribute("role", "button");
    article.setAttribute(
        "aria-label",
        `Afficher les détails de ${pays.nom}`
    );

    titre.textContent = pays.nom;

    article.append(
        titre,
        creerInformation("Capitale", pays.capitale),
        creerInformation("Région", pays.region),
        creerInformation(
            "Population",
            formaterPopulation(pays.population)
        )
    );

    return article;
}

export function afficherDetail(pays, conteneur) {
    const titreSection = document.createElement("h2");
    const nomPays = document.createElement("h3");

    titreSection.textContent = "Détail du pays";
    nomPays.textContent = pays.nom;

    conteneur.replaceChildren(
        titreSection,
        nomPays,
        creerInformation("Code", pays.code),
        creerInformation("Capitale", pays.capitale),
        creerInformation("Région", pays.region),
        creerInformation(
            "Population",
            formaterPopulation(pays.population)
        )
    );

    conteneur.hidden = false;
    conteneur.focus();
}