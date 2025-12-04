/* ================================
   VARIÁVEIS
================================ */
let words = [];
let filteredWords = null; // ← lista filtrada
let currentPage = 1;
const pageSize = 10;

const input = document.getElementById("wordInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const searchInput = document.getElementById("searchInput"); // ← NOVO

/* ================================
   LOCALSTORAGE
================================ */
function saveWords() {
  localStorage.setItem("myWords", JSON.stringify(words));
}

function loadWords() {
  const data = localStorage.getItem("myWords");
  if (data) {
    words = JSON.parse(data);
  }
}

/* ================================
   NORMALIZAR TEXTO (remove acentos)
================================ */
function normalize(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* ================================
   FUNÇÃO DE ORDENAR
================================ */
function sortWords(list = words) {
  list.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return a.word.localeCompare(b.word, "pt-BR");
  });
}

/* ================================
   ADICIONAR PALAVRA
================================ */
addBtn.onclick = () => {
  const w = input.value.trim();
  if (!w) return;

  words.push({
    id: crypto.randomUUID(),
    word: w,
    level: 0
  });

  input.value = "";
  saveWords();
  applySearch();   // ← mantém busca funcionando
};

/* ================================
   FUNÇÃO DE BUSCA
================================ */
function applySearch() {
  const txt = normalize(searchInput.value);

  if (txt === "") {
    filteredWords = null;
  } else {
    filteredWords = words.filter(item =>
      normalize(item.word).includes(txt)
    );
  }

  currentPage = 1;
  updateList();
}

/* ================================
   ATUALIZAR LISTA
================================ */
function updateList() {
  const listToShow = filteredWords ?? words;

  sortWords(listToShow);
  listEl.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(listToShow.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const items = listToShow.slice(start, start + pageSize);

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="item-left">
        <div class="word-pill">${item.word}</div>
      </div>
      <div class="controls">
        <div class="ctrl-btn minus">-</div>
        <div class="level-display">${item.level}</div>
        <div class="ctrl-btn plus">+</div>
        <div class="ctrl-btn delete" style="background:#ffb3b3;">X</div>
      </div>
    `;

    div.querySelector(".minus").onclick = () => {
      if (item.level > 0) {
        item.level--;
        saveWords();
        applySearch();
      }
    };

    div.querySelector(".plus").onclick = () => {
      item.level++;
      saveWords();
      applySearch();
    };

    div.querySelector(".delete").onclick = () => {
      words = words.filter(x => x.id !== item.id);
      saveWords();
      applySearch();
    };

    listEl.appendChild(div);
  });

  pageInfo.textContent = `${currentPage} / ${totalPages}`;
}

/* ================================
   PAGINAÇÃO
================================ */
prevBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    updateList();
  }
};

nextBtn.onclick = () => {
  const listToShow = filteredWords ?? words;
  const totalPages = Math.ceil(listToShow.length / pageSize);

  if (currentPage < totalPages) {
    currentPage++;
    updateList();
  }
};

/* ================================
   EVENTO DA BARRA DE PESQUISA
================================ */
searchInput.addEventListener("input", applySearch);

/* ================================
   INICIAR
================================ */
loadWords();
updateList();
