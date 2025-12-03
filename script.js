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
    const defaultVakken = ["Voortuin", "Achtertuin", "Serre"];

    defaultVakken.forEach(vak => {
        if (!vakkenData[vak]) vakkenData[vak] = [];
        const option = document.createElement("option");
        option.value = vak;
        option.textContent = vak;
        vakSelect.appendChild(option);
    });
}

document.getElementById("add-vak-btn").onclick = () => {
    const input = document.getElementById("vak-naam-input");
    const vakNaam = input.value.trim();
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

// ==========================
// PLANTS.JSON LADEN + SELECT
// ==========================
let plantsDatabase = [];

async function loadPlantsDatabase() {
    try {
        const response = await fetch("plants.json");
        if (!response.ok) throw new Error("Kan plants.json niet laden");
        plantsDatabase = await response.json();
        populatePlantSelect();
    } catch (err) {
        console.error(err);
    }
}
plants.sort((a, b) => a.name.localeCompare(b.name, 'nl'));

function populatePlantSelect() {
    const plantList = document.getElementById("plant-select-list");
    if (!plantList) return;

    plantList.innerHTML = "";
    plantsDatabase.forEach((plant, index) => {
        const li = document.createElement("li");
        li.className = "plant-select-item";
        li.innerHTML = `<img src="${plant.image}" alt="${plant.name}" width="30" style="margin-right:5px;"> ${plant.name}`;
        li.onclick = () => addPlantToVak(index);
        plantList.appendChild(li);
    });
}

function addPlantToVak(index) {
    const vak = document.getElementById("vak-select-add").value;
    if (!vak) return alert("Kies eerst een vak!");
    const plant = plantsDatabase[index];

    vakkenData[vak].push({
        name: plant.name,
        science: plant.latin || "",
        info: plant.description || "",
        img: plant.image || "images/logo-192.png"
    });

    renderGarden();
    saveData();

    document.getElementById("plant-select-modal").style.display = "none";
}

// ==========================
// PLANT POPUP + NIEUWE PLANT
// ==========================
document.getElementById("open-plant-select").onclick = () => {
    const vak = document.getElementById("vak-select-add").value;
    if (!vak) return alert("Kies eerst een vak!");
    document.getElementById("plant-select-modal").style.display = "block";
};

document.getElementById("select-close").onclick = () => {
    document.getElementById("plant-select-modal").style.display = "none";
};

document.getElementById("add-new-plant").onclick = () => {
    const vak = document.getElementById("vak-select-add").value;
    const name = document.getElementById("new-plant-name").value.trim();
    const science = document.getElementById("new-plant-science").value.trim();
    const info = document.getElementById("new-plant-info").value.trim();
    const img = document.getElementById("new-plant-img").value.trim();

    if (!vak) return alert("Kies eerst een vak!");
    if (!name) return alert("Naam is verplicht");

    vakkenData[vak].push({
        name,
        science,
        info,
        img: img || "images/logo-192.png"
    });

    document.getElementById("plant-select-modal").style.display = "none";
    document.getElementById("new-plant-name").value = "";
    document.getElementById("new-plant-science").value = "";
    document.getElementById("new-plant-info").value = "";
    document.getElementById("new-plant-img").value = "";

    renderGarden();
    saveData();
};

// ==========================
// PLANT DETAIL POPUP + EDIT
// ==========================
const plantInfoModal = document.getElementById("plant-info-modal");
const plantEditModal = document.getElementById("plant-edit-modal");
let editingVak = null;
let editingIndex = null;

function openPlantInfo(vak, index) {
    const plant = vakkenData[vak][index];

    document.getElementById("info-plant-img").src = plant.img;
    document.getElementById("info-plant-name").textContent = plant.name;
    document.getElementById("info-plant-science").textContent = plant.science || "—";
    document.getElementById("info-plant-info").textContent = plant.info || "Geen info";

    editingVak = vak;
    editingIndex = index;

    plantInfoModal.style.display = "block";
}

document.getElementById("info-close").onclick = () => {
    plantInfoModal.style.display = "none";
};

document.getElementById("edit-plant-btn").onclick = () => {
    const plant = vakkenData[editingVak][editingIndex];

    document.getElementById("edit-plant-name").value = plant.name;
    document.getElementById("edit-plant-science").value = plant.science;
    document.getElementById("edit-plant-info").value = plant.info;
    document.getElementById("edit-plant-img").value = plant.img;

    plantInfoModal.style.display = "none";
    plantEditModal.style.display = "block";
};

document.getElementById("edit-close").onclick = () => {
    plantEditModal.style.display = "none";
};

document.getElementById("save-edit-plant").onclick = () => {
    const plant = vakkenData[editingVak][editingIndex];

    plant.name = document.getElementById("edit-plant-name").value.trim();
    plant.science = document.getElementById("edit-plant-science").value.trim();
    plant.info = document.getElementById("edit-plant-info").value.trim();
    plant.img = document.getElementById("edit-plant-img").value.trim() || "images/logo-192.png";

    plantEditModal.style.display = "none";

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
    installBtn.classList.remove("hidden");
});

installBtn.onclick = () => {
    installPopup.classList.remove("hidden");
};

popupCancel.onclick = () => {
    installPopup.classList.add("hidden");
};

popupInstall.onclick = async () => {
    installPopup.classList.add("hidden");
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add("hidden");
};

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
        Object.keys(vakkenData).forEach(vak => {
            const option = document.createElement("option");
            option.value = vak;
            option.textContent = vak;
            vakSelect.appendChild(option);
        });
    }

    renderGarden(positions);
});
