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
            plantsData.sort((a,b) => a.name.localeCompare(b.name, 'nl', {sensitivity:'base'}));
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
        div.className = "vak-card vak";
        div.dataset.vakId = id;

        // Maak vak versleepbaar
        div.draggable = true;
        div.addEventListener("dragover", e => e.preventDefault());
        div.addEventListener("drop", handleDrop);

        div.innerHTML = `
            <h3 class="vak-title"><i class="fa-solid fa-border-all"></i> ${vak.name}</h3>
            <div class="vak-planten"></div>
            <p>${vak.plants.length} planten</p>
        `;

        const plantenContainer = div.querySelector(".vak-planten");
        vak.plants
            .map(pid => plantsData.find(p => p.id === pid))
            .filter(p => p)
            .sort((a,b) => a.name.localeCompare(b.name, 'nl', {sensitivity:'base'}))
            .forEach(plant => {
                const img = document.createElement("img");
                img.src = plant.image || "images/logo-192.png";
                img.title = `${plant.name}\n${plant.latin}\n${plant.description}`;
                img.className = "vak-mini-plant";
                img.draggable = true;
                img.dataset.plantId = plant.id;

                // Versleepbare planten
                img.addEventListener("dragstart", handleDragStart);
                img.addEventListener("dragover", e => e.preventDefault());
                img.addEventListener("drop", handlePlantDrop);

                img.addEventListener("click", () => showPlantDetails(plant.id));
                plantenContainer.appendChild(img);
            });

        div.addEventListener("click", e => {
            if(!e.target.classList.contains("vak-mini-plant")) openVak(id);
        });

        container.appendChild(div);
    });
}

/* -------------------------
   DRAG & DROP HANDLERS
------------------------- */
let draggedPlantId = null;
function handleDragStart(e) {
    draggedPlantId = e.target.dataset.plantId;
}

function handleDrop(e) {
    e.preventDefault();
    const targetVakId = e.currentTarget.dataset.vakId;
    if (!draggedPlantId || !targetVakId) return;

    // Verplaats plant naar ander vak
    Object.keys(vakken).forEach(vakId => {
        vakken[vakId].plants = vakken[vakId].plants.filter(pid => pid !== draggedPlantId);
    });
    vakken[targetVakId].plants.push(draggedPlantId);
    saveVakken();
    renderVakken();
    draggedPlantId = null;
}

function handlePlantDrop(e) {
    e.preventDefault();
    const targetPlantId = e.currentTarget.dataset.plantId;
    if (!draggedPlantId || !targetPlantId || draggedPlantId === targetPlantId) return;

    // Wissel planten binnen hetzelfde vak
    const vakId = selectedVakId;
    if(!vakId) return;
    const arr = vakken[vakId].plants;
    const i1 = arr.indexOf(draggedPlantId);
    const i2 = arr.indexOf(targetPlantId);
    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
    saveVakken();
    renderVakken();
    draggedPlantId = null;
}

/* -------------------------
   VAK SELECT DROPDOWN
------------------------- */
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
        .sort((a,b) => a.name.localeCompare(b.name, 'nl', {sensitivity:'base'}))
        .forEach(plant => {
            const li = document.createElement("li");
            li.textContent = plant.name;
            li.style.cursor = "pointer";
            li.title = `${plant.latin}\n${plant.description}`;
            li.onclick = () => {
                addPlantToVak(plant.id);
                document.getElementById("plantSelectModal").style.display = "none";
            };
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
    plantsData.sort((a,b) => a.name.localeCompare(b.name, 'nl', {sensitivity:'base'}));
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

    vak.plants
        .map(pid => plantsData.find(p => p.id === pid))
        .filter(p => p)
        .sort((a,b) => a.name.localeCompare(b.name, 'nl', {sensitivity:'base'}))
        .forEach(plant => {
            const div = document.createElement("div");
            div.className = "plant-mini-card";
            div.textContent = plant.name;
            div.title = `${plant.latin}\n${plant.description}`;
            div.onclick = () => showPlantDetails(plant.id);
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
