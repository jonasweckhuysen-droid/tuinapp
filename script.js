// ==================== Config ====================
const TREFLE_TOKEN = "usr-46Bb6d5A0nMov4n2jw-C8mTAKvtpetDHMwDXlDEr2aA";
const vakkenAantal = 8;
const gardenGrid = document.getElementById('garden-grid');

// ==================== Modals ====================
const plantModal = document.getElementById("plant-modal");
const modalClose = document.getElementsByClassName("close")[0];
const plantName = document.getElementById("plant-name");
const plantScientific = document.getElementById("plant-scientific");
const plantFertilization = document.getElementById("plant-fertilization");
const plantMaintenance = document.getElementById("plant-maintenance");
const plantLight = document.getElementById("plant-light");
const plantWater = document.getElementById("plant-water");
const plantImage = document.getElementById("plant-image");

// Plant selectiemodal
const selectModal = document.getElementById("plant-select-modal");
const selectClose = document.getElementById("select-close");
const plantOptionsDiv = document.getElementById("plant-options");

// ==================== Data ====================
let plantsData = [];
let currentVak = null;

// ==================== Local Storage voor vaknamen ====================
const savedNames = JSON.parse(localStorage.getItem("vakNames")) || {};

// ==================== Modals sluiten ====================
modalClose.onclick = () => plantModal.style.display = "none";
selectClose.onclick = () => selectModal.style.display = "none";

window.onclick = (event) => { 
  if(event.target == plantModal) plantModal.style.display = "none"; 
  if(event.target == selectModal) selectModal.style.display = "none"; 
}

// ==================== Fetch Trefle Planten ====================
async function fetchPlants() {
    try {
        const response = await fetch(`https://trefle.io/api/v1/plants?token=${TREFLE_TOKEN}&page=1`);
        const data = await response.json();
        plantsData = data.data.map(plant => ({
            id: plant.id,
            name: plant.common_name || plant.scientific_name,
            scientificName: plant.scientific_name,
            image: plant.image_url || "images/default.png"
        }));
        console.log("Planten geladen:", plantsData);
    } catch(err) {
        console.error("Fout bij Trefle API:", err);
    }
}

// ==================== Fetch Trefle Plant Details ====================
async function fetchPlantDetails(plantId) {
    try {
        const response = await fetch(`https://trefle.io/api/v1/plants/${plantId}?token=${TREFLE_TOKEN}`);
        const data = await response.json();
        const plant = data.data;

        return {
            fertilization: plant.specifications?.fertility || "Geen info",
            maintenance: plant.growth?.growth_form || "Geen info",
            light: plant.growth?.light || "Geen info",
            water: plant.specifications?.water_use || "Geen info"
        };
    } catch(err) {
        console.error("Fout bij Trefle plant details:", err);
        return {
            fertilization: "Geen info",
            maintenance: "Geen info",
            light: "Geen info",
            water: "Geen info"
        };
    }
}

// ==================== Vak grid opbouwen ====================
function buildGardenGrid() {
    for (let i = 1; i <= vakkenAantal; i++) {
        const vak = document.createElement("div");
        vak.classList.add("vak");
        vak.dataset.plantId = null;

        const vaknaam = document.createElement("span");
        vaknaam.classList.add("vaknaam");
        vaknaam.textContent = savedNames[`vak${i}`] || `Vak ${i}`;
        vaknaam.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt("Nieuwe naam voor dit vak:", vaknaam.textContent);
            if(newName) {
                vaknaam.textContent = newName;
                savedNames[`vak${i}`] = newName;
                localStorage.setItem("vakNames", JSON.stringify(savedNames));
            }
        }
        vak.appendChild(vaknaam);

        vak.addEventListener("click", async () => {
            if (!vak.dataset.plantId) {
                currentVak = vak;
                openPlantSelect();
                selectModal.style.display = "block";
            } else {
                const plantId = vak.dataset.plantId;
                const plant = plantsData.find(p => p.id == plantId);
                if(!plant) return;

                const details = await fetchPlantDetails(plantId);

                plantName.textContent = plant.name;
                plantScientific.textContent = plant.scientificName;
                plantFertilization.textContent = details.fertilization;
                plantMaintenance.textContent = details.maintenance;
                plantLight.textContent = details.light;
                plantWater.textContent = details.water;
                plantImage.src = plant.image;

                plantModal.style.display = "block";
            }
        });

        gardenGrid.appendChild(vak);
    }
}

// ==================== Plant selectiemodal ====================
function openPlantSelect() {
    plantOptionsDiv.innerHTML = "";
    plantsData.forEach(plant => {
        const img = document.createElement("img");
        img.src = plant.image;
        img.title = plant.name;
        img.onclick = () => {
            currentVak.dataset.plantId = plant.id;
            const existingImg = currentVak.querySelector("img");
            if(existingImg) existingImg.src = plant.image;
            else currentVak.appendChild(img.cloneNode(true));
            selectModal.style.display = "none";
        };
        plantOptionsDiv.appendChild(img);
    });
}

// ==================== Init ====================
async function init() {
    await fetchPlants();
    buildGardenGrid();
}

// Start de app
init();
// ==================== Drag & Drop ====================

let draggedPlant = null;

// Voeg event listeners toe in buildGardenGrid()
function addDragDrop(vak) {
    // Maak vak dropbaar
    vak.addEventListener("dragover", (e) => e.preventDefault());

    vak.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedPlant) return;

        const sourceVak = draggedPlant.parentElement;

        // Verplaats de plant
        const existingImg = vak.querySelector("img");
        if(existingImg) existingImg.remove();

        vak.appendChild(draggedPlant);
        vak.dataset.plantId = draggedPlant.dataset.plantId;
        
        // Reset source vak
        sourceVak.dataset.plantId = null;
        draggedPlant = null;
    });
}

// Voeg draggable toe aan elke plantafbeelding bij select
function makeDraggable(img, plantId) {
    img.draggable = true;
    img.dataset.plantId = plantId;

    img.addEventListener("dragstart", (e) => {
        draggedPlant = e.target;
    });
}

// Pas openPlantSelect aan
function openPlantSelect() {
    plantOptionsDiv.innerHTML = "";
    plantsData.forEach(plant => {
        const img = document.createElement("img");
        img.src = plant.image;
        img.title = plant.name;
        makeDraggable(img, plant.id);

        img.onclick = () => {
            currentVak.dataset.plantId = plant.id;
            const existingImg = currentVak.querySelector("img");
            if(existingImg) existingImg.src = plant.image;
            else currentVak.appendChild(img.cloneNode(true));

            // Maak geplaatste plant draggable
            const addedImg = currentVak.querySelector("img");
            makeDraggable(addedImg, plant.id);

            selectModal.style.display = "none";
        };
        plantOptionsDiv.appendChild(img);
    });
}

// Roep addDragDrop aan in buildGardenGrid
function buildGardenGrid() {
    for (let i = 1; i <= vakkenAantal; i++) {
        const vak = document.createElement("div");
        vak.classList.add("vak");
        vak.dataset.plantId = null;

        const vaknaam = document.createElement("span");
        vaknaam.classList.add("vaknaam");
        vaknaam.textContent = savedNames[`vak${i}`] || `Vak ${i}`;
        vaknaam.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt("Nieuwe naam voor dit vak:", vaknaam.textContent);
            if(newName) {
                vaknaam.textContent = newName;
                savedNames[`vak${i}`] = newName;
                localStorage.setItem("vakNames", JSON.stringify(savedNames));
            }
        }
        vak.appendChild(vaknaam);

        vak.addEventListener("click", async () => {
            if (!vak.dataset.plantId) {
                currentVak = vak;
                openPlantSelect();
                selectModal.style.display = "block";
            } else {
                const plantId = vak.dataset.plantId;
                const plant = plantsData.find(p => p.id == plantId);
                if(!plant) return;

                const details = await fetchPlantDetails(plantId);

                plantName.textContent = plant.name;
                plantScientific.textContent = plant.scientificName;
                plantFertilization.textContent = details.fertilization;
                plantMaintenance.textContent = details.maintenance;
                plantLight.textContent = details.light;
                plantWater.textContent = details.water;
                plantImage.src = plant.image;

                plantModal.style.display = "block";
            }
        });

        addDragDrop(vak);

        gardenGrid.appendChild(vak);
    }
}
