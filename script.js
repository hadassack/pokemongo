// Controlar a Splash Screen (Abertura de 2.5 segundos)
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('fade-out');
    }, 2500);

    // Carregar um Pokémon inicial padrão
    fetchPokemon('charmander');
});

// --- BUSCA INTELIGENTE ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const pokemonCard = document.getElementById('pokemon-card');

async function fetchPokemon(query) {
    if (!query) return;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase().trim()}`);
        if (!response.ok) throw new Error('Não encontrado');
        const data = await response.json();
        renderPokemonCard(data, pokemonCard);
    } catch (error) {
        pokemonCard.innerHTML = `<p style="color: #ff4444;">Pokémon não encontrado!</p>`;
    }
}

function renderPokemonCard(poke, container) {
    container.innerHTML = `
        <img src="${poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default}" alt="${poke.name}">
        <h3>#${poke.id} - ${poke.name}</h3>
        <p><strong>Tipo:</strong> ${poke.types.map(t => t.type.name).join(', ')}</p>
        <p><strong>Altura:</strong> ${poke.height / 10}m | <strong>Peso:</strong> ${poke.weight / 10}kg</p>
    `;
}

searchBtn.addEventListener('click', () => fetchPokemon(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon(searchInput.value);
});


// --- SIMULADOR DE BATALHA ---
const battleBtn = document.getElementById('battle-btn');
const poke1Input = document.getElementById('poke1-input');
const poke2Input = document.getElementById('poke2-input');
const battleResult = document.getElementById('battle-result');
const fighter1Div = document.getElementById('fighter-1');
const fighter2Div = document.getElementById('fighter-2');

async function compareBattle() {
    const p1Name = poke1Input.value.trim();
    const p2Name = poke2Input.value.trim();

    if (!p1Name || !p2Name) {
        alert('Digite os nomes dos dois Pokémon para a batalha!');
        return;
    }

    try {
        const [res1, res2] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${p1Name.toLowerCase()}`),
            fetch(`https://pokeapi.co/api/v2/pokemon/${p2Name.toLowerCase()}`)
        ]);

        if (!res1.ok || !res2.ok) throw new Error('Pokémon inválido');

        const data1 = await res1.json();
        const data2 = await res2.json();

        // Calcular pontuação total de status
        const score1 = data1.stats.reduce((acc, curr) => acc + curr.base_stat, 0);
        const score2 = data2.stats.reduce((acc, curr) => acc + curr.base_stat, 0);

        battleResult.classList.remove('hidden');

        // Renderizar lutador 1
        fighter1Div.className = `fighter ${score1 >= score2 ? 'winner' : ''}`;
        fighter1Div.innerHTML = `
            <h4>${data1.name} ${score1 >= score2 ? '👑' : ''}</h4>
            <div class="stat-bar">HP: ${data1.stats[0].base_stat}</div>
            <div class="stat-bar">Ataque: ${data1.stats[1].base_stat}</div>
            <div class="stat-bar">Defesa: ${data1.stats[2].base_stat}</div>
            <div class="stat-bar">Velocidade: ${data1.stats[5].base_stat}</div>
            <p style="margin-top: 8px; font-size: 0.8rem; color:#ff6600;">Total: ${score1}</p>
        `;

        // Renderizar lutador 2
        fighter2Div.className = `fighter ${score2 > score1 ? 'winner' : ''}`;
        fighter2Div.innerHTML = `
            <h4>${data2.name} ${score2 > score1 ? '👑' : ''}</h4>
            <div class="stat-bar">HP: ${data2.stats[0].base_stat}</div>
            <div class="stat-bar">Ataque: ${data2.stats[1].base_stat}</div>
            <div class="stat-bar">Defesa: ${data2.stats[2].base_stat}</div>
            <div class="stat-bar">Velocidade: ${data2.stats[5].base_stat}</div>
            <p style="margin-top: 8px; font-size: 0.8rem; color:#ff6600;">Total: ${score2}</p>
        `;

    } catch (error) {
        alert('Erro ao buscar um dos Pokémon para a batalha. Verifique os nomes.');
    }
}

battleBtn.addEventListener('click', compareBattle);
