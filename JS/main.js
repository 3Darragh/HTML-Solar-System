/* Creates the root, model, panel, and containers. */
const solar_root = document.getElementById("solar_system_root");
const info_panel = document.getElementById("info_panel");
const time_panel = document.getElementById("time_panel");
const solar_system_container = document.getElementById("solar_system_container");

/* Throws an error if root is not accessible. */
if (!solar_root) 
{
    throw new Error("Missing #solar_system_root mount point.");
}

/* Throws and error if objects are not accessible. */
if (!Array.isArray(window.solar_system_objects)) 
{
    throw new Error("Missing object data. Ensure JS/objects.js is loaded before JS/main.js.");
}

const objects = window.solar_system_objects;
const elements_by_id = new Map();

/* Creates the time slider with default value. */
function initialize_time_panel()
{
    if (!time_panel) return;
    
    const slider = document.createElement("input");
    slider.id = "time_scale_slider";
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.step = "0.1";
    slider.value = "1";
    slider.setAttribute("aria-label", "Time scale");
    
    time_panel.appendChild(slider);
    
    return slider;
}

/* Initializes the info panel with the default introduction paragraph. */
function initialize_info_panel()
{
    if (!info_panel)
    {
        return;
    }

    info_panel.innerHTML = `
        <h2> HTML Educational Solar System </h2>
        <p> Click and drag to pan around the solar system. </p>
        <p> Hover over a planet to view detailed information and sprite animation. </p>
        <p> Move the slider to adjust the speed of rotation and revolution in the model. </p>
        <p> Use the mouse wheel to zoom in and out for 10x the focus. </p>

        <p> Created by Darragh McConville. </p>
    `;
    info_panel.classList.add("show");
}

/* Applies all object configs one by one. */
function apply_object_properties(element, object)
{
    if (!element || !object) return;

    const base_size = Number.isFinite(object.model_size) ? object.model_size : undefined;

    if (base_size !== undefined)
    {
        element.style.setProperty("--object-model-size", `${base_size}px`);
    }

    element.style.setProperty("--planet-z", object.z_index);

    if (object.sprite_image)
    {
        element.style.setProperty("--sprite-image", `url("${object.sprite_image}")`);
    }

    if (object.panel_sprite_image)
    {
        element.style.setProperty("--panel-sprite-image", `url("${object.panel_sprite_image}")`);
    }

    if (object.sprite_frame_width !== undefined)
    {
        element.style.setProperty("--sprite-frame-width", `${object.sprite_frame_width}px`);
    }

    if (object.sprite_frame_height !== undefined)
    {
        element.style.setProperty("--sprite-frame-height", `${object.sprite_frame_height}px`);
    }

    if (object.panel_sprite_frame_width !== undefined)
    {
        element.style.setProperty("--panel-sprite-frame-width", `${object.panel_sprite_frame_width}px`);
    }

    if (object.panel_sprite_frame_height !== undefined)
    {
        element.style.setProperty("--panel-sprite-frame-height", `${object.panel_sprite_frame_height}px`);
    }

    if (object.panel_sprite_rotation !== undefined)
    {
        element.style.setProperty("--panel-sprite-rotation", object.panel_sprite_rotation);
    }

    if (object.model_rotation_speed !== undefined)
    {
        element.style.setProperty("--object-model-rotation-speed", `${object.model_rotation_speed}s`);
        element.style.setProperty("--object-panel-rotation-speed", `${object.panel_rotation_speed}s`);

        const rotation_map = {
            "clockwise": "reverse",
            "counterclockwise": "normal"
        };
        const animation_direction = rotation_map[object.sprite_rotation_direction] || "normal";
        element.style.setProperty("--sprite-animation-direction-computed", animation_direction);
    }

    if (object.panel_scale !== undefined)
    {
        element.style.setProperty("--object-panel-scale", object.panel_scale);
    }

    if (object.sprite_flip_horizontal)
    {
        element.style.setProperty("--sprite-flip-scale-x", "-1");
    }

    if (object.sprite_flip_vertical)
    {
        element.style.setProperty("--sprite-flip-scale-y", "-1");
    }
}

/* Wraps a planet element in a CSS div, defines it as a planet in the solar system, and returns the wrapper. */
function build_planet_panel(object)
{
    const wrapper = document.createElement("div");
    wrapper.className = "planet_panel";

    const planet = document.createElement("div");
    planet.className = `solar_system_object ${object.class_name}`;
    apply_object_properties(planet, object);
    wrapper.appendChild(planet);

    return wrapper;
}

/* Splits overflowing lines into different sentences in the info panel. */
function split_into_sentences(section)
{
    return String(section)
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0);
}

/* Displays all info panel information (Back button, planet, text). */
function show_info_panel(object) 
{
    /* If no info panel or object provided, early out. */
    if (!info_panel) 
    {
        return;
    }

    /* Gets the planet description from descriptions.js based on the object id. */
    const description = window.solar_system_descriptions?.[object.id];

    /* Creates the planet overview by looking up the description.
    If no description is available, it displays a default message. */
    const overview_sections = Array.isArray(description?.overview)
        ? description.overview
        : [description?.overview ??  "No description available."];

    /* Splits the description into multiple lines based on length. */
    const overview_lines = overview_sections.flatMap(split_into_sentences);

    /* Maps each overview line to a HTML paragraph. */
    const object_overview = overview_lines.map((line) => `<p class="overview_line">${line}</p>`).join("");

    /* Adds the back button, planet name, and object overview to the info panel. */
    info_panel.innerHTML = `
        <button type="button" class="info_back_button" aria-label="Back to solar system overview">Back</button>
        <h2>${object.name}</h2>
        <div class="object_overview">${object_overview}</div>
    `;

    /* Adds the planet preview to the top of the info panel. */
    info_panel.prepend(build_planet_panel(object));

    /* Adds event listener to the back button to return to the solar system overview. */
    const back_button = info_panel.querySelector(".info_back_button");

    /* If the back button exists, reinitialize the info panel to its default state on click. */
    if (back_button)
    {
        back_button.addEventListener("click", initialize_info_panel);
    }

    info_panel.classList.add("show");
}

function initialize_objects()
{
    /* Creates a document fragment to batch append all planet elements to the DOM for better performance. */
    const fragment = document.createDocumentFragment();

    /* For each object, create an element, sets its attributes, applies properties, displays its spritesheet, 
    adds event listeners for interactions, and appends it to the document fragment. */
    for (const object of objects)
    {
        /* Creates the HTML element and sets the name, object ID, makes it a button, sets tabindex to 0, and 
        creates an aria-label for the info panel. */
        const element = document.createElement("div");
        element.className = `solar_system_object ${object.class_name}`;
        element.dataset.objectId = object.id;
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-label", object.name);

        /* Applies all object properties. */
        apply_object_properties(element, object);

        /* If the spritesheet exists with defined dimensions, set the width, height, and size for each frame. */
        if (object.class_name.includes("solar_system_object--spritesheet") && object.sprite_frame_width !== undefined && object.sprite_frame_height !== undefined)
        {
            const displayFrameWidth = Number.isFinite(object.model_size) ? object.model_size : object.sprite_frame_width;
            const displayFrameHeight = Number.isFinite(object.model_size) ? object.model_size : object.sprite_frame_height;
            element.style.setProperty("--sprite-model-frame-width", `${displayFrameWidth}px`);
            element.style.setProperty("--sprite-model-frame-height", `${displayFrameHeight}px`);
            element.style.setProperty("--sprite-background-size", `${displayFrameWidth * 8}px ${displayFrameHeight * 8}px`);
        }

        /* Adds event listeners for click (pan), mouseenter (info panel update), and focus (zoom) to show the info panel for the planet. */
        element.addEventListener("click", () => show_info_panel(object));
        element.addEventListener("mouseenter", () => show_info_panel(object));
        element.addEventListener("focus", () => show_info_panel(object));

        /* Stores the element in a map by its object ID and appends it to the fragment. */
        elements_by_id.set(object.id, element);
        fragment.appendChild(element);
    }

    /* Appends the fragment with all planet elements to the solar system root. */
    solar_root.appendChild(fragment);
}

initialize_objects();
initialize_info_panel();

/* Creates the time slider with default value. */
const time_scale_slider = initialize_time_panel();

/* If time control code is available, initializes the time control. */
if (typeof window.initialize_time_control === "function") 
{
    window.initialize_time_control({
        slider: time_scale_slider,
    });
}

/* If zoom control code is available, initializes the zoom control. */
if (typeof window.initialize_zoom_control === "function") 
{
    window.initialize_zoom_control(
    {
        solar_system_container: solar_system_container,
        solar_root: solar_root,
    });
}

/* If pan control code is available, initializes the pan control. */
if (typeof window.initialize_pan_control === "function") 
{
    window.initialize_pan_control(
    {
        solar_system_container: solar_system_container,
    });
}

/* If the orbit simulation is available, starts the simulation. */
if (typeof window.start_orbit_simulation !== "function") 
{
    throw new Error("Missing orbit code. Ensure JS/orbits.js is loaded before JS/main.js.");
}

/* Starts the orbit simulation. */
window.start_orbit_simulation(
{
    objects: objects,
    elements_by_id,
    solar_root,
    solar_system_container,
});