Claro — aqui está o script.js completo da primeira versão. Ele já conversa com a PokéAPI, carrega Pokémon, busca, filtra por tipo, abre detalhes, favoritar e montar equipe.

Salve exatamente como script.js na mesma pasta do index.html e style.css.

/* =========================================================
   POKÉFLAME — SCRIPT PRINCIPAL
   Pokémon Hub | GitHub Pages
   ========================================================= */

const API_URL = "https://pokeapi.co/api/v2";
const MAX_POKEMON = 1025;

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

const state = {
    pokemon: [],
    displayedPokemon: [],
    favorites: JSON.parse(localStorage.getItem("pokeflame_favorites")) || [],
    team: JSON.parse(localStorage.getItem("pokeflame_team")) || [],
    currentPage: 1,
    perPage: 24,
    currentFilter: "all",
    currentSearch: "",
    loading: false,
    currentPokemon: null
};

/* =========================================================
   ELEMENTOS DOM
   ========================================================= */

const elements = {
    grid: document.getElementById("pokemon-grid"),
    search: document.getElementById("pokemon-search"),
    searchButton: document.getElementById("search-button"),
    typeFilters: document.getElementById("type-filters"),
    pagination: document.getElementById("pagination"),
    modal: document.getElementById("pokemon-modal"),
    modalContent: document.getElementById("pokemon-modal-content"),
    modalClose: document.getElementById("modal-close"),
    favoritesCount: document.getElementById("favorites-count"),
    teamCount: document.getElementById("team-count"),
    teamContainer: document.getElementById("team-container"),
    randomButton: document.getElementById("random-pokemon"),
    menuButton: document.getElementById("menu-button"),
    navigation: document.getElementById("main-navigation"),
    loading: document.getElementById("loading")
};

/* =========================================================
   TIPOS
   ========================================================= */

const pokemonTypes = [
    "all",
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
];

const typeNames = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    electric: "Elétrico",
    grass: "Planta",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Veneno",
    ground: "Terrestre",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
};

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

async function initializeApp() {
    setupEvents();
    updateCounters();
    renderTypeFilters();
    renderTeam();

    await loadPokemonList();
}

/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    if (elements.search) {
        elements.search.addEventListener("input", debounce(() => {
            state.currentSearch = elements.search.value
                .trim()
                .toLowerCase();

            state.currentPage = 1;
            applyFilters();
        }, 300));

        elements.search.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                state.currentSearch = elements.search.value
                    .trim()
                    .toLowerCase();

                state.currentPage = 1;
                applyFilters();
            }
        });
    }

    if (elements.searchButton) {
        elements.searchButton.addEventListener("click", () => {
            state.currentSearch = elements.search.value
                .trim()
                .toLowerCase();

            state.currentPage = 1;
            applyFilters();
        });
    }

    if (elements.modalClose) {
        elements.modalClose.addEventListener("click", closeModal);
    }

    if (elements.modal) {
        elements.modal.addEventListener("click", event => {
            if (event.target === elements.modal) {
                closeModal();
            }
        });
    }

    if (elements.randomButton) {
        elements.randomButton.addEventListener("click", showRandomPokemon);
    }

    if (elements.menuButton) {
        elements.menuButton.addEventListener("click", () => {
            elements.navigation?.classList.toggle("active");
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
}

/* =========================================================
   CARREGAR LISTA DE POKÉMON
   ========================================================= */

async function loadPokemonList() {

    state.loading = true;
    showLoading(true);

    try {

        const response = await fetch(
            `${API_URL}/pokemon?limit=${MAX_POKEMON}`
        );

        if (!response.ok) {
            throw new Error("Erro ao acessar a PokéAPI.");
        }

        const data = await response.json();

        state.pokemon = data.results.map((pokemon, index) => ({
            id: index + 1,
            name: pokemon.name,
            url: pokemon.url,
            image:
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`
        }));

        state.displayedPokemon = [...state.pokemon];

        applyFilters();

    } catch (error) {

        console.error(error);

        showError(
            "Não foi possível carregar a Pokédex. Verifique sua conexão e tente novamente."
        );

    } finally {

        state.loading = false;
        showLoading(false);
    }
}

/* =========================================================
   FILTROS
   ========================================================= */

function renderTypeFilters() {

    if (!elements.typeFilters) return;

    elements.typeFilters.innerHTML = pokemonTypes
        .map(type => {

            const label =
                type === "all"
                    ? "Todos"
                    : typeNames[type];

            return `
                <button
                    class="type-filter ${type === "all" ? "active" : ""}"
                    data-type="${type}"
                >
                    ${label}
                </button>
            `;
        })
        .join("");

    document
        .querySelectorAll(".type-filter")
        .forEach(button => {

            button.addEventListener("click", async () => {

                document
                    .querySelectorAll(".type-filter")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                state.currentFilter =
                    button.dataset.type;

                state.currentPage = 1;

                await applyFilters();
            });
        });
}

async function applyFilters() {

    let results = [...state.pokemon];

    /* Busca */

    if (state.currentSearch) {

        results = results.filter(pokemon => {

            const number =
                pokemon.id.toString().padStart(3, "0");

            return (
                pokemon.name
                    .toLowerCase()
                    .includes(state.currentSearch) ||
                number.includes(state.currentSearch) ||
                pokemon.id.toString()
                    .includes(state.currentSearch)
            );
        });
    }

    /* Tipo */

    if (state.currentFilter !== "all") {

        try {

            const response = await fetch(
                `${API_URL}/type/${state.currentFilter}`
            );

            const data = await response.json();

            const typeIds = new Set(
                data.pokemon.map(item =>
                    extractIdFromUrl(item.pokemon.url)
                )
            );

            results = results.filter(pokemon =>
                typeIds.has(pokemon.id)
            );

        } catch (error) {

            console.error(
                "Erro ao filtrar por tipo:",
                error
            );
        }
    }

    state.displayedPokemon = results;

    renderPokemonGrid();
    renderPagination();
}

/* =========================================================
   GRID
   ========================================================= */

function renderPokemonGrid() {

    if (!elements.grid) return;

    const start =
        (state.currentPage - 1) * state.perPage;

    const end =
        start + state.perPage;

    const pagePokemon =
        state.displayedPokemon.slice(start, end);

    if (!pagePokemon.length) {

        elements.grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔥</div>
                <h3>Nenhum Pokémon encontrado</h3>
                <p>
                    Tente outro nome, número ou tipo.
                </p>
            </div>
        `;

        return;
    }

    elements.grid.innerHTML =
        pagePokemon
            .map(createPokemonCard)
            .join("");

    document
        .querySelectorAll(".pokemon-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                const id =
                    Number(card.dataset.id);

                openPokemonModal(id);
            });
        });

    document
        .querySelectorAll(".favorite-button")
        .forEach(button => {

            button.addEventListener("click", event => {

                event.stopPropagation();

                const id =
                    Number(button.dataset.id);

                toggleFavorite(id);
            });
        });
}

/* =========================================================
   CARD
   ========================================================= */

function createPokemonCard(pokemon) {

    const favorite =
        state.favorites.includes(pokemon.id);

    const number =
        `#${pokemon.id.toString().padStart(3, "0")}`;

    return `
        <article
            class="pokemon-card"
            data-id="${pokemon.id}"
        >

            <button
                class="favorite-button ${favorite ? "active" : ""}"
                data-id="${pokemon.id}"
                aria-label="Favoritar Pokémon"
            >
                ${favorite ? "♥" : "♡"}
            </button>

            <span class="pokemon-number">
                ${number}
            </span>

            <div class="pokemon-image-wrapper">
                <div class="pokemon-glow"></div>

                <img
                    class="pokemon-image"
                    src="${pokemon.image}"
                    alt="${capitalize(pokemon.name)}"
                    loading="lazy"
                >
            </div>

            <div class="pokemon-card-info">

                <h3>
                    ${capitalize(pokemon.name)}
                </h3>

                <span class="pokemon-id">
                    ${number}
                </span>

            </div>

            <div class="card-bottom">
                <span>Ver detalhes</span>
                <span class="arrow">→</span>
            </div>

        </article>
    `;
}

/* =========================================================
   PAGINAÇÃO
   ========================================================= */

function renderPagination() {

    if (!elements.pagination) return;

    const totalPages =
        Math.ceil(
            state.displayedPokemon.length /
            state.perPage
        );

    if (totalPages <= 1) {

        elements.pagination.innerHTML = "";
        return;
    }

    let html = "";

    html += `
        <button
            class="pagination-button"
            ${state.currentPage === 1 ? "disabled" : ""}
            data-page="${state.currentPage - 1}"
        >
            ←
        </button>
    `;

    const maxButtons = 7;

    let start =
        Math.max(
            1,
            state.currentPage -
            Math.floor(maxButtons / 2)
        );

    let end =
        Math.min(
            totalPages,
            start + maxButtons - 1
        );

    if (end - start < maxButtons - 1) {
        start =
            Math.max(
                1,
                end - maxButtons + 1
            );
    }

    for (let i = start; i <= end; i++) {

        html += `
            <button
                class="pagination-button ${i === state.currentPage ? "active" : ""}"
                data-page="${i}"
            >
                ${i}
            </button>
        `;
    }

    html += `
        <button
            class="pagination-button"
            ${state.currentPage === totalPages ? "disabled" : ""}
            data-page="${state.currentPage + 1}"
        >
            →
        </button>
    `;

    elements.pagination.innerHTML = html;

    document
        .querySelectorAll(".pagination-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                if (button.disabled) return;

                const page =
                    Number(button.dataset.page);

                if (!page) return;

                state.currentPage = page;

                renderPokemonGrid();
                renderPagination();

                scrollToPokemon();
            });
        });
}

function scrollToPokemon() {

    const grid =
        document.querySelector("#pokemon-grid");

    if (grid) {

        grid.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* =========================================================
   DETALHES DO POKÉMON
   ========================================================= */

async function openPokemonModal(id) {

    if (!elements.modal ||
        !elements.modalContent) return;

    elements.modal.classList.add("active");

    document.body.classList.add("modal-open");

    elements.modalContent.innerHTML = `
        <div class="modal-loading">
            <div class="spinner"></div>
            <p>Carregando Pokémon...</p>
        </div>
    `;

    try {

        const pokemonResponse =
            await fetch(
                `${API_URL}/pokemon/${id}`
            );

        if (!pokemonResponse.ok) {
            throw new Error("Pokémon não encontrado.");
        }

        const pokemon =
            await pokemonResponse.json();

        state.currentPokemon = pokemon;

        const speciesResponse =
            await fetch(
                `${API_URL}/pokemon-species/${id}`
            );

        const species =
            await speciesResponse.json();

        const evolutionUrl =
            species.evolution_chain?.url;

        let evolutionChain = null;

        if (evolutionUrl) {

            const evolutionResponse =
                await fetch(evolutionUrl);

            evolutionChain =
                await evolutionResponse.json();
        }

        renderPokemonModal(
            pokemon,
            species,
            evolutionChain
        );

    } catch (error) {

        console.error(error);

        elements.modalContent.innerHTML = `
            <div class="error-state">
                <h3>Ops! 🔥</h3>
                <p>
                    Não conseguimos carregar os detalhes desse Pokémon.
                </p>
            </div>
        `;
    }
}

function renderPokemonModal(
    pokemon,
    species,
    evolutionChain
) {

    const favorite =
        state.favorites.includes(pokemon.id);

    const types =
        pokemon.types
            .map(type => {

                const name =
                    typeNames[type.type.name] ||
                    capitalize(type.type.name);

                return `
                    <span class="type-badge type-${type.type.name}">
                        ${name}
                    </span>
                `;
            })
            .join("");

    const abilities =
        pokemon.abilities
            .map(ability => `
                <span class="ability-badge">
                    ${formatName(ability.ability.name)}
                </span>
            `)
            .join("");

    const stats =
        pokemon.stats
            .map(stat => {

                const value =
                    stat.base_stat;

                const percentage =
                    Math.min(
                        100,
                        Math.round((value / 180) * 100)
                    );

                return `
                    <div class="stat-row">

                        <div class="stat-name">
                            ${formatStatName(stat.stat.name)}
                        </div>

                        <div class="stat-bar">
                            <div
                                class="stat-fill"
                                style="width: ${percentage}%"
                            ></div>
                        </div>

                        <div class="stat-value">
                            ${value}
                        </div>

                    </div>
                `;
            })
            .join("");

    const description =
        getPokemonDescription(species);

    const height =
        (pokemon.height / 10)
            .toFixed(1);

    const weight =
        (pokemon.weight / 10)
            .toFixed(1);

    const shinyImage =
        pokemon.sprites.other?.["official-artwork"]?.front_shiny ||
        pokemon.sprites.front_shiny;

    const normalImage =
        pokemon.sprites.other?.["official-artwork"]?.front_default ||
        pokemon.sprites.front_default;

    const evolutions =
        buildEvolutionHTML(evolutionChain);

    elements.modalContent.innerHTML = `

        <div class="pokemon-detail">

            <div class="detail-hero">

                <div class="detail-number">
                    #${pokemon.id.toString().padStart(3, "0")}
                </div>

                <button
                    class="detail-favorite ${favorite ? "active" : ""}"
                    onclick="toggleFavorite(${pokemon.id}); refreshModal(${pokemon.id})"
                >
                    ${favorite ? "♥ Favoritado" : "♡ Favoritar"}
                </button>

                <div class="detail-image-container">

                    <div class="detail-glow"></div>

                    <img
                        id="detail-pokemon-image"
                        src="${normalImage}"
                        alt="${pokemon.name}"
                    >

                </div>

                <div class="shiny-control">

                    <button
                        class="shiny-button active"
                        onclick="changePokemonImage('${normalImage}', this)"
                    >
                        Normal
                    </button>

                    <button
                        class="shiny-button"
                        onclick="changePokemonImage('${shinyImage}', this)"
                    >
                        ✨ Shiny
                    </button>

                </div>

                <h2>
                    ${capitalize(pokemon.name)}
                </h2>

                <div class="detail-types">
                    ${types}
                </div>

            </div>

            <div class="detail-body">

                <section class="detail-section">

                    <div class="section-title">
                        <span>📊</span>
                        <h3>Informações</h3>
                    </div>

                    <div class="info-grid">

                        <div class="info-item">
                            <span>Altura</span>
                            <strong>${height} m</strong>
                        </div>

                        <div class="info-item">
                            <span>Peso</span>
                            <strong>${weight} kg</strong>
                        </div>

                        <div class="info-item">
                            <span>Experiência base</span>
                            <strong>${pokemon.base_experience || "-"}</strong>
                        </div>

                        <div class="info-item">
                            <span>Ordem</span>
                            <strong>${pokemon.order}</strong>
                        </div>

                    </div>

                </section>

                <section class="detail-section">

                    <div class="section-title">
                        <span>📖</span>
                        <h3>Descrição</h3>
                    </div>

                    <p class="pokemon-description">
                        ${description}
                    </p>

                </section>

                <section class="detail-section">

                    <div class="section-title">
                        <span>📈</span>
                        <h3>Estatísticas</h3>
                    </div>

                    <div class="stats-container">
                        ${stats}
                    </div>

                </section>

                <section class="detail-section">

                    <div class="section-title">
                        <span>✨</span>
                        <h3>Habilidades</h3>
                    </div>

                    <div class="abilities">
                        ${abilities}
                    </div>

                </section>

                ${
                    evolutions
                    ? `
                        <section class="detail-section">

                            <div class="section-title">
                                <span>🔄</span>
                                <h3>Evoluções</h3>
                            </div>

                            <div class="evolution-chain">
                                ${evolutions}
                            </div>

                        </section>
                    `
                    : ""
                }

                <section class="detail-section">

                    <div class="section-title">
                        <span>⚡</span>
                        <h3>Movimentos</h3>
                    </div>

                    <div class="moves-grid">

                        ${pokemon.moves
                            .slice(0, 20)
                            .map(move => `
                                <span class="move-badge">
                                    ${formatName(move.move.name)}
                                </span>
                            `)
                            .join("")
                        }

                    </div>

                </section>

                <div class="detail-actions">

                    <button
                        class="orange-button"
                        onclick="addToTeam(${pokemon.id})"
                    >
                        ⚔️ Adicionar à equipe
                    </button>

                    <button
                        class="dark-button"
                        onclick="closeModal()"
                    >
                        Fechar
                    </button>

                </div>

            </div>

        </div>
    `;
}

/* =========================================================
   EVOLUÇÕES
   ========================================================= */

function buildEvolutionHTML(chain) {

    if (!chain) return "";

    const stages = [];

    function walk(node) {

        if (!node) return;

        stages.push({
            name: node.species.name,
            id: extractIdFromUrl(
                node.species.url
            )
        });

        node.evolves_to?.forEach(next => {
            walk(next);
        });
    }

    walk(chain.chain);

    return stages
        .map((stage, index) => {

            const image =
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.id}.png`;

            return `
                ${
                    index > 0
                    ? `<span class="evolution-arrow">→</span>`
                    : ""
                }

                <div
                    class="evolution-item"
                    onclick="openPokemonModal(${stage.id})"
                >

                    <img
                        src="${image}"
                        alt="${stage.name}"
                    >

                    <span>
                        ${capitalize(stage.name)}
                    </span>

                </div>
            `;
        })
        .join("");
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function toggleFavorite(id) {

    const index =
        state.favorites.indexOf(id);

    if (index === -1) {

        state.favorites.push(id);

    } else {

        state.favorites.splice(index, 1);
    }

    saveFavorites();
    updateCounters();
    renderPokemonGrid();
}

function saveFavorites() {

    localStorage.setItem(
        "pokeflame_favorites",
        JSON.stringify(state.favorites)
    );
}

/* =========================================================
   EQUIPE
   ========================================================= */

function addToTeam(id) {

    if (state.team.includes(id)) {

        showToast(
            "Esse Pokémon já está na sua equipe."
        );

        return;
    }

    if (state.team.length >= 6) {

        showToast(
            "Sua equipe já possui 6 Pokémon."
        );

        return;
    }

    state.team.push(id);

    localStorage.setItem(
        "pokeflame_team",
        JSON.stringify(state.team)
    );

    updateCounters();
    renderTeam();

    showToast(
        "Pokémon adicionado à equipe! 🔥"
    );
}

function removeFromTeam(id) {

    state.team =
        state.team.filter(
            pokemonId => pokemonId !== id
        );

    localStorage.setItem(
        "pokeflame_team",
        JSON.stringify(state.team)
    );

    updateCounters();
    renderTeam();
}

async function renderTeam() {

    if (!elements.teamContainer) return;

    if (!state.team.length) {

        elements.teamContainer.innerHTML = `
            <div class="empty-team">
                <span>🔥</span>
                <p>Sua equipe está vazia.</p>
                <small>
                    Adicione até 6 Pokémon!
                </small>
            </div>
        `;

        return;
    }

    elements.teamContainer.innerHTML =
        state.team
            .map(id => {

                const pokemon =
                    state.pokemon.find(
                        p => p.id === id
                    );

                if (!pokemon) return "";

                return `
                    <div class="team-member">

                        <button
                            class="team-remove"
                            onclick="removeFromTeam(${id})"
                        >
                            ×
                        </button>

                        <img
                            src="${pokemon.image}"
                            alt="${pokemon.name}"
                            onclick="openPokemonModal(${id})"
                        >

                        <span>
                            ${capitalize(pokemon.name)}
                        </span>

                    </div>
                `;
            })
            .join("");
}

/* =========================================================
   POKÉMON ALEATÓRIO
   ========================================================= */

function showRandomPokemon() {

    if (!state.pokemon.length) return;

    const randomIndex =
        Math.floor(
            Math.random() *
            state.pokemon.length
        );

    const pokemon =
        state.pokemon[randomIndex];

    openPokemonModal(pokemon.id);
}

/* =========================================================
   MODAL
   ========================================================= */

function closeModal() {

    elements.modal?.classList.remove("active");

    document.body.classList.remove("modal-open");

    state.currentPokemon = null;
}

async function refreshModal(id) {

    await openPokemonModal(id);
}

function changePokemonImage(
    image,
    button
) {

    const imageElement =
        document.getElementById(
            "detail-pokemon-image"
        );

    if (!imageElement) return;

    imageElement.style.opacity = "0";

    setTimeout(() => {

        imageElement.src = image;
        imageElement.style.opacity = "1";

    }, 150);

    document
        .querySelectorAll(".shiny-button")
        .forEach(btn =>
            btn.classList.remove("active")
        );

    button.classList.add("active");
}

/* =========================================================
   CONTADORES
   ========================================================= */

function updateCounters() {

    if (elements.favoritesCount) {

        elements.favoritesCount.textContent =
            state.favorites.length;
    }

    if (elements.teamCount) {

        elements.teamCount.textContent =
            state.team.length;
    }

    const favoriteCounter =
        document.querySelector(
            "[data-favorites-count]"
        );

    if (favoriteCounter) {

        favoriteCounter.textContent =
            state.favorites.length;
    }

    const teamCounter =
        document.querySelector(
            "[data-team-count]"
        );

    if (teamCounter) {

        teamCounter.textContent =
            state.team.length;
    }
}

/* =========================================================
   DESCRIÇÃO
   ========================================================= */

function getPokemonDescription(species) {

    const entries =
        species.flavor_text_entries || [];

    const entry =
        entries.find(
            item =>
                item.language.name === "en"
        );

    if (!entry) {
        return "Informações sobre este Pokémon.";
    }

    return entry.flavor_text
        .replace(/\f/g, " ")
        .replace(/\n/g, " ")
        .replace(/\r/g, " ");
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}

function formatName(text) {

    if (!text) return "";

    return text
        .split("-")
        .map(capitalize)
        .join(" ");
}

function formatStatName(name) {

    const names = {

        hp: "HP",

        attack: "ATK",

        defense: "DEF",

        "special-attack": "SP. ATK",

        "special-defense": "SP. DEF",

        speed: "VEL"
    };

    return names[name] || formatName(name);
}

function extractIdFromUrl(url) {

    const parts =
        url
            .replace(/\/$/, "")
            .split("/");

    return Number(
        parts[parts.length - 1]
    );
}

function debounce(
    callback,
    delay
) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout =
            setTimeout(
                () => callback(...args),
                delay
            );
    };
}

/* =========================================================
   LOADING
   ========================================================= */

function showLoading(show) {

    if (!elements.loading) return;

    elements.loading.style.display =
        show ? "flex" : "none";
}

/* =========================================================
   ERRO
   ========================================================= */

function showError(message) {

    if (!elements.grid) return;

    elements.grid.innerHTML = `
        <div class="error-state">

            <div class="error-icon">
                ⚠️
            </div>

            <h3>Algo deu errado</h3>

            <p>
                ${message}
            </p>

            <button
                class="orange-button"
                onclick="location.reload()"
            >
                Tentar novamente
            </button>

        </div>
    `;
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const existing =
        document.querySelector(".pokeflame-toast");

    if (existing) {
        existing.remove();
    }

    const toast =
        document.createElement("div");

    toast.className =
        "pokeflame-toast";

    toast.innerHTML = `
        <span>🔥</span>
        <span>${
