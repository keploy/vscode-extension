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

	/* webviews/components/Record.svelte generated by Svelte v4.2.12 */
	const file = "webviews/components/Record.svelte";

	function create_fragment(ctx) {
		let body;
		let a;
		let t1;
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
		let option1;
		let t10;
		let div3;
		let select1;
		let option2;
		let option3;
		let t13;
		let button2;
		let t15;
		let hr;
		let t16;
		let div9;
		let div5;
		let img;
		let img_src_value;
		let t17;
		let h30;
		let t19;
		let div6;
		let h1;
		let t21;
		let div7;
		let t22;
		let button3;
		let t24;
		let h31;
		let t25;
		let div8;

		const block = {
			c: function create() {
				body = element("body");
				a = element("a");
				a.textContent = "Home";
				t1 = space();
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
				option0.textContent = "Flag 1";
				option1 = element("option");
				option1.textContent = "Flag 2";
				t10 = space();
				div3 = element("div");
				select1 = element("select");
				option2 = element("option");
				option2.textContent = "True";
				option3 = element("option");
				option3.textContent = "False";
				t13 = space();
				button2 = element("button");
				button2.textContent = "Start Recording";
				t15 = space();
				hr = element("hr");
				t16 = space();
				div9 = element("div");
				div5 = element("div");
				img = element("img");
				t17 = space();
				h30 = element("h3");
				h30.textContent = "Command";
				t19 = space();
				div6 = element("div");
				h1 = element("h1");
				h1.textContent = "keploy record -c \"\"";
				t21 = space();
				div7 = element("div");
				t22 = space();
				button3 = element("button");
				button3.textContent = "Stop Recording";
				t24 = space();
				h31 = element("h3");
				h31.innerHTML = ``;
				t25 = space();
				div8 = element("div");
				div8.innerHTML = ``;
				attr_dev(a, "id", "navigateHomeButton");
				attr_dev(a, "class", "homebutton svelte-83reyp");
				add_location(a, file, 25, 4, 965);
				attr_dev(button0, "id", "selectRecordFolderButton");
				attr_dev(button0, "class", "secondary svelte-83reyp");
				add_location(button0, file, 28, 4, 1058);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "id", "recordProjectFolder");
				attr_dev(input0, "name", "projectFolder");
				attr_dev(input0, "placeholder", "Enter Manual Path");
				attr_dev(input0, "class", "svelte-83reyp");
				add_location(input0, file, 31, 4, 1161);
				attr_dev(div0, "id", "selectFolderDiv");
				attr_dev(div0, "class", "svelte-83reyp");
				add_location(div0, file, 27, 2, 1027);
				attr_dev(button1, "id", "enterAppCommandButton");
				button1.disabled = "true";
				attr_dev(button1, "class", "secondary svelte-83reyp");
				add_location(button1, file, 39, 4, 1329);
				attr_dev(input1, "type", "text");
				attr_dev(input1, "id", "recordCommand");
				attr_dev(input1, "name", "recordCommand");
				attr_dev(input1, "placeholder", "Enter App Command");
				attr_dev(input1, "class", "svelte-83reyp");
				add_location(input1, file, 42, 4, 1441);
				attr_dev(div1, "id", "appCommandDiv");
				attr_dev(div1, "class", "svelte-83reyp");
				add_location(div1, file, 38, 2, 1300);
				option0.__value = "manual";
				set_input_value(option0, option0.__value);
				add_location(option0, file, 52, 8, 1655);
				option1.__value = "record";
				set_input_value(option1, option1.__value);
				add_location(option1, file, 53, 8, 1702);
				attr_dev(select0, "id", "selectflags");
				attr_dev(select0, "class", "svelte-83reyp");
				add_location(select0, file, 51, 6, 1621);
				attr_dev(div2, "id", "flags");
				add_location(div2, file, 50, 4, 1598);
				option2.__value = "manual";
				set_input_value(option2, option2.__value);
				add_location(option2, file, 58, 8, 1837);
				option3.__value = "record";
				set_input_value(option3, option3.__value);
				add_location(option3, file, 59, 8, 1882);
				attr_dev(select1, "id", "selectflagValue");
				attr_dev(select1, "class", "svelte-83reyp");
				add_location(select1, file, 57, 6, 1799);
				attr_dev(div3, "id", "flagValue");
				add_location(div3, file, 56, 4, 1772);
				attr_dev(div4, "id", "flagsDiv");
				attr_dev(div4, "class", "svelte-83reyp");
				add_location(div4, file, 49, 2, 1574);
				attr_dev(button2, "id", "startRecordingButton");
				button2.disabled = "true";
				attr_dev(button2, "class", "svelte-83reyp");
				add_location(button2, file, 63, 2, 1958);
				add_location(hr, file, 65, 2, 2038);
				attr_dev(img, "class", "keploylogo svelte-83reyp");
				if (!src_url_equal(img.src, img_src_value = "https://avatars.githubusercontent.com/u/92252339?s=200&v=4")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "Keploy Logo");
				add_location(img, file, 68, 6, 2104);
				add_location(h30, file, 73, 6, 2250);
				attr_dev(div5, "id", "upperOutputDiv");
				attr_dev(div5, "class", "svelte-83reyp");
				add_location(div5, file, 67, 4, 2072);
				attr_dev(h1, "id", "generatedRecordCommand");
				attr_dev(h1, "class", "svelte-83reyp");
				add_location(h1, file, 76, 6, 2316);
				attr_dev(div6, "id", "recordCommandDiv");
				add_location(div6, file, 75, 4, 2282);
				attr_dev(div7, "class", "loader svelte-83reyp");
				attr_dev(div7, "id", "loader");
				add_location(div7, file, 78, 4, 2388);
				attr_dev(button3, "id", "stopRecordingButton");
				attr_dev(button3, "class", "svelte-83reyp");
				add_location(button3, file, 79, 4, 2431);
				attr_dev(h31, "id", "recordStatus");
				attr_dev(h31, "class", "svelte-83reyp");
				add_location(h31, file, 80, 4, 2492);
				attr_dev(div8, "id", "recordedTestCases");
				attr_dev(div8, "class", "svelte-83reyp");
				add_location(div8, file, 81, 4, 2525);
				attr_dev(div9, "id", "outputDiv");
				add_location(div9, file, 66, 2, 2047);
				add_location(body, file, 24, 0, 954);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, body, anchor);
				append_dev(body, a);
				append_dev(body, t1);
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
				append_dev(select0, option1);
				append_dev(div4, t10);
				append_dev(div4, div3);
				append_dev(div3, select1);
				append_dev(select1, option2);
				append_dev(select1, option3);
				append_dev(body, t13);
				append_dev(body, button2);
				append_dev(body, t15);
				append_dev(body, hr);
				append_dev(body, t16);
				append_dev(body, div9);
				append_dev(div9, div5);
				append_dev(div5, img);
				append_dev(div5, t17);
				append_dev(div5, h30);
				append_dev(div9, t19);
				append_dev(div9, div6);
				append_dev(div6, h1);
				append_dev(div9, t21);
				append_dev(div9, div7);
				append_dev(div9, t22);
				append_dev(div9, button3);
				append_dev(div9, t24);
				append_dev(div9, h31);
				append_dev(div9, t25);
				append_dev(div9, div8);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(body);
				}
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
		validate_slots('Record', slots, []);

		onMount(() => {
			document.getElementById('recordProjectFolder').addEventListener('input', () => {
				if (document.getElementById('recordProjectFolder').value && document.getElementById('recordCommand').value) {
					document.getElementById('startRecordingButton').disabled = false;
				}
			});

			document.getElementById('recordCommand').addEventListener('input', () => {
				if (document.getElementById('recordProjectFolder').value && document.getElementById('recordCommand').value) {
					document.getElementById('startRecordingButton').disabled = false;
				}
			});

			//change the value of the generatedRecordCommand when the recordCommand is filled
			document.getElementById('recordCommand').addEventListener('input', () => {
				document.getElementById('generatedRecordCommand').innerText = `keploy record -c "${document.getElementById('recordCommand').value}"`;
			});
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Record> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ onMount });
		return [];
	}

	class Record extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Record",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Record({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=Record.js.map
