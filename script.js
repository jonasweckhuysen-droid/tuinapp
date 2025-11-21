const backendUrl = "https://tuin-backend.onrender.com";

// ===== Fetch planten via backend =====
async function fetchPlants(query = "") {
    try {
        const response = await fetch(`${backendUrl}/plants`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        let plants = data.data || [];

        if (query) {
            plants = plants.filter(p =>
                (p.common_name && p.common_name.toLowerCase().includes(query.toLowerCase())) ||
                (p.scientific_name && p.scientific_name.toLowerCase().includes(query.toLowerCase()))
            );
        }

        return plants;
    } catch (err) {
        console.error("Fout bij backend fetch:", err);
        return [];
    }
}

// ===== Init vak select =====
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

// ===== Open plant select modal =====
async function openPlantSelectForDropdown() {
    const vakSelect = document.getElementById("vak-select-add");
    const selectedVak = vakSelect.value;
    if (!selectedVak) {
        alert("Kies eerst een vak!");
        return;
    }

    const plantOptionsContainer = document.getElementById("plant-options");
    plantOptionsContainer.innerHTML = "";

    const plants = await fetchPlants();
    if (plants.length === 0) {
        plantOptionsContainer.textContent = "Geen planten gevonden.";
        return;
    }

    plants.forEach(p => {
        const div = document.createElement("div");
        div.className = "plant-option";

        // Voeg afbeelding toe indien beschikbaar
        const img = document.createElement("img");
        img.src = p.image_url || "images/logo-192.png";
        img.alt = p.common_name || p.scientific_name;

        // Klik event: plant toevoegen
        img.onclick = () => addPlantToVak(selectedVak, p);

        // Voeg naam onder de afbeelding toe
        const nameDiv = document.createElement("div");
        nameDiv.textContent = p.common_name || p.scientific_name;
        nameDiv.style.textAlign = "center";
        nameDiv.style.fontSize = "12px";
        nameDiv.style.marginTop = "4px";

        div.appendChild(img);
        div.appendChild(nameDiv);
        plantOptionsContainer.appendChild(div);
    });

    document.getElementById("plant-select-modal").style.display = "block";
}

// ===== Plant search =====
document.getElementById("plant-search").addEventListener("input", async (e) => {
    const query = e.target.value;
    const plantOptionsContainer = document.getElementById("plant-options");
    plantOptionsContainer.innerHTML = "";

    const plants = await fetchPlants(query);
    if (plants.length === 0) {
        plantOptionsContainer.textContent = "Geen planten gevonden.";
        return;
    }

    plants.forEach(p => {
        const div = document.createElement("div");
        div.className = "plant-option";

        const img = document.createElement("img");
        img.src = p.image_url || "images/logo-192.png";
        img.alt = p.common_name || p.scientific_name;
        img.onclick = () => addPlantToVak(document.getElementById("vak-select-add").value, p);

        const nameDiv = document.createElement("div");
        nameDiv.textContent = p.common_name || p.scientific_name;
        nameDiv.style.textAlign = "center";
        nameDiv.style.fontSize = "12px";
        nameDiv.style.marginTop = "4px";

        div.appendChild(img);
        div.appendChild(nameDiv);
        plantOptionsContainer.appendChild(div);
    });
});

// ===== Plant toevoegen aan vak =====
function addPlantToVak(vak, plant) {
    const gardenGrid = document.getElementById("garden-grid");

    const plantDiv = document.createElement("div");
    plantDiv.className = "vak";

    // Voeg plantnaam toe
    const nameDiv = document.createElement("div");
    nameDiv.className = "vaknaam";
    nameDiv.textContent = `${plant.common_name || plant.scientific_name} (${vak})`;

    // Voeg afbeelding toe
    const img = document.createElement("img");
    img.src = plant.image_url || "images/logo-192.png";
    img.alt = plant.common_name || plant.scientific_name;

    plantDiv.appendChild(img);
    plantDiv.appendChild(nameDiv);
    gardenGrid.appendChild(plantDiv);

    // Sluit modal
    document.getElementById("plant-select-modal").style.display = "none";
}

// ===== Close modal =====
document.getElementById("select-close").onclick = () => {
    document.getElementById("plant-select-modal").style.display = "none";
};

// ===== Init alles =====
document.addEventListener("DOMContentLoaded", () => {
    initVakSelect();
});
