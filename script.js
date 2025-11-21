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
const savedNames = JSON.parse(localStorage.getItem("vakNames")) || {};

// ==================== Modals sluiten ====================
modalClose.onclick = () => plantModal.style.display = "none";
selectClose.onclick = () => selectModal.style.display = "none";
window.onclick = (event) => { 
  if(event.target == plantModal) plantModal.style.display = "none"; 
  if(event.target == selectModal) selectModal.style.display = "none"; 
}

// ==================== Fetch Trefle Planten ====================
// Functie om planten op te halen via je eigen backend
async function fetchPlants(page = 1) {
    const backendUrl = `https://tuin-backend.onrender.com/plants?page=${page}`;

    try {
        const response = await fetch(backendUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Trefle data via backend:", data);
        return data;
    } catch (err) {
        console.error("Fout bij backend fetch:", err);
        return [];
    }
}

// Init functie om de app te starten
async function init() {
    const plantsData = await fetchPlants();
    
    // Hier voeg je code toe om planten in je UI te tonen
    const plantOptions = document.getElementById("plant-options");
    if (plantsData.data) {
        plantsData.data.forEach(plant => {
            const div = document.createElement("div");
            div.className = "plant-option";
            div.textContent = plant.common_name || plant.scientific_name;
            plantOptions.appendChild(div);
        });
    }
}

// Start de app
document.addEventListener("DOMContentLoaded", init);

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
        vak.planten = [];

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
                populateVakDropdowns();
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
            currentVak.planten.push({id: plant.id, imageURL: plant.image});

            const plantImg = document.createElement("img");
            plantImg.src = plant.image;
            plantImg.dataset.plantId = plant.id;
            makeDraggable(plantImg, plant.id);

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

// ==================== Dropdown functies ====================
function populateVakDropdowns() {
    const selectIds = ["vak-select-add", "vak-select-rename", "vak-select-info"];
    selectIds.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = `<option value="" disabled selected>Kies vak</option>`;
        for(let i=1; i<=vakkenAantal; i++){
            const vak = gardenGrid.children[i-1];
            const option = document.createElement("option");
            option.value = i-1;
            option.textContent = vak.querySelector(".vaknaam").textContent;
            select.appendChild(option);
        }
    });
}

function openPlantSelectForDropdown() {
    const select = document.getElementById("vak-select-add");
    const vakIndex = select.value;
    if(vakIndex === "") return alert("Kies eerst een vak!");
    currentVak = gardenGrid.children[vakIndex];
    openPlantSelect();
    selectModal.style.display = "block";
}

function renameVakForDropdown() {
    const select = document.getElementById("vak-select-rename");
    const vakIndex = select.value;
    if(vakIndex === "") return alert("Kies eerst een vak!");
    const vak = gardenGrid.children[vakIndex];
    const vaknaam = vak.querySelector(".vaknaam");
    const newName = prompt("Nieuwe naam voor dit vak:", vaknaam.textContent);
    if(newName) {
        vaknaam.textContent = newName;
        savedNames[`vak${parseInt(vakIndex)+1}`] = newName;
        localStorage.setItem("vakNames", JSON.stringify(savedNames));
        populateVakDropdowns();
    }
}

function showPlantenInfoForDropdown() {
    const select = document.getElementById("vak-select-info");
    const vakIndex = select.value;
    if(vakIndex === "") return alert("Kies eerst een vak!");
    const vak = gardenGrid.children[vakIndex];
    if(!vak.planten || vak.planten.length === 0) return alert("Geen planten in dit vak.");

    let infoText = "Planten in dit vak:\n";
    vak.planten.forEach((p, idx) => {
        const plant = plantsData.find(pl => pl.id == p.id);
        infoText += `${idx+1}. ${plant ? plant.name : "Onbekende plant"}\n`;
    });
    alert(infoText);
}

function scrollToTuin() {
    gardenGrid.scrollIntoView({behavior: "smooth"});
}

function showSettingsForMenu() {
    alert("Instellingen functie kan hier later uitgebreid worden.");
}

// ==================== Init ====================
async function init() {
    await fetchPlants();
    buildGardenGrid();
    populateVakDropdowns();
}

init();
