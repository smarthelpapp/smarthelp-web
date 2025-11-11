const API_URL = "https://smarthelp-api.onrender.com"; 

function switchTab(tabId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");
}

async function searchRecipe() {
    const q = document.getElementById("searchInput").value;
    const result = await fetch(`${API_URL}/recipes/search?q=${q}`).then(r => r.json());

    const container = document.getElementById("recipeList");
    container.innerHTML = "";

    result.forEach(item => {
        container.innerHTML += `
        <div class="recipe-item">
            <div>
                <strong>${item.title}</strong><br>
                Kalori: ${item.kcal}
            </div>
            <button onclick="addFavorite('${item.title}')">⭐</button>
        </div>`;
    });
}

function addFavorite(name) {
    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs.push(name);
    localStorage.setItem("favorites", JSON.stringify(favs));
    renderFav();
}

function renderFav() {
    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const list = document.getElementById("favList");
    list.innerHTML = "";
    favs.forEach(f => {
        list.innerHTML += `<div class='fav-item'>${f}</div>`;
    });
}

renderFav();
