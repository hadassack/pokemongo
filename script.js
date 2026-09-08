window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => splash.style.display = 'none', 500);
        }
    }, 2000);

    fetchPokemon('charmander');
});

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const pokemonCard = document.getElementById('pokemon-card');

async function fetchPokemon(query) {
    if (!query) return;
    pokemonCard.innerHTML = `<p style="color: #aaa; padding: 20px;">Buscando...</p>`;
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase().trim()}`);
        if (!res.ok) throw new Error('Não encontrado');
        const data = await res.json();
        renderCard(data, pokemonCard);
    } catch (err) {
        pokemonCard.innerHTML = `<p style="color: #ff4444; padding: 20px;">Pokémon não encontrado! Tente outro nome.</p>`;
    }
}

function renderCard(poke, container) {
    const types = poke.types.map(t => `<span class="badge">${t.type.name}</span>`).join('');
    const imgSrc = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default || '';
    container.innerHTML = `
        <span class="poke-id">#${String(poke.id).padStart(3, '0')}</span>
        <img src="${imgSrc}" alt="${poke.name}">
        <h3 class="poke-name">${poke.name}</h3>
        <div class="poke-badges">${types}</div>
        <div class="poke-stats-grid">
            <div><span>Altura</span><strong>${poke.height / 10} m</strong></div>
            <div><span>Peso</span><strong>${poke.weight / 10} kg</strong></div>
            <div><span>XP Base</span><strong>${poke.base_experience}</strong></div>
            <div><span>Habilidade</span><strong style="text-transform: capitalize;">${poke.abilities[0]?.ability.name || 'N/A'}</strong></div>
        </div>
    `;
}

searchBtn.addEventListener('click', () => {
    fetchPokemon(searchInput.value);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        fetchPokemon(searchInput.value);
    }
});

const battleBtn = document.getElementById('battle-btn');
const poke1Input = document.getElementById('poke1-input');
const poke2Input = document.getElementById('poke2-input');
const battleResult = document.getElementById('battle-result');
const fighter1Div = document.getElementById('fighter-1');
const fighter2Div = document.getElementById('fighter-2');

async function runBattle() {
    const p1 = poke1Input.value.trim();
    const p2 = poke2Input.value.trim();

    if (!p1 || !p2) {
        alert('Preencha os dois nomes para batalhar!');
        return;
    }

    try {
        const [res1, res2] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${p1.toLowerCase()}`),
            fetch(`https://pokeapi.co/api/v2/pokemon/${p2.toLowerCase()}`)
        ]);

        if (!res1.ok || !res2.ok) throw new Error('Erro de lutador');

        const data1 = await res1.json();
        const data2 = await res2.json();

        const score1 = data1.stats.reduce((acc, curr) => acc + curr.base_stat, 0);
        const score2 = data2.stats.reduce((acc, curr) => acc + curr.base_stat, 0);

        battleResult.classList.remove('hidden');

        renderFighter(data1, score1, score2, fighter1Div);
        renderFighter(data2, score2, score1, fighter2Div);

    } catch (err) {
        alert('Erro ao carregar os Pokémon da batalha. Verifique os nomes digitados!');
    }
}

function renderFighter(poke, score, opponentScore, container) {
    const isWinner = score >= opponentScore;
    container.className = `fighter-card ${isWinner ? 'winner' : ''}`;

    const stats = [
        { name: 'HP', val: poke.stats[0].base_stat },
        { name: 'Ataque', val: poke.stats[1].base_stat },
        { name: 'Defesa', val: poke.stats[2].base_stat },
        { name: 'Velocidade', val: poke.stats[5].base_stat }
    ];

    const statsHtml = stats.map(s => `
        <div class="stat-bar-container">
            <div class="stat-info"><span>${s.name}</span><strong>${s.val}</strong></div>
            <div class="progress-track"><div class="progress-fill" style="width: ${Math.min(s.val, 100)}%;"></div></div>
        </div>
    `).join('');

    const imgSrc = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default || '';

    container.innerHTML = `
        ${isWinner ? '<span style="position: absolute; top: 12px; right: 15px; background: #ff6600; color: #fff; font-size: 0.7rem; padding: 3px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Vencedor</span>' : ''}
        <img src="${imgSrc}" alt="${poke.name}">
        <h4>${poke.name}</h4>
        ${statsHtml}
        <p style="margin-top: 15px; font-size: 0.85rem; color: #ff6600; font-weight: bold;">Poder Total: ${score}</p>
    `;
}

battleBtn.addEventListener('click', runBattle);
