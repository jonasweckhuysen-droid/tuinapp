// =====================================
// VAKKEN
// =====================================
let vakkenData = {};

function initVakSelect() {
    const vakSelect = document.getElementById("vak-select-add");
    const defaultVakken = ["Voortuin", "Achtertuin", "Serre"];
    defaultVakken.forEach(vak => {
        vakkenData[vak] = [];
        const option = document.createElement("option");
        option.value = vak;
        option.textContent = vak;
        vakSelect.appendChild(option);
    });
}

// Vak toevoegen
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
};

// =====================================
// PLANT POPUP
// =====================================
document.getElementById("open-plant-select").onclick = () => {
    const vak = document.getElementById("vak-select-add").value;
    if (!vak) {
        alert("Kies eerst een vak!");
        return;
    }
    document.getElementById("plant-select-modal").style.display = "block";
};

// Sluiten
document.getElementById("select-close").onclick = () => {
    document.getElementById("plant-select-modal").style.display = "none";
};

// Nieuwe plant toevoegen
document.getElementById("add-new-plant").onclick = () => {
    const vak = document.getElementById("vak-select-add").value;
    const name = document.getElementById("new-plant-name").value.trim();
    const science = document.getElementById("new-plant-science").value.trim();
    const info = document.getElementById("new-plant-info").value.trim();
    const img = document.getElementById("new-plant-img").value.trim();

    if (!name) {
        alert("Naam is verplicht");
        return;
    }

    vakkenData[vak].push({
        name,
        science,
        info,
        img: img || "images/logo-192.png"
    });

    renderGarden();

    document.getElementById("plant-select-modal").style.display = "none";
    document.getElementById("new-plant-name").value = "";
    document.getElementById("new-plant-science").value = "";
    document.getElementById("new-plant-info").value = "";
    document.getElementById("new-plant-img").value = "";
};

// =====================================
// DRAGGABLE
// =====================================
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
    el.addEventListener("touchstart", function(e) {
        if (e.target === handle) return;
        const touch = e.touches[0];
        let shiftX = touch.clientX - el.getBoundingClientRect().left;
        let shiftY = touch.clientY - el.getBoundingClientRect().top;

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
        }, { once: true });
    });

    // Resize
    handle.addEventListener("touchstart", function(e) {
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
        }

        document.addEventListener("touchmove", resizeMove);
        document.addEventListener("touchend", stopResize);
    });
}

// =====================================
// RENDEREN
// =====================================
function renderGarden() {
    const gardenGrid = document.getElementById("garden-grid");
    gardenGrid.innerHTML = "";

    Object.keys(vakkenData).forEach(vak => {
        const vakDiv = document.createElement("div");
        vakDiv.className = "vak";

        const title = document.createElement("div");
        title.className = "vak-title";
        title.textContent = vak;
        vakDiv.appendChild(title);

        vakkenData[vak].forEach(plant => {
            const div = document.createElement("div");
            div.className = "plant-item";

            const img = document.createElement("img");
            img.src = plant.img;
            img.alt = plant.name;

            const span = document.createElement("span");
            span.textContent = plant.name;

            div.appendChild(img);
            div.appendChild(span);
            vakDiv.appendChild(div);
        });

        gardenGrid.appendChild(vakDiv);
        makeDraggableResizable(vakDiv);
    });
}

// =====================================
// PWA INSTALL
// =====================================
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
    const result = await deferredPrompt.userChoice;

    deferredPrompt = null;
    installBtn.classList.add("hidden");
};

// =====================================
document.addEventListener("DOMContentLoaded", () => {
    initVakSelect();
    renderGarden();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
});
