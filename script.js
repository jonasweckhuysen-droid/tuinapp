// Voorbeeld: 8 vakken
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

// Modal elementen
const modal = document.getElementById("plant-modal");
const spanClose = document.getElementsByClassName("close")[0];
const plantName = document.getElementById("plant-name");
const plantScientific = document.getElementById("plant-scientific");
const plantFertilization = document.getElementById("plant-fertilization");
const plantMaintenance = document.getElementById("plant-maintenance");
const plantImage = document.getElementById("plant-image");

// Sluit modal
spanClose.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Vak grid opbouwen
for (let i = 1; i <= vakkenAantal; i++) {
  const vak = document.createElement("div");
  vak.classList.add("vak");
  vak.textContent = `Vak ${i}`;
  vak.dataset.plantId = null;

  vak.addEventListener("click", () => {
    if (!vak.dataset.plantId) {
      // Planten kiezen
      const plantOptions = plantsData.map(p => `${p.id}: ${p.name}`).join("\n");
      const choice = prompt(`Kies een plant:\n${plantOptions}`);
      const plant = plantsData.find(p => p.id == choice);
      if (plant) {
        vak.dataset.plantId = plant.id;
        vak.textContent = plant.name;
      }
    } else {
      // Plant info tonen
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
