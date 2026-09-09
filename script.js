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
