// app.js - lógica principal
const STORAGE_KEY = 'palavras_niveis_v1';
const MAX_LEVEL = 999;
const MIN_LEVEL = 0;

let state = {
  items: [] // cada item {id, word, level, createdAt}
};

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      state = JSON.parse(raw);
      if(!state.items) state.items = [];
    }catch(e){
      state = {items:[]};
    }
  }
}

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function addWord(word){
  if(!word) return;
  const item = { id: uid(), word: word.trim(), level: 0, createdAt: Date.now() };
  state.items.push(item);
  sortItems();
  saveState();
  render();
}

function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

function changeLevel(id, delta){
  const it = state.items.find(x=>x.id===id);
  if(!it) return;
  it.level = clamp(it.level + delta, MIN_LEVEL, MAX_LEVEL);
  sortItems();
  saveState();
  render();
}

function sortItems(){
  // ordena por level desc, se empate usar createdAt (mais recente primeiro)
  state.items.sort((a,b)=>{
    if(b.level !== a.level) return b.level - a.level;
    return b.createdAt - a.createdAt;
  });
}

function removeItem(id){
  state.items = state.items.filter(x=>x.id !== id);
  saveState();
  render();
}

function render(){
  const list = document.getElementById('list');
  list.innerHTML = '';
  if(state.items.length === 0){
    const el = document.createElement('div');
    el.className = 'small-muted';
    el.textContent = 'Nenhuma palavra ainda. Adicione uma acima.';
    list.appendChild(el);
    return;
  }

  state.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item';

    const left = document.createElement('div');
    left.className = 'item-left';

    const pill = document.createElement('div');
    pill.className = 'word-pill';
    pill.textContent = item.word;

    left.appendChild(pill);

    // controls
    const controls = document.createElement('div');
    controls.className = 'controls';

    const minus = document.createElement('button');
    minus.className = 'ctrl-btn';
    minus.textContent = '-';
    minus.addEventListener('click', ()=>changeLevel(item.id, -1));

    const level = document.createElement('div');
    level.className = 'level-display';
    level.textContent = String(item.level);

    const plus = document.createElement('button');
    plus.className = 'ctrl-btn';
    plus.textContent = '+';
    plus.addEventListener('click', ()=>changeLevel(item.id, +1));

    // delete small (opcional)
    const del = document.createElement('button');
    del.className = 'ctrl-btn';
    del.textContent = '✕';
    del.title = 'Remover';
    del.addEventListener('click', ()=>{ if(confirm('Remover "'+item.word+'"?')) removeItem(item.id); });

    controls.appendChild(minus);
    controls.appendChild(level);
    controls.appendChild(plus);
    controls.appendChild(del);

    row.appendChild(left);
    row.appendChild(controls);
    list.appendChild(row);
  });
}

function setupHandlers(){
  const input = document.getElementById('wordInput');
  const addBtn = document.getElementById('addBtn');

  function doAdd(){
    const v = input.value.trim();
    if(!v) return;
    addWord(v);
    input.value = '';
    input.focus();
  }

  addBtn.addEventListener('click', doAdd);
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') doAdd();
  });
}

// init
loadState();
sortItems();
document.addEventListener('DOMContentLoaded', ()=>{
  setupHandlers();
  render();
});
