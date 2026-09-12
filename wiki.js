const searchInput = document.getElementById("pokemon-search");
const searchButton = document.getElementById("pokemon-search-button");
const wikiContent = document.querySelector(".wiki-content");

async function searchPokemon() {
    const pokemonName = searchInput.value.trim().toLowerCase();

    if (!pokemonName) {
        return;
    }

    wikiContent.innerHTML = `
        <div class="wiki-placeholder">
            <span class="wiki-placeholder-icon">◉</span>
            <h2>Buscando...</h2>
            <p>Procurando ${pokemonName} na Pokédex.</p>
        </div>
    `;

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
        );

        if (!response.ok) {
            throw new Error("Pokémon não encontrado");
        }

        const pokemon = await response.json();
        const speciesResponse = await fetch(pokemon.species.url);
const speciesData = await speciesResponse.json();

const evolutionResponse = await fetch(speciesData.evolution_chain.url);
const evolutionData = await evolutionResponse.json();
        const descriptionEntry =
    speciesData.flavor_text_entries.find(
        entry => entry.language.name === "pt-BR"
    ) ||
    speciesData.flavor_text_entries.find(
        entry => entry.language.name === "en"
    );

const pokemonDescription = descriptionEntry
    ? descriptionEntry.flavor_text
        .replace(/\f/g, " ")
        .replace(/\n/g, " ")
    : "Descrição não disponível.";

        const image =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default;

        const types = pokemon.types
            .map(type => type.type.name)
            .join(" • ");

        const abilities = pokemon.abilities
            .map(ability => ability.ability.name.replace("-", " "))
            .join(", ");

        const evolutionNames = [];

function getEvolutionNames(chain) {
    evolutionNames.push(chain.species.name);

    if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach(nextEvolution => {
            getEvolutionNames(nextEvolution);
        });
    }
}

getEvolutionNames(evolutionData.chain);


const evolutionPokemonData = await Promise.all(
    evolutionNames.map(async name => {
        const evolutionPokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${name}`
        );

        const evolutionPokemon = await evolutionPokemonResponse.json();

        return {
            id: evolutionPokemon.id,
            name: evolutionPokemon.name,
            image:
                evolutionPokemon.sprites.other["official-artwork"].front_default ||
                evolutionPokemon.sprites.front_default
        };
    })
);


const evolutionHTML = evolutionPokemonData
    .map(evolutionPokemon => {
        return `
            <button
                class="evolution-card"
                data-pokemon="${evolutionPokemon.name}"
            >
                <span class="evolution-number">
                    #${String(evolutionPokemon.id).padStart(3, "0")}
                </span>

                <img
                    src="${evolutionPokemon.image}"
                    alt="${evolutionPokemon.name}"
                >

                <strong>
                    ${evolutionPokemon.name}
                </strong>
            </button>
        `;
    })
    .join("");
        const stats = pokemon.stats.map(stat => {
            return {
                name: stat.stat.name,
                value: stat.base_stat
            };
        });

        const statNames = {
            hp: "HP",
            attack: "ATAQUE",
            defense: "DEFESA",
            "special-attack": "ATAQUE ESP.",
            "special-defense": "DEFESA ESP.",
            speed: "VELOCIDADE"
        };

        const statsHTML = stats
            .map(stat => {
                const percentage = Math.min(
                    (stat.value / 180) * 100,
                    100
                );

                return `
                    <div class="pokemon-stat">

                        <div class="pokemon-stat-top">
                            <span>
                                ${statNames[stat.name] || stat.name}
                            </span>

                            <strong>
                                ${stat.value}
                            </strong>
                        </div>

                        <div class="pokemon-stat-bar">
                            <div
                                class="pokemon-stat-fill"
                                style="--stat-width: ${percentage}%"
                            ></div>
                        </div>

                    </div>
                `;
            })
            .join("");

        wikiContent.innerHTML = `
            <div class="pokemon-result">

                <div class="pokemon-image-area">

                    <span class="pokemon-number">
                        #${String(pokemon.id).padStart(3, "0")}
                    </span>

                    <img
                        src="${image}"
                        alt="${pokemon.name}"
                        class="pokemon-image"
                    >

                </div>

                <div class="pokemon-info">

                    <span class="pokemon-result-small">
                        POKÉDEX
                    </span>

                    <h2 class="pokemon-name">
                        ${pokemon.name}
                    </h2>

                    <p class="pokemon-types">
                        ${types}
                    </p>


                    <div class="pokemon-details">

                        <div>
                            <span>ALTURA</span>

                            <strong>
                                ${(pokemon.height / 10).toFixed(1)} m
                            </strong>
                        </div>

                        <div>
                            <span>PESO</span>

                            <strong>
                                ${(pokemon.weight / 10).toFixed(1)} kg
                            </strong>
                        </div>

                    </div>


                    <div class="pokemon-abilities">

                        <span>HABILIDADES</span>

                        <p>
                            ${abilities}
                        </p>

                    </div>


                    <div class="pokemon-stats">

                        <div class="pokemon-stats-title">
                            STATUS BASE
                        </div>
                        <div class="pokemon-evolution">

    <div class="pokemon-evolution-title">
        LINHA EVOLUTIVA
    </div>

    <div class="pokemon-evolution-list">
        ${evolutionHTML}
    </div>

</div>

                        ${statsHTML}

                    </div>

                </div>

            </div>
        `;

        setTimeout(() => {
            wikiContent.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 100);
    

    } catch (error) {

        wikiContent.innerHTML = `
            <div class="wiki-placeholder">

                <span class="wiki-placeholder-icon">
                    !
                </span>

                <h2>
                    Pokémon não encontrado
                </h2>

                <p>
                    Confira o nome e tente novamente.
                </p>

            </div>
        `;
    }
}


searchButton.addEventListener("click", searchPokemon);


searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchPokemon();
    }

});

wikiContent.addEventListener("click", function(event) {

    const evolutionCard = event.target.closest(".evolution-card");

    if (!evolutionCard) {
        return;
    }

    const selectedPokemon = evolutionCard.dataset.pokemon;

    searchInput.value = selectedPokemon;

    searchPokemon();
});
