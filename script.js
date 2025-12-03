let plantsData = [];
let vakken = JSON.parse(localStorage.getItem("vakken")) || {};
let selectedVakId = null;

/* -------------------------
   ICONEN PER TYPE EN SPEC
------------------------- */
const typeIcons = {
    zon: "☀️", halfzon: "🌤️", schaduw: "🌑",
    winterhard: "❄️", vochtig: "💧", droog: "🔥",
    bodembedekker: "🟦", struik: "🌳", vasteplant: "🌱", siergras: "🎋"
};

const specIcons = {
    plantgroep: "🪴", bloeikleur: "🌸", standplaats: "☀️",
    familie: "🌿", bladkleur: "🍃", wintergroen: "❄️",
    planthoogte: "📏", grondsoort: "🌱", toepassingssuggesties: "🏡",
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
function saveVakken() { localStorage.setItem("vakken", JSON.stringify(vakken)); }

function renderVakken() {
    const container = document.getElementById("vakkenContainer");
    container.innerHTML = "";

    Object.keys(vakken).forEach(id => {
        const vak = vakken[id];
        const div = document.createElement("div");
        div.className = "vak-card vak";
        div.dataset.vakId = id;
        div.draggable = true;

        // Drag & Drop vak
        div.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", id);
        });
        div.addEventListener("dragover", e => e.preventDefault());
        div.addEventListener("drop", e => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData("text/plain");
            if(draggedId === id) return;
            const container = document.getElementById("vakkenContainer");
            const draggedElem = document.querySelector(`[data-vak-id="${draggedId}"]`);
            container.insertBefore(draggedElem, div.nextSibling);
        });

        div.innerHTML = `
            <h3 class="vak-title"><i class="fa-solid fa-border-all"></i> ${vak.name}</h3>
            <div class="vak-plants"></div>
            <p>${vak.plants.length} planten</p>
        `;

        // Voeg resize handle
        const handle = document.createElement("div");
        handle.className = "resize-handle";
        div.appendChild(handle);
        handle.addEventListener("mousedown", initResize);

        function initResize(e) {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = div.offsetWidth;
            const startHeight = div.offsetHeight;

            function doResize(event) {
                div.style.width = startWidth + (event.clientX - startX) + "px";
                div.style.height = startHeight + (event.clientY - startY) + "px";
            }
            function stopResize() {
                window.removeEventListener("mousemove", doResize);
                window.removeEventListener("mouseup", stopResize);
            }
            window.addEventListener("mousemove", doResize);
            window.addEventListener("mouseup", stopResize);
        }

        const plantenContainer = div.querySelector(".vak-plants");
        vak.plants
            .map(pid => plantsData.find(p => p.id === pid))
            .filter(p => p)
            .sort((a,b) => a.name.localeCompare(b.name, 'nl', {sensitivity:'base'}))
            .forEach(plant => {
                const img = document.createElement("img");
                img.src = plant.image || "images/logo-192.png";
                img.title = `${plant.name}\n${plant.latin}\n${plant.description}`;
                img.className = "vak-mini-plant";
                img.dataset.plantId = plant.id;

                img.addEventListener("mousedown", e => e.stopPropagation());
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
   Drag & Drop Planten
------------------------- */
let draggedPlantId = null;
function handleDragStart(e) { draggedPlantId = e.target.dataset.plantId; }

function handleDrop(e) {
    e.preventDefault();
    const targetVakId = e.currentTarget.dataset.vakId;
    if (!draggedPlantId || !targetVakId) return;

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
   Vak Select Dropdown
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
   Plant Modal
------------------------- */
document.getElementById("open-plant-select").addEventListener("click", () => {
    if (!selectedVakId) return alert("Kies eerst een vak.");
    document.getElementById("plantSelectModal").style.display = "block";
});

document.getElementById("plantSelectClose").addEventListener("click", () => {
    document.getElementById("plantSelectModal").style.display = "none";
});

function showPlantDetails(id) {
    const plant = plantsData.find(p => p.id === id);
    if (!plant) return;
    const content = document.getElementById("detailContent");
    content.innerHTML = `
        <h3>${plant.name}</h3>
        <p><i>${plant.latin}</i></p>
        <img src="${plant.image || 'images/logo-192.png'}" class="plant-detail-img">
        <p>${plant.description || ""}</p>
    `;
    document.getElementById("plantDetailModal").style.display = "block";
}

function closePlantDetails() {
    document.getElementById("plantDetailModal").style.display = "none";
}

/* -------------------------
   Vak Modal
------------------------- */
function openVak(id) {
    const vak = vakken[id];
    selectedVakId = id;
    document.getElementById("vakModalTitle").textContent = vak.name;
    const container = document.getElementById("vakPlantList");
    container.innerHTML = vak.plants.map(pid => {
        const p = plantsData.find(pl => pl.id === pid);
        return `<p>${p ? p.name : pid}</p>`;
    }).join("");
    document.getElementById("vakModal").style.display = "block";
}

function closeVak() {
    document.getElementById("vakModal").style.display = "none";
}
