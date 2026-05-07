function initialize_pan_control(config)
{
    const { solar_root, solar_system_container } = config;

    /* Simulation safety check. */
    if (!solar_system_container || !window.apply_transform)
    {
        return;
    }

    let is_dragging = false;
    let last_x = 0;
    let last_y = 0;

    /* Waits until left click is held and sets the coordinates and dragging state. */
    solar_system_container.addEventListener("pointerdown", (event) =>
    {
        if (event.button !== 0)
        {
            return;
        }

        is_dragging = true;
        last_x = event.clientX;
        last_y = event.clientY;
        solar_system_container.classList.add("is_panning");
        solar_system_container.setPointerCapture(event.pointerId);
    });

    /* If dragging, update pan state by delta coordinates - last coordinates, update
    last coordinates to current coordinates, and then apply the current position. */
    solar_system_container.addEventListener("pointermove", (event) =>
    {
        if (!is_dragging)
        {
            return;
        }

        const delta_x = event.clientX - last_x;
        const delta_y = event.clientY - last_y;

        window.solar_system_state.pan_x += delta_x;
        window.solar_system_state.pan_y += delta_y;

        last_x = event.clientX;
        last_y = event.clientY;

        window.apply_transform();
    });

    /* When not dragging, sets dragging state to false and releases pointer capture. */
    function stop_dragging(event)
    {
        if (!is_dragging)
        {
            return;
        }

        is_dragging = false;
        solar_system_container.classList.remove("is_panning");

        if (solar_system_container.hasPointerCapture(event.pointerId))
        {
            solar_system_container.releasePointerCapture(event.pointerId);
        }
    }

    solar_system_container.addEventListener("pointerup", stop_dragging);
    solar_system_container.addEventListener("pointercancel", stop_dragging);
}

window.initialize_pan_control = initialize_pan_control;