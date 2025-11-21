const vakkenAantal = 8;
const gardenGrid = document.getElementById('garden-grid');
let plantsData = [
  {
    "id": 1,
    "name": "Tomaat",
    "scientificName": "Solanum lycopersicum",
    "fertilization": "Om de 2 weken meststof voor groenten",
    "maintenance": "Snoeien van zijtakken, regelmatig water geven",
    "image": "images/tomaat.png"
  },
  {
    "id": 2,
    "name": "Basilicum",
    "scientificName": "Ocimum basilicum",
    "fertilization": "1x per maand met universele meststof",
    "maintenance": "Bladeren regelmatig plukken om groei te stimuleren",
    "image": "images/basilicum.png"
  }
];

// Modal
const modal = document.getElementById("plant-modal");
const spanClose = document.getElementsByClassName("close")[0];
const plantName = document.getElementById("plant-name");
const plantScientific = document.getElementById("plant-scientific");
const plantFertilization = document.getElementById("plant-fertilization");
const plantMaintenance = document.getElementById("plant-maintenance");
const plantImage = document.getElementById("plant-image");

spanClose.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if(event.target == modal) modal.style.display = "none"; }

const savedNames = JSON.parse(localStorage.getItem("vakNames")) || {};

// Vak grid opbouwen
for (let i = 1; i <= vakkenAantal; i++) {
  const vak = document.createElement("div");
  vak.classList.add("vak");
  vak.dataset.plantId = null;

  // Vaknaam
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

  const selectModal = document.getElementById("plant-select-modal");
const selectClose = document.getElementById("select-close");
const plantOptionsDiv = document.getElementById("plant-options");

let currentVak = null; // Het vak dat we willen vullen

// Sluit plant selectiemodal
selectClose.onclick = () => selectModal.style.display = "none";
window.onclick = (event) => { 
  if(event.target == selectModal) selectModal.style.display = "none"; 
}

// Plant selectiemodal vullen
function openPlantSelect(vak) {
  currentVak = vak;
  plantOptionsDiv.innerHTML = "";
  plantsData.forEach(plant => {
    const img = document.createElement("img");
    img.src = plant.image;
    img.title = plant.name;
    img.onclick = () => {
      currentVak.dataset.plantId = plant.id;
      // Voeg afbeelding toe in vak
      const existingImg = currentVak.querySelector("img");
      if(existingImg) existingImg.src = plant.image;
      else currentVak.appendChild(img.cloneNode(true));
      selectModal.style.display = "none";
    };
    plantOptionsDiv.appendChild(img);
  });
}

// Vak click listener aanpassen
document.querySelectorAll(".vak").forEach(vak => {
  vak.addEventListener("click", () => {
    if (!vak.dataset.plantId) {
      openPlantSelect(vak); // Open visuele plant selector
      selectModal.style.display = "block";
    } else {
      const plant = plantsData.find(p => p.id == vak.dataset.plantId);
      plantName.textContent = plant.name;
      plantScientific.textContent = plant.scientificName;
      plantFertilization.textContent = plant.fertilization;
      plantMaintenance.textContent = plant.maintenance;
      plantImage.src = plant.image;
      modal.style.display = "block";
    }
  });
});


  gardenGrid.appendChild(vak);
}
