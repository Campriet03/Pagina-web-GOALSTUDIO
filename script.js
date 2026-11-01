const pages = document.querySelectorAll("main > section");
const navLinks = document.querySelectorAll(".nav-link");
const pageLinks = document.querySelectorAll("[data-page]");
const menu = document.getElementById("navLinks");

function showPage(name) {
    if (!document.getElementById(name)) return;
    pages.forEach(page => page.classList.toggle("active", page.id === name));
    navLinks.forEach(link => link.classList.toggle("active", link.dataset.page === name));
    menu.classList.remove("open");
    localStorage.setItem("goalstudio-page", name);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

pageLinks.forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    showPage(link.dataset.page);
}));

document.getElementById("menuBtn").addEventListener("click", () => {
    menu.classList.toggle("open");
});

const savedPage = localStorage.getItem("goalstudio-page");
if (savedPage) showPage(savedPage);

const themeButton = document.getElementById("themeButton");
const savedTheme = localStorage.getItem("goalstudio-theme");
if (savedTheme === "light") document.body.classList.add("light-theme");

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const theme = document.body.classList.contains("light-theme") ? "light" : "dark";
    localStorage.setItem("goalstudio-theme", theme);
    themeButton.textContent = theme === "light" ? "☀" : "☾";
});
themeButton.textContent = document.body.classList.contains("light-theme") ? "☀" : "☾";

function setupSearch(inputId, containerSelector, emptyId) {
    const input = document.getElementById(inputId);
    const items = document.querySelectorAll(containerSelector);
    const empty = document.getElementById(emptyId);

    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        let visible = 0;
        items.forEach(item => {
            const matches = item.textContent.toLowerCase().includes(query);
            item.hidden = !matches;
            if (matches) visible++;
        });
        if (empty) empty.hidden = visible > 0;
    });
}

setupSearch("searchNews", "#noticias .story", "newsEmpty");
setupSearch("searchClub", "#clubes .story", "clubEmpty");
setupSearch("searchPlayer", "#futbolistas .player-card", "playerEmpty");

document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        document.querySelectorAll(".filter-button").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        document.querySelectorAll(".match-card").forEach(card => {
            card.hidden = filter !== "todos" && card.dataset.competition !== filter;
        });
    });
});

function updateCountdowns() {
    document.querySelectorAll(".match-card[data-match]").forEach(card => {
        const target = new Date(card.dataset.match).getTime();
        const remaining = target - Date.now();
        const output = card.querySelector(".countdown");
        if (remaining <= 0) {
            output.textContent = "El partido ya comenzó";
            return;
        }
        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        output.textContent = `Comienza en ${days} d · ${hours} h · ${minutes} min`;
    });
}
updateCountdowns();
setInterval(updateCountdowns, 60000);

const favorites = new Set(JSON.parse(localStorage.getItem("goalstudio-favorites") || "[]"));
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".favorite-button").forEach(button => {
    const id = button.dataset.favorite;
    const saved = favorites.has(id);
    button.textContent = saved ? "♥" : "♡";
    button.classList.toggle("saved", saved);
    button.addEventListener("click", () => {
        if (favorites.has(id)) {
            favorites.delete(id);
            button.textContent = "♡";
            button.classList.remove("saved");
            showToast("Eliminado de favoritos");
        } else {
            favorites.add(id);
            button.textContent = "♥";
            button.classList.add("saved");
            showToast("Guardado en favoritos");
        }
        localStorage.setItem("goalstudio-favorites", JSON.stringify([...favorites]));
    });
});

const slides = [...document.querySelectorAll(".carousel-slide")];
let currentSlide = 0;

function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active-slide", i === currentSlide));
    document.getElementById("slideStatus").textContent = `${currentSlide + 1} / ${slides.length}`;
}

document.getElementById("prevSlide").addEventListener("click", () => showSlide(currentSlide - 1));
document.getElementById("nextSlide").addEventListener("click", () => showSlide(currentSlide + 1));
setInterval(() => showSlide(currentSlide + 1), 7000);

const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.14 })
    : null;

document.querySelectorAll(".reveal-item").forEach(item => {
    if (observer) observer.observe(item);
    else item.classList.add("visible");
});

const newsletterForm = document.getElementById("newsletterForm");
newsletterForm.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.getElementById("newsletterEmail");
    const message = document.getElementById("newsletterMessage");
    if (!email.checkValidity()) {
        message.textContent = "Introduce un correo válido.";
        message.className = "newsletter-message error";
        return;
    }
    localStorage.setItem("goalstudio-email", email.value);
    message.textContent = "¡Suscripción realizada! Recibirás lo mejor del fútbol.";
    message.className = "newsletter-message success";
    newsletterForm.reset();
});

document.getElementById("liveButton").addEventListener("click", () => {
    showPage("partidos");
    showToast("Mostrando la programación de partidos");
});

let liveScoresStarted = false;
document.getElementById("liveButton").addEventListener("click", () => {
    if (liveScoresStarted) return;
    liveScoresStarted = true;
    const scores = document.querySelectorAll("#partidos .score");
    scores.forEach((score, index) => {
        score.textContent = `${index}-${index}`;
    });
    setInterval(() => {
        const score = scores[Math.floor(Math.random() * scores.length)];
        const value = score.textContent.split("-");
        const side = Math.random() > 0.5 ? 0 : 1;
        value[side] = Number(value[side]) + 1;
        score.textContent = value.join("-");
    }, 12000);
});

const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
    backToTop.classList.toggle("show", window.scrollY > 500);
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const playerStats = {
    messi: { goles: 21, asistencias: 15, valoracion: 8.7 },
    mbappe: { goles: 24, asistencias: 8, valoracion: 8.5 },
    yamal: { goles: 12, asistencias: 18, valoracion: 8.4 },
    haaland: { goles: 27, asistencias: 5, valoracion: 8.6 },
    vini: { goles: 16, asistencias: 12, valoracion: 8.5 },
    bellingham: { goles: 14, asistencias: 9, valoracion: 8.4 }
};

function renderComparison() {
    const first = playerStats[document.getElementById("playerOne").value];
    const second = playerStats[document.getElementById("playerTwo").value];
    document.getElementById("comparisonValues").innerHTML = `
        <div class="compare-stat"><span>Goles</span><strong>${first.goles} · ${second.goles}</strong></div>
        <div class="compare-stat"><span>Asistencias</span><strong>${first.asistencias} · ${second.asistencias}</strong></div>
        <div class="compare-stat"><span>Valoración</span><strong>${first.valoracion} · ${second.valoracion}</strong></div>`;
}

document.getElementById("playerOne").addEventListener("change", renderComparison);
document.getElementById("playerTwo").addEventListener("change", renderComparison);
renderComparison();

document.querySelectorAll(".poll-options button").forEach(option => {
    option.addEventListener("click", () => {
        document.querySelectorAll(".poll-options button").forEach(item => item.classList.remove("selected"));
        option.classList.add("selected");
        document.getElementById("pollMessage").textContent = `Tu voto por ${option.querySelector("span").textContent} ha sido registrado.`;
        localStorage.setItem("goalstudio-poll", option.dataset.option);
    });
});

const savedVote = localStorage.getItem("goalstudio-poll");
if (savedVote) {
    const option = document.querySelector(`.poll-options button[data-option="${savedVote}"]`);
    if (option) {
        option.classList.add("selected");
        document.getElementById("pollMessage").textContent = `Tu voto por ${option.querySelector("span").textContent} está registrado.`;
    }
}
