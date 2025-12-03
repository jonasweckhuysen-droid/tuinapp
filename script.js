let plantsData = [];
let vakken = JSON.parse(localStorage.getItem("vakken")) || {};
let selectedVakId = null;

/* -------------------------
   ICONEN PER TYPE EN SPEC
------------------------- */
const typeIcons = {
    zon: "☀️",
    halfzon: "🌤️",
    schaduw: "🌑",
    winterhard: "❄️",
    vochtig: "💧",
    droog: "🔥",
    bodembedekker: "🟦",
    struik: "🌳",
    vasteplant: "🌱",
    siergras: "🎋"
};

const specIcons = {
    plantgroep: "🪴",
    bloeikleur: "🌸",
    standplaats: "☀️",
    familie: "🌿",
    bladkleur: "🍃",
    wintergroen: "❄️",
    planthoogte: "📏",
    grondsoort: "🌱",
    toepassingssuggesties: "🏡",
    vrucht: "🍎"
};

/* -------------------------
   INIT
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    loadPlants();
    renderVakken();
    updateVakSelect();
});

/* -------------------------
   PLANTS LADEN
------------------------- */
function loadPlants() {
    fetch("plants.json")
        .then(res => res.json())
        .then(data => {
            plantsData = data.map(p => ({ ...p, id: p.name.toLowerCase().replace(/\s+/g,'_') }));
        });
}

/* -------------------------
   VAKKEN
------------------------- */
function saveVakken() {
    localStorage.setItem("vakken", JSON.stringify(vakken));
}

function renderVakken() {
    const container = document.getElementById("vakkenContainer");
    container.innerHTML = "";
    Object.keys(vakken).forEach(id => {
        const vak = vakken[id];
        const div = document.createElement("div");
        div.className = "vak-card";
        div.onclick = () => openVak(id);
        div.innerHTML = `
            <h3><i class="fa-solid fa-border-all"></i> ${vak.name}</h3>
            <p>${vak.plants.length} planten</p>
        `;
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

/* -------------------------
   VAK TOEVOEGEN
------------------------- */
document.getElementById("add-vak-btn").addEventListener("click", () => {
    const input = document.getElementById("vak-naam-input");
    const name = input.value.trim();
    if (!name) return alert("Vul een naam in.");
    const id = "vak_" + Date.now();
    vakken[id] = { name, plants: [] };
    saveVakken();
    renderVakken();
    updateVakSelect();
    input.value = "";
});

/* -------------------------
   VAK SELECTEREN
------------------------- */
document.getElementById("vak-select-add").addEventListener("change", (e) => {
    selectedVakId = e.target.value;
});

/* -------------------------
   PLANT MODAL
------------------------- */
document.getElementById("open-plant-select").addEventListener("click", () => {
    if (!selectedVakId) { alert("Selecteer eerst een vak."); return; }
    renderPlantDropdown();
    document.getElementById("plantSelectModal").style.display = "block";
});

document.getElementById("plantSelectClose").addEventListener("click", () => {
    document.getElementById("plantSelectModal").style.display = "none";
});

/* -------------------------
   PLANT DROPDOWN + ZOEKEN
------------------------- */
function renderPlantDropdown(filter = "") {
    const list = document.getElementById("plantsList");
    list.innerHTML = "";
    plantsData
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(plant => {
            const li = document.createElement("li");
            li.textContent = plant.name;
            li.style.cursor = "pointer";
            li.onclick = () => { addPlantToVak(plant.id); document.getElementById("plantSelectModal").style.display = "none"; };
            list.appendChild(li);
        });
}

document.getElementById("plant-search").addEventListener("input", (e) => {
    renderPlantDropdown(e.target.value);
});

/* -------------------------
   NIEUWE PLANT TOEVOEGEN
------------------------- */
document.getElementById("add-new-plant").addEventListener("click", () => {
    const name = document.getElementById("new-plant-name").value.trim();
    const latin = document.getElementById("new-plant-science").value.trim();
    const description = document.getElementById("new-plant-info").value.trim();
    const image = document.getElementById("new-plant-img").value.trim() || "images/logo-192.png";
    if (!name) return alert("Vul een plantnaam in.");
    const newPlant = {
        id: name.toLowerCase().replace(/\s+/g,'_'),
        name, latin, description, image, types: [], specs: {}
    };
    plantsData.push(newPlant);
    renderPlantDropdown();
    document.getElementById("new-plant-name").value = "";
    document.getElementById("new-plant-science").value = "";
    document.getElementById("new-plant-info").value = "";
    document.getElementById("new-plant-img").value = "";
});

/* -------------------------
   PLANT TOEVOEGEN AAN VAK
------------------------- */
function addPlantToVak(plantId) {
    if (!selectedVakId) { alert("Open eerst een vak."); return; }
    if (!vakken[selectedVakId].plants.includes(plantId)) {
        vakken[selectedVakId].plants.push(plantId);
        saveVakken();
        renderVakken();
    }
}

/* -------------------------
   VAK MODAL
------------------------- */
function openVak(id) {
    selectedVakId = id;
    const modal = document.getElementById("vakModal");
    const list = document.getElementById("vakPlantList");
    const vak = vakken[id];
    document.getElementById("vakModalTitle").textContent = vak.name;
    list.innerHTML = "";

    vak.plants.forEach(pid => {
        const plant = plantsData.find(p => p.id === pid);
        if (!plant) return;
        const div = document.createElement("div");
        div.className = "plant-mini-card";
        div.textContent = plant.name;
        div.onclick = () => showPlantDetails(pid);
        list.appendChild(div);
    });

    modal.style.display = "block";
}

function closeVak() { document.getElementById("vakModal").style.display = "none"; }

/* -------------------------
   PLANT DETAILS
------------------------- */
function showPlantDetails(id) {
    const plant = plantsData.find(p => p.id === id);
    if (!plant) return;
    const modal = document.getElementById("plantDetailModal");
    const content = document.getElementById("detailContent");

    const typesHTML = plant.types.length
        ? `<div class="detail-types">${plant.types.map(t => `<span class="type-tag type-large">${typeIcons[t.toLowerCase()] || "❔"} ${t}</span>`).join("")}</div>`
        : "";

    const specsHTML = plant.specs ? `<div class="detail-specs">${Object.keys(plant.specs).map(k => `<p><strong>${specIcons[k] || "❔"} ${k}:</strong> ${plant.specs[k]}</p>`).join("")}</div>` : "";

    content.innerHTML = `
        <div class="detail-card">
            <h2>${plant.name}</h2>
            <img src="${plant.image}" class="plant-detail-img">
            <p><strong>Wetenschappelijke naam:</strong> ${plant.latin}</p>
            <p><strong>Info:</strong> ${plant.description}</p>
            ${typesHTML}
            ${specsHTML}
        </div>
    `;
    modal.style.display = "block";
}

function closePlantDetails() { document.getElementById("plantDetailModal").style.display = "none"; }
