var app = (function (lottie) {
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
		child_ctx[28] = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[28] = list[i];
		return child_ctx;
	}

	// (359:8) {:else}
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
				add_location(path0, file, 359, 99, 9778);
				attr_dev(path1, "fill", "#FF914D");
				attr_dev(path1, "d", "M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6");
				add_location(path1, file, 359, 199, 9878);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "35px");
				attr_dev(svg, "height", "35px");
				attr_dev(svg, "viewBox", "0 0 24 24");
				add_location(svg, file, 359, 12, 9691);
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
			source: "(359:8) {:else}",
			ctx
		});

		return block;
	}

	// (357:8) {#if isRecording}
	function create_if_block_6(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill", "#FF914D");
				attr_dev(path, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path, file, 357, 99, 9495);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "35px");
				attr_dev(svg, "height", "35px");
				attr_dev(svg, "viewBox", "0 0 24 24");
				add_location(svg, file, 357, 12, 9408);
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
			source: "(357:8) {#if isRecording}",
			ctx
		});

		return block;
	}

	// (379:6) {:else}
	function create_else_block(ctx) {
		let h1;

		let t_value = (/*isRecording*/ ctx[4]
		? "Recording Started"
		: /*isTesting*/ ctx[5]
			? "Testing Started"
			: "Running Keploy !!") + "";

		let t;

		const block = {
			c: function create() {
				h1 = element("h1");
				t = text(t_value);
				attr_dev(h1, "class", "svelte-9t8x9t");
				add_location(h1, file, 379, 8, 10855);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
				append_dev(h1, t);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*isRecording, isTesting*/ 48 && t_value !== (t_value = (/*isRecording*/ ctx[4]
				? "Recording Started"
				: /*isTesting*/ ctx[5]
					? "Testing Started"
					: "Running Keploy !!") + "")) set_data_dev(t, t_value);
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
			source: "(379:6) {:else}",
			ctx
		});

		return block;
	}

	// (377:41) 
	function create_if_block_5(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element("h1");
				h1.textContent = "View Previous Test Results";
				attr_dev(h1, "class", "svelte-9t8x9t");
				add_location(h1, file, 377, 8, 10797);
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
			source: "(377:41) ",
			ctx
		});

		return block;
	}

	// (375:6) {#if selectedIconButton === 3}
	function create_if_block_4(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element("h1");
				h1.textContent = "Make changes to keploy config !!";
				attr_dev(h1, "class", "svelte-9t8x9t");
				add_location(h1, file, 375, 8, 10705);
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
			source: "(375:6) {#if selectedIconButton === 3}",
			ctx
		});

		return block;
	}

	// (401:2) {#if selectedIconButton === 2}
	function create_if_block_3(ctx) {
		let div;
		let h3;

		const block = {
			c: function create() {
				div = element("div");
				h3 = element("h3");
				h3.innerHTML = ``;
				attr_dev(h3, "id", "testSuiteName");
				add_location(h3, file, 402, 12, 12332);
				attr_dev(div, "id", "lastTestResults");
				add_location(div, file, 401, 8, 12293);
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
			source: "(401:2) {#if selectedIconButton === 2}",
			ctx
		});

		return block;
	}

	// (422:2) {#if showSteps}
	function create_if_block(ctx) {
		let div;
		let div_transition;
		let current;

		function select_block_type_2(ctx, dirty) {
			if (/*isRecording*/ ctx[4]) return create_if_block_1;
			if (/*isTesting*/ ctx[5]) return create_if_block_2;
		}

		let current_block_type = select_block_type_2(ctx);
		let if_block = current_block_type && current_block_type(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (if_block) if_block.c();
				attr_dev(div, "class", "steps svelte-9t8x9t");
				add_location(div, file, 422, 4, 13467);
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
			source: "(422:2) {#if showSteps}",
			ctx
		});

		return block;
	}

	// (428:26) 
	function create_if_block_2(ctx) {
		let each_1_anchor;
		let each_value_1 = ensure_array_like_dev(/*replayingSteps*/ ctx[13]);
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
				if (dirty[0] & /*replayingSteps*/ 8192) {
					each_value_1 = ensure_array_like_dev(/*replayingSteps*/ ctx[13]);
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
			source: "(428:26) ",
			ctx
		});

		return block;
	}

	// (424:6) {#if isRecording}
	function create_if_block_1(ctx) {
		let each_1_anchor;
		let each_value = ensure_array_like_dev(/*recordingSteps*/ ctx[12]);
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
				if (dirty[0] & /*recordingSteps*/ 4096) {
					each_value = ensure_array_like_dev(/*recordingSteps*/ ctx[12]);
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
			source: "(424:6) {#if isRecording}",
			ctx
		});

		return block;
	}

	// (429:8) {#each replayingSteps as step}
	function create_each_block_1(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = `${/*step*/ ctx[28]}`;
				attr_dev(div, "class", "step svelte-9t8x9t");
				add_location(div, file, 429, 10, 13725);
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
			source: "(429:8) {#each replayingSteps as step}",
			ctx
		});

		return block;
	}

	// (425:8) {#each recordingSteps as step}
	function create_each_block(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = `${/*step*/ ctx[28]}`;
				attr_dev(div, "class", "step svelte-9t8x9t");
				add_location(div, file, 425, 10, 13602);
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
			source: "(425:8) {#each recordingSteps as step}",
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
		let hr;
		let t18;
		let t19;
		let div14;
		let div9;
		let div6;
		let svg2;
		let path2;
		let path3;
		let t20;
		let div7;
		let t22;
		let div8;
		let t24;
		let div13;
		let div10;
		let t25;
		let div11;
		let t27;
		let div12;
		let t29;
		let t30;
		let div15;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (/*isRecording*/ ctx[4]) return create_if_block_6;
			return create_else_block_1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block0 = current_block_type(ctx);

		function select_block_type_1(ctx, dirty) {
			if (/*selectedIconButton*/ ctx[6] === 3) return create_if_block_4;
			if (/*selectedIconButton*/ ctx[6] === 2) return create_if_block_5;
			return create_else_block;
		}

		let current_block_type_1 = select_block_type_1(ctx);
		let if_block1 = current_block_type_1(ctx);
		let if_block2 = /*selectedIconButton*/ ctx[6] === 2 && create_if_block_3(ctx);
		let if_block3 = /*showSteps*/ ctx[7] && create_if_block(ctx);

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
				h30.innerHTML = ``;
				t12 = space();
				div2 = element("div");
				t13 = space();
				h31 = element("h3");
				h31.innerHTML = ``;
				t14 = space();
				div3 = element("div");
				t15 = space();
				button3 = element("button");
				button3.textContent = "View Complete Test Summary";
				t17 = space();
				hr = element("hr");
				t18 = space();
				if (if_block2) if_block2.c();
				t19 = space();
				div14 = element("div");
				div9 = element("div");
				div6 = element("div");
				svg2 = svg_element("svg");
				path2 = svg_element("path");
				path3 = svg_element("path");
				t20 = space();
				div7 = element("div");
				div7.textContent = "Record Test Cases";
				t22 = space();
				div8 = element("div");
				div8.textContent = "➔";
				t24 = space();
				div13 = element("div");
				div10 = element("div");
				t25 = space();
				div11 = element("div");
				div11.textContent = "Replay Test Cases";
				t27 = space();
				div12 = element("div");
				div12.textContent = "➔";
				t29 = space();
				if (if_block3) if_block3.c();
				t30 = space();
				div15 = element("div");
				attr_dev(span0, "class", "tooltip svelte-9t8x9t");
				add_location(span0, file, 355, 6, 9327);
				attr_dev(button0, "id", "keploycommands");
				attr_dev(button0, "class", button0_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 1 ? 'selected' : '') + " svelte-9t8x9t");
				add_location(button0, file, 354, 4, 9194);
				attr_dev(span1, "class", "history-icon");
				add_location(span1, file, 364, 6, 10284);
				attr_dev(span2, "class", "tooltip svelte-9t8x9t");
				add_location(span2, file, 365, 6, 10325);
				attr_dev(button1, "id", "displayPreviousTestResults");
				attr_dev(button1, "class", button1_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 2 ? 'selected' : '') + " svelte-9t8x9t");
				add_location(button1, file, 363, 4, 10139);
				attr_dev(span3, "class", "settings-icon");
				add_location(span3, file, 368, 6, 10509);
				attr_dev(span4, "class", "tooltip svelte-9t8x9t");
				add_location(span4, file, 369, 6, 10552);
				attr_dev(button2, "id", "openConfig");
				attr_dev(button2, "class", button2_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 3 ? 'selected' : '') + " svelte-9t8x9t");
				add_location(button2, file, 367, 4, 10380);
				attr_dev(div0, "class", "icon-buttons svelte-9t8x9t");
				add_location(div0, file, 353, 2, 9163);
				attr_dev(path0, "fill", "#FF914D");
				attr_dev(path0, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path0, file, 382, 95, 11240);
				attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg0, "width", "35px");
				attr_dev(svg0, "height", "35px");
				attr_dev(svg0, "viewBox", "0 0 24 24");
				add_location(svg0, file, 382, 8, 11153);
				attr_dev(span5, "class", "stop-button svelte-9t8x9t");
				attr_dev(span5, "id", "stopRecordingButton");
				attr_dev(span5, "role", "button");
				attr_dev(span5, "tabindex", "0");
				add_location(span5, file, 381, 6, 10972);
				attr_dev(path1, "fill", "#FF914D");
				attr_dev(path1, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path1, file, 386, 95, 11693);
				attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg1, "width", "35px");
				attr_dev(svg1, "height", "35px");
				attr_dev(svg1, "viewBox", "0 0 24 24");
				add_location(svg1, file, 386, 8, 11606);
				attr_dev(span6, "class", "stop-button svelte-9t8x9t");
				attr_dev(span6, "id", "stopTestingButton");
				attr_dev(span6, "role", "button");
				attr_dev(span6, "tabindex", "0");
				add_location(span6, file, 385, 6, 11429);
				attr_dev(div1, "class", "heading svelte-9t8x9t");
				add_location(div1, file, 373, 4, 10638);
				attr_dev(h30, "id", "recordStatus");
				attr_dev(h30, "class", "svelte-9t8x9t");
				add_location(h30, file, 390, 8, 11943);
				attr_dev(div2, "id", "recordedTestCases");
				attr_dev(div2, "class", "svelte-9t8x9t");
				add_location(div2, file, 391, 8, 11980);
				attr_dev(h31, "id", "testStatus");
				attr_dev(h31, "class", "svelte-9t8x9t");
				add_location(h31, file, 392, 8, 12023);
				attr_dev(div3, "id", "testResults");
				attr_dev(div3, "class", "svelte-9t8x9t");
				add_location(div3, file, 393, 8, 12058);
				attr_dev(button3, "id", "viewCompleteSummaryButton");
				attr_dev(button3, "class", "svelte-9t8x9t");
				add_location(button3, file, 394, 8, 12095);
				attr_dev(hr, "id", "completeSummaryHr");
				attr_dev(hr, "class", "svelte-9t8x9t");
				add_location(hr, file, 397, 8, 12200);
				attr_dev(div4, "class", "statusdiv svelte-9t8x9t");
				attr_dev(div4, "id", "statusdiv");
				add_location(div4, file, 389, 6, 11896);
				attr_dev(div5, "class", "header svelte-9t8x9t");
				add_location(div5, file, 372, 2, 10613);
				attr_dev(path2, "fill", "#FF914D");
				attr_dev(path2, "d", "M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6");
				attr_dev(path2, "opacity", "0.3");
				add_location(path2, file, 409, 95, 12734);
				attr_dev(path3, "fill", "#FF914D");
				attr_dev(path3, "d", "M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6");
				add_location(path3, file, 409, 195, 12834);
				attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg2, "width", "35px");
				attr_dev(svg2, "height", "35px");
				attr_dev(svg2, "viewBox", "0 0 24 24");
				add_location(svg2, file, 409, 8, 12647);
				attr_dev(div6, "class", "card-icon svelte-9t8x9t");
				add_location(div6, file, 408, 6, 12615);
				attr_dev(div7, "class", "card-text svelte-9t8x9t");
				add_location(div7, file, 411, 6, 13004);
				attr_dev(div8, "class", "card-arrow svelte-9t8x9t");
				add_location(div8, file, 412, 6, 13057);
				attr_dev(div9, "class", "card svelte-9t8x9t");
				attr_dev(div9, "tabindex", "0");
				attr_dev(div9, "role", "button");
				attr_dev(div9, "id", "startRecordingButton");
				add_location(div9, file, 407, 4, 12420);
				attr_dev(div10, "class", "card-icon replay-icon svelte-9t8x9t");
				add_location(div10, file, 415, 6, 13291);
				attr_dev(div11, "class", "card-text svelte-9t8x9t");
				add_location(div11, file, 416, 6, 13339);
				attr_dev(div12, "class", "card-arrow svelte-9t8x9t");
				add_location(div12, file, 417, 6, 13392);
				attr_dev(div13, "class", "card svelte-9t8x9t");
				attr_dev(div13, "tabindex", "0");
				attr_dev(div13, "role", "button");
				attr_dev(div13, "id", "startTestingButton");
				add_location(div13, file, 414, 4, 13104);
				attr_dev(div14, "class", "section svelte-9t8x9t");
				add_location(div14, file, 406, 2, 12394);
				attr_dev(div15, "class", "loader svelte-9t8x9t");
				attr_dev(div15, "id", "loader");
				add_location(div15, file, 434, 2, 13805);
				attr_dev(div16, "class", "container svelte-9t8x9t");
				add_location(div16, file, 352, 0, 9137);
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
				/*span5_binding*/ ctx[18](span5);
				append_dev(div1, t10);
				append_dev(div1, span6);
				append_dev(span6, svg1);
				append_dev(svg1, path1);
				/*span6_binding*/ ctx[20](span6);
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
				append_dev(div4, hr);
				append_dev(div16, t18);
				if (if_block2) if_block2.m(div16, null);
				append_dev(div16, t19);
				append_dev(div16, div14);
				append_dev(div14, div9);
				append_dev(div9, div6);
				append_dev(div6, svg2);
				append_dev(svg2, path2);
				append_dev(svg2, path3);
				append_dev(div9, t20);
				append_dev(div9, div7);
				append_dev(div9, t22);
				append_dev(div9, div8);
				/*div9_binding*/ ctx[22](div9);
				append_dev(div14, t24);
				append_dev(div14, div13);
				append_dev(div13, div10);
				append_dev(div13, t25);
				append_dev(div13, div11);
				append_dev(div13, t27);
				append_dev(div13, div12);
				/*div13_binding*/ ctx[24](div13);
				append_dev(div16, t29);
				if (if_block3) if_block3.m(div16, null);
				append_dev(div16, t30);
				append_dev(div16, div15);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*click_handler*/ ctx[14], false),
						listen_dev(button1, "click", /*click_handler_1*/ ctx[15], false),
						listen_dev(button2, "click", /*click_handler_2*/ ctx[16], false),
						listen_dev(span5, "click", /*stop*/ ctx[11], false),
						listen_dev(span5, "keydown", /*keydown_handler*/ ctx[17], false),
						listen_dev(span6, "click", /*stop*/ ctx[11], false),
						listen_dev(span6, "keydown", /*keydown_handler_1*/ ctx[19], false),
						listen_dev(div9, "click", /*toggleRecording*/ ctx[9], false),
						listen_dev(div9, "keydown", /*keydown_handler_2*/ ctx[21], false),
						listen_dev(div13, "click", /*toggleTesting*/ ctx[10], false),
						listen_dev(div13, "keydown", /*keydown_handler_3*/ ctx[23], false)
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

				if (dirty[0] & /*selectedIconButton*/ 64 && button0_class_value !== (button0_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 1 ? 'selected' : '') + " svelte-9t8x9t")) {
					attr_dev(button0, "class", button0_class_value);
				}

				if (dirty[0] & /*selectedIconButton*/ 64 && button1_class_value !== (button1_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 2 ? 'selected' : '') + " svelte-9t8x9t")) {
					attr_dev(button1, "class", button1_class_value);
				}

				if (dirty[0] & /*selectedIconButton*/ 64 && button2_class_value !== (button2_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 3 ? 'selected' : '') + " svelte-9t8x9t")) {
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

				if (/*selectedIconButton*/ ctx[6] === 2) {
					if (if_block2) ; else {
						if_block2 = create_if_block_3(ctx);
						if_block2.c();
						if_block2.m(div16, t19);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (/*showSteps*/ ctx[7]) {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty[0] & /*showSteps*/ 128) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(div16, t30);
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
				/*span5_binding*/ ctx[18](null);
				/*span6_binding*/ ctx[20](null);
				if (if_block2) if_block2.d();
				/*div9_binding*/ ctx[22](null);
				/*div13_binding*/ ctx[24](null);
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

	const intro = 60; // final frame of the intro sequence
	const stopFrame = 180; // final frame of the stop icon appearing
	const recFrame = 240; // final frame of the record frame appearing (last frame which matches the intro frame to ensure it loops)

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('KeployHome', slots, []);
		let startRecordingButton;
		let startTestingButton;
		let stopRecordingButton;
		let stopTestingButton;
		let isRecording = false;
		let isTesting = false;
		let showSteps = false;
		let selectedIconButton = 1;
		let settingsIcon = document.querySelector('.settings-icon');

		const selectButton = buttonNumber => {
			console.log('buttonNumber', buttonNumber);
			$$invalidate(6, selectedIconButton = buttonNumber);

			if (buttonNumber !== 2) {
				clearLastTestResults();
			}

			if (buttonNumber !== 1) {
				console.log("setting display none");
				$$invalidate(0, startRecordingButton.style.display = 'none', startRecordingButton);
				$$invalidate(1, startTestingButton.style.display = 'none', startTestingButton);
			}

			if (buttonNumber === 1) {
				$$invalidate(0, startRecordingButton.style.display = 'flex', startRecordingButton);
				$$invalidate(1, startTestingButton.style.display = 'flex', startTestingButton);
			}

			if (buttonNumber === 3) {
				settingsIcon.classList.toggle('open'); // Update icon based on dropdown state
			}
		};

		const clearLastTestResults = () => {
			const testSuiteName = document.getElementById('testSuiteName');
			const totalTestCases = document.getElementById('totalTestCases');
			const testCasesPassed = document.getElementById('testCasesPassed');
			const testCasesFailed = document.getElementById('testCasesFailed');
			const errorElement = document.getElementById('errorElement');
			if (testSuiteName) testSuiteName.textContent = '';
			if (totalTestCases) totalTestCases.textContent = '';
			if (testCasesPassed) testCasesPassed.textContent = '';
			if (testCasesFailed) testCasesFailed.textContent = '';
			if (errorElement) errorElement.style.display = 'none';
		};

		const triggerAnimation = () => {
			if (anim.currentFrame > intro && anim.currentFrame <= stopFrame - intro - 1) {
				console.log('playing from stop to record');
				anim.playSegments([stopFrame, recFrame], true);
			} else {
				console.log('playing to stop icon');
				anim.playSegments([intro, stopFrame], true);
			}
		};

		const toggleRecording = () => {
			$$invalidate(4, isRecording = !isRecording);
			$$invalidate(5, isTesting = false);
			$$invalidate(7, showSteps = !showSteps);
			triggerAnimation();
		};

		const toggleTesting = () => {
			$$invalidate(5, isTesting = !isTesting);
			$$invalidate(4, isRecording = false);
			$$invalidate(7, showSteps = !showSteps);
			triggerAnimation();
		};

		const stop = () => {
			$$invalidate(4, isRecording = false);
			$$invalidate(5, isTesting = false);
			$$invalidate(7, showSteps = false);
			triggerAnimation();
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
		const click_handler_1 = () => selectButton(2);
		const click_handler_2 = () => selectButton(3);
		const keydown_handler = e => e.key === 'Enter' && stop();

		function span5_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				stopRecordingButton = $$value;
				((((($$invalidate(2, stopRecordingButton), $$invalidate(0, startRecordingButton)), $$invalidate(4, isRecording)), $$invalidate(5, isTesting)), $$invalidate(6, selectedIconButton)), $$invalidate(1, startTestingButton));
			});
		}

		const keydown_handler_1 = e => e.key === 'Enter' && stop();

		function span6_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				stopTestingButton = $$value;
				((((($$invalidate(3, stopTestingButton), $$invalidate(0, startRecordingButton)), $$invalidate(4, isRecording)), $$invalidate(5, isTesting)), $$invalidate(6, selectedIconButton)), $$invalidate(1, startTestingButton));
			});
		}

		const keydown_handler_2 = e => e.key === 'Enter' && toggleRecording();

		function div9_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				startRecordingButton = $$value;
				(((($$invalidate(0, startRecordingButton), $$invalidate(4, isRecording)), $$invalidate(5, isTesting)), $$invalidate(6, selectedIconButton)), $$invalidate(1, startTestingButton));
			});
		}

		const keydown_handler_3 = e => e.key === 'Enter' && toggleTesting();

		function div13_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				startTestingButton = $$value;
				(((($$invalidate(1, startTestingButton), $$invalidate(0, startRecordingButton)), $$invalidate(4, isRecording)), $$invalidate(5, isTesting)), $$invalidate(6, selectedIconButton));
			});
		}

		$$self.$capture_state = () => ({
			fly,
			onMount,
			lottie,
			intro,
			stopFrame,
			recFrame,
			startRecordingButton,
			startTestingButton,
			stopRecordingButton,
			stopTestingButton,
			isRecording,
			isTesting,
			showSteps,
			selectedIconButton,
			settingsIcon,
			selectButton,
			clearLastTestResults,
			triggerAnimation,
			toggleRecording,
			toggleTesting,
			stop,
			recordingSteps,
			replayingSteps
		});

		$$self.$inject_state = $$props => {
			if ('startRecordingButton' in $$props) $$invalidate(0, startRecordingButton = $$props.startRecordingButton);
			if ('startTestingButton' in $$props) $$invalidate(1, startTestingButton = $$props.startTestingButton);
			if ('stopRecordingButton' in $$props) $$invalidate(2, stopRecordingButton = $$props.stopRecordingButton);
			if ('stopTestingButton' in $$props) $$invalidate(3, stopTestingButton = $$props.stopTestingButton);
			if ('isRecording' in $$props) $$invalidate(4, isRecording = $$props.isRecording);
			if ('isTesting' in $$props) $$invalidate(5, isTesting = $$props.isTesting);
			if ('showSteps' in $$props) $$invalidate(7, showSteps = $$props.showSteps);
			if ('selectedIconButton' in $$props) $$invalidate(6, selectedIconButton = $$props.selectedIconButton);
			if ('settingsIcon' in $$props) settingsIcon = $$props.settingsIcon;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*startRecordingButton, isRecording, isTesting, selectedIconButton, startTestingButton*/ 115) {
				{
					if (startRecordingButton) {
						$$invalidate(
							0,
							startRecordingButton.style.display = isRecording || isTesting || selectedIconButton !== 1
							? 'none'
							: 'flex',
							startRecordingButton
						);
					}

					if (startTestingButton) {
						$$invalidate(
							1,
							startTestingButton.style.display = isRecording || isTesting || selectedIconButton !== 1
							? 'none'
							: 'flex',
							startTestingButton
						);
					}

					// if (stopRecordingButton) {
					//   stopRecordingButton.style.display = isRecording ? 'inline' : 'none';
					// }
					// if (stopTestingButton) {
					//   stopTestingButton.style.display = isTesting ? 'inline' : 'none';
					// }
					const loader = document.getElementById('loader');

					if (loader) {
						loader.style.display = isRecording || isTesting ? 'block' : 'none';
					}

					const stopRecordingButton = document.getElementById('stopRecordingButton');

					if (stopRecordingButton) {
						stopRecordingButton.style.display = isRecording ? 'inline' : 'none';
					}

					const stopTestingButton = document.getElementById('stopTestingButton');

					if (stopTestingButton) {
						stopTestingButton.style.display = isTesting ? 'inline' : 'none';
					}

					const statusdiv = document.getElementById('statusdiv');

					if (statusdiv) {
						statusdiv.style.display = selectedIconButton === 1 ? 'block' : "none";
					}
				}
			}
		};

		return [
			startRecordingButton,
			startTestingButton,
			stopRecordingButton,
			stopTestingButton,
			isRecording,
			isTesting,
			selectedIconButton,
			showSteps,
			selectButton,
			toggleRecording,
			toggleTesting,
			stop,
			recordingSteps,
			replayingSteps,
			click_handler,
			click_handler_1,
			click_handler_2,
			keydown_handler,
			span5_binding,
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

})(lottie);
//# sourceMappingURL=KeployHome.js.map
