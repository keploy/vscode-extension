var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

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
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
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

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
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

	const outroing = new Set();

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
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
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
	 * @param {Element} node
	 * @param {string} property
	 * @param {any} [value]
	 * @returns {void}
	 */
	function prop_dev(node, property, value) {
		node[property] = value;
		dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

	/* webviews/components/Keploy.svelte generated by Svelte v4.2.17 */

	const { console: console_1 } = globals;
	const file = "webviews/components/Keploy.svelte";

	// (321:16) {:else}
	function create_else_block(ctx) {
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
				add_location(path0, file, 321, 107, 10657);
				attr_dev(path1, "fill", "#FF914D");
				attr_dev(path1, "d", "M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6");
				add_location(path1, file, 321, 207, 10757);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "35px");
				attr_dev(svg, "height", "35px");
				attr_dev(svg, "viewBox", "0 0 24 24");
				add_location(svg, file, 321, 20, 10570);
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
			id: create_else_block.name,
			type: "else",
			source: "(321:16) {:else}",
			ctx
		});

		return block;
	}

	// (319:16) {#if isRecording}
	function create_if_block_2(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill", "#FF914D");
				attr_dev(path, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z");
				add_location(path, file, 319, 107, 10358);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "35px");
				attr_dev(svg, "height", "35px");
				attr_dev(svg, "viewBox", "0 0 24 24");
				add_location(svg, file, 319, 20, 10271);
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
			id: create_if_block_2.name,
			type: "if",
			source: "(319:16) {#if isRecording}",
			ctx
		});

		return block;
	}

	// (335:8) {#if selectedIconButton === 1}
	function create_if_block_1(ctx) {
		let h30;
		let t0;
		let div0;
		let t1;
		let div1;
		let button0;
		let t3;
		let button1;
		let t5;
		let h31;
		let t6;
		let div2;
		let t7;
		let button2;
		let t9;
		let button3;
		let t10;
		let button3_disabled_value;
		let t11;
		let button4;
		let t12;
		let button4_disabled_value;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				h30 = element("h3");
				h30.innerHTML = ``;
				t0 = space();
				div0 = element("div");
				div0.innerHTML = ``;
				t1 = space();
				div1 = element("div");
				button0 = element("button");
				button0.textContent = "Previous";
				t3 = space();
				button1 = element("button");
				button1.textContent = "Next";
				t5 = space();
				h31 = element("h3");
				h31.innerHTML = ``;
				t6 = space();
				div2 = element("div");
				t7 = space();
				button2 = element("button");
				button2.textContent = "View Complete Test Summary";
				t9 = space();
				button3 = element("button");
				t10 = text("Start Recording");
				t11 = space();
				button4 = element("button");
				t12 = text("Start Testing");
				attr_dev(h30, "id", "recordStatus");
				attr_dev(h30, "class", "svelte-1qs5a31");
				add_location(h30, file, 335, 8, 12627);
				attr_dev(div0, "id", "recordedTestCases");
				attr_dev(div0, "class", "svelte-1qs5a31");
				add_location(div0, file, 336, 8, 12664);
				attr_dev(button0, "id", "prevPageButton");
				attr_dev(button0, "class", "svelte-1qs5a31");
				add_location(button0, file, 339, 12, 12785);
				attr_dev(button1, "id", "nextPageButton");
				attr_dev(button1, "class", "svelte-1qs5a31");
				add_location(button1, file, 341, 12, 12918);
				attr_dev(div1, "class", "pagination-buttons svelte-1qs5a31");
				attr_dev(div1, "id", "pagination-buttons");
				add_location(div1, file, 338, 8, 12716);
				attr_dev(h31, "id", "testStatus");
				attr_dev(h31, "class", "svelte-1qs5a31");
				add_location(h31, file, 343, 8, 13003);
				attr_dev(div2, "id", "testResults");
				attr_dev(div2, "class", "svelte-1qs5a31");
				add_location(div2, file, 344, 8, 13038);
				attr_dev(button2, "id", "viewCompleteSummaryButton");
				attr_dev(button2, "class", "svelte-1qs5a31");
				add_location(button2, file, 345, 8, 13075);
				attr_dev(button3, "id", "startRecordingButton");
				attr_dev(button3, "class", "button svelte-1qs5a31");
				button3.disabled = button3_disabled_value = /*isRecording*/ ctx[4] && /*isTesting*/ ctx[5];
				add_location(button3, file, 346, 12, 13162);
				attr_dev(button4, "id", "startTestingButton");
				attr_dev(button4, "class", "button svelte-1qs5a31");
				button4.disabled = button4_disabled_value = /*isRecording*/ ctx[4] && /*isTesting*/ ctx[5];
				add_location(button4, file, 349, 12, 13374);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h30, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, div0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, div1, anchor);
				append_dev(div1, button0);
				append_dev(div1, t3);
				append_dev(div1, button1);
				insert_dev(target, t5, anchor);
				insert_dev(target, h31, anchor);
				insert_dev(target, t6, anchor);
				insert_dev(target, div2, anchor);
				insert_dev(target, t7, anchor);
				insert_dev(target, button2, anchor);
				insert_dev(target, t9, anchor);
				insert_dev(target, button3, anchor);
				append_dev(button3, t10);
				/*button3_binding*/ ctx[18](button3);
				insert_dev(target, t11, anchor);
				insert_dev(target, button4, anchor);
				append_dev(button4, t12);
				/*button4_binding*/ ctx[19](button4);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*prevPage*/ ctx[12], false, false, false, false),
						listen_dev(button1, "click", /*nextPage*/ ctx[11], false, false, false, false),
						listen_dev(button3, "click", /*toggleRecording*/ ctx[9], false, false, false, false),
						listen_dev(button4, "click", /*toggleTesting*/ ctx[10], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*isRecording, isTesting*/ 48 && button3_disabled_value !== (button3_disabled_value = /*isRecording*/ ctx[4] && /*isTesting*/ ctx[5])) {
					prop_dev(button3, "disabled", button3_disabled_value);
				}

				if (dirty & /*isRecording, isTesting*/ 48 && button4_disabled_value !== (button4_disabled_value = /*isRecording*/ ctx[4] && /*isTesting*/ ctx[5])) {
					prop_dev(button4, "disabled", button4_disabled_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h30);
					detach_dev(t0);
					detach_dev(div0);
					detach_dev(t1);
					detach_dev(div1);
					detach_dev(t5);
					detach_dev(h31);
					detach_dev(t6);
					detach_dev(div2);
					detach_dev(t7);
					detach_dev(button2);
					detach_dev(t9);
					detach_dev(button3);
					detach_dev(t11);
					detach_dev(button4);
				}

				/*button3_binding*/ ctx[18](null);
				/*button4_binding*/ ctx[19](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(335:8) {#if selectedIconButton === 1}",
			ctx
		});

		return block;
	}

	// (357:8) {#if selectedIconButton === 2}
	function create_if_block(ctx) {
		let div;
		let h3;

		const block = {
			c: function create() {
				div = element("div");
				h3 = element("h3");
				h3.innerHTML = ``;
				attr_dev(h3, "id", "testSuiteName");
				attr_dev(h3, "class", "svelte-1qs5a31");
				add_location(h3, file, 358, 12, 13890);
				attr_dev(div, "id", "lastTestResults");
				add_location(div, file, 357, 8, 13851);
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
			id: create_if_block.name,
			type: "if",
			source: "(357:8) {#if selectedIconButton === 2}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let main;
		let div5;
		let div0;
		let input0;
		let t0;
		let div1;
		let button0;
		let t2;
		let input1;
		let t3;
		let div2;
		let button1;
		let button1_class_value;
		let t4;
		let button2;
		let svg0;
		let path0;
		let button2_class_value;
		let t5;
		let button3;
		let svg1;
		let path1;
		let button3_class_value;
		let t6;
		let hr;
		let t7;
		let t8;
		let div3;
		let h3;
		let t10;
		let button4;
		let t12;
		let t13;
		let div4;
		let t14;
		let button5;
		let t16;
		let button6;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (/*isRecording*/ ctx[4]) return create_if_block_2;
			return create_else_block;
		}

		let current_block_type = select_block_type(ctx);
		let if_block0 = current_block_type(ctx);
		let if_block1 = /*selectedIconButton*/ ctx[6] === 1 && create_if_block_1(ctx);
		let if_block2 = /*selectedIconButton*/ ctx[6] === 2 && create_if_block(ctx);

		const block = {
			c: function create() {
				main = element("main");
				div5 = element("div");
				div0 = element("div");
				input0 = element("input");
				t0 = space();
				div1 = element("div");
				button0 = element("button");
				button0.textContent = "Select Project Folder";
				t2 = space();
				input1 = element("input");
				t3 = space();
				div2 = element("div");
				button1 = element("button");
				if_block0.c();
				t4 = space();
				button2 = element("button");
				svg0 = svg_element("svg");
				path0 = svg_element("path");
				t5 = space();
				button3 = element("button");
				svg1 = svg_element("svg");
				path1 = svg_element("path");
				t6 = space();
				hr = element("hr");
				t7 = space();
				if (if_block1) if_block1.c();
				t8 = space();
				div3 = element("div");
				h3 = element("h3");
				h3.textContent = "Please make changes to the Keploy Config File";
				t10 = space();
				button4 = element("button");
				button4.textContent = "Initialise Config";
				t12 = space();
				if (if_block2) if_block2.c();
				t13 = space();
				div4 = element("div");
				t14 = space();
				button5 = element("button");
				button5.textContent = "Stop Recording";
				t16 = space();
				button6 = element("button");
				button6.textContent = "Stop Testing";
				attr_dev(input0, "type", "text");
				attr_dev(input0, "id", "appCommand");
				attr_dev(input0, "name", "appCommand");
				attr_dev(input0, "placeholder", "Enter App Command");
				attr_dev(input0, "class", "svelte-1qs5a31");
				add_location(input0, file, 298, 12, 9445);
				attr_dev(div0, "id", "appCommandDiv");
				attr_dev(div0, "class", "svelte-1qs5a31");
				add_location(div0, file, 297, 8, 9408);
				attr_dev(button0, "id", "selectRecordFolderButton");
				attr_dev(button0, "class", "button svelte-1qs5a31");
				add_location(button0, file, 307, 12, 9711);
				attr_dev(input1, "type", "text");
				attr_dev(input1, "id", "projectFolder");
				attr_dev(input1, "name", "projectFolder");
				attr_dev(input1, "class", "svelte-1qs5a31");
				toggle_class(input1, "isVisible", /*isProjectFolderVisible*/ ctx[7]);
				add_location(input1, file, 308, 12, 9807);
				attr_dev(div1, "id", "selectFolderDiv");
				attr_dev(div1, "class", "svelte-1qs5a31");
				add_location(div1, file, 306, 8, 9672);
				attr_dev(button1, "id", "keploycommands");
				attr_dev(button1, "class", button1_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 1 ? 'selected' : '') + " svelte-1qs5a31");
				add_location(button1, file, 317, 12, 10090);
				attr_dev(path0, "fill", "#FF914D");
				attr_dev(path0, "d", "M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29c-.47 2.27-2.31 4.1-4.57 4.57c-3.57.75-6.75-1.7-7.23-5.01a1 1 0 0 0-.98-.85c-.6 0-1.08.53-1 1.13c.62 4.39 4.8 7.64 9.53 6.72c3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5");
				add_location(path0, file, 325, 103, 11206);
				attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg0, "width", "35px");
				attr_dev(svg0, "height", "35px");
				attr_dev(svg0, "viewBox", "0 0 24 24");
				add_location(svg0, file, 325, 16, 11119);
				attr_dev(button2, "id", "displayPreviousTestResults");
				attr_dev(button2, "class", button2_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 2 ? 'selected' : '') + " svelte-1qs5a31");
				add_location(button2, file, 324, 12, 10964);
				attr_dev(path1, "fill", "#FF914D");
				attr_dev(path1, "d", "M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6");
				add_location(path1, file, 328, 103, 11796);
				attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg1, "width", "35px");
				attr_dev(svg1, "height", "35px");
				attr_dev(svg1, "viewBox", "0 0 24 24");
				add_location(svg1, file, 328, 16, 11709);
				attr_dev(button3, "id", "openConfig");
				attr_dev(button3, "class", button3_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 3 ? 'selected' : '') + " svelte-1qs5a31");
				add_location(button3, file, 327, 12, 11570);
				attr_dev(div2, "class", "icon-buttons svelte-1qs5a31");
				add_location(div2, file, 316, 8, 10051);
				add_location(hr, file, 331, 8, 12556);
				attr_dev(h3, "class", "info");
				attr_dev(h3, "id", "keployConfigInfo");
				add_location(h3, file, 352, 12, 13601);
				attr_dev(div3, "id", "keployConfigInfoDiv");
				attr_dev(div3, "class", "svelte-1qs5a31");
				add_location(div3, file, 351, 8, 13558);
				attr_dev(button4, "id", "initialiseConfigButton");
				attr_dev(button4, "class", "button svelte-1qs5a31");
				add_location(button4, file, 355, 8, 13726);
				attr_dev(div4, "class", "loader svelte-1qs5a31");
				attr_dev(div4, "id", "loader");
				add_location(div4, file, 367, 8, 14245);
				attr_dev(button5, "id", "stopRecordingButton");
				attr_dev(button5, "class", "svelte-1qs5a31");
				add_location(button5, file, 368, 8, 14292);
				attr_dev(button6, "id", "stopTestingButton");
				attr_dev(button6, "class", "svelte-1qs5a31");
				add_location(button6, file, 369, 8, 14384);
				attr_dev(div5, "class", "menu");
				add_location(div5, file, 296, 4, 9381);
				attr_dev(main, "class", "svelte-1qs5a31");
				add_location(main, file, 295, 0, 9370);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				append_dev(main, div5);
				append_dev(div5, div0);
				append_dev(div0, input0);
				set_input_value(input0, /*appCommand*/ ctx[0]);
				append_dev(div5, t0);
				append_dev(div5, div1);
				append_dev(div1, button0);
				append_dev(div1, t2);
				append_dev(div1, input1);
				/*input1_binding*/ ctx[14](input1);
				append_dev(div5, t3);
				append_dev(div5, div2);
				append_dev(div2, button1);
				if_block0.m(button1, null);
				append_dev(div2, t4);
				append_dev(div2, button2);
				append_dev(button2, svg0);
				append_dev(svg0, path0);
				append_dev(div2, t5);
				append_dev(div2, button3);
				append_dev(button3, svg1);
				append_dev(svg1, path1);
				append_dev(div5, t6);
				append_dev(div5, hr);
				append_dev(div5, t7);
				if (if_block1) if_block1.m(div5, null);
				append_dev(div5, t8);
				append_dev(div5, div3);
				append_dev(div3, h3);
				append_dev(div5, t10);
				append_dev(div5, button4);
				append_dev(div5, t12);
				if (if_block2) if_block2.m(div5, null);
				append_dev(div5, t13);
				append_dev(div5, div4);
				append_dev(div5, t14);
				append_dev(div5, button5);
				append_dev(div5, t16);
				append_dev(div5, button6);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
						listen_dev(button1, "click", /*click_handler*/ ctx[15], false, false, false, false),
						listen_dev(button2, "click", /*click_handler_1*/ ctx[16], false, false, false, false),
						listen_dev(button3, "click", /*click_handler_2*/ ctx[17], false, false, false, false),
						listen_dev(button5, "click", /*toggleRecording*/ ctx[9], false, false, false, false),
						listen_dev(button6, "click", /*toggleTesting*/ ctx[10], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*appCommand*/ 1 && input0.value !== /*appCommand*/ ctx[0]) {
					set_input_value(input0, /*appCommand*/ ctx[0]);
				}

				if (dirty & /*isProjectFolderVisible*/ 128) {
					toggle_class(input1, "isVisible", /*isProjectFolderVisible*/ ctx[7]);
				}

				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(ctx);

					if (if_block0) {
						if_block0.c();
						if_block0.m(button1, null);
					}
				}

				if (dirty & /*selectedIconButton*/ 64 && button1_class_value !== (button1_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 1 ? 'selected' : '') + " svelte-1qs5a31")) {
					attr_dev(button1, "class", button1_class_value);
				}

				if (dirty & /*selectedIconButton*/ 64 && button2_class_value !== (button2_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 2 ? 'selected' : '') + " svelte-1qs5a31")) {
					attr_dev(button2, "class", button2_class_value);
				}

				if (dirty & /*selectedIconButton*/ 64 && button3_class_value !== (button3_class_value = "icon-button " + (/*selectedIconButton*/ ctx[6] === 3 ? 'selected' : '') + " svelte-1qs5a31")) {
					attr_dev(button3, "class", button3_class_value);
				}

				if (/*selectedIconButton*/ ctx[6] === 1) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_1(ctx);
						if_block1.c();
						if_block1.m(div5, t8);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*selectedIconButton*/ ctx[6] === 2) {
					if (if_block2) ; else {
						if_block2 = create_if_block(ctx);
						if_block2.c();
						if_block2.m(div5, t13);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}

				/*input1_binding*/ ctx[14](null);
				if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
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

	const itemsPerPage = 15;

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Keploy', slots, []);
		let appCommand = '';
		let startTestingButton;
		let startRecordingButton;
		let projectFolder;
		let selectedIconButton = 1;
		let isProjectFolderVisible = false;
		let isRecording = false;
		let isTesting = false;

		const selectButton = buttonNumber => {
			console.log('buttonNumber', buttonNumber);
			$$invalidate(6, selectedIconButton = buttonNumber);

			if (buttonNumber !== 2) {
				clearLastTestResults();
			}

			if (buttonNumber !== 3) {
				const initialiseConfigButton = document.getElementById('initialiseConfigButton');

				if (initialiseConfigButton) {
					initialiseConfigButton.style.display = 'none';
				}

				const initialiseConfig = document.getElementById('initialiseConfig');

				if (initialiseConfig) {
					initialiseConfig.style.display = 'none';
				}

				const keployConfigInfoDiv = document.getElementById('keployConfigInfoDiv');

				if (keployConfigInfoDiv) {
					keployConfigInfoDiv.style.display = 'none';
				}
			}

			if (buttonNumber === 3) {
				keployConfigInfoDiv.style.display = 'grid';
			}
		};

		const toggleRecording = () => {
			$$invalidate(4, isRecording = !isRecording);
		};

		const toggleTesting = () => {
			$$invalidate(5, isTesting = !isTesting);
		};

		// Pagination variables
		let currentPage = 1;

		let totalPages = 0;

		const clearLastTestResults = () => {
			const testSuiteName = document.getElementById('testSuiteName');
			const totalTestCases = document.getElementById('totalTestCases');
			const testCasesPassed = document.getElementById('testCasesPassed');
			const testCasesFailed = document.getElementById('testCasesFailed');
			document.getElementById('lastTestResults');
			const errorElement = document.getElementById('errorElement');
			if (testSuiteName) testSuiteName.textContent = '';
			if (totalTestCases) totalTestCases.textContent = '';
			if (testCasesPassed) testCasesPassed.textContent = '';
			if (testCasesFailed) testCasesFailed.textContent = '';

			// if (lastTestResultsDiv) lastTestResultsDiv.innerHTML = '';
			if (errorElement) errorElement.style.display = 'none';
		};

		const updatePagination = () => {
			//set timeout here to allow the DOM to update
			const recordedTestCases = document.getElementById('recordedTestCases');

			const paginationButtons = document.getElementById('pagination-buttons');
			paginationButtons.style.display = recordedTestCases.innerHTML.length > 0 ? 'flex' : 'none';

			if (totalPages < 2) {
				paginationButtons.style.display = 'none';
			}

			const allTestCases = document.querySelectorAll('.recordedTestCase');
			console.log('allTestCases', allTestCases);
			totalPages = Math.ceil(allTestCases.length / itemsPerPage);
			console.log('totalPages', totalPages);

			allTestCases.forEach((testCase, index) => {
				const start = (currentPage - 1) * itemsPerPage;
				const end = currentPage * itemsPerPage;
				console.log('start', start, 'end', end);
				testCase.style.display = index >= start && index < end ? 'block' : 'none';
			});

			// document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${totalPages}`;
			console.log('currentPage', currentPage);

			console.log('totalpages', totalPages);
		};

		const nextPage = () => {
			if (currentPage < totalPages) {
				currentPage++;
				updatePagination();
			}
		};

		const prevPage = () => {
			if (currentPage > 1) {
				currentPage--;
				updatePagination();
			}
		};

		const observeDOMChanges = () => {
			const targetNode = document.getElementById('recordedTestCases');
			const config = { childList: true, subtree: true };

			const callback = mutationsList => {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						updatePagination();
					}
				}
			};

			const observer = new MutationObserver(callback);
			if (targetNode) observer.observe(targetNode, config);
		};

		document.addEventListener('DOMContentLoaded', () => {
			// updateUI();
			observeDOMChanges();
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Keploy> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			appCommand = this.value;
			$$invalidate(0, appCommand);
		}

		function input1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				projectFolder = $$value;
				$$invalidate(3, projectFolder);
			});
		}

		const click_handler = () => selectButton(1);
		const click_handler_1 = () => selectButton(2);
		const click_handler_2 = () => selectButton(3);

		function button3_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				startRecordingButton = $$value;
				(((($$invalidate(2, startRecordingButton), $$invalidate(0, appCommand)), $$invalidate(1, startTestingButton)), $$invalidate(4, isRecording)), $$invalidate(5, isTesting));
			});
		}

		function button4_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				startTestingButton = $$value;
				(((($$invalidate(1, startTestingButton), $$invalidate(0, appCommand)), $$invalidate(2, startRecordingButton)), $$invalidate(4, isRecording)), $$invalidate(5, isTesting));
			});
		}

		$$self.$capture_state = () => ({
			appCommand,
			startTestingButton,
			startRecordingButton,
			projectFolder,
			selectedIconButton,
			isProjectFolderVisible,
			isRecording,
			isTesting,
			selectButton,
			toggleRecording,
			toggleTesting,
			currentPage,
			itemsPerPage,
			totalPages,
			clearLastTestResults,
			updatePagination,
			nextPage,
			prevPage,
			observeDOMChanges
		});

		$$self.$inject_state = $$props => {
			if ('appCommand' in $$props) $$invalidate(0, appCommand = $$props.appCommand);
			if ('startTestingButton' in $$props) $$invalidate(1, startTestingButton = $$props.startTestingButton);
			if ('startRecordingButton' in $$props) $$invalidate(2, startRecordingButton = $$props.startRecordingButton);
			if ('projectFolder' in $$props) $$invalidate(3, projectFolder = $$props.projectFolder);
			if ('selectedIconButton' in $$props) $$invalidate(6, selectedIconButton = $$props.selectedIconButton);
			if ('isProjectFolderVisible' in $$props) $$invalidate(7, isProjectFolderVisible = $$props.isProjectFolderVisible);
			if ('isRecording' in $$props) $$invalidate(4, isRecording = $$props.isRecording);
			if ('isTesting' in $$props) $$invalidate(5, isTesting = $$props.isTesting);
			if ('currentPage' in $$props) currentPage = $$props.currentPage;
			if ('totalPages' in $$props) totalPages = $$props.totalPages;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*appCommand, startTestingButton, startRecordingButton, isRecording, isTesting*/ 55) {
				{
					const isAppCommandEmpty = appCommand.trim() === '';
					if (startTestingButton) $$invalidate(1, startTestingButton.disabled = isAppCommandEmpty, startTestingButton);
					if (startRecordingButton) $$invalidate(2, startRecordingButton.disabled = isAppCommandEmpty, startRecordingButton);
					const recordedTestCases = document.getElementById('recordedTestCases');

					if (recordedTestCases) {
						if (recordedTestCases.innerHTML.length === 0) ; else {
							console.log(
								'updating pagination'
							);

							setTimeout(
								() => {
									updatePagination();
								},
								3000
							);
						} // updatePagination();
					}

					const recordStatus = document.getElementById('recordStatus');

					if (recordStatus) {
						//if style of recordStatus is set to block, call the function to update the pagination
						if (recordStatus.style.display === 'block') {
							console.log('updating pagination from recordstatus');

							setTimeout(
								() => {
									updatePagination();
								},
								3000
							);
						}
					}

					//set visibility of stop recording button
					const stopRecordingButton = document.getElementById('stopRecordingButton');

					if (stopRecordingButton) {
						stopRecordingButton.style.display = isRecording ? 'block' : 'none';
					}

					const stopTestingButton = document.getElementById('stopTestingButton');

					if (stopTestingButton) {
						stopTestingButton.style.display = isTesting ? 'block' : 'none';
					}

					const loader = document.getElementById('loader');

					if (loader) {
						loader.style.display = isRecording || isTesting ? 'block' : 'none';
					}

					//set visibility of start recording button and start testing button
					if (startRecordingButton) {
						$$invalidate(2, startRecordingButton.style.display = isRecording || isTesting ? 'none' : 'block', startRecordingButton);
					}

					if (startTestingButton) {
						$$invalidate(1, startTestingButton.style.display = isRecording || isTesting ? 'none' : 'block', startTestingButton);
					}
				}
			}

			if ($$self.$$.dirty & /*projectFolder*/ 8) {
				$$invalidate(7, isProjectFolderVisible = projectFolder?.value.trim() !== '');
			}
		};

		return [
			appCommand,
			startTestingButton,
			startRecordingButton,
			projectFolder,
			isRecording,
			isTesting,
			selectedIconButton,
			isProjectFolderVisible,
			selectButton,
			toggleRecording,
			toggleTesting,
			nextPage,
			prevPage,
			input0_input_handler,
			input1_binding,
			click_handler,
			click_handler_1,
			click_handler_2,
			button3_binding,
			button4_binding
		];
	}

	class Keploy extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Keploy",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Keploy({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=Keploy.js.map
