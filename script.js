const backendUrl = "https://tuin-backend.onrender.com";

// ==========================
// Planten laden van backend
// ==========================
async function fetchPlants(query = "") {
    try {
        const response = await fetch(`${backendUrl}/plants`);
        if (!response.ok) throw new Error("Backend fout");

        const data = await response.json();
        let plants = data.data || data.plants || [];

        if (!Array.isArray(plants)) {
            console.error("Back-end data is geen lijst:", data);
            return [];
        }

        if (query) {
            plants = plants.filter(p =>
                (p.common_name && p.common_name.toLowerCase().includes(query.toLowerCase())) ||
                (p.scientific_name && p.scientific_name.toLowerCase().includes(query.toLowerCase()))
            );
        }

        return plants;
    } catch (err) {
        console.error("Fout bij het laden van planten:", err);
        return [];
    }
}

// ==========================
// Vakken invullen
// ==========================
function initVakSelect() {
    const vakSelect = document.getElementById("vak-select-add");
    const vakken = ["Voortuin", "Achtertuin", "Serre"];

    vakken.forEach(vak => {
        const option = document.createElement("option");
        option.value = vak;
        option.textContent = vak;
        vakSelect.appendChild(option);
    });
}

// ==========================
// Plantmodal openen
// ==========================
async function openPlantSelectForDropdown() {
    const selectedVak = document.getElementById("vak-select-add").value;
    if (!selectedVak) {
        alert("Kies eerst een vak!");
        return;
    }

    const plantOptionsContainer = document.getElementById("plant-options");
    plantOptionsContainer.innerHTML = "Planten laden...";

    const plants = await fetchPlants();

    plantOptionsContainer.innerHTML = "";

    if (plants.length === 0) {
        plantOptionsContainer.textContent = "Geen planten gevonden.";
        return;
    }

    plants.forEach(p => createPlantOption(p, selectedVak));

    document.getElementById("plant-select-modal").style.display = "block";
}

// ==========================
// Plant optie maken
// ==========================
function createPlantOption(plant, vak) {
    const container = document.getElementById("plant-options");

    const div = document.createElement("div");
    div.className = "plant-option";

    // FIX: juiste URL
    const imgUrl =
        (plant.default_image && plant.default_image.thumbnail) ||
        "images/logo-192.png";

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = plant.common_name || plant.scientific_name;

    img.onclick = () => addPlantToVak(vak, plant);

    const nameDiv = document.createElement("div");
    nameDiv.textContent =
        plant.common_name && plant.common_name.trim() !== ""
            ? plant.common_name
            : plant.scientific_name;
    nameDiv.className = "plant-name";

    div.appendChild(img);
    div.appendChild(nameDiv);
    container.appendChild(div);
}

// ==========================
// Zoeken
// ==========================
document.getElementById("plant-search").addEventListener("input", async e => {
    const query = e.target.value;
    const selectedVak = document.getElementById("vak-select-add").value;
    const container = document.getElementById("plant-options");

    container.innerHTML = "Zoeken...";

    const plants = await fetchPlants(query);

    container.innerHTML = "";

    if (plants.length === 0) {
        container.textContent = "Geen planten gevonden.";
        return;
    }

    plants.forEach(p => createPlantOption(p, selectedVak));
});

// ==========================
// Plant toevoegen aan vak
// ==========================
function addPlantToVak(vak, plant) {
    const gardenGrid = document.getElementById("garden-grid");

    const plantDiv = document.createElement("div");
    plantDiv.className = "vak";

    const imgUrl =
        (plant.default_image && plant.default_image.thumbnail) ||
        "images/logo-192.png";

    const img = document.createElement("img");
    img.src = imgUrl;

    const nameDiv = document.createElement("div");
    nameDiv.className = "vaknaam";
    nameDiv.textContent =
        `${plant.common_name || plant.scientific_name} (${vak})`;

    plantDiv.appendChild(img);
    plantDiv.appendChild(nameDiv);

    gardenGrid.appendChild(plantDiv);

    document.getElementById("plant-select-modal").style.display = "none";
}

// ==========================
// Modal sluiten
// ==========================
document.getElementById("select-close").onclick = () => {
    document.getElementById("plant-select-modal").style.display = "none";
};

// ==========================
// Init
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    initVakSelect();
    document
        .getElementById("open-plant-select")
        .addEventListener("click", openPlantSelectForDropdown);
});
