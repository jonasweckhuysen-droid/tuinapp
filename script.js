// ==========================
// Vakken
// ==========================
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

// ==========================
// Plant modal
// ==========================
document.getElementById("open-plant-select").onclick = () => {
    const selectedVak = document.getElementById("vak-select-add").value;
    if (!selectedVak) {
        alert("Kies eerst een vak!");
        return;
    }
    document.getElementById("plant-select-modal").style.display = "block";
};

// Plant toevoegen (zelf)
document.getElementById("add-custom-plant").onclick = () => {
    const name = document.getElementById("custom-plant-name").value.trim();
    const img = document.getElementById("custom-plant-img").value.trim();
    const vak = document.getElementById("vak-select-add").value;
    if (!name || !vak) {
        alert("Vul plantnaam en vak in!");
        return;
    }

    vakkenData[vak].push({ name, img: img || "images/logo-192.png" });
    renderGarden();

    document.getElementById("custom-plant-name").value = "";
    document.getElementById("custom-plant-img").value = "";
    document.getElementById("plant-select-modal").style.display = "none";
};

// Modal sluiten
document.getElementById("select-close").onclick = () => {
    document.getElementById("plant-select-modal").style.display = "none";
};

// ==========================
// Draggable & Resizable functies
// ==========================
function makeDraggable(el) {
    el.style.position = "absolute";
    el.onmousedown = function(event) {
        let shiftX = event.clientX - el.getBoundingClientRect().left;
        let shiftY = event.clientY - el.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            el.style.left = pageX - shiftX + 'px';
            el.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        el.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            el.onmouseup = null;
        };
    };

    el.ondragstart = function() { return false; };
}

// ==========================
// Garden renderen
// ==========================
function renderGarden() {
    const gardenGrid = document.getElementById("garden-grid");
    gardenGrid.innerHTML = "";

    const icons = ["🌸","🍃","☀️","🌼","🌱"];

    Object.keys(vakkenData).forEach(vak => {
        const vakDiv = document.createElement("div");
        vakDiv.className = "vak";
        vakDiv.style.position = "relative"; // nodig voor drag
        vakDiv.style.resize = "both";        // resize
        vakDiv.style.overflow = "auto";
        vakDiv.style.minWidth = "100px";
        vakDiv.style.minHeight = "100px";
        vakDiv.style.border = "2px solid #2c7a2c";
        vakDiv.style.borderRadius = "10px";
        vakDiv.style.padding = "10px";
        vakDiv.style.margin = "10px";
        vakDiv.style.backgroundColor = "#e6f2e6";
        vakDiv.style.cursor = "move";

        const vakTitle = document.createElement("div");
        vakTitle.className = "vak-title";
        vakTitle.textContent = vak;
        vakDiv.appendChild(vakTitle);

        vakkenData[vak].forEach(plant => {
            const plantDiv = document.createElement("div");
            plantDiv.className = "plant-item";
            plantDiv.style.position = "relative";
            plantDiv.style.resize = "both";
            plantDiv.style.overflow = "auto";
            plantDiv.style.minWidth = "50px";
            plantDiv.style.minHeight = "50px";
            plantDiv.style.border = "1px dashed #2c7a2c";
            plantDiv.style.margin = "5px";
            plantDiv.style.padding = "5px";
            plantDiv.style.cursor = "move";

            const img = document.createElement("img");
            img.src = plant.img;
            img.alt = plant.name;
            img.style.width = "50px";
            img.style.height = "50px";

            const nameSpan = document.createElement("span");
            const icon = icons[Math.floor(Math.random() * icons.length)];
            nameSpan.textContent = `${icon} ${plant.name}`;

            plantDiv.appendChild(img);
            plantDiv.appendChild(nameSpan);
            vakDiv.appendChild(plantDiv);

            // Maak plant-items ook draggable
            makeDraggable(plantDiv);
        });

        gardenGrid.appendChild(vakDiv);

        // Maak vakken draggable
        makeDraggable(vakDiv);
    });
}

// ==========================
// Init
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    initVakSelect();
    renderGarden();
});
