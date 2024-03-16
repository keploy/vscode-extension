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

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
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
	const VERSION = '4.2.12';
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

	/* webviews/components/Test.svelte generated by Svelte v4.2.12 */

	const { Object: Object_1, console: console_1 } = globals;
	const file = "webviews/components/Test.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (97:8) {#each Object.keys(flags) as flag}
	function create_each_block(ctx) {
		let option;
		let t_value = /*flag*/ ctx[1] + "";
		let t;
		let option_value_value;

		const block = {
			c: function create() {
				option = element("option");
				t = text(t_value);
				option.__value = option_value_value = /*flag*/ ctx[1];
				set_input_value(option, option.__value);
				add_location(option, file, 97, 10, 3312);
			},
			m: function mount(target, anchor) {
				insert_dev(target, option, anchor);
				append_dev(option, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*flags*/ 1 && t_value !== (t_value = /*flag*/ ctx[1] + "")) set_data_dev(t, t_value);

				if (dirty & /*flags*/ 1 && option_value_value !== (option_value_value = /*flag*/ ctx[1])) {
					prop_dev(option, "__value", option_value_value);
					set_input_value(option, option.__value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(option);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(97:8) {#each Object.keys(flags) as flag}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let a;
		let t1;
		let body;
		let div0;
		let button0;
		let t3;
		let input0;
		let t4;
		let div1;
		let button1;
		let t6;
		let input1;
		let t7;
		let div4;
		let div2;
		let select0;
		let option0;
		let t9;
		let div3;
		let input2;
		let t10;
		let select1;
		let option1;
		let t12;
		let button2;
		let t14;
		let hr;
		let t15;
		let div9;
		let div5;
		let img;
		let img_src_value;
		let t16;
		let h30;
		let t18;
		let div6;
		let h1;
		let t20;
		let div7;
		let t21;
		let button3;
		let t23;
		let h31;
		let t24;
		let div8;
		let t25;
		let button4;
		let each_value = ensure_array_like_dev(Object.keys(/*flags*/ ctx[0]));
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				a = element("a");
				a.textContent = "Home";
				t1 = space();
				body = element("body");
				div0 = element("div");
				button0 = element("button");
				button0.textContent = "Select Project Folder";
				t3 = space();
				input0 = element("input");
				t4 = space();
				div1 = element("div");
				button1 = element("button");
				button1.textContent = "Enter App Command";
				t6 = space();
				input1 = element("input");
				t7 = space();
				div4 = element("div");
				div2 = element("div");
				select0 = element("select");
				option0 = element("option");
				option0.textContent = "Select Flag";

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t9 = space();
				div3 = element("div");
				input2 = element("input");
				t10 = space();
				select1 = element("select");
				option1 = element("option");
				option1.textContent = "Run all test cases";
				t12 = space();
				button2 = element("button");
				button2.textContent = "Start Testing";
				t14 = space();
				hr = element("hr");
				t15 = space();
				div9 = element("div");
				div5 = element("div");
				img = element("img");
				t16 = space();
				h30 = element("h3");
				h30.textContent = "Command";
				t18 = space();
				div6 = element("div");
				h1 = element("h1");
				h1.textContent = "keploy test -c \"\"";
				t20 = space();
				div7 = element("div");
				t21 = space();
				button3 = element("button");
				button3.textContent = "Stop Testing";
				t23 = space();
				h31 = element("h3");
				h31.innerHTML = ``;
				t24 = space();
				div8 = element("div");
				div8.innerHTML = ``;
				t25 = space();
				button4 = element("button");
				button4.textContent = "View Complete Test Summary";
				attr_dev(a, "id", "navigateHomeButton");
				attr_dev(a, "class", "homebutton svelte-18fcqkx");
				add_location(a, file, 67, 0, 2512);
				attr_dev(button0, "id", "selectTestFolderButton");
				attr_dev(button0, "class", "secondary svelte-18fcqkx");
				add_location(button0, file, 71, 4, 2610);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "id", "testProjectFolder");
				attr_dev(input0, "name", "testProjectFolder");
				attr_dev(input0, "placeholder", "Enter Manual Path");
				attr_dev(input0, "class", "svelte-18fcqkx");
				add_location(input0, file, 74, 4, 2711);
				attr_dev(div0, "id", "selectFolderDiv");
				attr_dev(div0, "class", "svelte-18fcqkx");
				add_location(div0, file, 70, 2, 2579);
				attr_dev(button1, "id", "enterAppCommandButton");
				button1.disabled = "true";
				attr_dev(button1, "class", "secondary svelte-18fcqkx");
				add_location(button1, file, 82, 4, 2881);
				attr_dev(input1, "type", "text");
				attr_dev(input1, "id", "testCommand");
				attr_dev(input1, "name", "testCommand");
				attr_dev(input1, "placeholder", "Enter App Command");
				attr_dev(input1, "class", "svelte-18fcqkx");
				add_location(input1, file, 85, 4, 2993);
				attr_dev(div1, "id", "appCommandDiv");
				attr_dev(div1, "class", "svelte-18fcqkx");
				add_location(div1, file, 81, 2, 2852);
				option0.__value = "";
				set_input_value(option0, option0.__value);
				option0.disabled = true;
				option0.selected = true;
				add_location(option0, file, 95, 8, 3203);
				attr_dev(select0, "id", "selectflags");
				attr_dev(select0, "class", "svelte-18fcqkx");
				add_location(select0, file, 94, 6, 3169);
				attr_dev(div2, "id", "flags");
				add_location(div2, file, 93, 4, 3146);
				attr_dev(input2, "type", "text");
				attr_dev(input2, "id", "flagValueInput");
				attr_dev(input2, "placeholder", "Enter Value");
				attr_dev(input2, "class", "svelte-18fcqkx");
				add_location(input2, file, 102, 6, 3423);
				attr_dev(div3, "id", "flagValue");
				add_location(div3, file, 101, 4, 3396);
				attr_dev(div4, "id", "flagsDiv");
				attr_dev(div4, "class", "svelte-18fcqkx");
				add_location(div4, file, 92, 2, 3122);
				option1.__value = "Run all test cases";
				set_input_value(option1, option1.__value);
				add_location(option1, file, 106, 4, 3548);
				attr_dev(select1, "id", "selectTestCases");
				attr_dev(select1, "class", "svelte-18fcqkx");
				add_location(select1, file, 105, 2, 3513);
				attr_dev(button2, "id", "startTestingButton");
				button2.disabled = "true";
				attr_dev(button2, "class", "svelte-18fcqkx");
				add_location(button2, file, 108, 2, 3625);
				add_location(hr, file, 109, 2, 3698);
				attr_dev(img, "class", "keploylogo svelte-18fcqkx");
				if (!src_url_equal(img.src, img_src_value = "https://avatars.githubusercontent.com/u/92252339?s=200&v=4")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "Keploy Logo");
				add_location(img, file, 112, 6, 3764);
				add_location(h30, file, 117, 6, 3910);
				attr_dev(div5, "id", "upperOutputDiv");
				attr_dev(div5, "class", "svelte-18fcqkx");
				add_location(div5, file, 111, 4, 3732);
				attr_dev(h1, "id", "generatedTestCommand");
				attr_dev(h1, "class", "svelte-18fcqkx");
				add_location(h1, file, 120, 6, 3974);
				attr_dev(div6, "id", "testCommandDiv");
				add_location(div6, file, 119, 4, 3942);
				attr_dev(div7, "class", "loader svelte-18fcqkx");
				attr_dev(div7, "id", "loader");
				add_location(div7, file, 122, 4, 4042);
				attr_dev(button3, "id", "stopTestingButton");
				attr_dev(button3, "class", "svelte-18fcqkx");
				add_location(button3, file, 123, 4, 4085);
				attr_dev(h31, "id", "testStatus");
				attr_dev(h31, "class", "svelte-18fcqkx");
				add_location(h31, file, 124, 4, 4142);
				attr_dev(div8, "id", "testResults");
				attr_dev(div8, "class", "svelte-18fcqkx");
				add_location(div8, file, 125, 4, 4173);
				attr_dev(button4, "id", "viewCompleteSummaryButton");
				attr_dev(button4, "class", "svelte-18fcqkx");
				add_location(button4, file, 127, 4, 4211);
				attr_dev(div9, "id", "outputDiv");
				add_location(div9, file, 110, 2, 3707);
				add_location(body, file, 69, 0, 2570);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, body, anchor);
				append_dev(body, div0);
				append_dev(div0, button0);
				append_dev(div0, t3);
				append_dev(div0, input0);
				append_dev(body, t4);
				append_dev(body, div1);
				append_dev(div1, button1);
				append_dev(div1, t6);
				append_dev(div1, input1);
				append_dev(body, t7);
				append_dev(body, div4);
				append_dev(div4, div2);
				append_dev(div2, select0);
				append_dev(select0, option0);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(select0, null);
					}
				}

				append_dev(div4, t9);
				append_dev(div4, div3);
				append_dev(div3, input2);
				append_dev(body, t10);
				append_dev(body, select1);
				append_dev(select1, option1);
				append_dev(body, t12);
				append_dev(body, button2);
				append_dev(body, t14);
				append_dev(body, hr);
				append_dev(body, t15);
				append_dev(body, div9);
				append_dev(div9, div5);
				append_dev(div5, img);
				append_dev(div5, t16);
				append_dev(div5, h30);
				append_dev(div9, t18);
				append_dev(div9, div6);
				append_dev(div6, h1);
				append_dev(div9, t20);
				append_dev(div9, div7);
				append_dev(div9, t21);
				append_dev(div9, button3);
				append_dev(div9, t23);
				append_dev(div9, h31);
				append_dev(div9, t24);
				append_dev(div9, div8);
				append_dev(div9, t25);
				append_dev(div9, button4);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*Object, flags*/ 1) {
					each_value = ensure_array_like_dev(Object.keys(/*flags*/ ctx[0]));
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select0, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t1);
					detach_dev(body);
				}

				destroy_each(each_blocks, detaching);
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

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Test', slots, []);

		let flags = {
			"apiTimeout": "",
			"config-path": "",
			"delay": "",
			"mongoPassword": "",
			"passThroughPorts": "",
			"testsets": "",
			"generateTestReport": "",
			"removeUnusedMocks": "",
			"ignoreOrdering": "",
			"coverage": "",
			"withCoverage": "",
			"path": "",
			"proxyport": "",
			"debug": ""
		};

		//enable the startTestingButton when the testProjectFolder and testCommand are filled
		onMount(() => {
			document.getElementById('testProjectFolder').addEventListener('input', () => {
				if (document.getElementById('testProjectFolder').value && document.getElementById('testCommand').value) {
					document.getElementById('startTestingButton').disabled = false;
				}
			});

			document.getElementById('testCommand').addEventListener('input', () => {
				if (document.getElementById('testProjectFolder').value && document.getElementById('testCommand').value) {
					document.getElementById('startTestingButton').disabled = false;
				}
			});

			//change the value of the generatedtestCommand when the testCommand is filled
			document.getElementById('testCommand').addEventListener('input', () => {
				document.getElementById('generatedTestCommand').innerText = `keploy test -c "${document.getElementById('testCommand').value}"`;
			});

			const selectFlagsElement = document.getElementById("selectflags");
			selectFlagsElement.addEventListener("change", () => handleFlagValueChange());
			const flagValueInput = document.getElementById("flagValueInput");
			flagValueInput.addEventListener("input", () => handleFlagValueChange());

			function handleFlagValueChange() {
				const e = document.getElementById("selectflags");
				var selectedFlag = e.options[e.selectedIndex].value;
				console.log("selectedFlag : " + selectedFlag);
				const flagValue = document.getElementById("flagValueInput").value;
				console.log("flagValue : " + flagValue);
				$$invalidate(0, flags[selectedFlag] = flagValue, flags);
				console.log(flags);
				updateGeneratedCommand();
			}

			function updateGeneratedCommand() {
				let currentCommand = `keploy test -c "${document.getElementById("testCommand").value}"`;

				for (const [flag, value] of Object.entries(flags)) {
					if (value) {
						currentCommand += ` --${flag}="${value}"`;
					}
				}

				document.getElementById("generatedTestCommand").innerText = currentCommand;
			}
		});

		const writable_props = [];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Test> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ onMount, flags });

		$$self.$inject_state = $$props => {
			if ('flags' in $$props) $$invalidate(0, flags = $$props.flags);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [flags];
	}

	class Test extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Test",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Test({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=Test.js.map
