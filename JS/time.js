function initialize_time_control(config)
{
    const { slider, value_label } = config;

    const solar_system_state = window.solar_system_state ?? window.solar_system_state;

    /* Simulation safety check. */
    if (!slider || !solar_system_state)
    {
        return;
    }

    /* Takes the slider value and returns a normalized time scale. */
    function apply_time_scale(raw_value)
    {
        const next_scale = Number(raw_value);
        const normalized_scale = Number.isFinite(next_scale) ? next_scale : 1;

        solar_system_state.time_scale = normalized_scale;

        const is_paused = normalized_scale <= 0;
        const css_time_scale = is_paused ? 1 : normalized_scale;

        document.documentElement.style.setProperty("--global-time-scale", String(css_time_scale));
        document.documentElement.style.setProperty(
            "--planet-animation-play-state",
            is_paused ? "paused" : "running"
        );

        /* Update sprite animation durations for model based on time scale.
         When the simulation is paused, keep the current duration so the
         paused frame does not restart from the first sprite frame. */
        if (!is_paused)
        {
            const all_spritesheets = document.querySelectorAll(".solar_system_object--spritesheet");
            all_spritesheets.forEach(element => {
                const base_duration = parseFloat(getComputedStyle(element).getPropertyValue("--body-model-rotation-speed")) || 0.8;
                const new_duration = base_duration / css_time_scale;
                element.style.setProperty("--sprite-model-step-duration", `${new_duration}s`);
            });
        }

        /* Normalizes value label and adds x unit to represent scale. */
        if (value_label)
        {
            value_label.textContent = `${normalized_scale.toFixed(1)}x`;
        }

        /* Time scale text label. */
        document.documentElement.style.setProperty("--time-scale-value", `"${normalized_scale.toFixed(1)}x"`);
    }

    /* When the slider changes, new time scale is applied. */
    slider.addEventListener("input", (event) => 
    {
        apply_time_scale(event.target.value);
    });

    apply_time_scale(slider.value);
}

window.initialize_time_control = initialize_time_control;
