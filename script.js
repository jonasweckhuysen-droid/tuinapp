let plantsData = [];
let vakken = JSON.parse(localStorage.getItem("vakken")) || {};
let selectedVakId = null;
let draggedPlantId = null;

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
    setupVakEvents();
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
            renderVakken();
            updateVakSelect();
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
        div.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", id));
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

        // Resize handle
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

        // Planten weergeven
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
                img.addEventListener("dragstart", handlePlantDragStart);
                img.addEventListener("dragover", e => e.preventDefault());
                img.addEventListener("drop", handlePlantDrop);
                img.addEventListener("click", () => showPlantDetails(plant.id));

                plantenContainer.appendChild(img);
            });

        div.addEventListener("click", e => {
            if(!e.target.classList.contains("vak-mini-plant")) openVak(id);
        });

        div.addEventListener("dragover", e => e.preventDefault());
        div.addEventListener("drop", handleDrop);

        container.appendChild(div);
    });
}

/* -------------------------
   DRAG & DROP PLANTEN
------------------------- */
function handlePlantDragStart(e) {
    draggedPlantId = e.target.dataset.plantId;
}

function handlePlantDrop(e) {
    e.preventDefault();
    const targetVakId = e.currentTarget.closest(".vak").dataset.vakId;
    if (!draggedPlantId || !targetVakId) return;

    const sourceVakId = Object.keys(vakken).find(v => vakken[v].plants.includes(draggedPlantId));
    if (sourceVakId) vakken[sourceVakId].plants = vakken[sourceVakId].plants.filter(p => p !== draggedPlantId);

    vakken[targetVakId].plants.push(draggedPlantId);
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

/* -------------------------
   VAK TOEVOEGEN
------------------------- */
function setupVakEvents() {
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
        selectedVakId = id;
        document.getElementById("vak-select-add").value = id;
    });

    document.getElementById("vak-select-add").addEventListener("change", (e) => {
        selectedVakId = e.target.value;
    });

    document.getElementById("open-plant-select").addEventListener("click", () => {
        if (!selectedVakId) return alert("Kies eerst een vak.");
        const list = document.getElementById("plantsList");
        list.innerHTML = "";
        plantsData.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p.name;
            li.addEventListener("click", () => {
                vakken[selectedVakId].plants.push(p.id);
                saveVakken();
                renderVakken();
                document.getElementById("plantSelectModal").style.display = "none";
            });
            list.appendChild(li);
        });
        document.getElementById("plantSelectModal").style.display = "block";
    });

    document.getElementById("plantSelectClose").addEventListener("click", () => {
        document.getElementById("plantSelectModal").style.display = "none";
    });
}

/* -------------------------
   PLANT DETAILS
------------------------- */
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
   VAK MODAL
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

/* -------------------------
   VAK DROP (voor vakken verslepen)
------------------------- */
function handleDrop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const targetId = e.currentTarget.dataset.vakId;
    if (!draggedId || draggedId === targetId) return;
    const container = document.getElementById("vakkenContainer");
    const draggedElem = document.querySelector(`[data-vak-id="${draggedId}"]`);
    const targetElem = document.querySelector(`[data-vak-id="${targetId}"]`);
    container.insertBefore(draggedElem, targetElem.nextSibling);
}
