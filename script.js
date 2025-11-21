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
// Garden renderen
// ==========================
function renderGarden() {
    const gardenGrid = document.getElementById("garden-grid");
    gardenGrid.innerHTML = "";

    const icons = ["🌸","🍃","☀️","🌼","🌱"];

    Object.keys(vakkenData).forEach(vak => {
        const vakDiv = document.createElement("div");
        vakDiv.className = "vak";

        const vakTitle = document.createElement("div");
        vakTitle.className = "vak-title";
        vakTitle.textContent = vak;
        vakDiv.appendChild(vakTitle);

        vakkenData[vak].forEach(plant => {
            const plantDiv = document.createElement("div");
            plantDiv.className = "plant-item";

            const img = document.createElement("img");
            img.src = plant.img;
            img.alt = plant.name;

            const nameSpan = document.createElement("span");
            // Kies een random icoontje
            const icon = icons[Math.floor(Math.random() * icons.length)];
            nameSpan.textContent = `${icon} ${plant.name}`;

            plantDiv.appendChild(img);
            plantDiv.appendChild(nameSpan);
            vakDiv.appendChild(plantDiv);
        });

        gardenGrid.appendChild(vakDiv);
    });
}

// ==========================
// Init
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    initVakSelect();
    renderGarden();
});
