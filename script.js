let voterData = [];

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const status = document.getElementById("status");
const results = document.getElementById("results");

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function field(label, value) {
  return `
    <div class="result-item">
      <span class="result-label">${escapeHtml(label)}</span>
      <span class="result-value">${escapeHtml(value || "-")}</span>
    </div>
  `;
}

function renderResults(matches, query) {
  results.innerHTML = "";

  if (!matches.length) {
    status.className = "status error";
    status.textContent = "Data tidak ditemukan.";
    results.innerHTML = '<div class="empty">Tidak ada nama yang cocok dengan pencarian.</div>';
    return;
  }

  status.className = "status";
  status.textContent = `${matches.length.toLocaleString("id-ID")} data ditemukan untuk "${query}".`;

  const list = document.createElement("div");
  list.className = "result-list";

  list.innerHTML = matches.map(person => `
    <article class="result-card">
      <h2 class="result-name">${escapeHtml(person.Nama || "-")}</h2>
      <div class="result-grid">
        ${field("Dusun", person.Dusun)}
        ${field("RT", person.RT)}
        ${field("RW", person.RW)}
        ${field("TPS", person.TPS)}
      </div>
    </article>
  `).join("");

  results.appendChild(list);
}

function search() {
  const query = input.value.trim();

  results.innerHTML = "";

  if (!query) {
    status.className = "status error";
    status.textContent = "Silakan masukkan nama.";
    return;
  }

  const normalizedQuery = normalize(query);
  const matches = voterData.filter(person =>
    normalize(person.Nama).includes(normalizedQuery)
  );

  renderResults(matches, query);
}

async function loadData() {
  try {
    const response = await fetch("data.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    voterData = await response.json();

    // Cache normalized names once so repeated searches stay fast.
    voterData.forEach(person => {
      person._namaSearch = normalize(person.Nama);
    });

    // Replace the filter with the cached normalized value.
    status.className = "status";
    status.textContent = `${voterData.length.toLocaleString("id-ID")} data siap dicari.`;
  } catch (error) {
    console.error(error);
    status.className = "status error";
    status.textContent = "Data tidak dapat dimuat. Pastikan data.json berada di folder yang sama.";
  }
}

// Use the cached normalized name after data is loaded.
function searchWithCache() {
  const query = input.value.trim();
  results.innerHTML = "";

  if (!query) {
    status.className = "status error";
    status.textContent = "Silakan masukkan nama.";
    return;
  }

  const normalizedQuery = normalize(query);
  const matches = voterData.filter(person =>
    person._namaSearch.includes(normalizedQuery)
  );

  renderResults(matches, query);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  searchWithCache();
});

loadData();
