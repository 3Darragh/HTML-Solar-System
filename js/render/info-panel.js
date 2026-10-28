import { descriptions } from "../data/descriptions.js";
import { build_planet_panel } from "./objects.js";

function split_into_sentences(section)
{
    return String(section)
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0);
}

function initialize_info_panel(info_panel)
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

        <p> Created by D McConville. </p>
    `;
    info_panel.classList.add("show");
}

function show_info_panel(object, info_panel)
{
    if (!info_panel)
    {
        return;
    }

    const description = descriptions[object.id];
    const overview_sections = Array.isArray(description?.overview)
        ? description.overview
        : [description?.overview ?? "No description available."];
    const overview_lines = overview_sections.flatMap(split_into_sentences);
    const object_overview = overview_lines.map((line) => `<p class="overview_line">${line}</p>`).join("");

    info_panel.innerHTML = `
        <button type="button" class="info_back_button" aria-label="Back to solar system overview">Back</button>
        <h2>${object.name}</h2>
        <div class="object_overview">${object_overview}</div>
    `;

    info_panel.prepend(build_planet_panel(object));

    const back_button = info_panel.querySelector(".info_back_button");

    if (back_button)
    {
        back_button.addEventListener("click", () => initialize_info_panel(info_panel));
    }

    info_panel.classList.add("show");
}

export { initialize_info_panel, show_info_panel };
