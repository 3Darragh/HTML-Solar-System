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

function initialize_objects(objects, solar_root, on_object_select)
{
    const fragment = document.createDocumentFragment();
    const elements_by_id = new Map();

    for (const object of objects)
    {
        const element = document.createElement("div");
        element.className = `solar_system_object ${object.class_name}`;
        element.dataset.objectId = object.id;
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-label", object.name);

        apply_object_properties(element, object);

        if (object.class_name.includes("solar_system_object--spritesheet") && object.sprite_frame_width !== undefined && object.sprite_frame_height !== undefined)
        {
            const displayFrameWidth = Number.isFinite(object.model_size) ? object.model_size : object.sprite_frame_width;
            const displayFrameHeight = Number.isFinite(object.model_size) ? object.model_size : object.sprite_frame_height;
            element.style.setProperty("--sprite-model-frame-width", `${displayFrameWidth}px`);
            element.style.setProperty("--sprite-model-frame-height", `${displayFrameHeight}px`);
            element.style.setProperty("--sprite-background-size", `${displayFrameWidth * 8}px ${displayFrameHeight * 8}px`);
        }

        element.addEventListener("click", () => on_object_select(object));
        element.addEventListener("mouseenter", () => on_object_select(object));
        element.addEventListener("focus", () => on_object_select(object));

        elements_by_id.set(object.id, element);
        fragment.appendChild(element);
    }

    solar_root.appendChild(fragment);
    return elements_by_id;
}

export { build_planet_panel, initialize_objects };
