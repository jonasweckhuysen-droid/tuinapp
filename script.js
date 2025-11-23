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
// Draggable & Resizable voor mobiel
// ==========================
function makeDraggableResizable(el) {
    el.style.position = "absolute";
    el.style.touchAction = "none"; // nodig voor touch events

    // Voeg een klein resize-handvat toe
    const handle = document.createElement("div");
    handle.style.width = "15px";
    handle.style.height = "15px";
    handle.style.background = "#2c7a2c";
    handle.style.position = "absolute";
    handle.style.right = "2px";
    handle.style.bottom = "2px";
    handle.style.cursor = "se-resize";
    handle.style.borderRadius = "3px";
    el.appendChild(handle);

    // Slepen
    el.addEventListener("touchstart", function(e) {
        if (e.target === handle) return; // niet slepen als resize
        let touch = e.touches[0];
        let shiftX = touch.clientX - el.getBoundingClientRect().left;
        let shiftY = touch.clientY - el.getBoundingClientRect().top;

        function moveAt(touch) {
            el.style.left = touch.clientX - shiftX + "px";
            el.style.top = touch.clientY - shiftY + "px";
        }

        function onTouchMove(e) {
            moveAt(e.touches[0]);
        }

        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", function() {
            document.removeEventListener("touchmove", onTouchMove);
        }, { once: true });
    });

    // Resize
    handle.addEventListener("touchstart", function(e) {
        e.stopPropagation();
        let startX = e.touches[0].clientX;
        let startY = e.touches[0].clientY;
        let startWidth = el.offsetWidth;
        let startHeight = el.offsetHeight;

        function resizeMove(e) {
            let dx = e.touches[0].clientX - startX;
            let dy = e.touches[0].clientY - startY;
            el.style.width = Math.max(100, startWidth + dx) + "px";
            el.style.height = Math.max(100, startHeight + dy) + "px";
        }

        function stopResize() {
            document.removeEventListener("touchmove", resizeMove);
            document.removeEventListener("touchend", stopResize);
        }

        document.addEventListener("touchmove", resizeMove);
        document.addEventListener("touchend", stopResize);
    });
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

        vakDiv.style.minWidth = "100px";
        vakDiv.style.minHeight = "100px";
        vakDiv.style.border = "2px solid #2c7a2c";
        vakDiv.style.borderRadius = "10px";
        vakDiv.style.padding = "10px";
        vakDiv.style.margin = "10px";
        vakDiv.style.backgroundColor = "#e6f2e6";

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
            const icon = icons[Math.floor(Math.random() * icons.length)];  
            nameSpan.textContent = `${icon} ${plant.name}`;  

            plantDiv.appendChild(img);  
            plantDiv.appendChild(nameSpan);  
            vakDiv.appendChild(plantDiv);  
        });  

        gardenGrid.appendChild(vakDiv);  

        // Maak vak versleepbaar en resizebaar
        makeDraggableResizable(vakDiv);
    });
}

// ==========================
// Init
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    initVakSelect();
    renderGarden();
});
