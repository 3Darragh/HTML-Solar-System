/* Takes configs and starts starts the orbit simulation by placing objects and upading
their positions based on the elapsed time and orbit by ID. */
function start_orbit_simulation(config) 
{
	/* Gets object configs and creates two maps to store sprite position and state seperately. */
	const { objects, elements_by_id, solar_root } = config;
	const positions_by_id = new Map();
	const sprite_state_by_id = new Map();

	/* Stores reduced motion preference. */
	const prefers_reduced_motion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* Initializes the last frame time and total simulation seconds. */
	let last_frame_time = null;
	let simulation_seconds = 0;

	/* Initializes starting value of planet for sprites based off first frame data. */
	function initialize_sprite_frame_state()
	{
		for (const object of objects)
		{
			/* Checks for spritesheet. */
			if (!object.class_name?.includes("solar_system_object--spritesheet"))
			{
				continue;
			}

			const element = elements_by_id.get(object.id);
			/* Checks for element by  */
			if (!element)
			{
				continue;
			}

			/* Gets the computed style for the element for frame dimensions and animation duration. */
			const computed_style = getComputedStyle(element);

			/* Calculates frame dimensions and base rotation speed. */
			const frame_width = Number.parseFloat(computed_style.getPropertyValue("--sprite-model-frame-width")) || Number.parseFloat(computed_style.getPropertyValue("--sprite-frame-width")) || object.model_size || object.sprite_frame_width || 32;
			const frame_height = Number.parseFloat(computed_style.getPropertyValue("--sprite-model-frame-height")) || Number.parseFloat(computed_style.getPropertyValue("--sprite-frame-height")) || object.model_size || object.sprite_frame_height || 32;
			const base_duration = Number.parseFloat(computed_style.getPropertyValue("--sprite-model-step-duration")) || object.model_rotation_speed || 0.8;

			const animation_direction = object.sprite_rotation_direction === "clockwise" ? -1 : 1;

			/* Sets frame dimension and rotation for the sprite. */
			sprite_state_by_id.set(object.id, {
				current_frame: 0,
				frame_count: 64,
				frame_width,
				frame_height,
				base_duration,
				direction: animation_direction,
			});

			element.style.backgroundPosition = "0px 0px";
		}
	}

	/* Updates the sprite frame based on the elapsed time and animation state. */
	function update_sprite_frame(element, state, delta_seconds, time_scale)
	{
		/* If no state found, time is paused, or reduced motion, early outs. */
		if (!state || time_scale <= 0 || prefers_reduced_motion.matches)
		{
			return;
		}

		/* Calculates base duration and frame duration from state or model step duration.*/
		const base_duration = Number.parseFloat(getComputedStyle(element).getPropertyValue("--sprite-model-step-duration")) || state.base_duration;
		const frame_duration = base_duration / 8;

		/* Calculates the frame delta by frame duration * delta seconds, then sets the current frame
		by wrapping the frame delta in the count.*/
		const frame_delta = delta_seconds * time_scale / frame_duration * state.direction;
		state.current_frame = ((state.current_frame + frame_delta) % state.frame_count + state.frame_count) % state.frame_count;

		/* Rounds down the current frame and derives the x and y positions. */
		const displayed_frame = Math.floor(state.current_frame);
		const column = displayed_frame % 8;
		const row = Math.floor(displayed_frame / 8);
		const x = -column * state.frame_width;
		const y = -row * state.frame_height;

		/* Sets the background position to the new frame. */
		element.style.backgroundPosition = `${x}px ${y}px`;
	}

	/* Gets the solar center from the bounding box. */
	function get_solar_center() 
	{
		const rect = solar_root.getBoundingClientRect();
		return {
			x: rect.width * 0.5,
			y: rect.height * 0.5,
		};
	}

	/* Places objects in the solar system by ID and coordinates. */
	function place_object(id, x, y)
	{
		const element = elements_by_id.get(id);
		if (!element)
		{
			return;
		}

		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
		positions_by_id.set(id, { x, y });
	}

	/* Updates object position by multiplying orbit radius by the sine or cosine of the elapsed 
	time and tau and adding the result to the current position. */
	function get_object_position(object, elapsed_seconds, center) 
	{
		/* If no orbit, position is center. */
		if (!object.orbit) 
		{
			return center;
		}

		/* Gets the current position and updated angle for the new position.*/
		const parent_position = positions_by_id.get(object.orbit.around) ?? center;
		const phase_seconds = object.orbit.phase_seconds ?? 0;
		const angle = (elapsed_seconds + phase_seconds) * ((Math.PI * 2) / object.orbit.period_seconds);

		/* Returns the updated object position.*/
		return {
			x: parent_position.x + Math.cos(angle) * object.orbit.radius_x,
			y: parent_position.y + Math.sin(angle) * object.orbit.radius_y,
		};
	}

	function render_frame(now) 
	{
		const center = get_solar_center();
		const state = window.solar_system_state ?? { time_scale: 1 };

		if (last_frame_time === null)
		{
			last_frame_time = now;
		}

		const delta_seconds = Math.min((now - last_frame_time) / 1000, 0.1);
		last_frame_time = now;

		if (!prefers_reduced_motion.matches)
		{
			simulation_seconds += delta_seconds * state.time_scale;
		}

		positions_by_id.clear();

		for (const object of objects) 
		{
			const position = get_object_position(object, simulation_seconds, center);
			place_object(object.id, position.x, position.y);

			const sprite_state = sprite_state_by_id.get(object.id);
			const element = elements_by_id.get(object.id);
			if (element && sprite_state)
			{
				update_sprite_frame(element, sprite_state, delta_seconds, state.time_scale);
			}
		}

		requestAnimationFrame(render_frame);
	}

	initialize_sprite_frame_state();
	requestAnimationFrame(render_frame);
}

window.start_orbit_simulation = start_orbit_simulation;
