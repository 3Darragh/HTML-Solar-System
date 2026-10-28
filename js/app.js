import { objects } from "./data/objects.js";
import { initialize_time_control } from "./controls/time.js";
import { initialize_zoom_control } from "./controls/zoom.js";
import { initialize_pan_control } from "./controls/pan.js";
import { start_orbit_simulation } from "./controls/orbits.js";
import { initialize_info_panel, show_info_panel } from "./render/info-panel.js";
import { initialize_objects } from "./render/objects.js";

const solar_root = document.getElementById("solar_system_root");
const info_panel = document.getElementById("info_panel");
const time_panel = document.getElementById("time_panel");
const solar_system_container = document.getElementById("solar_system_container");

if (!solar_root)
{
    throw new Error("Missing #solar_system_root mount point.");
}

if (!Array.isArray(objects))
{
    throw new Error("Missing solar system object data.");
}

const elements_by_id = initialize_objects(
    objects,
    solar_root,
    (object) => show_info_panel(object, info_panel)
);

initialize_info_panel(info_panel);

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

const time_scale_slider = initialize_time_panel();
initialize_time_control({ slider: time_scale_slider });

const apply_transform = initialize_zoom_control({
    solar_system_container,
    solar_root,
});

initialize_pan_control({
    solar_system_container,
    apply_transform,
});

start_orbit_simulation({
    objects,
    elements_by_id,
    solar_root,
    solar_system_container,
});
