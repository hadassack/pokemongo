/*
==================================================
WIKIGAME
HOME - JAVASCRIPT
==================================================
*/

/* -----------------------------------------------
   ESTADO INICIAL DO JOGADOR
------------------------------------------------ */

const player = {

    name: "Treinador",

    level: 1,

    xp: 0,

    xpRequired: 100,

    coins: 0,

    discoveredPokemon: 0,

    victories: 0,

    achievements: 0,

    exploredLocations: 0

};


/* -----------------------------------------------
   ELEMENTOS
------------------------------------------------ */

const profileName =
    document.querySelector(".profile-button strong");

const trainerName =
    document.querySelector(".trainer-mini strong");

const levelElement =
    document.querySelector(".trainer-mini small");

const xpText =
    document.querySelector(".xp-text span:last-child");

const xpFill =
    document.querySelector(".xp-fill");

const progressPercentage =
    document.querySelector(".progress-header > strong");

const bigProgressFill =
    document.querySelector(".big-progress-fill");


/* -----------------------------------------------
   ATUALIZAR INTERFACE
------------------------------------------------ */

function updateInterface() {

    profileName.textContent = player.name;

    trainerName.textContent = player.name;

    levelElement.textContent =
        `Lv. ${player.level}`;

    xpText.textContent =
        `${player.xp} / ${player.xpRequired}`;

    const xpPercentage =
        (player.xp / player.xpRequired) * 100;

    xpFill.style.width =
        `${xpPercentage}%`;

    const gameProgress =
        Math.round(
            (player.discoveredPokemon / 151) * 100
        );

    progressPercentage.textContent =
        `${gameProgress}%`;

    bigProgressFill.style.width =
        `${gameProgress}%`;
}


/* -----------------------------------------------
   SISTEMA DE XP
------------------------------------------------ */

function addXP(amount) {

    player.xp += amount;

    while (player.xp >= player.xpRequired) {

        player.xp -= player.xpRequired;

        player.level++;

        player.xpRequired =
            Math.floor(player.xpRequired * 1.25);

        showNotification(
            `🔥 Você alcançou o nível ${player.level}!`
        );
    }

    saveGame();

    updateInterface();
}


/* -----------------------------------------------
   NOTIFICAÇÃO
------------------------------------------------ */

function showNotification(message) {

    const notification =
        document.createElement("div");

    notification.className =
        "game-notification";

    notification.textContent =
        message;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 10);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 3000);
}


/* -----------------------------------------------
   SAVE
------------------------------------------------ */

function saveGame() {

    localStorage.setItem(
        "wikigame-save",
        JSON.stringify(player)
    );
}


/* -----------------------------------------------
   LOAD
------------------------------------------------ */

function loadGame() {

    const save =
        localStorage.getItem("wikigame-save");

    if (!save) {
        updateInterface();
        return;
    }

    try {

        const savedPlayer =
            JSON.parse(save);

        Object.assign(
            player,
            savedPlayer
        );

    } catch (error) {

        console.error(
            "Não foi possível carregar o save.",
            error
        );

    }

    updateInterface();
}


/* -----------------------------------------------
   BOTÕES
------------------------------------------------ */

const adventureButton =
    document.querySelector(".primary-button");

adventureButton.addEventListener(
    "click",
    () => {

        showNotification(
            "🗺️ A aventura estará disponível em breve!"
        );

    }
);


const wikiButton =
    document.querySelector(".secondary-button");

wikiButton.addEventListener(
    "click",
    () => {

        showNotification(
            "📖 A Wiki estará disponível em breve!"
        );

    }
);


const challengeButton =
    document.querySelector(".dark-button");

challengeButton.addEventListener(
    "click",
    () => {

        addXP(25);

        showNotification(
            "🧠 Desafio iniciado! +25 XP"
        );

    }
);


/* -----------------------------------------------
   RESPOSTAS DO DESAFIO
------------------------------------------------ */

const answers =
    document.querySelectorAll(".answers button");

answers.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (
                button.textContent.includes("Pikachu")
            ) {

                addXP(50);

                button.style.background =
                    "#8be28b";

                button.textContent =
                    "✓ Pikachu — CORRETO!";

                showNotification(
                    "⚡ Resposta correta! +50 XP"
                );

            } else {

                button.style.background =
                    "#ffaaaa";

                showNotification(
                    "❌ Resposta incorreta!"
                );
            }

        }
    );

});


/* -----------------------------------------------
   INICIALIZAÇÃO
------------------------------------------------ */

loadGame();
