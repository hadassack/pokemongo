/* =====================================================
   WIKIGAME — PARTÍCULAS DO HERO
===================================================== */

const particlesContainer = document.getElementById("particles");

if (particlesContainer) {

    const totalParticles = 40;

    for (let i = 0; i < totalParticles; i++) {

        const particle = document.createElement("span");

        particle.classList.add("particle");

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.animationDuration =
            5 + Math.random() * 8 + "s";

        particle.style.animationDelay =
            Math.random() * 8 + "s";

        const size =
            1 + Math.random() * 4;

        particle.style.width =
            size + "px";

        particle.style.height =
            size + "px";

        particlesContainer.appendChild(particle);

    }

} 

/* =========================================================
   ABERTURA WIKIGAME
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const intro =
        document.getElementById("wikigame-intro");

    const skipButton =
        document.getElementById("skip-intro");


    if (!intro) return;


    const jaViuIntro =
        localStorage.getItem("wikigame_intro");


    /*
        PRIMEIRA VISITA:
        abertura cinematográfica completa

        PRÓXIMAS VISITAS:
        abertura mais rápida
    */

    const tempoIntro =
        jaViuIntro ? 4500 : 8000;


    function finalizarIntro() {

        intro.classList.add("intro-hidden");

        localStorage.setItem(
            "wikigame_intro",
            "true"
        );


        setTimeout(() => {

            intro.style.display = "none";

        }, 1000);

    }


    const introTimer =
        setTimeout(
            finalizarIntro,
            tempoIntro
        );


    /* PULAR ABERTURA */

    if (skipButton) {

        skipButton.addEventListener(
            "click",
            () => {

                clearTimeout(introTimer);

                finalizarIntro();

            }
        );

    }

});
