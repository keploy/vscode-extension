var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	const identity = (x) => x;

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @param {number | string} value
	 * @returns {[number, string]}
	 */
	function split_css_unit(value) {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
	}

	const is_client = typeof window !== 'undefined';

	/** @type {() => number} */
	let now = is_client ? () => window.performance.now() : () => Date.now();

	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

	const tasks = new Set();

	/**
	 * @param {number} now
	 * @returns {void}
	 */
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {import('./private.js').TaskCallback} callback
	 * @returns {import('./private.js').Task}
	 */
	function loop(callback) {
		/** @type {import('./private.js').TaskEntry} */
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			}
		};
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {Node} node
	 * @returns {CSSStyleSheet}
	 */
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
		// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
		// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
		// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
		// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
		style_element.textContent = '/* empty */';
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
	const managed_styles = new Map();

	let active = 0;

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	/**
	 * @param {string} str
	 * @returns {number}
	 */
	function hash(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	/**
	 * @param {Document | ShadowRoot} doc
	 * @param {Element & ElementCSSInlineStyle} node
	 * @returns {{ stylesheet: any; rules: {}; }}
	 */
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {number} a
	 * @param {number} b
	 * @param {number} duration
	 * @param {number} delay
	 * @param {(t: number) => number} ease
	 * @param {(t: number, u: number) => string} fn
	 * @param {number} uid
	 * @returns {string}
	 */
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {string} [name]
	 * @returns {void}
	 */
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}

	/** @returns {void} */
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { ownerNode } = info.stylesheet;
				// there is no ownerNode if it runs on jsdom.
				if (ownerNode) detach(ownerNode);
			});
			managed_styles.clear();
		});
	}

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	/**
	 * @type {Promise<void> | null}
	 */
	let promise;

	/**
	 * @returns {Promise<void>}
	 */
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}

	/**
	 * @param {Element} node
	 * @param {INTRO | OUTRO | boolean} direction
	 * @param {'start' | 'end'} kind
	 * @returns {void}
	 */
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/**
	 * @type {import('../transition/public.js').TransitionConfig}
	 */
	const null_transition = { duration: 0 };

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @param {boolean} intro
	 * @returns {{ run(b: 0 | 1): void; end(): void; }}
	 */
	function create_bidirectional_transition(node, fn, params, intro) {
		/**
		 * @type {TransitionOptions} */
		const options = { direction: 'both' };
		let config = fn(node, params, options);
		let t = intro ? 0 : 1;

		/**
		 * @type {Program | null} */
		let running_program = null;

		/**
		 * @type {PendingProgram | null} */
		let pending_program = null;
		let animation_name = null;

		/** @type {boolean} */
		let original_inert_value;

		/**
		 * @returns {void} */
		function clear_animation() {
			if (animation_name) delete_rule(node, animation_name);
		}

		/**
		 * @param {PendingProgram} program
		 * @param {number} duration
		 * @returns {Program}
		 */
		function init(program, duration) {
			const d = /** @type {Program['d']} */ (program.b - t);
			duration *= Math.abs(d);
			return {
				a: t,
				b: program.b,
				d,
				duration,
				start: program.start,
				end: program.start + duration,
				group: program.group
			};
		}

		/**
		 * @param {INTRO | OUTRO} b
		 * @returns {void}
		 */
		function go(b) {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;

			/**
			 * @type {PendingProgram} */
			const program = {
				start: now() + delay,
				b
			};

			if (!b) {
				// @ts-ignore todo: improve typings
				program.group = outros;
				outros.r += 1;
			}

			if ('inert' in node) {
				if (b) {
					if (original_inert_value !== undefined) {
						// aborted/reversed outro — restore previous inert value
						node.inert = original_inert_value;
					}
				} else {
					original_inert_value = /** @type {HTMLElement} */ (node).inert;
					node.inert = true;
				}
			}

			if (running_program || pending_program) {
				pending_program = program;
			} else {
				// if this is an intro, and there's a delay, we need to do
				// an initial tick and/or apply CSS animation immediately
				if (css) {
					clear_animation();
					animation_name = create_rule(node, t, b, duration, delay, easing, css);
				}
				if (b) tick(0, 1);
				running_program = init(program, duration);
				add_render_callback(() => dispatch(node, b, 'start'));
				loop((now) => {
					if (pending_program && now > pending_program.start) {
						running_program = init(pending_program, duration);
						pending_program = null;
						dispatch(node, running_program.b, 'start');
						if (css) {
							clear_animation();
							animation_name = create_rule(
								node,
								t,
								running_program.b,
								running_program.duration,
								0,
								easing,
								config.css
							);
						}
					}
					if (running_program) {
						if (now >= running_program.end) {
							tick((t = running_program.b), 1 - t);
							dispatch(node, running_program.b, 'end');
							if (!pending_program) {
								// we're done
								if (running_program.b) {
									// intro — we can tidy up immediately
									clear_animation();
								} else {
									// outro — needs to be coordinated
									if (!--running_program.group.r) run_all(running_program.group.c);
								}
							}
							running_program = null;
						} else if (now >= running_program.start) {
							const p = now - running_program.start;
							t = running_program.a + running_program.d * easing(p / running_program.duration);
							tick(t, 1 - t);
						}
					}
					return !!(running_program || pending_program);
				});
			}
		}
		return {
			run(b) {
				if (is_function(config)) {
					wait().then(() => {
						const opts = { direction: b ? 'in' : 'out' };
						// @ts-ignore
						config = config(opts);
						go(b);
					});
				} else {
					go(b);
				}
			},
			end() {
				clear_animation();
				running_program = pending_program = null;
			}
		};
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.17';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			[];
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/*
	Adapted from https://github.com/mattdesl
	Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
	*/

	/**
	 * https://svelte.dev/docs/svelte-easing
	 * @param {number} t
	 * @returns {number}
	 */
	function cubicOut(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * https://svelte.dev/docs/svelte-transition#fly
	 * @param {Element} node
	 * @param {import('./public').FlyParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fly(
		node,
		{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const od = target_opacity * (1 - opacity);
		const [xValue, xUnit] = split_css_unit(x);
		const [yValue, yUnit] = split_css_unit(y);
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
		};
	}

	/* webviews/components/KeployHome.svelte generated by Svelte v4.2.17 */

	const { console: console_1 } = globals;
	const file = "webviews/components/KeployHome.svelte";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[33] = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[33] = list[i];
		return child_ctx;
	}

	// (681:6) {:else}
	function create_else_block_1(ctx) {
		let svg;
		let path0;
		let path1;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path0 = svg_element("path");
				path1 = svg_element("path");
				attr_dev(path0, "fill", "#FF914D");
				attr_dev(path0, "d", "M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6");
				attr_dev(path0, "opacity", "0.3");
				add_location(path0, file, 686, 11, 24940);
				attr_dev(path1, "fill", "#FF914D");
				attr_dev(path1, "d", "M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6");
				add_location(path1, file, 690, 12, 25087);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "35px");
				attr_dev(svg, "height", "35px");
				attr_dev(svg, "viewBox", "0 0 24 24");
				add_location(svg, file, 681, 8, 24802);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path0);
				append_dev(svg, path1);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1.name,
			type: "else",
			source: "(681:6) {:else}",
			ctx
		});

		return block;
	}

	// (670:6) {#if isRecording}
	function create_if_block_6(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill", "#FF914D");
				attr_dev(path, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path, file, 675, 11, 24568);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "35px");
				attr_dev(svg, "height", "35px");
				attr_dev(svg, "viewBox", "0 0 24 24");
				add_location(svg, file, 670, 8, 24430);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_6.name,
			type: "if",
			source: "(670:6) {#if isRecording}",
			ctx
		});

		return block;
	}

	// (722:6) {:else}
	function create_else_block(ctx) {
		let h1;

		let t_value = (/*isRecording*/ ctx[3]
		? "Recording Started"
		: /*isTesting*/ ctx[4]
			? "Testing Started"
			: "Running Keploy") + "";

		let t;

		const block = {
			c: function create() {
				h1 = element("h1");
				t = text(t_value);
				attr_dev(h1, "class", "svelte-12b0lrl");
				add_location(h1, file, 722, 8, 26147);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
				append_dev(h1, t);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*isRecording, isTesting*/ 24 && t_value !== (t_value = (/*isRecording*/ ctx[3]
				? "Recording Started"
				: /*isTesting*/ ctx[4]
					? "Testing Started"
					: "Running Keploy") + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(722:6) {:else}",
			ctx
		});

		return block;
	}

	// (720:41) 
	function create_if_block_5(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element("h1");
				h1.textContent = "View Previous Test Results";
				attr_dev(h1, "class", "svelte-12b0lrl");
				add_location(h1, file, 720, 8, 26089);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5.name,
			type: "if",
			source: "(720:41) ",
			ctx
		});

		return block;
	}

	// (718:6) {#if selectedIconButton === 3}
	function create_if_block_4(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element("h1");
				h1.textContent = "Make changes to keploy config";
				attr_dev(h1, "class", "svelte-12b0lrl");
				add_location(h1, file, 718, 8, 26000);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4.name,
			type: "if",
			source: "(718:6) {#if selectedIconButton === 3}",
			ctx
		});

		return block;
	}

	// (794:2) {#if selectedIconButton === 2}
	function create_if_block_3(ctx) {
		let div;
		let h3;

		const block = {
			c: function create() {
				div = element("div");
				h3 = element("h3");
				attr_dev(h3, "id", "testSuiteName");
				add_location(h3, file, 796, 6, 28350);
				attr_dev(div, "id", "lastTestResults");
				add_location(div, file, 794, 4, 28267);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, h3);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(794:2) {#if selectedIconButton === 2}",
			ctx
		});

		return block;
	}

	// (845:2) {#if showSteps}
	function create_if_block(ctx) {
		let div;
		let div_transition;
		let current;

		function select_block_type_2(ctx, dirty) {
			if (/*isRecording*/ ctx[3]) return create_if_block_1;
			if (/*isTesting*/ ctx[4]) return create_if_block_2;
		}

		let current_block_type = select_block_type_2(ctx);
		let if_block = current_block_type && current_block_type(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (if_block) if_block.c();
				attr_dev(div, "class", "steps svelte-12b0lrl");
				add_location(div, file, 845, 4, 29734);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if (if_block) if_block.m(div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div, null);
					}
				}
			},
			i: function intro(local) {
				if (current) return;

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: 20, duration: 300 }, true);
						div_transition.run(1);
					});
				}

				current = true;
			},
			o: function outro(local) {
				if (local) {
					if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: 20, duration: 300 }, false);
					div_transition.run(0);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (if_block) {
					if_block.d();
				}

				if (detaching && div_transition) div_transition.end();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(845:2) {#if showSteps}",
			ctx
		});

		return block;
	}

	// (851:26) 
	function create_if_block_2(ctx) {
		let each_1_anchor;
		let each_value_1 = ensure_array_like_dev(/*replayingSteps*/ ctx[19]);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*replayingSteps*/ 524288) {
					each_value_1 = ensure_array_like_dev(/*replayingSteps*/ ctx[19]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_1.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(851:26) ",
			ctx
		});

		return block;
	}

	// (847:6) {#if isRecording}
	function create_if_block_1(ctx) {
		let each_1_anchor;
		let each_value = ensure_array_like_dev(/*recordingSteps*/ ctx[18]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*recordingSteps*/ 262144) {
					each_value = ensure_array_like_dev(/*recordingSteps*/ ctx[18]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(847:6) {#if isRecording}",
			ctx
		});

		return block;
	}

	// (852:8) {#each replayingSteps as step}
	function create_each_block_1(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = `${/*step*/ ctx[33]}`;
				attr_dev(div, "class", "step svelte-12b0lrl");
				add_location(div, file, 852, 10, 29992);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(852:8) {#each replayingSteps as step}",
			ctx
		});

		return block;
	}

	// (848:8) {#each recordingSteps as step}
	function create_each_block(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = `${/*step*/ ctx[33]}`;
				attr_dev(div, "class", "step svelte-12b0lrl");
				add_location(div, file, 848, 10, 29869);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(848:8) {#each recordingSteps as step}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let div16;
		let div0;
		let button0;
		let span0;
		let t1;
		let button0_class_value;
		let t2;
		let button1;
		let span1;
		let t3;
		let span2;
		let button1_class_value;
		let t5;
		let button2;
		let span3;
		let t6;
		let span4;
		let button2_class_value;
		let t8;
		let div5;
		let div1;
		let t9;
		let span5;
		let svg0;
		let path0;
		let t10;
		let span6;
		let svg1;
		let path1;
		let t11;
		let div4;
		let h30;
		let t12;
		let div2;
		let t13;
		let h31;
		let t14;
		let div3;
		let t15;
		let button3;
		let t17;
		let button4;
		let t19;
		let button5;
		let t21;
		let hr;
		let t22;
		let t23;
		let div14;
		let div9;
		let div6;
		let svg2;
		let path2;
		let path3;
		let t24;
		let div7;
		let t26;
		let div8;
		let t28;
		let div13;
		let div10;
		let t29;
		let div11;
		let t31;
		let div12;
		let t33;
		let t34;
		let div15;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (/*isRecording*/ ctx[3]) return create_if_block_6;
			return create_else_block_1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block0 = current_block_type(ctx);

		function select_block_type_1(ctx, dirty) {
			if (/*selectedIconButton*/ ctx[5] === 3) return create_if_block_4;
			if (/*selectedIconButton*/ ctx[5] === 2) return create_if_block_5;
			return create_else_block;
		}

		let current_block_type_1 = select_block_type_1(ctx);
		let if_block1 = current_block_type_1(ctx);
		let if_block2 = /*selectedIconButton*/ ctx[5] === 2 && create_if_block_3(ctx);
		let if_block3 = /*showSteps*/ ctx[6] && create_if_block(ctx);

		const block = {
			c: function create() {
				div16 = element("div");
				div0 = element("div");
				button0 = element("button");
				span0 = element("span");
				span0.textContent = "Record/Replay";
				t1 = space();
				if_block0.c();
				t2 = space();
				button1 = element("button");
				span1 = element("span");
				t3 = space();
				span2 = element("span");
				span2.textContent = "History";
				t5 = space();
				button2 = element("button");
				span3 = element("span");
				t6 = space();
				span4 = element("span");
				span4.textContent = "Settings";
				t8 = space();
				div5 = element("div");
				div1 = element("div");
				if_block1.c();
				t9 = space();
				span5 = element("span");
				svg0 = svg_element("svg");
				path0 = svg_element("path");
				t10 = space();
				span6 = element("span");
				svg1 = svg_element("svg");
				path1 = svg_element("path");
				t11 = space();
				div4 = element("div");
				h30 = element("h3");
				t12 = space();
				div2 = element("div");
				t13 = space();
				h31 = element("h3");
				t14 = space();
				div3 = element("div");
				t15 = space();
				button3 = element("button");
				button3.textContent = "View Complete Test Summary";
				t17 = space();
				button4 = element("button");
				button4.textContent = "View Logs";
				t19 = space();
				button5 = element("button");
				button5.textContent = "View Logs";
				t21 = space();
				hr = element("hr");
				t22 = space();
				if (if_block2) if_block2.c();
				t23 = space();
				div14 = element("div");
				div9 = element("div");
				div6 = element("div");
				svg2 = svg_element("svg");
				path2 = svg_element("path");
				path3 = svg_element("path");
				t24 = space();
				div7 = element("div");
				div7.textContent = "Record Test Cases";
				t26 = space();
				div8 = element("div");
				div8.textContent = "➔";
				t28 = space();
				div13 = element("div");
				div10 = element("div");
				t29 = space();
				div11 = element("div");
				div11.textContent = "Replay Test Cases";
				t31 = space();
				div12 = element("div");
				div12.textContent = "➔";
				t33 = space();
				if (if_block3) if_block3.c();
				t34 = space();
				div15 = element("div");
				attr_dev(span0, "class", "tooltip svelte-12b0lrl");
				add_location(span0, file, 668, 6, 24355);
				attr_dev(button0, "id", "keploycommands");
				attr_dev(button0, "class", button0_class_value = "icon-button " + (/*selectedIconButton*/ ctx[5] === 1 ? 'selected' : '') + " svelte-12b0lrl");
				add_location(button0, file, 663, 4, 24199);
				attr_dev(span1, "class", "history-icon");
				add_location(span1, file, 703, 6, 25560);
				attr_dev(span2, "class", "tooltip svelte-12b0lrl");
				add_location(span2, file, 704, 6, 25601);
				attr_dev(button1, "id", "displayPreviousTestResults");
				attr_dev(button1, "class", button1_class_value = "icon-button " + (/*selectedIconButton*/ ctx[5] === 2 ? 'selected' : '') + " svelte-12b0lrl");
				add_location(button1, file, 698, 4, 25388);
				attr_dev(span3, "class", "settings-icon");
				add_location(span3, file, 711, 6, 25803);
				attr_dev(span4, "class", "tooltip svelte-12b0lrl");
				add_location(span4, file, 712, 6, 25845);
				attr_dev(button2, "id", "openConfig");
				attr_dev(button2, "class", button2_class_value = "icon-button " + (/*selectedIconButton*/ ctx[5] === 3 ? 'selected' : '') + " svelte-12b0lrl");
				add_location(button2, file, 706, 4, 25656);
				attr_dev(div0, "class", "icon-buttons svelte-12b0lrl");
				add_location(div0, file, 662, 2, 24168);
				attr_dev(path0, "fill", "#FF914D");
				attr_dev(path0, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path0, file, 746, 11, 26738);
				attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg0, "width", "35px");
				attr_dev(svg0, "height", "35px");
				attr_dev(svg0, "viewBox", "0 0 24 24");
				add_location(svg0, file, 741, 8, 26600);
				attr_dev(span5, "class", "stop-button svelte-12b0lrl");
				attr_dev(span5, "id", "stopRecordingButton");
				attr_dev(span5, "role", "button");
				attr_dev(span5, "tabindex", "0");
				add_location(span5, file, 730, 6, 26333);
				attr_dev(path1, "fill", "#FF914D");
				attr_dev(path1, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path1, file, 769, 11, 27412);
				attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg1, "width", "35px");
				attr_dev(svg1, "height", "35px");
				attr_dev(svg1, "viewBox", "0 0 24 24");
				add_location(svg1, file, 764, 8, 27274);
				attr_dev(span6, "class", "stop-button svelte-12b0lrl");
				attr_dev(span6, "id", "stopTestingButton");
				attr_dev(span6, "role", "button");
				attr_dev(span6, "tabindex", "0");
				add_location(span6, file, 752, 6, 26970);
				attr_dev(div1, "class", "heading svelte-12b0lrl");
				add_location(div1, file, 716, 4, 25933);
				attr_dev(h30, "id", "recordStatus");
				attr_dev(h30, "class", "svelte-12b0lrl");
				add_location(h30, file, 777, 6, 27698);
				attr_dev(div2, "id", "recordedTestCases");
				attr_dev(div2, "class", "svelte-12b0lrl");
				add_location(div2, file, 778, 6, 27732);
				attr_dev(h31, "id", "testStatus");
				attr_dev(h31, "class", "svelte-12b0lrl");
				add_location(h31, file, 779, 6, 27773);
				attr_dev(div3, "id", "testResults");
				attr_dev(div3, "class", "svelte-12b0lrl");
				add_location(div3, file, 780, 6, 27805);
				attr_dev(button3, "id", "viewCompleteSummaryButton");
				attr_dev(button3, "class", "svelte-12b0lrl");
				add_location(button3, file, 781, 6, 27840);
				attr_dev(button4, "id", "viewTestLogsButton");
				attr_dev(button4, "class", "svelte-12b0lrl");
				add_location(button4, file, 784, 6, 27970);
				attr_dev(button5, "id", "viewRecordLogsButton");
				attr_dev(button5, "class", "svelte-12b0lrl");
				add_location(button5, file, 787, 6, 28073);
				attr_dev(hr, "id", "completeSummaryHr");
				attr_dev(hr, "class", "svelte-12b0lrl");
				add_location(hr, file, 790, 6, 28180);
				attr_dev(div4, "class", "statusdiv svelte-12b0lrl");
				attr_dev(div4, "id", "statusdiv");
				add_location(div4, file, 776, 4, 27653);
				attr_dev(div5, "class", "header svelte-12b0lrl");
				add_location(div5, file, 715, 2, 25908);
				attr_dev(path2, "fill", "#FF914D");
				attr_dev(path2, "d", "M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6");
				attr_dev(path2, "opacity", "0.3");
				add_location(path2, file, 816, 11, 28861);
				attr_dev(path3, "fill", "#FF914D");
				attr_dev(path3, "d", "M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6");
				add_location(path3, file, 820, 12, 29008);
				attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg2, "width", "35px");
				attr_dev(svg2, "height", "35px");
				attr_dev(svg2, "viewBox", "0 0 24 24");
				add_location(svg2, file, 811, 8, 28723);
				attr_dev(div6, "class", "card-icon svelte-12b0lrl");
				add_location(div6, file, 810, 6, 28691);
				attr_dev(div7, "class", "card-text svelte-12b0lrl");
				add_location(div7, file, 826, 6, 29222);
				attr_dev(div8, "class", "card-arrow svelte-12b0lrl");
				add_location(div8, file, 827, 6, 29275);
				attr_dev(div9, "class", "card svelte-12b0lrl");
				attr_dev(div9, "tabindex", "0");
				attr_dev(div9, "role", "button");
				attr_dev(div9, "id", "startRecordingButton");
				add_location(div9, file, 801, 4, 28447);
				attr_dev(div10, "class", "card-icon replay-icon svelte-12b0lrl");
				add_location(div10, file, 838, 6, 29558);
				attr_dev(div11, "class", "card-text svelte-12b0lrl");
				add_location(div11, file, 839, 6, 29606);
				attr_dev(div12, "class", "card-arrow svelte-12b0lrl");
				add_location(div12, file, 840, 6, 29659);
				attr_dev(div13, "class", "card svelte-12b0lrl");
				attr_dev(div13, "tabindex", "0");
				attr_dev(div13, "role", "button");
				attr_dev(div13, "id", "startTestingButton");
				add_location(div13, file, 829, 4, 29322);
				attr_dev(div14, "class", "section svelte-12b0lrl");
				attr_dev(div14, "id", "buttonsSection");
				add_location(div14, file, 800, 2, 28401);
				attr_dev(div15, "class", "loader svelte-12b0lrl");
				attr_dev(div15, "id", "loader");
				add_location(div15, file, 857, 2, 30072);
				attr_dev(div16, "class", "container baloo-2-custom svelte-12b0lrl");
				add_location(div16, file, 661, 0, 24127);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div16, anchor);
				append_dev(div16, div0);
				append_dev(div0, button0);
				append_dev(button0, span0);
				append_dev(button0, t1);
				if_block0.m(button0, null);
				append_dev(div0, t2);
				append_dev(div0, button1);
				append_dev(button1, span1);
				append_dev(button1, t3);
				append_dev(button1, span2);
				append_dev(div0, t5);
				append_dev(div0, button2);
				append_dev(button2, span3);
				append_dev(button2, t6);
				append_dev(button2, span4);
				append_dev(div16, t8);
				append_dev(div16, div5);
				append_dev(div5, div1);
				if_block1.m(div1, null);
				append_dev(div1, t9);
				append_dev(div1, span5);
				append_dev(span5, svg0);
				append_dev(svg0, path0);
				append_dev(div1, t10);
				append_dev(div1, span6);
				append_dev(span6, svg1);
				append_dev(svg1, path1);
				/*span6_binding*/ ctx[26](span6);
				append_dev(div5, t11);
				append_dev(div5, div4);
				append_dev(div4, h30);
				append_dev(div4, t12);
				append_dev(div4, div2);
				append_dev(div4, t13);
				append_dev(div4, h31);
				append_dev(div4, t14);
				append_dev(div4, div3);
				append_dev(div4, t15);
				append_dev(div4, button3);
				append_dev(div4, t17);
				append_dev(div4, button4);
				append_dev(div4, t19);
				append_dev(div4, button5);
				append_dev(div4, t21);
				append_dev(div4, hr);
				append_dev(div16, t22);
				if (if_block2) if_block2.m(div16, null);
				append_dev(div16, t23);
				append_dev(div16, div14);
				append_dev(div14, div9);
				append_dev(div9, div6);
				append_dev(div6, svg2);
				append_dev(svg2, path2);
				append_dev(svg2, path3);
				append_dev(div9, t24);
				append_dev(div9, div7);
				append_dev(div9, t26);
				append_dev(div9, div8);
				/*div9_binding*/ ctx[28](div9);
				append_dev(div14, t28);
				append_dev(div14, div13);
				append_dev(div13, div10);
				append_dev(div13, t29);
				append_dev(div13, div11);
				append_dev(div13, t31);
				append_dev(div13, div12);
				/*div13_binding*/ ctx[30](div13);
				append_dev(div16, t33);
				if (if_block3) if_block3.m(div16, null);
				append_dev(div16, t34);
				append_dev(div16, div15);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*click_handler*/ ctx[21], false),
						listen_dev(button1, "click", /*handlePreviousTestResults*/ ctx[12], false),
						listen_dev(button2, "click", /*handleOpenConfig*/ ctx[13], false),
						listen_dev(span5, "click", /*click_handler_1*/ ctx[22], false),
						listen_dev(span5, "keydown", /*keydown_handler*/ ctx[23], false),
						listen_dev(span6, "click", /*click_handler_2*/ ctx[24], false),
						listen_dev(span6, "keydown", /*keydown_handler_1*/ ctx[25], false),
						listen_dev(button3, "click", /*handleCompleteSummary*/ ctx[11], false),
						listen_dev(button4, "click", /*handleViewTestLogs*/ ctx[14], false),
						listen_dev(button5, "click", /*handleViewRecordLogs*/ ctx[15], false),
						listen_dev(div9, "click", /*toggleRecording*/ ctx[8], false),
						listen_dev(div9, "keydown", /*keydown_handler_2*/ ctx[27], false),
						listen_dev(div13, "click", /*toggleTesting*/ ctx[9], false),
						listen_dev(div13, "keydown", /*keydown_handler_3*/ ctx[29], false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(ctx);

					if (if_block0) {
						if_block0.c();
						if_block0.m(button0, null);
					}
				}

				if (dirty[0] & /*selectedIconButton*/ 32 && button0_class_value !== (button0_class_value = "icon-button " + (/*selectedIconButton*/ ctx[5] === 1 ? 'selected' : '') + " svelte-12b0lrl")) {
					attr_dev(button0, "class", button0_class_value);
				}

				if (dirty[0] & /*selectedIconButton*/ 32 && button1_class_value !== (button1_class_value = "icon-button " + (/*selectedIconButton*/ ctx[5] === 2 ? 'selected' : '') + " svelte-12b0lrl")) {
					attr_dev(button1, "class", button1_class_value);
				}

				if (dirty[0] & /*selectedIconButton*/ 32 && button2_class_value !== (button2_class_value = "icon-button " + (/*selectedIconButton*/ ctx[5] === 3 ? 'selected' : '') + " svelte-12b0lrl")) {
					attr_dev(button2, "class", button2_class_value);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(ctx);

					if (if_block1) {
						if_block1.c();
						if_block1.m(div1, t9);
					}
				}

				if (/*selectedIconButton*/ ctx[5] === 2) {
					if (if_block2) ; else {
						if_block2 = create_if_block_3(ctx);
						if_block2.c();
						if_block2.m(div16, t23);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (/*showSteps*/ ctx[6]) {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty[0] & /*showSteps*/ 64) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(div16, t34);
					}
				} else if (if_block3) {
					group_outros();

					transition_out(if_block3, 1, 1, () => {
						if_block3 = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				transition_in(if_block3);
			},
			o: function outro(local) {
				transition_out(if_block3);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div16);
				}

				if_block0.d();
				if_block1.d();
				/*span6_binding*/ ctx[26](null);
				if (if_block2) if_block2.d();
				/*div9_binding*/ ctx[28](null);
				/*div13_binding*/ ctx[30](null);
				if (if_block3) if_block3.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function resetUI() {
		const recordedTestCasesDiv = document.getElementById("recordedTestCases");
		const recordStatus = document.getElementById("recordStatus");
		const testStatus = document.getElementById("testStatus");
		const viewTestLogsButton = document.getElementById("viewTestLogsButton");
		const viewRecordLogsButton = document.getElementById("viewRecordLogsButton");
		const testResultsDiv = document.getElementById("testResults");
		const lastTestResultsDiv = document.getElementById("lastTestResults");
		const testSuiteNameDiv = document.getElementById("testSuiteName");
		const totalTestCasesDiv = document.getElementById("totalTestCases");
		const testCasesPassedDiv = document.getElementById("testCasesPassed");
		const testCasesFailedDiv = document.getElementById("testCasesFailed");
		const viewCompleteSummaryButton = document.getElementById("viewCompleteSummaryButton");
		const upperOutputDiv = document.getElementById("upperOutputDiv");

		if (recordedTestCasesDiv) {
			recordedTestCasesDiv.innerHTML = "";
		}

		if (recordStatus) {
			recordStatus.style.display = "none";
			recordStatus.textContent = "";
		}

		if (viewRecordLogsButton) {
			viewRecordLogsButton.style.display = "none";
		}

		if (viewTestLogsButton) {
			viewTestLogsButton.style.display = "none";
		}

		if (testResultsDiv) {
			testResultsDiv.innerHTML = "";
		}

		if (testStatus) {
			testStatus.textContent = "";
			testStatus.style.display = "none";
		}

		if (testSuiteNameDiv) {
			testSuiteNameDiv.innerHTML = "";
		}

		if (totalTestCasesDiv) {
			totalTestCasesDiv.innerHTML = "";
		}

		if (testCasesPassedDiv) {
			testCasesPassedDiv.innerHTML = "";
		}

		if (testCasesFailedDiv) {
			testCasesFailedDiv.innerHTML = "";
		}

		if (lastTestResultsDiv) {
			lastTestResultsDiv.innerHTML = "";
		}

		if (viewCompleteSummaryButton) {
			viewCompleteSummaryButton.style.display = "none";
		}

		if (upperOutputDiv) {
			upperOutputDiv.style.display = "none";
		}
	}

	function formatDate(date) {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('KeployHome', slots, []);

		onMount(() => {
			const recordStatus = document.getElementById("recordStatus");
			const recordedTestCasesDiv = document.getElementById("recordedTestCases");
			const viewTestLogsButton = document.getElementById("viewTestLogsButton");
			const viewRecordLogsButton = document.getElementById("viewRecordLogsButton");
			const stopTestButton = document.getElementById("stopTestingButton");
			const testResultsDiv = document.getElementById("testResults");
			const testStatus = document.getElementById("testStatus");

			window.addEventListener("message", event => {
				const message = event.data;
				console.log("From Home", message);

				switch (message.type) {
					case "updateStatus":
						console.log("message.value", message.value);
						break;
					case "error":
						console.error(message.value);
						break;
					case "success":
						console.log(message.value);
						break;
					case "testcaserecorded":
						console.log("message.textContent", message.textContent);
						recordStatus.style.display = "block";
						recordedTestCasesDiv.style.display = "grid";
						if (message.error === true) {
							recordStatus.textContent = `Failed To Record Test Cases`;
							recordStatus.classList.add("error");
							const errorMessage = document.createElement("p");
							errorMessage.textContent = message.textContent;
							errorMessage.classList.add("error");
							recordedTestCasesDiv.appendChild(errorMessage);
							viewRecordLogsButton.style.display = "block";
							break;
						}
						if (message.noTestCases === true) {
							console.log("I am Called");
							viewRecordLogsButton.style.display = "block";
							recordStatus.textContent = `No Test Cases Recorded`;
							recordedTestCasesDiv.style.display = "none";
							recordStatus.classList.add("info");
							break;
						}
						console.log("Why i am getting called");
						recordStatus.textContent = `Test Cases Recorded`;
						recordStatus.classList.add("success");
						console.log(message.textContent);
						if (recordedTestCasesDiv) {
							let testSetDropdown = document.getElementById(message.testSetName);

							if (!testSetDropdown) {
								// Create a dropdown for the new test set
								testSetDropdown = document.createElement("div");

								testSetDropdown.id = message.testSetName;
								testSetDropdown.classList.add("dropdown-container");

								// Create a button to act as the dropdown toggle
								const dropdownToggle = document.createElement("div");

								dropdownToggle.classList.add("dropdown-header");

								// Create the toggle text
								const toggleText = document.createElement("span");

								// bind:this={startRecordingButton}
								toggleText.textContent = message.testSetName;

								// Create the dropdown icon
								const dropdownIcon = document.createElement("span");

								dropdownIcon.className = "dropdown-icon";

								// Append text and icon to the toggle
								dropdownToggle.appendChild(toggleText);

								dropdownToggle.appendChild(dropdownIcon);

								// Create a container for the test cases
								const testCaseContainer = document.createElement("div");

								testCaseContainer.classList.add("dropdown-content");
								testCaseContainer.style.display = "none"; // Hide initially

								// Add toggle functionality
								dropdownToggle.addEventListener("click", () => {
									testCaseContainer.style.display = testCaseContainer.style.display === "none"
									? "block"
									: "none";

									dropdownIcon.classList.toggle("open"); // Update icon based on dropdown state
								});

								// Append the toggle and container to the dropdown
								testSetDropdown.appendChild(dropdownToggle);

								testSetDropdown.appendChild(testCaseContainer);
								recordedTestCasesDiv.appendChild(testSetDropdown);
							}

							// Create the test case element
							const testCaseElement = document.createElement("button");

							testCaseElement.classList.add("recordedTestCase");

							testCaseElement.addEventListener("click", async () => {
								vscode.postMessage({
									type: "openRecordedTestFile",
									value: message.path
								});
							});

							testCaseElement.textContent = message.textContent;

							// Find the container and append the test case element
							const testCaseContainer = testSetDropdown.querySelector(".dropdown-content");

							testCaseContainer.appendChild(testCaseElement);
						}
						break;
					case "recordfile":
						const projectFolder = document.getElementById("projectFolder");
						if (projectFolder) {
							projectFolder.style.display = "block";
							projectFolder.value = message.value;
							FilePath = message.value;
						}
						break;
					case "testResults":
						console.log("message.value", message.value);
						const testCaseElement = document.createElement("p");
						//click the stop testing button
						if (stopTestButton) {
							stopTestButton.click();
						}
						testCaseElement.textContent = message.textSummary;
						if (message.textSummary.includes("test passed")) {
							testCaseElement.classList.add("success");
						} else if (message.textSummary.includes("test failed")) {
							//split the textSummary
							const numErrors = message.textSummary.split(":")[1];

							if (numErrors !== " 0") {
								viewTestLogsButton.style.display = "block";
							}

							testCaseElement.classList.add("error");
						} else {
							testCaseElement.classList.add("info");
						}
						if (message.isCompleteSummary === true) {
							console.log("message.isCompleteSummary", message.isCompleteSummary);
							console.log("message.textSummary", message.textSummary);
							let messageList = message.textSummary.split("\t");

							//remove all "" from the list
							messageList = messageList.filter(function (el) {
								return el !== "";
							});

							console.log("messageList", messageList);
							const testSuiteNameElement = document.createElement("p");
							testSuiteNameElement.textContent = messageList[0];
							testSuiteNameDiv.appendChild(testSuiteNameElement);
							const testCasesTotalElement = document.createElement("p");
							testCasesTotalElement.textContent = messageList[1];
							totalTestCasesDiv.appendChild(testCasesTotalElement);
							const testCasesPassedElement = document.createElement("p");
							testCasesPassedElement.textContent = messageList[2];
							testCasesPassedDiv.appendChild(testCasesPassedElement);
							const testCasesFailedElement = document.createElement("p");
							testCasesFailedElement.textContent = messageList[3];
							testCasesFailedDiv.appendChild(testCasesFailedElement);
							return;
						}
						if (message.error === true) {
							viewCompleteSummaryButton.style.display = "none";
							viewTestLogsButton.style.display = "block";
						} else {
							viewCompleteSummaryButton.style.display = "block";
							completeSummaryHr.style.display = "block";
						}
						if (message.error === true) {
							viewTestLogsButton.style.display = "block";

							if (testStatus) {
								testStatus.style.display = "block";
								testStatus.textContent = message.value;
								testStatus.classList.add("error");
							} else {
								testResultsDiv.innerHTML = `<p class="error">${message.value}</p>`;
							}
						}
						testResultsDiv.appendChild(testCaseElement);
						break;
					case "testfile":
						const Folder = document.getElementById("projectFolder");
						if (Folder) {
							Folder.value = message.value;
							FilePath = message.value;
						}
						const testCommandDiv = document.getElementById("testCommandInput");
						if (testCommandDiv) {
							testCommandDiv.style.display = "block";
						}
						break;
					case "aggregatedTestResults":
						console.log("message.value", message.value);
						const lastTestResultsDiv = document.getElementById("lastTestResults");
						const totalTestCasesDiv = document.getElementById("totalTestCases");
						const testSuiteNameDiv = document.getElementById("testSuiteName");
						const testCasesPassedDiv = document.getElementById("testCasesPassed");
						const testCasesFailedDiv = document.getElementById("testCasesFailed");
						// Clear previous content
						if (totalTestCasesDiv) {
							totalTestCasesDiv.innerHTML = "";
						}
						if (testSuiteNameDiv) {
							testSuiteNameDiv.innerHTML = "";
						}
						if (testCasesPassedDiv) {
							testCasesPassedDiv.innerHTML = "";
						}
						if (testCasesFailedDiv) {
							testCasesFailedDiv.innerHTML = "";
						}
						if (message.error === true) {
							if (lastTestResultsDiv) {
								const errorElement = document.createElement("p");
								errorElement.textContent = "No Test Runs Found";
								errorElement.classList.add("error");
								errorElement.id = "errorElement";
								lastTestResultsDiv.appendChild(errorElement);
							}
						} else {
							// Group tests by date
							const testsByDate = {};

							message.data.testResults.forEach(test => {
								const date = test.date;

								if (!testsByDate[date]) {
									testsByDate[date] = [];
								}

								testsByDate[date].push(test);
							});

							const testCasesTotalElement = document.createElement("p");
							testCasesTotalElement.textContent = `Total Test Cases : ${message.data.total}`;

							if (totalTestCasesDiv) {
								totalTestCasesDiv.appendChild(testCasesTotalElement);
							}

							const testCasesPassedElement = document.createElement("p");
							testCasesPassedElement.textContent = `Test Cases Passed : ${message.data.success}`;

							if (testCasesPassedDiv) {
								testCasesPassedDiv.appendChild(testCasesPassedElement);
							}

							const testCasesFailedElement = document.createElement("p");
							testCasesFailedElement.textContent = `Test Cases Failed : ${message.data.failure}`;

							if (testCasesFailedDiv) {
								testCasesFailedDiv.appendChild(testCasesFailedElement);
							}

							// Create and append dropdown structure based on testsByDate
							const dropdownContainer = document.createElement("div");

							dropdownContainer.className = "dropdown-container";

							for (const date in testsByDate) {
								if (testsByDate.hasOwnProperty(date)) {
									const tests = testsByDate[date];
									const dropdownHeader = document.createElement("div");
									dropdownHeader.className = "dropdown-header";

									// Get current date
									const currentDate = new Date();

									const currentDateString = formatDate(currentDate);

									// Get yesterday's date
									const yesterday = new Date(currentDate);

									yesterday.setDate(currentDate.getDate() - 1);
									const yesterdayDateString = formatDate(yesterday);

									if (currentDateString === date) {
										dropdownHeader.textContent = `Today`;
									} else if (yesterdayDateString === date) {
										dropdownHeader.textContent = `Yesterday`;
									} else {
										dropdownHeader.textContent = `${date}`;
									}

									// Add dropdown icon
									const dropdownIcon = document.createElement("span");

									dropdownIcon.className = "dropdown-icon";
									dropdownHeader.appendChild(dropdownIcon);

									dropdownHeader.onclick = () => {
										const content = document.getElementById(`dropdown${date}`);

										if (content) {
											content.classList.toggle("show");
											dropdownIcon.classList.toggle("open"); // Update icon based on dropdown state
										}
									};

									const dropdownContent = document.createElement("div");
									dropdownContent.id = `dropdown${date}`;
									dropdownContent.className = "dropdown-content";

									tests.forEach((test, index) => {
										// Append individual test details
										const testMethod = document.createElement("div");

										testMethod.textContent = `${test.method}`;

										if (test.status === "PASSED") {
											testMethod.classList.add("testSuccess");
										} else {
											testMethod.classList.add("testError");
										}

										dropdownContent.appendChild(testMethod);
										const testName = document.createElement("div");
										testName.textContent = `${test.name}`;
										testName.classList.add("testName");
										dropdownContent.appendChild(testName);

										testName.addEventListener("click", async () => {
											vscode.postMessage({
												type: "openTestFile",
												value: test.testCasePath
											});
										});

										testMethod.addEventListener("click", async () => {
											vscode.postMessage({
												type: "openTestFile",
												value: test.testCasePath
											});
										});
									});

									dropdownContainer.appendChild(dropdownHeader);
									dropdownContainer.appendChild(dropdownContent);
								}
							}

							if (lastTestResultsDiv) {
								lastTestResultsDiv.appendChild(dropdownContainer);
							}
						}
				}
			});
		});

		let startRecordingButton;
		let startTestingButton;
		let buttonsSection = document.getElementById("buttonsSection");

		// let stopRecordingButton;
		let stopTestingButton;

		let isRecording = false;
		let isTesting = false;
		let showSteps = false;
		let selectedIconButton = 1;
		let settingsIcon = document.querySelector(".settings-icon");

		const selectButton = buttonNumber => {
			console.log("buttonNumber", buttonNumber);
			$$invalidate(5, selectedIconButton = buttonNumber);

			if (buttonNumber !== 2) {
				clearLastTestResults();
			}

			if (buttonNumber !== 1) {
				console.log("setting display none");
				$$invalidate(0, startRecordingButton.style.display = "none", startRecordingButton);
				$$invalidate(1, startTestingButton.style.display = "none", startTestingButton);
			}

			if (buttonNumber === 1) {
				$$invalidate(0, startRecordingButton.style.display = "flex", startRecordingButton);
				$$invalidate(1, startTestingButton.style.display = "flex", startTestingButton);
			}

			if (buttonNumber === 3) {
				settingsIcon.classList.toggle("open"); // Update icon based on dropdown state
			}
		};

		const clearLastTestResults = () => {
			const testSuiteName = document.getElementById("testSuiteName");
			const totalTestCases = document.getElementById("totalTestCases");
			const testCasesPassed = document.getElementById("testCasesPassed");
			const testCasesFailed = document.getElementById("testCasesFailed");
			const errorElement = document.getElementById("errorElement");
			if (testSuiteName) testSuiteName.textContent = "";
			if (totalTestCases) totalTestCases.textContent = "";
			if (testCasesPassed) testCasesPassed.textContent = "";
			if (testCasesFailed) testCasesFailed.textContent = "";
			if (errorElement) errorElement.style.display = "none";
		};

		//   const triggerAnimation = () => {
		//   if (anim.currentFrame > intro && anim.currentFrame <= stopFrame - intro - 1) {
		//     console.log('playing from stop to record');
		//     anim.playSegments([stopFrame, recFrame], true);
		//   } else {
		//     console.log('playing to stop icon');
		//     anim.playSegments([intro, stopFrame], true);
		//   }
		// };
		const toggleRecording = () => {
			$$invalidate(3, isRecording = !isRecording);
			$$invalidate(4, isTesting = false);
			$$invalidate(6, showSteps = !showSteps);
			resetUI();

			// triggerAnimation();
			vscode.postMessage({
				type: "startRecordingCommand",
				value: `Recording Command...`
			});

			clearLastTestResults();
		};

		const toggleTesting = () => {
			$$invalidate(4, isTesting = !isTesting);
			$$invalidate(3, isRecording = false);
			$$invalidate(6, showSteps = !showSteps);
			resetUI();

			// triggerAnimation();
			vscode.postMessage({
				type: "startTestingCommand",
				value: `Testing Command...`
			});
		};

		const stop = () => {
			$$invalidate(3, isRecording = false);
			$$invalidate(4, isTesting = false);
			$$invalidate(6, showSteps = false);
		}; // triggerAnimation();

		const handleCompleteSummary = () => {
			console.log("viewCompleteSummaryButton clicked");
			vscode.postMessage({ type: "navigate", value: `Testresults` });

			vscode.postMessage({
				type: "viewCompleteSummary",
				value: `View Complete Summary`
			});
		};

		const handlePreviousTestResults = () => {
			vscode.postMessage({
				type: "viewPreviousTestResults",
				value: `viewPreviousTestResults`
			});

			selectButton(2);
		};

		const handleOpenConfig = () => {
			vscode.postMessage({
				type: "openConfigFile",
				value: `/keploy.yml`
			});

			selectButton(3);
		};

		const handleViewTestLogs = () => {
			vscode.postMessage({ type: "viewLogs", value: `test_mode.log` });
		};

		const handleViewRecordLogs = () => {
			vscode.postMessage({
				type: "viewLogs",
				value: `record_mode.log`
			});
		};

		const handleStopRecord = () => {
			vscode.postMessage({
				type: "stopRecordingCommand",
				value: `Stop Recording`
			});
		};

		const handleStopTesting = () => {
			vscode.postMessage({
				type: "stopTestingCommand",
				value: `Stop Testing`
			});
		};

		const recordingSteps = [
			"Step 1: Make sure the database is running",
			"Step 2: The command is present in Config",
			"Step 3: Make API Calls",
			"Step 4: Save Recording"
		];

		const replayingSteps = [
			"Step 1: Initialize Replay",
			"Step 2: Running Test Cases",
			"Step 3: Execute Replay",
			"Step 4: Verify Test Results"
		];

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<KeployHome> was created with unknown prop '${key}'`);
		});

		const click_handler = () => selectButton(1);

		const click_handler_1 = () => {
			stop();
			handleStopRecord();
		};

		const keydown_handler = e => e.key === "Enter" && stop();

		const click_handler_2 = () => {
			stop();
			handleStopTesting();
		};

		const keydown_handler_1 = e => e.key === "Enter" && stop();

		function span6_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				stopTestingButton = $$value;
				(((((($$invalidate(2, stopTestingButton), $$invalidate(0, startRecordingButton)), $$invalidate(3, isRecording)), $$invalidate(4, isTesting)), $$invalidate(5, selectedIconButton)), $$invalidate(1, startTestingButton)), $$invalidate(20, buttonsSection));
			});
		}

		const keydown_handler_2 = e => e.key === "Enter" && toggleRecording();

		function div9_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				startRecordingButton = $$value;
				((((($$invalidate(0, startRecordingButton), $$invalidate(3, isRecording)), $$invalidate(4, isTesting)), $$invalidate(5, selectedIconButton)), $$invalidate(1, startTestingButton)), $$invalidate(20, buttonsSection));
			});
		}

		const keydown_handler_3 = e => e.key === "Enter" && toggleTesting();

		function div13_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				startTestingButton = $$value;
				((((($$invalidate(1, startTestingButton), $$invalidate(0, startRecordingButton)), $$invalidate(3, isRecording)), $$invalidate(4, isTesting)), $$invalidate(5, selectedIconButton)), $$invalidate(20, buttonsSection));
			});
		}

		$$self.$capture_state = () => ({
			fly,
			onMount,
			startRecordingButton,
			startTestingButton,
			buttonsSection,
			stopTestingButton,
			isRecording,
			isTesting,
			showSteps,
			selectedIconButton,
			settingsIcon,
			resetUI,
			selectButton,
			clearLastTestResults,
			toggleRecording,
			toggleTesting,
			stop,
			handleCompleteSummary,
			handlePreviousTestResults,
			handleOpenConfig,
			handleViewTestLogs,
			handleViewRecordLogs,
			handleStopRecord,
			handleStopTesting,
			formatDate,
			recordingSteps,
			replayingSteps
		});

		$$self.$inject_state = $$props => {
			if ('startRecordingButton' in $$props) $$invalidate(0, startRecordingButton = $$props.startRecordingButton);
			if ('startTestingButton' in $$props) $$invalidate(1, startTestingButton = $$props.startTestingButton);
			if ('buttonsSection' in $$props) $$invalidate(20, buttonsSection = $$props.buttonsSection);
			if ('stopTestingButton' in $$props) $$invalidate(2, stopTestingButton = $$props.stopTestingButton);
			if ('isRecording' in $$props) $$invalidate(3, isRecording = $$props.isRecording);
			if ('isTesting' in $$props) $$invalidate(4, isTesting = $$props.isTesting);
			if ('showSteps' in $$props) $$invalidate(6, showSteps = $$props.showSteps);
			if ('selectedIconButton' in $$props) $$invalidate(5, selectedIconButton = $$props.selectedIconButton);
			if ('settingsIcon' in $$props) settingsIcon = $$props.settingsIcon;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*startRecordingButton, isRecording, isTesting, selectedIconButton, startTestingButton, buttonsSection*/ 1048635) {
				{
					if (startRecordingButton) {
						$$invalidate(
							0,
							startRecordingButton.style.display = isRecording || isTesting || selectedIconButton !== 1
							? "none"
							: "flex",
							startRecordingButton
						);
					}

					if (startTestingButton) {
						$$invalidate(
							1,
							startTestingButton.style.display = isRecording || isTesting || selectedIconButton !== 1
							? "none"
							: "flex",
							startTestingButton
						);
					}

					if (buttonsSection) {
						$$invalidate(
							20,
							buttonsSection.style.display = isRecording || isTesting || selectedIconButton !== 1
							? "none"
							: "flex",
							buttonsSection
						);
					}

					// if (stopRecordingButton) {
					//   stopRecordingButton.style.display = isRecording ? 'inline' : 'none';
					// }
					// if (stopTestingButton) {
					//   stopTestingButton.style.display = isTesting ? 'inline' : 'none';
					// }
					const loader = document.getElementById("loader");

					if (loader) {
						loader.style.display = isRecording || isTesting ? "block" : "none";
					}

					const stopRecordingButton = document.getElementById("stopRecordingButton");

					if (stopRecordingButton) {
						stopRecordingButton.style.display = isRecording ? "inline" : "none";
					}

					const stopTestingButton = document.getElementById("stopTestingButton");

					if (stopTestingButton) {
						stopTestingButton.style.display = isTesting ? "inline" : "none";
					}

					const statusdiv = document.getElementById("statusdiv");

					if (statusdiv) {
						statusdiv.style.display = selectedIconButton === 1 ? "block" : "none";
					}

					document.getElementById("viewTestLogsButton");
					document.getElementById("viewRecordLogsButton");
				}
			}
		};

		return [
			startRecordingButton,
			startTestingButton,
			stopTestingButton,
			isRecording,
			isTesting,
			selectedIconButton,
			showSteps,
			selectButton,
			toggleRecording,
			toggleTesting,
			stop,
			handleCompleteSummary,
			handlePreviousTestResults,
			handleOpenConfig,
			handleViewTestLogs,
			handleViewRecordLogs,
			handleStopRecord,
			handleStopTesting,
			recordingSteps,
			replayingSteps,
			buttonsSection,
			click_handler,
			click_handler_1,
			keydown_handler,
			click_handler_2,
			keydown_handler_1,
			span6_binding,
			keydown_handler_2,
			div9_binding,
			keydown_handler_3,
			div13_binding
		];
	}

	class KeployHome extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "KeployHome",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new KeployHome({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=KeployHome.js.map
