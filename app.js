const apiBase = "https://smarthelp-api.onrender.com";

document.querySelector("#searchBtn").addEventListener("click", () => {
    const q = document.querySelector("#searchInput").value.toLowerCase();

    fetch(`${apiBase}/recipes/search?q=${q}`)
        .then(res => res.json())
        .then(data => {
            const list = document.querySelector("#resultList");
            list.innerHTML = "";

            if (data.length === 0) {
                list.innerHTML = "<p>❌ Sonuç bulunamadı.</p>";
                return;
            }

            data.forEach(item => {
                list.innerHTML += `
                    <div class="recipe-card">
                        <h3>${item.title}</h3>
                        <p><strong>Kalori:</strong> ${item.kcal}</p>
                        <p><strong>Malzemeler:</strong> ${item.ingredients.join(", ")}</p>
                    </div>
                `;
            });
        });
});
