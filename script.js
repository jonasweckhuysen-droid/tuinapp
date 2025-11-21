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

  vak.addEventListener("click", () => {
    if (!vak.dataset.plantId) {
      const plantOptions = plantsData.map(p => `${p.id}: ${p.name}`).join("\n");
      const choice = prompt(`Kies een plant:\n${plantOptions}`);
      const plant = plantsData.find(p => p.id == choice);
      if (plant) {
        vak.dataset.plantId = plant.id;
        // Afbeelding toevoegen
        const img = document.createElement("img");
        img.src = plant.image;
        vak.appendChild(img);
      }
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

  gardenGrid.appendChild(vak);
}
