let plantsData = [];
let vakken = JSON.parse(localStorage.getItem("vakken")) || {};
let selectedVakId = null;

/* ICONEN */
const typeIcons = { zon: "☀️", halfzon: "🌤️", schaduw: "🌑", winterhard: "❄️", vochtig: "💧", droog: "🔥", bodembedekker: "🟦", struik: "🌳", vasteplant: "🌱", siergras: "🎋" };
const specIcons = { plantgroep: "🪴", bloeikleur: "🌸", standplaats: "☀️", familie: "🌿", bladkleur: "🍃", wintergroen: "❄️", planthoogte: "📏", grondsoort: "🌱", toepassingssuggesties: "🏡", vrucht: "🍎" };

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    loadPlants();
    renderVakken();
    updateVakSelect();
});

/* PLANTS LADEN */
function loadPlants() {
    fetch("plants.json")
        .then(res => res.json())
        .then(data => {
            plantsData = data.sort((a, b) => a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' }));
        });
}

/* VAKKEN */
function addNewVak() {
    const input = document.getElementById("vak-naam-input");
    const name = input.value.trim();
    if (!name) return;
    const id = "vak_" + Date.now();
    vakken[id] = { name, plants: [] };
    saveVakken();
    renderVakken();
    updateVakSelect();
    input.value = "";
}

function saveVakken() { localStorage.setItem("vakken", JSON.stringify(vakken)); }

function renderVakken() {
    const container = document.getElementById("vakkenContainer");
    if (!container) return;
    container.innerHTML = "";
    Object.keys(vakken).forEach(id => {
        const vak = vakken[id];
        const div = document.createElement("div");
        div.className = "vak-card";
        div.onclick = () => openVak(id);
        div.innerHTML = `<h3><i class="fa-solid fa-border-all"></i> ${vak.name}</h3><p>${vak.plants.length} planten</p>`;
        container.appendChild(div);
    });
}

function updateVakSelect() {
    const select = document.getElementById("vak-select-add");
    select.innerHTML = '<option value="">-- Kies een vak --</option>';
    Object.keys(vakken).forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = vakken[id].name;
        select.appendChild(option);
    });
}

/* SELECT VAK */
document.getElementById("vak-select-add").addEventListener("change", e => {
    selectedVakId = e.target.value;
});

/* OPEN PLANT MODAL */
document.getElementById("open-plant-select").addEventListener("click", () => {
    if (!selectedVakId) { alert("Selecteer eerst een vak."); return; }
    renderPlantDropdown();
    document.getElementById("plantSelectModal").style.display = "block";
});

/* PLANT DROPDOWN */
function renderPlantDropdown() {
    const list = document.getElementById("plantsList");
    list.innerHTML = "";
    plantsData.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.name;
        li.style.cursor = "pointer";
        li.style.padding = "4px 6px";
        li.onclick = () => { addPlantToVak(p.id); document.getElementById("plantSelectModal").style.display = "none"; };
        list.appendChild(li);
    });
}

/* CLOSE MODAL */
document.getElementById("plantSelectClose").addEventListener("click", () => {
    document.getElementById("plantSelectModal").style.display = "none";
});

/* PLANT TOEVOEGEN AAN VAK */
function addPlantToVak(plantId) {
    if (!selectedVakId) { alert("Open eerst een vak."); return; }
    if (!vakken[selectedVakId].plants.includes(plantId)) {
        vakken[selectedVakId].plants.push(plantId);
        saveVakken();
    }
    openVak(selectedVakId);
}

/* OPEN VAK */
function openVak(id) {
    selectedVakId = id;
    const modal = document.getElementById("vakModal");
    const list = document.getElementById("vakPlantList");
    modal.style.display = "block";
    list.innerHTML = "";
    const vak = vakken[id];
    vak.plants.forEach(pid => {
        const plant = plantsData.find(p => p.id === pid);
        if (!plant) return;
        const div = document.createElement("div");
        div.className = "plant-mini-card";
        div.textContent = plant.name;
        div.onclick = () => showPlantDetails(pid);
        list.appendChild(div);
    });
}

function closeVak() { document.getElementById("vakModal").style.display = "none"; }

/* PLANT DETAILS */
function showPlantDetails(id) {
    const plant = plantsData.find(p => p.id === id);
    if (!plant) return;
    const modal = document.getElementById("plantDetailModal");
    const content = document.getElementById("detailContent");

    const typesHTML = plant.types ? `<div class="detail-types">${plant.types.map(t => `<span class="type-tag type-large">${typeIcons[t.toLowerCase()] || "❔"} ${t}</span>`).join("")}</div>` : "";
    const specsHTML = plant.specs ? `<div class="detail-specs">${Object.keys(plant.specs).map(key => `<p><strong>${specIcons[key] || "❔"} ${key}:</strong> ${plant.specs[key]}</p>`).join("")}</div>` : "";

    content.innerHTML = `
        <div class="detail-card">
            <h2><i class="fa-solid fa-leaf"></i> ${plant.name}</h2>
            <img src="${plant.image || 'images/logo-192.png'}" class="plant-detail-img">
            <p><i class="fa-solid fa-flask"></i> <strong>Wetenschappelijke naam:</strong> ${plant.latin}</p>
            <p><i class="fa-solid fa-circle-info"></i> <strong>Info:</strong> ${plant.description}</p>
            ${typesHTML} ${specsHTML}
        </div>
    `;
    modal.style.display = "block";
}

function closePlantDetails() { document.getElementById("plantDetailModal").style.display = "none"; }
