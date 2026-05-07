function initialize_zoom_control(config)
{
    const { solar_root, solar_system_container } = config;

    /* Simulation safety check. */
    if (!solar_root || !window.solar_system_state)
    {
        return;
    }

    const min_zoom = 0.1;
    const max_zoom = 4;
    const zoom_step = 0.05;

    /* Zoom and pan safety checks. */
    if (!Number.isFinite(window.solar_system_state.zoom))
    {
        window.solar_system_state.zoom = 1;
    }

    if (!Number.isFinite(window.solar_system_state.pan_x))
    {
        window.solar_system_state.pan_x = 0;
    }

    if (!Number.isFinite(window.solar_system_state.pan_y))
    {
        window.solar_system_state.pan_y = 0;
    }

    /* Applies zoom and pan transforms simultaniously. Pan values are applied first and current
    position is declared as the solar root center, then zoom is applied in or out from there. */
    function apply_transform()
    {
        solar_root.style.transformOrigin = "center center";
        solar_root.style.transform = `translate(${window.solar_system_state.pan_x}px, ${window.solar_system_state.pan_y}px) scale(${window.solar_system_state.zoom})`;
    }

    window.apply_transform = apply_transform;

    /* Adjust pan position so that zooming in and out is centered on the current cursor position. */
    function center_zoom_on_cursor(p_cursor_x, p_cursor_y, p_current_zoom, p_target_zoom)
    {
        /* Returns if area or coordinates are infinite or zoom is negative. */
        if (!solar_system_container || !Number.isFinite(p_cursor_x) || !Number.isFinite(p_cursor_y) || p_current_zoom <= 0)
        {
            return;
        }

        /* Defines the simulation rectangle as the models bounding volume, to then derive the
        center x and y of the simulation area. */
        const simulation_rectangle = solar_system_container.getBoundingClientRect();
        const center_x = simulation_rectangle.left + (simulation_rectangle.width * 0.5);
        const center_y = simulation_rectangle.top + (simulation_rectangle.height * 0.5);

        /* Sets the new pan values by calculating the delta between the cursor and center, then 
        adjusting that to fit the scale ratio of the current and target zooms.
        */
        const delta_x = p_cursor_x - center_x - window.solar_system_state.pan_x;
        const delta_y = p_cursor_y - center_y - window.solar_system_state.pan_y;
        const scale_ratio = p_target_zoom / p_current_zoom;

        window.solar_system_state.pan_x -= delta_x * (scale_ratio - 1);
        window.solar_system_state.pan_y -= delta_y * (scale_ratio - 1);
    }

    /* Applies zoom transformation based off the zoom value and cursor coordinates.*/
    function apply_zoom(p_target_zoom, p_cursor_x, p_cursor_y) 
    {
        /* Stores the previous and current zoom values in two variables. */
        const current_zoom = window.solar_system_state.zoom;
        const raw_target_zoom = Number(p_target_zoom);

        /* Fallback zoom in case current zoom is not finite. */
        const fallback_zoom = Number.isFinite(window.solar_system_state.zoom) ? window.solar_system_state.zoom : 1;

        /* Normalizes the current zoom value and clamps it between the min and max zooms. */ 
        const normalized_zoom = Number.isFinite(raw_target_zoom) ? raw_target_zoom : fallback_zoom;
        const clamped_target_zoom = Math.min(Math.max(normalized_zoom, min_zoom), max_zoom);

        /* Adjusts pan position to keep the zoom centered on the cursor point. */
        center_zoom_on_cursor(p_cursor_x, p_cursor_y, current_zoom, clamped_target_zoom);

        /* Sets the zoom to the clamped target zoom and applies the transform. */
        window.solar_system_state.zoom = clamped_target_zoom;
        apply_transform();
    }

    /* If simulation area is available, tracks all wheel events and applies zoom. */
    if (solar_system_container)
    {
        solar_system_container.addEventListener("wheel", (event) =>
        {
            event.preventDefault();

            /* Determines zoom direction based on positive or negative delta, then applies zoom
            by the zoom step. */
            const direction = event.deltaY < 0 ? 1 : -1;
            const current_zoom = window.solar_system_state.zoom + (direction * zoom_step);

            apply_zoom(current_zoom, event.clientX, event.clientY);
        }, { passive: false });
    }

    apply_zoom(window.solar_system_state.zoom);
}

window.initialize_zoom_control = initialize_zoom_control;