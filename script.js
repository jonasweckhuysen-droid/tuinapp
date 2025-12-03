let plantsData = [];
let vakken = JSON.parse(localStorage.getItem("vakken")) || {};
let selectedVakId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPlants();
    renderVakken();
    renderPlantList();
});

/* -------------------------
   PLANTS LADEN EN TONEN
------------------------- */
function loadPlants() {
    fetch("plants.json")
        .then(res => res.json())
        .then(data => {
            plantsData = data.sort((a, b) =>
                a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' })
            );
            renderPlantList();
        });
}

function renderPlantList() {
    const list = document.getElementById("plantsList");
    if (!list) return;

    list.innerHTML = "";

    plantsData.forEach(plant => {
        const div = document.createElement("div");
        div.className = "plant-item";
        div.innerHTML = `
            <div class="plant-card">
                <div class="plant-header">
                    <i class="fa-solid fa-leaf plant-icon"></i>
                    <h3>${plant.name}</h3>
                </div>

                <div class="plant-info">
                    <p><i class="fa-solid fa-flask"></i> <strong>Wetenschappelijk:</strong> ${plant.scientific}</p>
                    <p><i class="fa-solid fa-circle-info"></i> <strong>Info:</strong> ${plant.info}</p>
                </div>

                <button class="add-btn" onclick="addPlantToVak('${plant.id}')">
                    <i class="fa-solid fa-plus"></i> Toevoegen
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

/* -------------------------
       VAKKEN
------------------------- */
function addNewVak() {
    const name = prompt("Naam van het nieuwe vak:");
    if (!name) return;

    const id = "vak_" + Date.now();
    vakken[id] = { name, plants: [] };
    saveVakken();
    renderVakken();
}

function saveVakken() {
    localStorage.setItem("vakken", JSON.stringify(vakken));
}

function renderVakken() {
    const container = document.getElementById("vakkenContainer");
    if (!container) return;

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

/* -------------------------
       VAK BEKIJKEN
------------------------- */
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
        div.className = "plant-mini";

        div.innerHTML = `
            <div class="plant-mini-card" onclick="showPlantDetails('${plant.id}')">
                <h4><i class="fa-solid fa-seedling"></i> ${plant.name}</h4>
            </div>
        `;

        list.appendChild(div);
    });
}

function closeVak() {
    document.getElementById("vakModal").style.display = "none";
}

/* -------------------------
   PLANT TOEVOEGEN AAN VAK
------------------------- */
function addPlantToVak(plantId) {
    if (!selectedVakId) {
        alert("Open eerst een vak om planten toe te voegen.");
        return;
    }

    vakken[selectedVakId].plants.push(plantId);
    saveVakken();
    openVak(selectedVakId);
}

/* -------------------------
   DETAILS VAN PLANT
------------------------- */
function showPlantDetails(id) {
    const plant = plantsData.find(p => p.id === id);
    if (!plant) return;

    const modal = document.getElementById("plantDetailModal");
    const content = document.getElementById("detailContent");

    modal.style.display = "block";

    content.innerHTML = `
        <div class="detail-card">
            <h2><i class="fa-solid fa-leaf"></i> ${plant.name}</h2>

            <p><i class="fa-solid fa-flask"></i> <strong>Wetenschappelijke naam:</strong><br>${plant.scientific}</p>

            <p><i class="fa-solid fa-circle-info"></i> <strong>Extra info:</strong><br>${plant.info}</p>
        </div>
    `;
}

function closePlantDetails() {
    document.getElementById("plantDetailModal").style.display = "none";
}
