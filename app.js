/* ================================
   VARIÁVEIS
================================ */
let words = [];
let currentPage = 1;
const pageSize = 10;

const input = document.getElementById("wordInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

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
   FUNÇÃO DE ORDENAR
================================ */
function sortWords() {
  words.sort((a, b) => {
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
    id: crypto.randomUUID(), // ID exclusivo para evitar troca errada
    word: w,
    level: 0
  });

  input.value = "";
  saveWords();
  updateList();
};

/* ================================
   ATUALIZAR LISTA
================================ */
function updateList() {
  sortWords();
  listEl.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(words.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const items = words.slice(start, start + pageSize);

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

    // DIMINUIR NÍVEL
    div.querySelector(".minus").onclick = () => {
      if (item.level > 0) {
        item.level--;
        saveWords();
        updateList();
      }
    };

    // AUMENTAR NÍVEL
    div.querySelector(".plus").onclick = () => {
      item.level++;
      saveWords();
      updateList();
    };

    // EXCLUIR
    div.querySelector(".delete").onclick = () => {
      words = words.filter(x => x.id !== item.id);
      saveWords();
      updateList();
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
  const totalPages = Math.ceil(words.length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    updateList();
  }
};

/* ================================
   INICIAR
================================ */
loadWords();
updateList();
