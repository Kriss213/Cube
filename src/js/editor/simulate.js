import { LEDCube } from '../cube.js';
import { AnimationEditor } from './AnimationEditor.js';
import { PixelCubeToBinary } from '../converter/PixelCubeToBinary.js';

/**
 * Single LED size
 *
 * @type {number}
 */
const ledSize = 1;

/**
 * LED count in a row or column
 *
 * @type {number}
 */
const cubeDim = 8;

/**
 * Spacing between the LEDs
 *
 * @type {number}
 */
const spacing = 4;

/**
 * Popup width
 *
 * @type {number}
 */
const popupWidth = window.innerWidth / 2;

/**
 * Popup height
 *
 * @type {number}
 */
const popupHeight = window.innerHeight / 2;

/**
 * Start simulation button element
 *
 * @type {HTMLElement}
 */
const startSimulationButton = document.getElementById('simulate-action');

/**
 * Stop simulation button element
 * @type {HTMLElement}
 */
const stopSimulationButton = document.getElementById("stop-simulation");

/**
 * Export button element
 *
 * @type {HTMLElement}
 */
const btn_export = document.getElementById("export_anim");

/**
 * Save button element
 *
 * @type {HTMLElement}
 */
const btn_save_anim = document.getElementById("save_anim");

/**
 * Import button element
 *
 * @type {HTMLElement}
 */
const input_import_anim = document.getElementById("lcaf_upload");

/**
 * Simulation section element
 *
 * @type {HTMLElement}
 */
const simulationSection = document.getElementById('simulation');

/**
 * Popup button element
 *
 * @type {HTMLElement}
 */
const popupButton = document.getElementById('open-popup');

/**
 * Simulation popup element
 *
 * @type {HTMLElement}
 */
const simulationPopup = document.getElementById('simulation-popup');

/**
 * Add new row button element
 *
 * @type {HTMLElement}
 */
const addNewRowBtn = document.getElementById("btn_addNewRow");

/**
 * Duplicate last row button element
 *
 * @type {HTMLElement}
 */
const dupl_last_row_btn = document.getElementById("btn_dupl_last_row");

/**
 * Animation name input field
 *
 * @type {HTMLElement}
 */
const animationNameInputField = document.getElementById("animation_name")

/**
 * Editor panel element
 *
 * @type {HTMLElement}
 */
const editorPanel = document.getElementById("row-section");

var animationEditor = new AnimationEditor(editorPanel, addNewRowBtn, dupl_last_row_btn);
var ledCube = new LEDCube(cubeDim, ledSize, spacing, popupWidth, popupHeight);
simulationSection.appendChild( ledCube.renderer.domElement );

function getAnimationName() {
    let anim_name = animationNameInputField.value;
    if (anim_name === "") {
        anim_name = "Animation";
    }

    // Remove illegal (for file name) charachters if present
    const illegalCharacters = /[\\/:"*?<>|]/g;
    anim_name = anim_name.replace(illegalCharacters, '');

    return anim_name
}

// Set animation name in local storage
animationNameInputField.addEventListener("change", (event) =>{
    window.localStorage.setItem('animation_name', getAnimationName());
});

// Toggle popup
popupButton.addEventListener('click', () => {
    if (simulationPopup.classList.contains("hidden")) {
        simulationPopup.classList.remove('hidden');
    } else {
        simulationPopup.classList.add('hidden');
    }
});

// Start simulation
startSimulationButton.addEventListener('click', () => {
    ledCube.startSimulation( animationEditor.getArray(null), animationEditor.getTimeout());
});

// Stop simulation
stopSimulationButton.addEventListener("click", (e) => {
    ledCube.stopSimulation();
});

// Export simulation file with .lcaf extension
btn_export.addEventListener('click', (e) => {
    let animation = new PixelCubeToBinary(animationEditor.getArray());
    animation.saveBinaryFile(getAnimationName() + '.gc', animationEditor.getTimeout());
});

btn_save_anim.addEventListener('click', (e) => {
    let arr2export = JSON.stringify(animationEditor.getArray(null));

    let blob_obj = new Blob([arr2export], {type: "application/json"});

    let url = URL.createObjectURL(blob_obj)
    let a = document.createElement('a')
    a.setAttribute('href', url)

    a.setAttribute('download', getAnimationName() + ".lcaf");
    a.click();
});

// Import animation
input_import_anim.addEventListener("click", () => {
    input_import_anim.value = null;
});

// When imported animation changes, read the uploaded file and update the local storage
input_import_anim.addEventListener('change', (e) => {
    let file = e.target.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
        const fileContent = event.target.result;
        let loadedArr = JSON.parse(fileContent);
        window.localStorage.setItem('uploaded_file_contents', fileContent);
        window.localStorage.setItem('timeout', animationEditor.getTimeout())
        animationEditor.loadFromArray(loadedArr);
    });

   reader.readAsText(file);

   // Set animation name to file name
   animationNameInputField.value = file.name.split(".")[0];

   // Update animation name in local storage
   window.localStorage.setItem('animation_name', getAnimationName());
});
