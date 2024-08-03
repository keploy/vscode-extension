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
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
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
	function set_style(node, key, value, important) {
		{
			node.style.setProperty(key, value, '');
		}
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

	/* webviews/components/Forms.svelte generated by Svelte v4.2.17 */

	const { console: console_1 } = globals;
	const file = "webviews/components/Forms.svelte";

	function create_fragment(ctx) {
		let div6;
		let div0;
		let t1;
		let div1;
		let ol;
		let li0;
		let t2;
		let a;
		let t4;
		let t5;
		let li1;
		let t7;
		let form;
		let div2;
		let label0;
		let t9;
		let input0;
		let t10;
		let div3;
		let label1;
		let t12;
		let input1;
		let t13;
		let div4;
		let label2;
		let t15;
		let input2;
		let t16;
		let div5;
		let label3;
		let t18;
		let input3;
		let t19;
		let button0;
		let t21;
		let button1;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div6 = element("div");
				div0 = element("div");
				div0.textContent = "Generate Your Keploy Unit Tests";
				t1 = space();
				div1 = element("div");
				ol = element("ol");
				li0 = element("li");
				t2 = text("Keploy UTG needs coverage report in cobertura format. For information visit - ");
				a = element("a");
				a.textContent = "Keploy Documentation";
				t4 = text(".");
				t5 = space();
				li1 = element("li");
				li1.textContent = "Make sure you are connected to the internet.";
				t7 = space();
				form = element("form");
				div2 = element("div");
				label0 = element("label");
				label0.textContent = "Source File Path";
				t9 = space();
				input0 = element("input");
				t10 = space();
				div3 = element("div");
				label1 = element("label");
				label1.textContent = "Test File Path";
				t12 = space();
				input1 = element("input");
				t13 = space();
				div4 = element("div");
				label2 = element("label");
				label2.textContent = "Test Command";
				t15 = space();
				input2 = element("input");
				t16 = space();
				div5 = element("div");
				label3 = element("label");
				label3.textContent = "Coverage Report Path";
				t18 = space();
				input3 = element("input");
				t19 = space();
				button0 = element("button");
				button0.textContent = "Generate";
				t21 = space();
				button1 = element("button");
				button1.textContent = "Back";
				attr_dev(div0, "class", "title svelte-jay8az");
				add_location(div0, file, 150, 2, 3245);
				attr_dev(a, "href", "https://keploy.io/docs/running-keploy/unit-test-generator/");
				attr_dev(a, "target", "_blank");
				set_style(a, "color", "#ff914d");
				add_location(a, file, 153, 88, 3428);
				add_location(li0, file, 153, 6, 3346);
				add_location(li1, file, 154, 6, 3574);
				attr_dev(ol, "class", "svelte-jay8az");
				add_location(ol, file, 152, 4, 3335);
				attr_dev(div1, "class", "instructions svelte-jay8az");
				add_location(div1, file, 151, 2, 3304);
				attr_dev(label0, "for", "sourceFilePath");
				attr_dev(label0, "class", "svelte-jay8az");
				add_location(label0, file, 159, 6, 3731);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "id", "sourceFilePath");
				attr_dev(input0, "placeholder", /*sourceFilePath*/ ctx[0]);
				attr_dev(input0, "class", "svelte-jay8az");
				add_location(input0, file, 160, 6, 3790);
				attr_dev(div2, "class", "form-group svelte-jay8az");
				add_location(div2, file, 158, 4, 3700);
				attr_dev(label1, "for", "testFilePath");
				attr_dev(label1, "class", "svelte-jay8az");
				add_location(label1, file, 168, 6, 3973);
				attr_dev(input1, "type", "text");
				attr_dev(input1, "id", "testFilePath");
				attr_dev(input1, "placeholder", /*testFilePath*/ ctx[1]);
				attr_dev(input1, "class", "svelte-jay8az");
				add_location(input1, file, 169, 6, 4028);
				attr_dev(div3, "class", "form-group svelte-jay8az");
				add_location(div3, file, 167, 4, 3942);
				attr_dev(label2, "for", "testCommand");
				attr_dev(label2, "class", "svelte-jay8az");
				add_location(label2, file, 177, 6, 4205);
				attr_dev(input2, "type", "text");
				attr_dev(input2, "id", "testCommand");
				attr_dev(input2, "placeholder", /*testCommand*/ ctx[2]);
				attr_dev(input2, "class", "svelte-jay8az");
				add_location(input2, file, 178, 6, 4257);
				attr_dev(div4, "class", "form-group svelte-jay8az");
				add_location(div4, file, 176, 4, 4174);
				attr_dev(label3, "for", "coverageReportPath");
				attr_dev(label3, "class", "svelte-jay8az");
				add_location(label3, file, 186, 6, 4431);
				attr_dev(input3, "type", "text");
				attr_dev(input3, "id", "coverageReportPath");
				attr_dev(input3, "placeholder", /*coverageReportPath*/ ctx[3]);
				attr_dev(input3, "class", "svelte-jay8az");
				add_location(input3, file, 187, 6, 4498);
				attr_dev(div5, "class", "form-group svelte-jay8az");
				add_location(div5, file, 185, 4, 4400);
				attr_dev(button0, "type", "submit");
				attr_dev(button0, "class", "button svelte-jay8az");
				add_location(button0, file, 194, 4, 4662);
				attr_dev(button1, "type", "button");
				attr_dev(button1, "class", "button back-button svelte-jay8az");
				add_location(button1, file, 195, 4, 4721);
				attr_dev(form, "class", "svelte-jay8az");
				add_location(form, file, 157, 2, 3649);
				attr_dev(div6, "class", "container svelte-jay8az");
				add_location(div6, file, 149, 0, 3219);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div6, anchor);
				append_dev(div6, div0);
				append_dev(div6, t1);
				append_dev(div6, div1);
				append_dev(div1, ol);
				append_dev(ol, li0);
				append_dev(li0, t2);
				append_dev(li0, a);
				append_dev(li0, t4);
				append_dev(ol, t5);
				append_dev(ol, li1);
				append_dev(div6, t7);
				append_dev(div6, form);
				append_dev(form, div2);
				append_dev(div2, label0);
				append_dev(div2, t9);
				append_dev(div2, input0);
				set_input_value(input0, /*sourceFilePath*/ ctx[0]);
				append_dev(form, t10);
				append_dev(form, div3);
				append_dev(div3, label1);
				append_dev(div3, t12);
				append_dev(div3, input1);
				set_input_value(input1, /*testFilePath*/ ctx[1]);
				append_dev(form, t13);
				append_dev(form, div4);
				append_dev(div4, label2);
				append_dev(div4, t15);
				append_dev(div4, input2);
				set_input_value(input2, /*testCommand*/ ctx[2]);
				append_dev(form, t16);
				append_dev(form, div5);
				append_dev(div5, label3);
				append_dev(div5, t18);
				append_dev(div5, input3);
				set_input_value(input3, /*coverageReportPath*/ ctx[3]);
				append_dev(form, t19);
				append_dev(form, button0);
				append_dev(form, t21);
				append_dev(form, button1);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
						listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
						listen_dev(input3, "input", /*input3_input_handler*/ ctx[9]),
						listen_dev(button1, "click", /*handleBackClick*/ ctx[5], false, false, false, false),
						listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[4]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*sourceFilePath*/ 1) {
					attr_dev(input0, "placeholder", /*sourceFilePath*/ ctx[0]);
				}

				if (dirty & /*sourceFilePath*/ 1 && input0.value !== /*sourceFilePath*/ ctx[0]) {
					set_input_value(input0, /*sourceFilePath*/ ctx[0]);
				}

				if (dirty & /*testFilePath*/ 2) {
					attr_dev(input1, "placeholder", /*testFilePath*/ ctx[1]);
				}

				if (dirty & /*testFilePath*/ 2 && input1.value !== /*testFilePath*/ ctx[1]) {
					set_input_value(input1, /*testFilePath*/ ctx[1]);
				}

				if (dirty & /*testCommand*/ 4) {
					attr_dev(input2, "placeholder", /*testCommand*/ ctx[2]);
				}

				if (dirty & /*testCommand*/ 4 && input2.value !== /*testCommand*/ ctx[2]) {
					set_input_value(input2, /*testCommand*/ ctx[2]);
				}

				if (dirty & /*coverageReportPath*/ 8) {
					attr_dev(input3, "placeholder", /*coverageReportPath*/ ctx[3]);
				}

				if (dirty & /*coverageReportPath*/ 8 && input3.value !== /*coverageReportPath*/ ctx[3]) {
					set_input_value(input3, /*coverageReportPath*/ ctx[3]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div6);
				}

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

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Forms', slots, []);
		let sourceFilePath = '';
		let testFilePath = '';
		let testCommand = '';
		let coverageReportPath = '';
		const vscode = acquireVsCodeApi();

		function handleSubmit() {
			// Logic to handle form submission
			console.log({
				sourceFilePath,
				testFilePath,
				testCommand,
				coverageReportPath
			});
		}

		function handleBackClick() {
			vscode.postMessage({
				type: 'navigate',
				value: 'ChooseLanguage'
			});
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Forms> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			sourceFilePath = this.value;
			$$invalidate(0, sourceFilePath);
		}

		function input1_input_handler() {
			testFilePath = this.value;
			$$invalidate(1, testFilePath);
		}

		function input2_input_handler() {
			testCommand = this.value;
			$$invalidate(2, testCommand);
		}

		function input3_input_handler() {
			coverageReportPath = this.value;
			$$invalidate(3, coverageReportPath);
		}

		$$self.$capture_state = () => ({
			sourceFilePath,
			testFilePath,
			testCommand,
			coverageReportPath,
			vscode,
			handleSubmit,
			handleBackClick
		});

		$$self.$inject_state = $$props => {
			if ('sourceFilePath' in $$props) $$invalidate(0, sourceFilePath = $$props.sourceFilePath);
			if ('testFilePath' in $$props) $$invalidate(1, testFilePath = $$props.testFilePath);
			if ('testCommand' in $$props) $$invalidate(2, testCommand = $$props.testCommand);
			if ('coverageReportPath' in $$props) $$invalidate(3, coverageReportPath = $$props.coverageReportPath);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		if (vscode.getState() && vscode.getState().language) {
			const language = vscode.getState().language;

			if (language === 'JS' || language === 'Java' || language === 'Python') {
				$$invalidate(0, sourceFilePath = './src/routes/routes.js');
				$$invalidate(1, testFilePath = './test/routes.test.js');
				$$invalidate(2, testCommand = 'npm test');
				$$invalidate(3, coverageReportPath = './coverage/cobertura-coverage.xml');
			} else if (language === 'Go') {
				$$invalidate(0, sourceFilePath = 'app.go');
				$$invalidate(1, testFilePath = 'app_test.go');
				$$invalidate(2, testCommand = 'go test -v ./... -coverprofile=coverage.out && gocov convert coverage.out | gocov-xml > coverage.xml');
				$$invalidate(3, coverageReportPath = './coverage.xml');
			}
		}

		return [
			sourceFilePath,
			testFilePath,
			testCommand,
			coverageReportPath,
			handleSubmit,
			handleBackClick,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			input3_input_handler
		];
	}

	class Forms extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Forms",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Forms({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=Forms.js.map
