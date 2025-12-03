// ==========================
// LOCALSTORAGE FUNCTIES
// ==========================
let vakkenData = {};

function saveData() {
    const positions = {};

    document.querySelectorAll(".vak").forEach(vak => {
        const name = vak.querySelector(".vak-title").textContent;

        positions[name] = {
            left: vak.style.left || "0px",
            top: vak.style.top || "0px",
            width: vak.style.width || "",
            height: vak.style.height || ""
        };
    });

    localStorage.setItem("vakkenData", JSON.stringify(vakkenData));
    localStorage.setItem("vakPositions", JSON.stringify(positions));
}

function loadData() {
    const savedVakken = localStorage.getItem("vakkenData");
    const savedPos = localStorage.getItem("vakPositions");

    if (savedVakken) vakkenData = JSON.parse(savedVakken);
    return savedPos ? JSON.parse(savedPos) : {};
}

// ==========================
// VAKKEN
// ==========================
function initVakSelect() {
    const vakSelect = document.getElementById("vak-select-add");
    if (!vakSelect) return;
    const defaultVakken = ["Voortuin", "Achtertuin", "Serre"];

    defaultVakken.forEach(vak => {
        if (!vakkenData[vak]) vakkenData[vak] = [];
        const option = document.createElement("option");
        option.value = vak;
        option.textContent = vak;
        vakSelect.appendChild(option);
    });
}

const addVakBtn = document.getElementById("add-vak-btn");
if (addVakBtn) {
    addVakBtn.onclick = () => {
        const input = document.getElementById("vak-naam-input");
        const vakNaam = input?.value.trim();
        if (!vakNaam) return;

        if (!vakkenData[vakNaam]) vakkenData[vakNaam] = [];

        const vakSelect = document.getElementById("vak-select-add");
        const option = document.createElement("option");
        option.value = vakNaam;
        option.textContent = vakNaam;
        vakSelect.appendChild(option);
        vakSelect.value = vakNaam;

        input.value = "";
        renderGarden();
        saveData();
    };
}

// ==========================
// PLANTS.JSON LADEN + SELECT
// ==========================
let plantsDatabase = [];

async function loadPlantsDatabase() {
    try {
        const response = await fetch("plants.json");
        if (!response.ok) throw new Error("Kan plants.json niet laden: " + response.status);
        plantsDatabase = await response.json();

        // Sorteer alfabetisch (Nederlandse locale)
        plantsDatabase.sort((a, b) => a.name.localeCompare(b.name, 'nl'));

        populatePlantSelect();
    } catch (err) {
        console.error(err);
    }
}

function populatePlantSelect(filter = "") {
    const plantList = document.getElementById("plant-select-list");
    if (!plantList) return;

    plantList.innerHTML = "";
    const q = filter.trim().toLowerCase();

    plantsDatabase.forEach((plant, index) => {
        if (q && !plant.name.toLowerCase().includes(q)) return; // filter
        const li = document.createElement("li");
        li.className = "plant-select-item";
        li.style.listStyle = "none";
        li.style.padding = "8px";
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "8px";
        li.innerHTML = `<img src="${plant.image}" alt="${plant.name}" width="36" style="border-radius:6px;"> <div style="flex:1">${plant.name}<br><small style="opacity:.7">${plant.latin || ""}</small></div>`;
        li.onclick = () => addPlantToVak(index);
        plantList.appendChild(li);
    });

    if (!plantList.hasChildNodes()) {
        const empty = document.createElement("div");
        empty.style.padding = "10px";
        empty.style.color = "#666";
        empty.textContent = "Geen planten gevonden.";
        plantList.appendChild(empty);
    }
}

function addPlantToVak(index) {
    const vak = document.getElementById("vak-select-add")?.value;
    if (!vak) return alert("Kies eerst een vak!");
    const plant = plantsDatabase[index];
    if (!plant) return;

    if (!vakkenData[vak]) vakkenData[vak] = [];

    vakkenData[vak].push({
        name: plant.name,
        science: plant.latin || "",
        info: plant.description || "",
        img: plant.image || "images/logo-192.png"
    });

    renderGarden();
    saveData();

    const modal = document.getElementById("plant-select-modal");
    if (modal) modal.style.display = "none";
}

// SEARCH input handling (live filter)
const plantSearchInput = document.getElementById("plant-search");
if (plantSearchInput) {
    plantSearchInput.addEventListener("input", (e) => {
        populatePlantSelect(e.target.value);
    });
}

// ==========================
// PLANT POPUP + NIEUWE PLANT
// ==========================
const openPlantBtn = document.getElementById("open-plant-select");
if (openPlantBtn) {
    openPlantBtn.onclick = () => {
        const vak = document.getElementById("vak-select-add")?.value;
        if (!vak) return alert("Kies eerst een vak!");
        const modal = document.getElementById("plant-select-modal");
        if (modal) modal.style.display = "block";
    };
}

const selectClose = document.getElementById("select-close");
if (selectClose) {
    selectClose.onclick = () => {
        const modal = document.getElementById("plant-select-modal");
        if (modal) modal.style.display = "none";
    };
}

const addNewPlantBtn = document.getElementById("add-new-plant");
if (addNewPlantBtn) {
    addNewPlantBtn.onclick = () => {
        const vak = document.getElementById("vak-select-add")?.value;
        const name = document.getElementById("new-plant-name")?.value.trim();
        const science = document.getElementById("new-plant-science")?.value.trim();
        const info = document.getElementById("new-plant-info")?.value.trim();
        const img = document.getElementById("new-plant-img")?.value.trim();

        if (!vak) return alert("Kies eerst een vak!");
        if (!name) return alert("Naam is verplicht");

        if (!vakkenData[vak]) vakkenData[vak] = [];

        vakkenData[vak].push({
            name,
            science,
            info,
            img: img || "images/logo-192.png"
        });

        const modal = document.getElementById("plant-select-modal");
        if (modal) modal.style.display = "none";

        if (document.getElementById("new-plant-name")) document.getElementById("new-plant-name").value = "";
        if (document.getElementById("new-plant-science")) document.getElementById("new-plant-science").value = "";
        if (document.getElementById("new-plant-info")) document.getElementById("new-plant-info").value = "";
        if (document.getElementById("new-plant-img")) document.getElementById("new-plant-img").value = "";

        renderGarden();
        saveData();
    };
}

// ==========================
// PLANT DETAIL POPUP + EDIT
// ==========================
const plantInfoModal = document.getElementById("plant-info-modal");
const plantEditModal = document.getElementById("plant-edit-modal");
let editingVak = null;
let editingIndex = null;

function openPlantInfo(vak, index) {
    const plant = vakkenData[vak][index];
    if (!plant) return;

    const imgEl = document.getElementById("info-plant-img");
    const nameEl = document.getElementById("info-plant-name");
    const scienceEl = document.getElementById("info-plant-science");
    const infoEl = document.getElementById("info-plant-info");

    if (imgEl) imgEl.src = plant.img || "images/logo-192.png";
    if (nameEl) nameEl.textContent = plant.name;
    if (scienceEl) scienceEl.textContent = plant.science || "—";
    if (infoEl) infoEl.textContent = plant.info || "Geen info";

    editingVak = vak;
    editingIndex = index;

    if (plantInfoModal) plantInfoModal.style.display = "block";
}

const infoClose = document.getElementById("info-close");
if (infoClose) infoClose.onclick = () => {
    if (plantInfoModal) plantInfoModal.style.display = "none";
};

const editPlantBtn = document.getElementById("edit-plant-btn");
if (editPlantBtn) editPlantBtn.onclick = () => {
    const plant = vakkenData[editingVak]?.[editingIndex];
    if (!plant) return;

    const eName = document.getElementById("edit-plant-name");
    const eScience = document.getElementById("edit-plant-science");
    const eInfo = document.getElementById("edit-plant-info");
    const eImg = document.getElementById("edit-plant-img");

    if (eName) eName.value = plant.name || "";
    if (eScience) eScience.value = plant.science || "";
    if (eInfo) eInfo.value = plant.info || "";
    if (eImg) eImg.value = plant.img || "";

    if (plantInfoModal) plantInfoModal.style.display = "none";
    if (plantEditModal) plantEditModal.style.display = "block";
};

const editClose = document.getElementById("edit-close");
if (editClose) editClose.onclick = () => {
    if (plantEditModal) plantEditModal.style.display = "none";
};

const saveEditBtn = document.getElementById("save-edit-plant");
if (saveEditBtn) saveEditBtn.onclick = () => {
    const plant = vakkenData[editingVak]?.[editingIndex];
    if (!plant) return;

    const newName = document.getElementById("edit-plant-name")?.value.trim();
    const newScience = document.getElementById("edit-plant-science")?.value.trim();
    const newInfo = document.getElementById("edit-plant-info")?.value.trim();
    const newImg = document.getElementById("edit-plant-img")?.value.trim() || "images/logo-192.png";

    plant.name = newName || plant.name;
    plant.science = newScience || plant.science;
    plant.info = newInfo || plant.info;
    plant.img = newImg || plant.img;

    if (plantEditModal) plantEditModal.style.display = "none";

    renderGarden();
    saveData();
};

// ==========================
// DRAGGABLE + RESIZABLE
// ==========================
function makeDraggableResizable(el) {
    el.style.position = "absolute";
    el.style.touchAction = "none";

    const handle = document.createElement("div");
    handle.style.width = "15px";
    handle.style.height = "15px";
    handle.style.background = "#2c7a2c";
    handle.style.position = "absolute";
    handle.style.right = "2px";
    handle.style.bottom = "2px";
    handle.style.borderRadius = "3px";
    handle.style.cursor = "se-resize";
    el.appendChild(handle);

    // Drag
    el.addEventListener("touchstart", function (e) {
        if (e.target === handle) return;

        const touch = e.touches[0];
        const rect = el.getBoundingClientRect();
        let shiftX = touch.clientX - rect.left;
        let shiftY = touch.clientY - rect.top;

        function moveAt(touch) {
            el.style.left = touch.clientX - shiftX + "px";
            el.style.top = touch.clientY - shiftY + "px";
        }

        function onTouchMove(e) {
            moveAt(e.touches[0]);
        }

        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", () => {
            document.removeEventListener("touchmove", onTouchMove);
            saveData();
        }, { once: true });
    });

    // Resize
    handle.addEventListener("touchstart", function (e) {
        e.stopPropagation();
        const startX = e.touches[0].clientX;
        const startY = e.touches[0].clientY;
        const startWidth = el.offsetWidth;
        const startHeight = el.offsetHeight;

        function resizeMove(e) {
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            el.style.width = Math.max(100, startWidth + dx) + "px";
            el.style.height = Math.max(100, startHeight + dy) + "px";
        }

        function stopResize() {
            document.removeEventListener("touchmove", resizeMove);
            document.removeEventListener("touchend", stopResize);
            saveData();
        }

        document.addEventListener("touchmove", resizeMove);
        document.addEventListener("touchend", stopResize);
    });
}

// ==========================
// RENDEREN
// ==========================
function renderGarden(savedPositions = {}) {
    const gardenGrid = document.getElementById("garden-grid");
    if (!gardenGrid) return;
    gardenGrid.innerHTML = "";

    Object.keys(vakkenData).forEach(vak => {
        const vakDiv = document.createElement("div");
        vakDiv.className = "vak";

        const title = document.createElement("div");
        title.className = "vak-title";
        title.textContent = vak;
        vakDiv.appendChild(title);

        // planten renderen
        vakkenData[vak].forEach((plant, index) => {
            const div = document.createElement("div");
            div.className = "plant-item";

            const img = document.createElement("img");
            img.src = plant.img;
            img.alt = plant.name;

            const span = document.createElement("span");
            span.textContent = plant.name;

            div.onclick = () => openPlantInfo(vak, index);

            div.appendChild(img);
            div.appendChild(span);
            vakDiv.appendChild(div);
        });

        gardenGrid.appendChild(vakDiv);
        makeDraggableResizable(vakDiv);

        if (savedPositions[vak]) {
            vakDiv.style.left = savedPositions[vak].left;
            vakDiv.style.top = savedPositions[vak].top;
            if (savedPositions[vak].width) vakDiv.style.width = savedPositions[vak].width;
            if (savedPositions[vak].height) vakDiv.style.height = savedPositions[vak].height;
        }
    });
}

// ==========================
// PWA INSTALL
// ==========================
let deferredPrompt = null;
const installBtn = document.getElementById("install-btn");
const installPopup = document.getElementById("install-popup");
const popupInstall = document.getElementById("popup-install");
const popupCancel = document.getElementById("popup-cancel");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove("hidden");
});

if (installBtn) {
    installBtn.onclick = () => {
        if (installPopup) installPopup.classList.remove("hidden");
    };
}
if (popupCancel) {
    popupCancel.onclick = () => {
        if (installPopup) installPopup.classList.add("hidden");
    };
}
if (popupInstall) {
    popupInstall.onclick = async () => {
        if (installPopup) installPopup.classList.add("hidden");
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (installBtn) installBtn.classList.add("hidden");
    };
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    loadPlantsDatabase(); // laad JSON bij opstart

    const positions = loadData();

    if (Object.keys(vakkenData).length === 0) {
        initVakSelect();
    } else {
        const vakSelect = document.getElementById("vak-select-add");
        if (vakSelect) {
            Object.keys(vakkenData).forEach(vak => {
                const option = document.createElement("option");
                option.value = vak;
                option.textContent = vak;
                vakSelect.appendChild(option);
            });
        }
    }

    renderGarden(positions);
});
