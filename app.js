
const API = window.SMARTHELP_CONFIG.API_BASE;

// helpers
const $ = s => document.querySelector(s);
const grid = $("#grid");
const empty = $("#empty");
const overlay = $("#overlay");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");

function seedImage(title){
  // AI-stil görsel (seed'li), kaynak link göstermiyoruz
  const seed = encodeURIComponent(String(title||'yemek').toLowerCase().replace(/\s+/g,'-'));
  return `https://picsum.photos/seed/${seed}/640/640`;
}

function favsGet(){ try{return JSON.parse(localStorage.getItem('favorites')||'[]')}catch(e){return []} }
function favsSet(list){ localStorage.setItem('favorites', JSON.stringify(list)); }
function favToggle(id){
  let list = favsGet();
  if(list.includes(id)) list = list.filter(x=>x!==id); else list.push(id);
  favsSet(list);
  document.querySelectorAll(`[data-fav='${id}']`).forEach(btn=>btn.classList.toggle('active', list.includes(id)));
}

async function search(q){
  grid.innerHTML = "";
  empty.style.display = "none";
  try{
    const res = await fetch(`${API}/recipes/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if(!Array.isArray(data) || data.length===0){ empty.style.display='block'; return; }
    const favs = favsGet();
    data.forEach(item=>{
      const id = item.id ?? item.title;
      const html = `
        <div class="card">
          <img class="thumb" src="${seedImage(item.title)}" alt="${escapeHtml(item.title||'Tarif')}">
          <div class="body">
            <h4>${escapeHtml(item.title||'Tarif')}</h4>
            <div class="meta"><span>⏱ ${escapeHtml(item.time||'20 dk')}</span><span>🔥 ${escapeHtml(item.kcal??'-')} kcal</span></div>
            <div class="actions">
              <button class="btn-ghost" data-view="${id}">Tarifi Gör</button>
              <button class="fav ${favs.includes(id)?'active':''}" title="Favori" data-fav="${id}">⭐</button>
            </div>
          </div>
        </div>`;
      grid.insertAdjacentHTML('beforeend', html);
    });

    // attach events
    grid.querySelectorAll("[data-view]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-view");
        const item = data.find(x=>(x.id??x.title)==id) || {};
        openRecipe(item);
      });
    });
    grid.querySelectorAll("[data-fav]").forEach(btn=>{
      btn.addEventListener("click", ()=>favToggle(btn.getAttribute("data-fav")));
    });

  }catch(e){
    console.error(e);
    empty.style.display='block';
  }
}

function openModal(){ overlay.style.display="flex"; }
function closeModal(){ overlay.style.display="none"; }
$("#btnClose").addEventListener("click", closeModal);
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeModal(); });

async function openRecipe(item){
  modalTitle.textContent = item.title || "Tarif";
  modalBody.innerHTML = "Yükleniyor…";
  openModal();

  const id = item.id;
  const title = item.title || "";
  const ingredients = Array.isArray(item.ingredients)? item.ingredients : [];

  // 1) steps endpoint
  try{
    if(id!==undefined){
      const r1 = await fetch(`${API}/recipes/steps?id=${encodeURIComponent(id)}`);
      if(r1.ok){
        const data = await r1.json();
        if(data && Array.isArray(data.steps)){
          renderRecipe({title, ingredients, ...data});
          return;
        }
      }
    }
  }catch(_){}

  // 2) ai endpoint
  try{
    if(title){
      const r2 = await fetch(`${API}/recipes/ai?title=${encodeURIComponent(title)}`);
      if(r2.ok){
        const data = await r2.json();
        if(data && (Array.isArray(data.steps) || Array.isArray(data.ingredients))){
          renderRecipe({title, ...data});
          return;
        }
      }
    }
  }catch(_){}

  // 3) fallback
  renderRecipe({
    title,
    ingredients,
    steps: [
      "Malzemeleri hazırlayın.",
      "Uygun bir tencere veya tavayı ısıtın.",
      "Baharat ve yağı ekleyin, pişirin.",
      "Servis edin."
    ],
    time: item.time || "20 dk",
    kcal: item.kcal || "-",
    servings: item.servings || 2
  });
}

function renderRecipe(data){
  const ing = (data.ingredients||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("") || "<li>—</li>";
  const steps = (data.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("") || "<li>—</li>";
  const info = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <span class="pill">⏱ ${escapeHtml(data.time??'-')}</span>
      <span class="pill">🔥 ${escapeHtml(data.kcal??'-')} kcal</span>
      <span class="pill">🍽️ ${escapeHtml(data.servings??'-')} porsiyon</span>
    </div>`;
  modalBody.innerHTML = info + `
    <h3>Malzemeler</h3>
    <ul>${ing}</ul>
    <h3>Hazırlanışı</h3>
    <ol class="steps">${steps}</ol>
  `;
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

// events
document.querySelectorAll(".chip").forEach(c=>{
  c.addEventListener("click", ()=>{
    $("#q").value = c.dataset.q;
    search(c.dataset.q);
  });
});
$("#btnSearch").addEventListener("click", ()=>{
  const q = $("#q").value.trim();
  if(q) search(q);
});
document.addEventListener("keydown", e=>{
  if(e.key==="Enter" && document.activeElement===$("#q")){
    const q = $("#q").value.trim();
    if(q) search(q);
  }
});

// first load
search("tavuk");
