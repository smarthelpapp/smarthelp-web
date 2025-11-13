const API_URL = "https://smarthelp-api.onrender.com/recipes";

let allResults = [];
let displayedCount = 0;

// 🔍 Arama
document.querySelector("#searchBtn").addEventListener("click", searchRecipes);

async function searchRecipes() {
    const q = document.querySelector("#searchInput").value.toLowerCase();

    const res = await fetch(API_URL);
    const data = await res.json();

    // 🔎 Başlık + malzeme filtreleme
    allResults = data.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.ingredients.some(i => i.toLowerCase().includes(q))
    );

    displayedCount = 0;
    document.querySelector("#resultList").innerHTML = "";

    showMore();

    document.getElementById("showMoreBtn").style.display = "block";
}

// ➕ Daha Fazla Göster
function showMore() {
    const slice = allResults.slice(displayedCount, displayedCount + 20);
    displayedCount += 20;
    renderResults(slice);
}

// 🎨 Tarifleri Ekrana Bastır
function renderResults(list) {
    const container = document.querySelector("#resultList");

    list.forEach(r => {
        const el = document.createElement("div");
        el.className = "recipe-card";

        el.innerHTML = `
            <h3>${r.title}</h3>
            <p><strong>Kalori:</strong> ${r.kcal}</p>
            <p><strong>Malzemeler:</strong> ${r.ingredients.join(", ")}</p>

            <button class="detailBtn">Tarifi Göster</button>

            <div class="details" style="display:none; margin-top:10px;">
                <h4>Hazırlanışı</h4>
                <ol>
                    ${r.steps.map(s => `<li>${s}</li>`).join("")}
                </ol>
            </div>
        `;

        // 🔽 Butona tıklayınca aç/kapa
        el.querySelector(".detailBtn").addEventListener("click", () => {
            const det = el.querySelector(".details");
            det.style.display = det.style.display === "none" ? "block" : "none";
        });

        container.appendChild(el);
    });
}
