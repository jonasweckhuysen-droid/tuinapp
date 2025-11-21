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

// ==================== Drag & Drop ====================
let draggedPlant = null;

function makeDraggable(img, plantId) {
    img.draggable = true;
    img.dataset.plantId = plantId;
    img.addEventListener("dragstart", (e) => {
        draggedPlant = e.target;
    });
}

function addDragDrop(vak) {
    vak.addEventListener("dragover", (e) => e.preventDefault());
    vak.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedPlant) return;

        const sourceVak = draggedPlant.parentElement;

        // Voeg plant toe in nieuwe vak
        vak.appendChild(draggedPlant);
        if(!vak.planten) vak.planten = [];
        vak.planten.push({id: draggedPlant.dataset.plantId, imageURL: draggedPlant.src});

        // Verwijder uit oude vak
        if(sourceVak && sourceVak.planten) {
            sourceVak.planten = sourceVak.planten.filter(p => p.imageURL !== draggedPlant.src);
        }

        draggedPlant = null;
    });
}

// ==================== Vak grid opbouwen ====================
function buildGardenGrid() {
    for (let i = 1; i <= vakkenAantal; i++) {
        const vak = document.createElement("div");
        vak.classList.add("vak");
        vak.planten = []; // array voor meerdere planten

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

        vak.addEventListener("click", () => {
            currentVak = vak;
            openPlantSelect();
            selectModal.style.display = "block";
        });

        addDragDrop(vak);
        gardenGrid.appendChild(vak);
    }
}

// ==================== Plant selectiemodal ====================
function openPlantSelect() {
    if(!currentVak) return;
    plantOptionsDiv.innerHTML = "";
    plantsData.forEach(plant => {
        const img = document.createElement("img");
        img.src = plant.image;
        img.title = plant.name;
        makeDraggable(img, plant.id);

        img.onclick = () => {
            // Voeg plant toe aan vak array
            currentVak.planten.push({id: plant.id, imageURL: plant.image});

            // Maak afbeelding in vak
            const plantImg = document.createElement("img");
            plantImg.src = plant.image;
            plantImg.dataset.plantId = plant.id;

            makeDraggable(plantImg, plant.id);

            // Klik op plant afbeelding voor info modal
            plantImg.addEventListener("click", async (e) => {
                e.stopPropagation();
                const details = await fetchPlantDetails(plant.id);
                plantName.textContent = plant.name;
                plantScientific.textContent = plant.scientificName;
                plantFertilization.textContent = details.fertilization;
                plantMaintenance.textContent = details.maintenance;
                plantLight.textContent = details.light;
                plantWater.textContent = details.water;
                plantImage.src = plant.image;
                plantModal.style.display = "block";
            });

            currentVak.appendChild(plantImg);
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
// ==================================================
// Menu functies
// ==================================================

// Planten toevoegen vanuit menu
function openPlantSelectForMenu() {
    // Vraag gebruiker eerst om vak te kiezen
    const vakIndex = prompt(`Selecteer vaknummer (1-${vakkenAantal}) om een plant toe te voegen:`);
    const vak = gardenGrid.children[vakIndex-1];
    if(!vak) return alert("Ongeldig vaknummer.");
    currentVak = vak;
    openPlantSelect();
    selectModal.style.display = "block";
}

// Vaknaam aanpassen vanuit menu
function renameVakForMenu() {
    const vakIndex = prompt(`Selecteer vaknummer (1-${vakkenAantal}) om naam aan te passen:`);
    const vak = gardenGrid.children[vakIndex-1];
    if(!vak) return alert("Ongeldig vaknummer.");

    const vaknaam = vak.querySelector(".vaknaam");
    const newName = prompt("Nieuwe naam voor dit vak:", vaknaam.textContent);
    if(newName) {
        vaknaam.textContent = newName;
        savedNames[`vak${vakIndex}`] = newName;
        localStorage.setItem("vakNames", JSON.stringify(savedNames));
    }
}

// Scroll naar tuin-grid (Tuin overzicht)
function scrollToTuin() {
    gardenGrid.scrollIntoView({behavior: "smooth"});
}

// Planten info vanuit menu
function showPlantenInfoForMenu() {
    const vakIndex = prompt(`Selecteer vaknummer (1-${vakkenAantal}) om planten info te bekijken:`);
    const vak = gardenGrid.children[vakIndex-1];
    if(!vak) return alert("Ongeldig vaknummer.");
    if(!vak.planten || vak.planten.length === 0) return alert("Geen planten in dit vak.");

    let infoText = "Planten in dit vak:\n";
    vak.planten.forEach((p, idx) => {
        const plant = plantsData.find(pl => pl.id == p.id);
        infoText += `${idx+1}. ${plant ? plant.name : "Onbekende plant"}\n`;
    });
    alert(infoText);
}

// Instellingen placeholder
function showSettingsForMenu() {
    alert("Instellingen functie kan hier later uitgebreid worden.");
}

// Start de app
init();
