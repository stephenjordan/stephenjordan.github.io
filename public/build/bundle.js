
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root.host) {
            return root;
        }
        return document;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
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
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
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
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
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
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.41.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\header\Header.svelte generated by Svelte v3.41.0 */

    const file$l = "src\\components\\header\\Header.svelte";

    function create_fragment$l(ctx) {
    	let header;
    	let h1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Quantum Algorithm Zoo";
    			attr_dev(h1, "class", "svelte-szjetr");
    			add_location(h1, file$l, 1, 4, 38);
    			attr_dev(header, "class", "w3-round-xlarge svelte-szjetr");
    			add_location(header, file$l, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    var algorithms$1 = {"Algebraic and Number Theoretic Algorithms":{"0":{alg_id:0,name:"Factoring",speedup:"Superpolynomial",description:" Given an <i>n</i> -bit integer, find the prime factorization. The quantum algorithm of Peter Shor solves this in <span>\\( \\widetilde{O} (n^3) \\)</span> time [ <a href=\"#Shor_factoring\">82</a> , <a href=\"#Shor_factoring94\">125</a> ]. The fastest known classical algorithm for integer factorization is the general number field sieve, which is believed to run in time <span>\\( 2^{\\widetilde{O}(n^{1/3})} \\)</span>. The best rigorously proven upper bound on the classical complexity of factoring is <span>\\( O(2^{n/4+o(1)}) \\)</span> via the Pollard-Strassen algorithm [ <a href=\"#Pol\">252</a> , <a href=\"#Stras\">362</a> ]. Shor's factoring algorithm breaks RSA public-key encryption and the closely related quantum algorithms for discrete logarithms break the DSA and ECDSA digital signature schemes and the Diffie-Hellman key-exchange protocol. A quantum algorithm even faster than Shor's for the special case of factoring “semiprimes”, which are widely used in cryptography, is given in [ <a href=\"#GLFB15\">271</a> ]. If small factors exist, Shor's algorithm can be beaten by a quantum algorithm using Grover search to speed up the elliptic curve factorization method [ <a href=\"#PQRSA\">366</a> ]. Additional optimized versions of Shor's algorithm are given in [ <a href=\"#EH17\">384</a> , <a href=\"#BBM17\">386</a> ]. There are proposed classical public-key cryptosystems not believed to be broken by quantum algorithms, <i>cf.</i> [ <a href=\"#BBD09\">248</a> ]. At the core of Shor's factoring algorithm is order finding, which can be reduced to the <a href=\"#abelian_HSP\">Abelian hidden subgroup problem</a> , which is solved using the quantum Fourier transform. A number of other problems are known to reduce to integer factorization including the membership problem for matrix groups over fields of odd order [ <a href=\"#BBS09\">253</a> ], and certain diophantine problems relevant to the synthesis of quantum circuits [ <a href=\"#RS12\">254</a> ]. ",references:[82,125,252,362,271,366,384,386,248,253,254],category:"Algebraic and Number Theoretic Algorithms"},"1":{alg_id:1,name:"Discrete-log",speedup:"Superpolynomial",description:" We are given three <i>n</i> -bit numbers <i>a</i> , <i>b</i> , and <i>N</i> , with the promise that <span>\\( b = a^s \\mod N \\)</span> for some <i>s</i> . The task is to find <i>s</i> . As shown by Shor [ <a href=\"#Shor_factoring\">82</a> ], this can be achieved on a quantum computer in poly( <i>n</i> ) time. The fastest known classical algorithm requires time superpolynomial in <i>n</i> . By similar techniques to those in [ <a href=\"#Shor_factoring\">82</a> ], quantum computers can solve the discrete logarithm problem on elliptic curves, thereby breaking elliptic curve cryptography [ <a href=\"#Zalka_ellip\">109</a> , <a href=\"#BL95\">14</a> ]. A further optimization to Shor's algorithm is given in [ <a href=\"#E17\">385</a> ]. The superpolynomial quantum speedup has also been extended to the discrete logarithm problem on semigroups [ <a href=\"#Childs_Ivanyos\">203</a> , <a href=\"#Banin_Tsaban\">204</a> ]. See also <a href=\"#abelian_HSP\">Abelian hidden subgroup</a> . ",references:[82,82,109,14,385,203,204],category:"Algebraic and Number Theoretic Algorithms"},"2":{alg_id:2,name:"Pell's Equation",speedup:"Superpolynomial",description:" Given a positive nonsquare integer <i>d</i> , Pell's equation is <span>\\( x^2 - d y^2 = 1 \\)</span>. For any such <i>d</i> there are infinitely many pairs of integers ( <i>x,y</i> ) solving this equation. Let <span>\\( (x_1,y_1) \\)</span> be the pair that minimizes <span>\\( x+y\\sqrt{d} \\)</span>. If <i>d</i> is an <i>n</i> -bit integer ( <i>i.e.</i> <span>\\( 0 \\leq d \\lt 2^n \\)</span> ), <span>\\( (x_1,y_1) \\)</span> may in general require exponentially many bits to write down. Thus it is in general impossible to find <span>\\( (x_1,y_1) \\)</span> in polynomial time.  Let <span>\\( R = \\log(x_1+y_1 \\sqrt{d}) \\)</span>. <span>\\( \\lfloor R \\rceil \\)</span> uniquely identifies <span>\\( (x_1,y_1) \\)</span>. As shown by Hallgren [ <a href=\"#Hallgren_Pell\">49</a> ], given a <i>n</i> -bit number <i>d</i> , a quantum computer can find <span>\\( \\lfloor R \\rceil \\)</span> in poly( <i>n</i> ) time. No polynomial time classical algorithm for this problem is known. Factoring reduces to this problem. This algorithm breaks the Buchman-Williams cryptosystem. See also <a href=\"#abelian_HSP\">Abelian hidden subgroup</a> . ",references:[49],category:"Algebraic and Number Theoretic Algorithms"},"3":{alg_id:3,name:"Principal Ideal",speedup:"Superpolynomial",description:" We are given an <i>n</i> -bit integer <i>d</i> and an invertible ideal <i>I</i> of the ring <span>\\( \\mathbb{Z}[\\sqrt{d}] \\)</span>. <i>I</i> is a principal ideal if there exists <span>\\( \\alpha \\in \\mathbb{Q}(\\sqrt{d}) \\)</span> such that <span>\\( I = \\alpha \\mathbb{Z}[\\sqrt{d}] \\)</span>. <span>\\( \\alpha \\)</span> may be exponentially large in <i>d</i> . Therefore <span>\\( \\alpha \\)</span> cannot in general even be written down in polynomial time. However, <span>\\( \\lfloor \\log \\alpha \\rceil \\)</span> uniquely identifies <span>\\( \\alpha \\)</span>. The task is to determine whether <i>I</i> is principal and if so find <span>\\( \\lfloor \\log \\alpha \\rceil \\)</span>. As shown by Hallgren, this can be done in polynomial time on a quantum computer [ <a href=\"#Hallgren_Pell\">49</a> ]. A modified quantum algorithm for this problem using fewer qubits was given in [ <a href=\"#Schmidt_PIP\">131</a> ]. A quantum algorithm solving the principal ideal problem in number fields of arbitrary degree ( <i>i.e.</i> scaling polynomially in the degree) was subsequently given in  [ <a href=\"#Biasse_Song16\">329</a> ]. Factoring reduces to solving Pell's equation, which reduces to the principal ideal problem. Thus the principal ideal problem is at least as hard as factoring and therefore is probably not in P. See also <a href=\"#abelian_HSP\">Abelian hidden subgroup</a> . ",references:[49,131,329],category:"Algebraic and Number Theoretic Algorithms"},"4":{alg_id:4,name:"Unit Group",speedup:"Superpolynomial",description:" The number field <span>\\( \\mathbb{Q}(\\theta) \\)</span> is said to be of degree <i>d</i> if the lowest degree polynomial of which  <span>\\( \\theta \\)</span> is a root has degree <i>d</i> . The set <span>\\( \\mathcal{O} \\)</span> of elements of <span>\\( \\mathbb{Q}(\\theta) \\)</span> which are roots of monic polynomials in <span>\\( \\mathbb{Z}[x] \\)</span> forms a ring, called the ring of integers of  <span>\\( \\mathbb{Q}(\\theta) \\)</span>. The set of units (invertible elements) of the ring  <span>\\( \\mathcal{O} \\)</span> form a group denoted <span>\\( \\mathcal{O}^* \\)</span>. As shown by Hallgren [ <a href=\"#Hallgren_unit\">50</a> ], and independently by Schmidt and  Vollmer [ <a href=\"#Schmidt\">116</a> ], for any <span>\\( \\mathbb{Q}(\\theta) \\)</span> of fixed degree, a quantum computer can find in polynomial time a set of generators for <span>\\( \\mathcal{O}^* \\)</span> given a description of <span>\\( \\theta \\)</span>. No polynomial time classical algorithm for this problem is known. Hallgren and collaborators subsequently discovered how to achieve polynomial scaling in the degree [ <a href=\"#EHKS14\">213</a> ]. See also [ <a href=\"#Biasse_Song16\">329</a> ]. The algorithms rely on solving Abelian hidden subgroup problems over the additive group of real numbers. ",references:[50,116,213,329],category:"Algebraic and Number Theoretic Algorithms"},"5":{alg_id:5,name:"Class Group",speedup:"Superpolynomial",description:" The number field <span>\\( \\mathbb{Q}(\\theta) \\)</span> is said to be of degree <i>d</i> if the lowest degree polynomial of which  <span>\\( \\theta \\)</span> is a root has degree <i>d</i> . The set <span>\\( \\mathcal{O} \\)</span> of elements of <span>\\( \\mathbb{Q}(\\theta) \\)</span> which are roots of monic polynomials in <span>\\( \\mathbb{Z}[x] \\)</span> forms a ring, called the ring of integers of  <span>\\( \\mathbb{Q}(\\theta) \\)</span>, which is a Dedekind domain. For a Dedekind domain, the nonzero fractional ideals modulo the nonzero principal ideals form a group called the class group. As shown by Hallgren [ <a href=\"#Hallgren_unit\">50</a> ], a quantum computer can find a set of generators for the class group of the ring of integers of any constant degree number field, given a description of <span>\\( \\theta \\)</span>, in time poly(log(<span>\\( | \\mathcal{O} | \\)</span>)). An improved quantum algorithm, whose runtime is also polynomial in <i>d</i> was subsequently given in [ <a href=\"#Biasse_Song16\">329</a> ]. No polynomial time classical algorithm for these problems are known. See also <a href=\"#abelian_HSP\">Abelian hidden subgroup</a> . ",references:[50,329],category:"Algebraic and Number Theoretic Algorithms"},"6":{alg_id:6,name:"Gauss Sums",speedup:"Superpolynomial",description:" Let <span>\\( \\mathbb{F}_q \\)</span> be a finite field. The elements other than zero of <span>\\( \\mathbb{F}_q \\)</span> form a group <span>\\( \\mathbb{F}_q^\\times \\)</span> under multiplication, and the elements of <span>\\( \\mathbb{F}_q \\)</span> form an (Abelian but  not necessarily cyclic) group <span>\\( \\mathbb{F}_q^+ \\)</span> under addition. We can choose  some character <span>\\( \\chi^\\times \\)</span> of <span>\\( \\mathbb{F}_q^\\times \\)</span> and some  character <span>\\( \\chi^+ \\)</span> of <span>\\( \\mathbb{F}_q^+ \\)</span>. The corresponding Gauss sum is the inner product of these characters:  <span>\\( \\sum_{x \\neq 0 \\in \\mathbb{F}_q} \\chi^+(x) \\chi^\\times(x) \\)</span> As shown by van Dam and Seroussi [ <a href=\"#vanDam_Gauss\">90</a> ], Gauss sums can be estimated to polynomial precision on a quantum computer in polynomial time. Although a finite ring does not form a group under multiplication, its set of units does. Choosing a representation for the additive group of the ring, and choosing a representation for the multiplicative group of its units, one can obtain a Gauss sum over the units of a finite ring. These can also be estimated to polynomial precision on a quantum computer in polynomial  time [ <a href=\"#vanDam_Gauss\">90</a> ]. No polynomial time classical algorithm for estimating Gauss sums is known. Discrete log reduces to Gauss sum estimation [ <a href=\"#vanDam_Gauss\">90</a> ]. Certain partition functions of the Potts model can be computed by a polynomial-time quantum algorithm related to Gauss sum estimation [ <a href=\"#Geraci_exact\">47</a> ]. ",references:[90,90,90,47],category:"Algebraic and Number Theoretic Algorithms"},"7":{alg_id:7,name:"Primality Proving",speedup:"Polynomial",description:" Given an <i>n</i> -bit number, return a proof of its primality. The fastest classical algorithms are AKS, the best versions of which [ <a href=\"#AKS1\">393</a> , <a href=\"#AKS2\">394</a> ] have essentially-quartic complexity, and ECPP, where the heuristic complexity of the fastest version [ <a href=\"#ECPP\">395</a> ] is also essentially quartic. The fastest known quantum algorithm for this problem is the method of Donis-Vela and Garcia-Escartin [ <a href=\"#DVGE\">396</a> ], with complexity <span>\\( O(n^2 (\\log \\ n)^3 \\log \\ \\log \\ n) \\)</span>. This improves upon a prior factoring-based quantum algorithm for primality proving [ <a href=\"#ChauLo\">397</a> ] that has complexity <span>\\( O(n^3 \\log \\ n \\ \\log \\ \\log \\ n) \\)</span>. A recent result of Harvey and Van Der Hoeven [ <a href=\"#HVDH\">398</a> ] can be used to improve the complexity of the factoring-based quantum algorithm for primality proving to <span>\\( O(n^3 \\log n) \\)</span> and it may be possible to similarly reduce the complexity of the Donis-Vela-Garcia-Escartin algorithm to <span>\\( O(n^2 (\\log \\ n)^3) \\)</span> [ <a href=\"#Greathouse\">399</a> ]. ",references:[393,394,395,396,397,398,399],category:"Algebraic and Number Theoretic Algorithms"},"8":{alg_id:8,name:"Solving Exponential Congruences",speedup:"Polynomial",description:" We are given <span>\\( a,b,c,f,g \\in \\mathbb{F}_q \\)</span>. We must find integers <span>\\(x,y\\)</span> such that <span>\\( a f^x + b g^y = c \\)</span>. As shown in [ <a href=\"#VDS08\">111</a> ], quantum computers can solve this problem in <span>\\( \\widetilde{O}(q^{3/8}) \\)</span> time whereas the best classical algorithm requires <span>\\( \\widetilde{O}(q^{9/8}) \\)</span> time. The quantum algorithm of  [ <a href=\"#VDS08\">111</a> ] is based on the quantum algorithms for discrete logarithms  and searching. ",references:[111,111],category:"Algebraic and Number Theoretic Algorithms"},"9":{alg_id:9,name:"Matrix Elements of Group Representations",speedup:"Superpolynomial",description:" All representations of finite groups and compact linear groups can be expressed as unitary matrices given an appropriate choice of basis. Conjugating the regular representation of a group by the quantum Fourier transform circuit over that group yields a direct sum of the group's irreducible representations. Thus, the efficient quantum Fourier transform over the symmetric group [ <a href=\"#Beals_general\">196</a> ], together with the Hadamard test, yields a fast quantum algorithm for additively approximating individual matrix elements of the arbitrary irreducible representations of <span>\\( S_n \\)</span>. Similarly, using the quantum Schur transform [ <a href=\"#Schur\">197</a> ], one can efficiently approximate matrix elements of the irreducible representations of SU(n) that have polynomial weight. Direct implementations of individual irreducible representations for the groups U(n), SU(n), SO(n), and <span>\\( A_n \\)</span> by efficient quantum circuits are given in [ <a href=\"#SPJ08\">106</a> ]. Instances that appear to be exponentially hard for known classical algorithms are also identified in [ <a href=\"#SPJ08\">106</a> ]. ",references:[196,197,106,106],category:"Algebraic and Number Theoretic Algorithms"},"10":{alg_id:10,name:"Verifying Matrix Products",speedup:"Polynomial",description:" Given three <span>\\( n \\times n \\)</span> matrices, <i>A,B</i> , and <i>C</i> , the matrix product verification problem is to decide whether <i>AB=C</i> . Classically, the best known algorithm achieves this in time <span>\\( O(n^2) \\)</span>, whereas the best known classical algorithm for matrix multiplication runs in time  <span>\\( O(n^{2.373}) \\)</span>. Ambainis <i>et al.</i> discovered a quantum algorithm for this problem with runtime <span>\\( O(n^{7/4}) \\)</span> [ <a href=\"#Ambainis_matrix\">6</a> ]. Subsequently, Buhrman and Špalek improved upon this, obtaining a quantum algorithm for this problem with runtime <span>\\( O(n^{5/3}) \\)</span> [ <a href=\"#Buhrman_matrix\">19</a> ]. This latter  algorithm is based on results regarding quantum walks that were proven in  [ <a href=\"#Szegedy\">85</a> ]. ",references:[6,19,85],category:"Algebraic and Number Theoretic Algorithms"},"11":{alg_id:11,name:"Subset-sum",speedup:"Polynomial",description:" Given a list of integers <span>\\( x_1,\\ldots,x_n \\)</span>, and a target integer <i>s</i> , the subset-sum problem is to determine whether the sum of any subset of the given integers adds up to <i>s</i> . This problem is NP-complete, and therefore is unlikely to be solvable by classical or quantum algorithms with polynomial worst-case complexity. In the hard instances the given integers are of order <span>\\( 2^n \\)</span> and much research on subset sum focuses on average case instances in this regime. In [ <a href=\"#BJLM13\">178</a> ], a quantum algorithm is given that solves such instances in time <span>\\( 2^{0.241n} \\)</span>, up to polynomial factors. This quantum algorithm works by applying a variant of Ambainis's quantum walk algorithm for element-distinctness [ <a href=\"#Ambainis_distinctness\">7</a> ] to speed up a sophisticated classical algorithm for this problem due to Howgrave-Graham and Joux. The fastest known classical algorithm for such instances of subset-sum runs in time <span>\\( 2^{0.291n} \\)</span>, up to polynomial factors [ <a href=\"#BCJ11\">404</a> ]. ",references:[178,7,404],category:"Algebraic and Number Theoretic Algorithms"},"12":{alg_id:12,name:"Decoding",speedup:"Varies",description:" Classical error correcting codes allow the detection and correction of bit-flips by storing data reduntantly. Maximum-likelihood decoding for arbitrary linear codes is NP-complete in the worst case, but for structured codes or bounded error efficient decoding algorithms are known. Quantum algorithms have been formulated to speed up the decoding of convolutional codes [ <a href=\"#GM14\">238</a> ] and simplex codes [ <a href=\"#BZ98\">239</a> ]. ",references:[238,239],category:"Algebraic and Number Theoretic Algorithms"},"13":{alg_id:13,name:"Quantum Cryptanalysis",speedup:"Various",description:" It is well-known that Shor's algorithms for factoring and discrete logarithms [ <a href=\"#Shor_factoring\">82</a> , <a href=\"#Shor_factoring94\">125</a> ] completely break the RSA and Diffie-Hellman cryptosystems, as well as their elliptic-curve-based variants [ <a href=\"#Zalka_ellip\">109</a> , <a href=\"#BL95\">14</a> ]. (A number of \"post-quantum\" public-key cryptosystems have been proposed to replace these primitives, which are not known to be broken by quantum attacks.) Beyond Shor's algorithm, there is a growing body of work on quantum algorithms specifically designed to attack cryptosystems. These generally fall into three categories. The first is quantum algorithms providing polynomial or sub-exponential time attacks on cryptosystems under standard assumptions. In particular, the algorithm of Childs, Jao, and Soukharev for finding isogenies of elliptic curves breaks certain elliptic curve based cryptosystems in subexponential time that were not already broken by Shor's algorithm [ <a href=\"#CJS14\">283</a> ]. The second category is quantum algorithms achieving polynomial improvement over known classical cryptanalytic attacks by speeding up parts of these classical algorithms using Grover search, quantum collision finding, etc. Such attacks on private-key [ <a href=\"#GLRS15\">284</a> , <a href=\"#AMGMPS16\">285</a> , <a href=\"#K14\">288</a> , <a href=\"#BHT98b\">315</a> , <a href=\"#B09\">316</a> ] and public-key [ <a href=\"#LMP13\">262</a> , <a href=\"#F15\">287</a> ] primitives, do not preclude the use of the associated cryptosystems but may influence choice of key size. The third category is attacks that make use of quantum superposition queries to block ciphers. These attacks in many cases completely break the cryptographic primitives [ <a href=\"#KLLNP16\">286</a> , <a href=\"#KM10\">289</a> , <a href=\"#KM12\">290</a> , <a href=\"#RS13\">291</a> , <a href=\"#SS16\">292</a> ]. However, in most practical situations such superposition queries are unlikely to be feasible. <hr/>  <a name=\"oracular\"></a> ",references:[82,125,109,14,283,284,285,288,315,316,262,287,286,289,290,291,292],category:"Algebraic and Number Theoretic Algorithms"}},"Oracular Algorithms":{"0":{alg_id:14,name:"Searching",speedup:"Polynomial",description:" We are given an oracle with <i>N</i> allowed inputs. For one input <i>w</i> (\"the winner\") the corresponding output is 1, and for all other inputs the corresponding output is 0. The task is to find <i>w</i> . On a classical computer this requires <span>\\( \\Omega(N) \\)</span> queries. The quantum algorithm of Lov Grover achieves this using <span>\\( O(\\sqrt{N}) \\)</span> queries [ <a href=\"#Grover_search\">48</a> ], which is optimal [ <a href=\"#BBBV\">216</a> ]. This has algorithm has subsequently been generalized to search in the presence of multiple \"winners\" [ <a href=\"#BBHT98\">15</a> ], evaluate the sum of an arbitrary function [ <a href=\"#BBHT98\">15</a> , <a href=\"#BHT98\">16</a> , <a href=\"#Mos98\">73</a> ], find the global minimum of an arbitrary function  [ <a href=\"#DH96\">35</a> , <a href=\"#NW99\">75</a> , <a href=\"#KLPF08\">255</a> ], take advantage of alternative initial states [ <a href=\"#Biham\">100</a> ] or nonuniform probabilistic priors [ <a href=\"#Montanaro\">123</a> ], work with oracles whose runtime varies  between inputs [ <a href=\"#Ambainis_linear\">138</a> ], approximate  definite integrals [ <a href=\"#integration\">77</a> ], and converge to a fixed-point [ <a href=\"#G05\">208</a> , <a href=\"#TGP05\">209</a> ]. Considerations on optimizing the depth of quantum search circuits are given in [ <a href=\"#ZK19\">405</a> ]. The generalization of Grover's algorithm known as amplitude estimation [ <a href=\"#Amplitude\">17</a> ] is now an important primitive in quantum algorithms. Amplitude estimation forms the core of most known quantum algorithms related to collision finding and graph  properties. One of the natural applications for Grover search is speeding up the  solution to NP-complete problems such as 3-SAT. Doing so is nontrivial, because  the best classical algorithm for 3-SAT is not quite a brute force search. Nevertheless, amplitude amplification enables a quadratic quantum speedup over the best classical 3-SAT algorithm, as shown in [ <a href=\"#Ambainis_SIGACT\">133</a> ]. Quadratic speedups for other constraint satisfaction problems are obtained in  [ <a href=\"#CGF\">134</a> ]. For further examples of application of Grover search and amplitude amplification see [ <a href=\"#C14\">261</a> , <a href=\"#LMP13\">262</a> ]. A problem closely related to, but harder than, Grover search, is spatial search, in which database queries are limited by some graph structure. On sufficiently well-connected graphs, <span>\\(O(\\sqrt{n})\\)</span> quantum query complexity is still achievable [ <a href=\"#CG04\">274</a> , <a href=\"#CNAO15\">275</a> , <a href=\"#Wong16\">303</a> , <a href=\"#JMW14\">304</a> , <a href=\"#MW14\">305</a> , <a href=\"#Wong15\">306</a> , <a href=\"#HK16\">330</a> ].  <a name=\"abelian_HSP\"></a> ",references:[48,216,15,15,16,73,35,75,255,100,123,138,77,208,209,405,17,133,134,261,262,274,275,303,304,305,306,330],category:"Oracular Algorithms"},"1":{alg_id:15,name:"Abelian Hidden Subgroup",speedup:"Superpolynomial",description:" Let <i>G</i> be a finitely generated Abelian group, and let <i>H</i> be some subgroup of <i>G</i> such that <i>G/H</i> is finite. Let <i>f</i> be a function on <i>G</i> such that for any <span>\\( g_1,g_2 \\in G \\)</span>, <span>\\( f(g_1) = f(g_2) \\)</span> if and only if <span>\\( g_1 \\)</span> and <span>\\( g_2 \\)</span> are in the same coset of <i>H</i> . The task is to find <i>H</i> ( <i>i.e.</i> find a set of generators for <i>H</i> ) by making queries to <i>f</i> . This is solvable on a quantum computer using <span>\\( O(\\log \\vert G\\vert) \\)</span> queries, whereas classically <span>\\( \\Omega(|G|) \\)</span> are required. This algorithm was first formulated in full generality by Boneh and Lipton in [ <a href=\"#BL95\">14</a> ]. However, proper attribution of this algorithm is difficult because, as described in chapter 5 of  [ <a href=\"#Nielsen_Chuang\">76</a> ], it subsumes many historically important quantum algorithms as special cases, including Simon's algorithm [ <a href=\"#Simon\">108</a> ],  which was the inspiration for Shor's period finding algorithm, which forms the core  of his factoring and discrete-log algorithms. The Abelian hidden subgroup algorithm  is also at the core of the Pell's equation, principal ideal, unit group, and class  group algorithms. In certain instances, the Abelian hidden subgroup problem can be solved using a single query rather than order <span>\\( \\log(\\vert G\\vert) \\)</span>, as shown in [ <a href=\"#Beaudrap\">30</a> ]. It is normally assumed in period finding that the function <span>\\(f(x) \\neq f(y) \\)</span> unless <span>\\( x-y = s \\)</span>, where <span>\\( s \\)</span> is the period. A quantum algorithm which applies even when this restiction is relaxed is given in  [ <a href=\"#Hales_Hallgren\">388</a> ]. Period finding has been generalized to apply to  oracles which provide only the few most significant bits about the underlying  function in [ <a href=\"#SW07\">389</a> ].  <a name=\"nonabelian_HSP\"></a> ",references:[14,76,108,30,388,389],category:"Oracular Algorithms"},"2":{alg_id:16,name:"Non-Abelian Hidden Subgroup",speedup:"Superpolynomial",description:" Let <i>G</i> be a finitely generated group, and let <i>H</i> be some subgroup of <i>G</i> that has finitely many left cosets. Let <i>f</i> be a  function on <i>G</i> such that for any <span>\\( g_1, g_2 \\)</span>, <span>\\( f(g_1) = f(g_2) \\)</span> if and only if <span>\\( g_1 \\)</span> and <span>\\( g_2 \\)</span> are in the same left coset of <i>H</i> . The task is to find <i>H</i> ( <i>i.e.</i> find a set of generators for <i>H</i> ) by making queries to <i>f</i> . This is solvable on a quantum computer using  <span>\\( O(\\log(|G|) \\)</span> queries, whereas classically <span>\\( \\Omega(|G|) \\)</span> are required [ <a href=\"#Ettinger\">37</a> , <a href=\"#Hallgren_Russell\">51</a> ]. However, this does not qualify as an efficient quantum algorithm because in general, it may take exponential time to process the quantum states obtained from these  queries. Efficient quantum algorithms for the hidden subgroup problem are known for certain specific non-Abelian groups [ <a href=\"#RB_NAHS\">81</a> , <a href=\"#IMS_NAHS\">55</a> , <a href=\"#MRRS_NAHS\">72</a> , <a href=\"#IlG_NAHS\">53</a> , <a href=\"#BCvD_NAHS\">9</a> , <a href=\"#CKL_NAHS\">22</a> , <a href=\"#ISS_NAHS\">56</a> , <a href=\"#CP_NAHS\">71</a> , <a href=\"#ISS2_NAHS\">57</a> , <a href=\"#FIMSS_NAHS\">43</a> , <a href=\"#G_NAHS\">44</a> , <a href=\"#CvD_NAHS\">28</a> , <a href=\"#DMR_NAHS\">126</a> , <a href=\"#W_NAHS\">207</a> , <a href=\"#NAHS_BVZ\">273</a> ].  A slightly outdated survey is given in [ <a href=\"#Survey_NAHS\">69</a> ]. Of  particular interest are the symmetric group and the dihedral group. A solution  for the symmetric group would solve graph isomorphism. A solution for the  dihedral group would solve certain lattice problems [ <a href=\"#Regev_lattice\">78</a> ]. Despite much effort, no polynomial-time solution for these groups is known, except in special cases [ <a href=\"#Roet16\">312</a> ]. However,  Kuperberg [ <a href=\"#Kuperberg\">66</a> ] found a time <span>\\( 2^{O( \\sqrt{\\log N})}) \\)</span> algorithm for finding a hidden subgroup of the dihedral group <span>\\( D_N \\)</span>. Regev  subsequently improved this algorithm so that it uses not only subexponential time  but also polynomial space [ <a href=\"#Regev_dihedral\">79</a> ]. A further improvement in the asymptotic scaling of the required number of qubits is obtained in [ <a href=\"#K13\">218</a> ]. Quantum query speedups (though not necessarily efficient quantum algorithms in terms of gate count) for somewhat more general problems of testing for isomorphisms of functions under sets of  permutations are given in [ <a href=\"#HM16\">311</a> ] ",references:[37,51,81,55,72,53,9,22,56,71,57,43,44,28,126,207,273,69,78,312,66,79,218,311],category:"Oracular Algorithms"},"3":{alg_id:17,name:"Bernstein-Vazirani",speedup:"Polynomial Directly, Superpolynomial Recursively",description:" We are given an oracle whose input is <i>n</i> bits and whose output is one bit. Given input <span>\\( x \\in \\{0,1\\}^n \\)</span>, the output is  <span>\\( x \\odot h \\)</span>, where <i>h</i> is the \"hidden\" string of <i>n</i> bits, and  <span>\\( \\odot \\)</span> denotes the bitwise inner product modulo 2. The task is to find <i>h</i> . On a classical computer this requires <i>n</i> queries. As shown by Bernstein and  Vazirani [ <a href=\"#Bernstein_Vazirani\">11</a> ], this can be achieved on a quantum  computer using a single query. Furthermore, one can construct recursive versions of this problem, called recursive Fourier sampling, such that quantum computers require exponentially fewer queries than classical computers  [ <a href=\"#Bernstein_Vazirani\">11</a> ]. See  [ <a href=\"#HH08\">256</a> , <a href=\"#BH10\">257</a> ] for related work on the ubiquity of quantum speedups from generic quantum circuits and [ <a href=\"#AA14\">258</a> , <a href=\"#ABK15\">270</a> ] for related work on a quantum query speedup for detecting correlations between the an oracle function and the Fourier transform of another. ",references:[11,11,256,257,258,270],category:"Oracular Algorithms"},"4":{alg_id:18,name:"Deutsch-Jozsa",speedup:"Exponential over P, none over BPP",description:" We are given an oracle whose input is <i>n</i> bits and whose output is one bit. We are promised that out of the <span>\\( 2^n \\)</span> possible inputs, either all of them, none of them, or half of them yield output 1. The task is to distinguish the balanced case (half of all inputs yield output 1) from the constant case (all or none of the inputs yield output 1). It was shown by Deutsch [ <a href=\"#Deutsch\">32</a> ] that for <i>n=1</i> , this can be solved on a quantum computer using one query, whereas any deterministic classical  algorithm requires two. This was historically the first well-defined quantum algorithm  achieving a speedup over classical computation. (A related, more recent, pedagogical  example is given in [ <a href=\"#G14\">259</a> ].) A single-query quantum algorithm for  arbitrary <i>n</i> was developed by Deutsch and Jozsa in [ <a href=\"#Deutsch_Jozsa\">33</a> ]. Although probabilistically easy to solve with <i>O(1)</i> queries, the Deutsch-Jozsa problem has exponential worst case deterministic query complexity classically. ",references:[32,259,33],category:"Oracular Algorithms"},"5":{alg_id:19,name:"Formula Evaluation",speedup:"Polynomial",description:" A Boolean expression is called a formula if each variable is used only once. A formula corresponds to a circuit with no fanout, which consequently has the topology of a tree. By Reichardt's span-program formalism, it is now known  [ <a href=\"#Reichardt_Reflection\">158</a> ] that the quantum query complexity of any formula of <i>O</i> (1) fanin on <i>N</i> variables is <span>\\( \\Theta(\\sqrt{N}) \\)</span>. This result culminates from a long line of work [ <a href=\"#Childs_Jordan\">27</a> , <a href=\"#ragged\">8</a> , <a href=\"#Reichardt_Spalek\">80</a> , <a href=\"#Reichardt_Unbalanced\">159</a> , <a href=\"#Reichardt_Faster\">160</a> ],  which started with the discovery by Farhi <i>et al.</i> [ <a href=\"#Farhi_NAND\">38</a> ] that NAND trees on <span>\\( 2^n \\)</span> variables can be evaluated on quantum computers in time <span>\\( O(2^{0.5n}) \\)</span> using a continuous-time quantum walk, whereas classical computers require <span>\\( \\Omega(2^{0.753n}) \\)</span> queries. In many cases, the quantum formula-evaluation  algorithms are efficient not only in query complexity but also in time-complexity. The  span-program formalism also yields quantum query complexity lower bounds [ <a href=\"#Reichardt2010\">149</a> ]. Although originally discovered from a different point of  view, Grover's algorithm can be regarded as a special case of formula evaluation in which  every gate is OR. The quantum complexity of evaluating non-boolean formulas has also been studied [ <a href=\"#Cleve_tree\">29</a> ], but is not as fully understood. Childs <i>et al.</i> have generalized to the case in which input variables may be repeated ( <i>i.e.</i> the first  layer of the circuit may include fanout) [ <a href=\"#Childs_Kimmel_Kothari\">101</a> ]. They  obtained a quantum algorithm using <span>\\( O(\\min \\{N,\\sqrt{S},N^{1/2} G^{1/4} \\}) \\)</span> queries, where <i>N</i> is the number of input variables not including multiplicities, <i>S</i> is the number of inputs counting multiplicities, and <i>G</i> is the number of gates in the formula. References [ <a href=\"#Zhan_Kimmel_Hassidim\">164</a> ], [ <a href=\"#Kimmel\">165</a> ], and [ <a href=\"#JK15\">269</a> ] consider special cases of the NAND tree problem in which the number of NAND gates taking unequal inputs is limited. Some of these cases yield superpolynomial separation between quantum and classical query complexity. ",references:[158,27,8,80,159,160,38,149,29,101,164,165,269],category:"Oracular Algorithms"},"6":{alg_id:20,name:"Hidden Shift",speedup:"Superpolynomial",description:" We are given oracle access to some function <i>f</i> on  <span>\\( \\mathbb{Z}_N \\)</span>. We know that <i>f(x) = g(x+s)</i> where <i>g</i> is a known function  and <i>s</i> is an unknown shift. The hidden shift problem is to find <i>s</i> . By reduction from Grover's problem it is clear that at least <span>\\( \\sqrt{N} \\)</span> queries are necessary to solve hidden shift in general. However, certain special cases of the hidden shift problem are solvable on quantum computers using <i>O(1)</i> queries. In  particular, van Dam <i>et al.</i> showed that this can be done if <i>f</i> is a multiplicative character of a finite ring or field [ <a href=\"#vanDam_shift\">89</a> ]. The previously  discovered shifted Legendre symbol algorithm  [ <a href=\"#vanDam_Legendre\">88</a> , <a href=\"#vanDam_weighing\">86</a> ] is subsumed as a special case of this, because the Legendre symbol <span>\\( \\left(\\frac{x}{p} \\right) \\)</span> is a multiplicative character of <span>\\( \\mathbb{F}_p \\)</span>. No classical algorithm running in time <i>O</i> (polylog( <i>N</i> )) is known for these problems. Furthermore, the quantum algorithm for the shifted Legendre symbol problem would break a certain cryptographic pseudorandom generator given the ability to make quantum queries to the generator [ <a href=\"#vanDam_shift\">89</a> ]. A quantum speedup for hidden shift problems of difference sets is given in [ <a href=\"#Roet16\">312</a> ], and this also subsumes the Legendre symbol problem as a special case. Roetteler has found exponential quantum speedups for  finding hidden shifts of certain nonlinear Boolean functions [ <a href=\"#Roetteler08\">105</a> , <a href=\"#Roetteler_quad\">130</a> ]. Building on this work, Gavinsky, Roetteler, and Roland have shown [ <a href=\"#Gavinsky\">142</a> ] that the hidden  shift problem on random boolean functions <span>\\( f:\\mathbb{Z}_2^n \\to \\mathbb{Z}_2 \\)</span> has <i>O(n)</i> average case quantum complexity, whereas the classical query complexity is <span>\\( \\Omega(2^{n/2}) \\)</span>. The results in [ <a href=\"#Ettinger_Hoyer\">143</a> ], though they are phrased in terms of the hidden subgroup problem for the dihedral group, imply that the quantum <i>query</i> complexity of the hidden shift problem for an injective function on <span>\\( \\mathbb{Z}_N \\)</span> is <i>O</i> (log <i>n</i> ), whereas the classical query complexity is  <span>\\( \\Theta(\\sqrt{N}) \\)</span>. However, the best known quantum <i>circuit</i> complexity for injective hidden shift on <span>\\( \\mathbb{Z}_N \\)</span> is <span>\\( O(2^{C \\sqrt{\\log N}}) \\)</span>, achieved by Kuperberg's sieve algorithm [ <a href=\"#Kuperberg\">66</a> ]. A recent result, building upon [ <a href=\"#Ivanyos08\">408</a> , <a href=\"#FIMSS_NAHS\">43</a> ], achieves exponential quantum speedups for some generalizations of the Hidden shift problem including the <i>hidden multiple shift problem</i> , in which one has query access to <span>\\(f_s(x) = f(x-hs) \\)</span> over some allowed range of <i>s</i> and one wishes to infer <i>h</i> [ <a href=\"#IPS18\">407</a> ]. ",references:[89,88,86,89,312,105,130,142,143,66,408,43,407],category:"Oracular Algorithms"},"7":{alg_id:21,name:"Polynomial interpolation",speedup:"Varies",description:" Let <span>\\( p(x) = a_d x^d + \\ldots + a_1 x + a_0 \\)</span> be a polynomial over the finite field <span>\\( \\mathrm{GF}(q) \\)</span>. One is given access to an oracle that, given <span>\\( x \\in \\mathrm{GF}(q) \\)</span>, returns <span>\\( p(x) \\)</span>. The polynomial reconstruction problem is, by making queries to the oracle, to determine the coefficients <span>\\( a_d,\\ldots,a_0 \\)</span>. Classically, <span>\\( d + 1 \\)</span> queries are necessary and sufficient. (In some sources use the term reconstruction instead of interpolation for this problem.) Quantumly, <span>\\( d/2 + 1/2 \\)</span> queries are necessary and <span>\\( d/2 + 1 \\)</span> queries are sufficient [ <a href=\"#interp1\">360</a> , <a href=\"#interp2\">361</a> ]. For multivariate polynomials of degree <i>d</i> in <i>n</i> variables the interpolation problem has classical query complexity <span>\\( \\binom{n+d}{d} \\)</span>. As shown in [ <a href=\"#interp3\">387</a> ], the quantum query complexity is <span>\\( O \\left( \\frac{1}{n+1} \\binom{n+d}{d} \\right) \\)</span> over <span>\\( \\mathbb{R} \\)</span> and <span>\\( \\mathbb{C} \\)</span> and it is <span>\\( O \\left( \\frac{d}{n+d} \\binom{n+d}{d} \\right) \\)</span> over <span>\\( \\mathbb{F}_q \\)</span> for sufficiently large <i>q</i> . Quantum algorithms have also been discovered for the case that the oracle returns <span>\\( \\chi(f(x)) \\)</span> where <span>\\( \\chi \\)</span> is a quadratic character of <span>\\( \\mathrm{GF}(q) \\)</span> [ <a href=\"#RS04\">390</a> ], and the case where the oracle returns <span>\\( f(x)^e \\)</span> [ <a href=\"#IKS17\">392</a> ]. These generalize the hidden shift algorithm of [ <a href=\"#vanDam_shift\">89</a> ] and achieve an exponential speedup over classical computation. A quantum algorithm for reconstructing rational functions over finite fields given noisy and incomplete oracle access to the function values is given in [ <a href=\"#HRS05\">391</a> ]. ",references:[360,361,387,390,392,89,391],category:"Oracular Algorithms"},"8":{alg_id:22,name:"Pattern matching",speedup:"Superpolynomial",description:" Given strings <i>T</i> of length <i>n</i> and <i>P</i> of length <i>m</i> < <i>n</i> , both from some finite alphabet, the pattern matching problem is to find an occurrence of <i>P</i> as a substring of <i>T</i> or to report that <i>P</i> is not a substring of <i>T</i> . More generally, <i>T</i> and <i>P</i> could be <i>d</i> -dimensional arrays rather than one-dimensional arrays (strings). Then, the pattern matching problem is to return the location of <i>P</i> as a  <span>\\(m \\times m \\times \\ldots \\times m\\)</span> block within the <span>\\(n \\times n \\times \\ldots \\times n\\)</span> array <i>T</i> or report that no such location exists. The <span>\\( \\Omega(\\sqrt{N}) \\)</span> query lower bound for unstructured search [ <a href=\"#BBBV\">216</a> ] implies that the worst-case quantum query complexity of this problem is <span>\\( \\Omega ( \\sqrt{n} + \\sqrt{m} ) \\)</span>. A quantum algorithm achieving this, up to logarithmic factors, was obtained in [ <a href=\"#RV00\">217</a> ]. This quantum algorithm works through the use of Grover's algorithm together with a classical method called deterministic sampling. More recently, Montanaro showed that superpolynomial quantum speedup can be achieved on average case instances of pattern matching, provided that <i>m</i> is greater than logarithmic in <i>n</i> . Specifically, the quantum algorithm given in [ <a href=\"#Montanaro14\">215</a> ] solves average case pattern matching in <span>\\( \\widetilde{O}((n/m)^{d/2} 2^{O(d^{3/2} \\sqrt{\\log m})})\\)</span> time. This quantum algorithm is constructed by generalizing Kuperberg's quantum sieve algorithm [ <a href=\"#Kuperberg\">66</a> ] for dihedral hidden subgroup and hidden shift problems so that it can operate in <i>d</i> dimensions and accomodate small amounts of noise, and then classically reducing the pattern matching problem to this noisy <i>d</i> -dimensional version of hidden shift. ",references:[216,217,215,66],category:"Oracular Algorithms"},"9":{alg_id:23,name:"Ordered Search",speedup:"Constant factor",description:" We are given oracle access to a list of <i>N</i> numbers in order  from least to greatest. Given a number <i>x</i> , the task is to find out where in the  list it would fit. Classically, the best possible algorithm is binary search which takes <span>\\( \\log_2 N \\)</span> queries. Farhi <i>et al.</i> showed that a quantum computer can achieve  this using 0.53 <span>\\( \\log_2 N \\)</span> queries [ <a href=\"#FGGS99\">39</a> ]. Currently, the best  known deterministic quantum algorithm for this problem uses 0.433 <span>\\( \\log_2 N \\)</span> queries [ <a href=\"#Landahl\">103</a> ]. A lower bound of <span>\\( \\frac{\\ln 2}{\\pi} \\log_2 N \\)</span> quantum queries has been proven for this problem [ <a href=\"#HNS01\">219</a> , <a href=\"#Childs_Lee\">24</a> ]. In [ <a href=\"#Ben_Or_Search\">10</a> ], a randomized quantum algorithm is given whose expected query complexity is less than <span>\\( \\frac{1}{3} \\log_2 N \\)</span>. ",references:[39,103,219,24,10],category:"Oracular Algorithms"},"10":{alg_id:24,name:"Graph Properties in the Adjacency Matrix Model",speedup:"Polynomial",description:" Let <i>G</i> be a graph of <i>n</i> vertices. We are given access to an oracle, which given a pair of integers in {1,2,..., <i>n</i> } tells us whether the corresponding vertices are connected by an edge. Building on previous work  [ <a href=\"#DH96\">35</a> , <a href=\"#prev2\">52</a> , <a href=\"#prev3\">36</a> ], Dürr <i>et al.</i> [ <a href=\"#Durr_graphs\">34</a> ] show that the quantum query complexity  of finding a minimum spanning tree of weighted graphs, and deciding connectivity for  directed and undirected graphs have <span>\\( \\Theta(n^{3/2}) \\)</span> quantum query complexity, and that finding lowest weight paths has <span>\\( O(n^{3/2}\\log^2 n) \\)</span> quantum query complexity. Deciding whether a graph is bipartite, detecting cycles, and deciding whether a given vertex can be reached from another (st-connectivity) can all be achieved using a number of queries and quantum gates that both scale as <span>\\( \\widetilde{O}(n^{3/2}) \\)</span>, and only logarithmically many qubits, as shown in [ <a href=\"#CMB16\">317</a> ], building upon [ <a href=\"#Berzina\">13</a> , <a href=\"#Arins\">272</a> , <a href=\"#BR12\">318</a> ]. A span-program-based quantum algorithm for detecting trees of a given size as minors in <span>\\( \\widetilde{O}(n) \\)</span> time is given in [ <a href=\"#Wang13\">240</a> ]. A graph property is  sparse if there exists a constant <i>c</i> such that every graph with the property has a ratio of edges to vertices at most <i>c</i> . Childs and Kothari have shown that all  sparse graph properties have query complexity <span>\\( \\Theta(n^{2/3}) \\)</span> if they cannot be characterized by a list of forbidden subgraphs and <span>\\( o(n^{2/3}) \\)</span>  ( <a href=\"http://en.wikipedia.org/wiki/Big_O_notation#Little-o_notation\">little-o</a> ) if they can [ <a href=\"#Childs_minor\">140</a> ]. The former algorithm is based on Grover  search, the latter on the quantum walk formalism of [ <a href=\"#Magniez_walk\">141</a> ]. By Mader's theorem, sparse graph properties include all nontrivial minor-closed properties. These include planarity, being a forest, and not containing a path of given length. According to the widely-believed Aanderaa-Karp-Rosenberg conjecture, all of the above problems have <span>\\( \\Omega(n^2) \\)</span> classical query complexity. Another interesting computational problem is finding a subgraph <i>H</i> in a given graph <i>G</i> . The simplest case of this finding the triangle, that is, the clique of size three. The fastest known quantum algorithm for this finds a triangle in <span>\\( O(n^{5/4}) \\)</span> quantum queries [ <a href=\"#CLM16\">319</a> ], improving upon [ <a href=\"#LG14\">276</a> , <a href=\"#Lee_Magniez_Santha12\">175</a> , <a href=\"#Jeffery_Kothari_Magniez12\">171</a> , <a href=\"#Magniez_triangle\">70</a> , <a href=\"#Belovs_Constant\">152</a> , <a href=\"#Buhrman_collision\">21</a> ]. Stronger quantum query complexity upper bounds are known when the graphs are sufficiently sparse [ <a href=\"#CLM16\">319</a> , <a href=\"#LS15\">320</a> ]. Classically, triangle finding  requires <span>\\( \\Omega(n^2) \\)</span> queries [ <a href=\"#Buhrman_collision\">21</a> ].  More generally, a quantum computer can find an  arbitrary subgraph of <i>k</i> vertices using <span>\\( O(n^{2-2/k-t}) \\)</span> queries where  <span>\\( t=(2k-d-3)/(k(d+1)(m+2)) \\)</span> and <i>d</i> and <i>m</i> are such that <i>H</i> has a vertex of degree <i>d</i> and <i>m</i> + <i>d</i> edges  [ <a href=\"#Lee_Magniez_Santha\">153</a> ]. This improves on the previous algorithm of [ <a href=\"#Magniez_triangle\">70</a> ]. In some cases, this query complexity is beaten by the quantum algorithm of [ <a href=\"#Childs_minor\">140</a> ], which finds <i>H</i> using <span>\\( \\widetilde{O}\\left( n^{\\frac{3}{2}-\\frac{1}{\\mathrm{vc}(H)+1}} \\right) \\)</span> queries, provided <i>G</i> is sparse, where vc( <i>H</i> ) is the size of the minimal  vertex cover of <i>H</i> . A quantum algorithm for finding constant-sized sub-hypergraphs over 3-uniform hypergraphs in <span>\\( O(n^{1.883}) \\)</span> queries is given in [ <a href=\"#LGNT13\">241</a> ]. ",references:[35,52,36,34,317,13,272,318,240,140,141,319,276,175,171,70,152,21,319,320,21,153,70,140,241],category:"Oracular Algorithms"},"11":{alg_id:25,name:"Graph Properties in the Adjacency List Model",speedup:"Polynomial",description:" Let <i>G</i> be a graph of <i>N</i> vertices, <i>M</i> edges, and  degree <i>d</i> . We are given access to an oracle which, when queried with the label of a vertex and <span>\\( j \\in \\{1,2,\\ldots,d\\} \\)</span> outputs the <i>j</i> th neighbor of the vertex or null if the vertex has degree less than <i>d</i> . Suppose we are given the promise that <i>G</i> is either bipartite or is far from bipartite in the sense that a constant fraction of the edges would need to be removed to achieve bipartiteness. Then, as shown in [ <a href=\"#Ambainis_Childs_Liu\">144</a> ], the quantum complexity of deciding bipartiteness is <span>\\( \\widetilde{O}(N^{1/3}) \\)</span>. Also in [ <a href=\"#Ambainis_Childs_Liu\">144</a> ], it is shown that distinguishing expander graphs from graphs that are far from being expanders has quantum complexity <span>\\( \\widetilde{O}(N^{1/3}) \\)</span> and  <span>\\( \\widetilde{\\Omega}(N^{1/4}) \\)</span>, whereas the classical complexity is  <span>\\( \\widetilde{\\Theta}(\\sqrt{N}) \\)</span>. The key quantum algorithmic tool is Ambainis' algorithm for element distinctness. In [ <a href=\"#Durr_graphs\">34</a> ], it is shown that finding a minimal spanning tree has quantum query complexity <span>\\( \\Theta(\\sqrt{NM}) \\)</span>, deciding graph  connectivity has quantum query complexity <span>\\( \\Theta(N) \\)</span> in the undirected case, and <span>\\( \\widetilde{\\Theta}(\\sqrt{NM}) \\)</span> in the directed case, and computing the lowest weight path from a given source to all other vertices on a weighted graph has quantum query complexity <span>\\( \\widetilde{\\Theta}(\\sqrt{NM}) \\)</span>. In [ <a href=\"#CMB16\">317</a> ] quantum algorithms are given for st-connectivity, deciding bipartiteness, and deciding whether a graph is a forest, which run in <span>\\( \\widetilde{O}(N \\sqrt{d}) \\)</span> time and use only logarithmically many qubits. ",references:[144,144,34,317],category:"Oracular Algorithms"},"12":{alg_id:26,name:"Welded Tree",speedup:"Superpolynomial",description:" Some computational problems can be phrased in terms of the query  complexity of finding one's way through a maze. That is, there is some graph <i>G</i> to which one is given oracle access. When queried with the label of a given node, the oracle returns a list of the labels of all adjacent nodes. The task is, starting from some source node ( <i>i.e.</i> its label), to find the label of a certain marked destination node. As shown by Childs <i>et al.</i> [ <a href=\"#Childs_weld\">26</a> ],  quantum computers can exponentially outperform classical computers at this task for at least some graphs. Specifically, consider the graph obtained by joining together two depth- <i>n</i> binary trees by a random \"weld\" such that all nodes but the two roots have degree three. Starting from one root, a quantum computer can find the other  root using poly( <i>n</i> ) queries, whereas this is provably impossible using classical queries. ",references:[26],category:"Oracular Algorithms"},"13":{alg_id:27,name:"Collision Finding and Element Distinctness",speedup:"Polynomial",description:" Suppose we are given oracle access to a two to one function <i>f</i> on a domain of size <i>N</i> . The collision problem is to find a pair <span>\\( x,y \\in \\{1,2,\\ldots,N\\} \\)</span> such that <i>f(x) = f(y)</i> . The classical randomized query complexity of this problem is <span>\\( \\Theta(\\sqrt{N}) \\)</span>, whereas, as shown by Brassard <i>et al.</i> , a quantum computer can achieve this  using <span>\\(O(N^{1/3}) \\)</span> queries [ <a href=\"#Brassard_collision\">18</a> ]. (See also [ <a href=\"#BHT98b\">315</a> ].) Removing the promise that <i>f</i> is two-to-one yields a problem called element distinctness, which has <span>\\( \\Theta(N) \\)</span> classical query complexity. Improving upon [ <a href=\"#Buhrman_collision\">21</a> ], Ambainis gives a quantum algorithm with query  complexity of <span>\\( O(N^{2/3}) \\)</span> for element distinctness, which is optimal [ <a href=\"#Ambainis_distinctness\">7</a> , <a href=\"#P17\">374</a> ]. The problem of deciding whether any <i>k</i> -fold collisions exist is called <i>k</i> -distinctness. Improving upon [ <a href=\"#Ambainis_distinctness\">7</a> , <a href=\"#Belovs_Lee\">154</a> ], the best quantum query complexity for <i>k</i> -distinctness is <span>\\( O(n^{3/4 - 1/(4(2^k-1))}) \\)</span> [ <a href=\"#Belovs12\">172</a> , <a href=\"#Childs_Jeffery_Kothari_Magniez13\">173</a> ]. For <i>k</i> =2,3 this is also the time-complexity, up to logarithmic  factors, by [ <a href=\"#Ambainis_distinctness\">7</a> ]. For <span>\\( k > 3\\)</span> the fastest known quantum algorithm has time complexity <span>\\( O(n^{(k-1)/k}) \\)</span> [ <a href=\"#Jefferythesis\">363</a> ]. Given two functions <i>f</i> and <i>g</i> , on domains of size <i>N</i> and <i>M</i> , respectively a claw is a pair <i>x,y</i> such that <i>f(x) = g(y)</i> . In the case that <i>N</i> = <i>M</i> , the algorithm of [ <a href=\"#Ambainis_distinctness\">7</a> ] solves claw-finding in <span>\\( O(N^{2/3}) \\)</span> queries, improving on the previous <span>\\( O(N^{3/4} \\log N) \\)</span> quantum algorithm of [ <a href=\"#Buhrman_collision\">21</a> ]. Further work gives improved query complexity for various parameter regimes in which <span>\\(N \\neq M\\)</span> [ <a href=\"#Tani\">364</a> , <a href=\"#IwamaKawachi\">365</a> ]. More generally, a related problem to element distinctness, is, given oracle access to a sequence, to estimate the <span>\\(k^{\\mathrm{th}}\\)</span> frequency moment <span>\\(F_k = \\sum_j n_j^k \\)</span>, where <span>\\(n_j\\)</span> is the number of times that <i>j</i> occurs in the sequence. An approximately quadratic speedup for this problem is obtained in [ <a href=\"#M15c\">277</a> ]. See also <a href=\"#graph_collision\">graph collision</a> .  <a name=\"graph_collision\"></a> ",references:[18,315,21,7,374,7,154,172,173,7,363,7,21,364,365,277],category:"Oracular Algorithms"},"14":{alg_id:28,name:"Graph Collision",speedup:"Polynomial",description:" We are given an undirected graph of <i>n</i> vertices and oracle access to a labelling of the vertices by 1 and 0. The graph collision problem is, by querying this oracle, to decide whether there exist a pair of vertices, connected by an edge, both of which are labelled 1. One can embed Grover's unstructured search problem as an instance of graph collision by choosing the star graph, labelling the center 1, and labelling the remaining vertices by the database entries. Hence, this problem has quantum query complexity <span>\\( \\Omega(\\sqrt{n}) \\)</span> and classical query complexity <span>\\( \\Theta (n) \\)</span>. In [ <a href=\"#Magniez_triangle\">70</a> ], Magniez, Nayak, and Szegedy gave a <span>\\( O(N^{2/3}) \\)</span>-query quantum algorithm for graph collision on general graphs. This remains the best upper bound on quantum query complexity for this problem on general graphs. However, stronger upper bounds have been obtained for several special classes of graphs. Specifically, the quantum query complexity on a graph <i>G</i> is <span>\\( \\widetilde{O}(\\sqrt{n} + \\sqrt{l}) \\)</span> where <i>l</i> is the number of non-edges in <i>G</i> [ <a href=\"#JKM\">161</a> ], <span>\\(O(\\sqrt{n} \\alpha^{1/6}) \\)</span> where <span>\\(\\alpha\\)</span> is the size of the largest independent set of <i>G</i> [ <a href=\"#Belovs12\">172</a> ], <span>\\(O(\\sqrt{n} + \\sqrt{\\alpha^*})\\)</span> where <span>\\( \\alpha^* \\)</span> is the maximum total degree of any independent set of <i>G</i> [ <a href=\"#GI12\">200</a> ], and <span>\\(O(\\sqrt{n} t^{1/6}) \\)</span> where <i>t</i> is the treewidth of <i>G</i> [ <a href=\"#ABI13\">201</a> ]. Furthermore, the quantum query complexity is <span>\\( \\widetilde{O}(\\sqrt{n}) \\)</span> with high probability for random graphs in which the presence or absence of an edge between each pair of vertices is chosen independently with fixed probability, ( <i>i.e.</i> Erdős-Rényi graphs) [ <a href=\"#GI12\">200</a> ]. See [ <a href=\"#ABI13\">201</a> ] for a summary of these results as well as new upper bounds for two additional classes of graph that are too complicated to describe here. ",references:[70,161,172,200,201,200,201],category:"Oracular Algorithms"},"15":{alg_id:29,name:"Matrix Commutativity",speedup:"Polynomial",description:" We are given oracle access to <i>k</i> matrices, each of which are <span>\\( n \\times n \\)</span>. Given integers <span>\\( i,j \\in \\{1,2,\\ldots,n\\} \\)</span>, and <span>\\( x \\in \\{1,2,\\ldots,k\\} \\)</span> the oracle returns the <i>ij</i> matrix element of the  <span>\\( x^{\\mathrm{th}} \\)</span> matrix. The task is to decide whether all of these <i>k</i> matrices commute. As shown by Itakura [ <a href=\"#Itakura\">54</a> ], this can be achieved on a quantum computer using <span>\\( O(k^{4/5}n^{9/5}) \\)</span> queries, whereas classically this requires <span>\\( \\Omega( k n^2 ) \\)</span> queries. ",references:[54],category:"Oracular Algorithms"},"16":{alg_id:30,name:"Group Commutativity",speedup:"Polynomial",description:" We are given a list of <i>k</i> generators for a group <i>G</i> and access to a blackbox implementing group multiplication. By querying this blackbox we  wish to determine whether the group is commutative. The best known classical algorithm is due to Pak and requires <i>O(k)</i> queries. Magniez and Nayak have shown that the  quantum query complexity of this task is <span>\\( \\widetilde{\\Theta}(k^{2/3}) \\)</span> [ <a href=\"#Magniez_Nayak\">139</a> ]. ",references:[139],category:"Oracular Algorithms"},"17":{alg_id:31,name:"Hidden Nonlinear Structures",speedup:"Superpolynomial",description:" Any Abelian group <i>G</i> can be visualized as a lattice. A subgroup <i>H</i> of <i>G</i> is a sublattice, and the cosets of <i>H</i> are all the shifts of that sublattice. The Abelian hidden subgroup problem is normally solved by obtaining superposition over a random coset of the Hidden subgroup, and then taking the Fourier transform so as to sample from the dual lattice. Rather than generalizing to non-Abelian groups (see <a href=\"#nonabelian_HSP\">non-Abelian hidden subgroup</a> ), one can instead generalize to the problem of identifying hidden subsets other than lattices. As shown by Childs <i>et al.</i> [ <a href=\"#Childs_nonlinear\">23</a> ] this problem is efficiently solvable on quantum computers for certain subsets defined by polynomials, such as spheres.  Decker <i>et al.</i> showed how to efficiently solve some related problems in  [ <a href=\"#Wocjan_nonlinear\">31</a> , <a href=\"#DHIS13\">212</a> ]. ",references:[23,31,212],category:"Oracular Algorithms"},"18":{alg_id:32,name:"Center of Radial Function",speedup:"Polynomial",description:" We are given an oracle that evaluates a function <i>f</i> from  <span>\\( \\mathbb{R}^d \\)</span> to some arbitrary set <i>S</i> , where <i>f</i> is spherically  symmetric. We wish to locate the center of symmetry, up to some precision.  (For simplicity, let the precision be fixed.) In [ <a href=\"#Liu\">110</a> ],  Liu gives a quantum algorithm, based on a curvelet transform, that solves  this problem using a constant number of quantum queries independent of <i>d</i> . This constitutes a polynomial speedup over the classical lower  bound, which is <span>\\( \\Omega(d) \\)</span> queries. The algorithm works when the function <i>f</i> fluctuates on sufficiently small scales, <i>e.g.</i> , when the level sets  of <i>f</i> are sufficiently thin spherical shells. The quantum algorithm is shown to work in an idealized continuous model, and nonrigorous arguments suggest that discretization effects should be small. ",references:[110],category:"Oracular Algorithms"},"19":{alg_id:33,name:"Group Order and Membership",speedup:"Superpolynomial",description:" Suppose a finite group <i>G</i> is given oracularly in the following way. To every element in <i>G</i> , one assigns a corresponding label. Given an ordered pair of labels of group elements, the oracle returns the label of their product. There are several classically hard problems regarding such groups. One is to find the group's order, given the labels of a set of generators. Another task is, given a bitstring, to decide whether it  corresponds to a group element. The constructive version of this membership problem requires, in the yes case, a decomposition of the given element as a product of group generators.  Classically, these problems cannot be solved using polylog(| <i>G</i> |) queries even if <i>G</i> is Abelian. For Abelian groups, quantum computers can solve these problems using polylog(| <i>G</i> |) queries by reduction to the Abelian hidden subgroup problem, as shown  by Mosca [ <a href=\"#Mosca_thesis\">74</a> ]. Furthermore, as shown by Watrous  [ <a href=\"#Watrous_solvable\">91</a> ], quantum computers can solve these problems using polylog(| <i>G</i> |) queries for any solvable group. For groups given as matrices over a finite field rather than oracularly, the order finding and constructive membership problems can be solved in polynomial time by using the quantum algorithms for discrete log and factoring [ <a href=\"#Babai\">124</a> ]. See also <a href=\"#group_isomorphism\">group isomorphism</a> .  <a name=\"group_isomorphism\"></a> ",references:[74,91,124],category:"Oracular Algorithms"},"20":{alg_id:34,name:"Group Isomorphism",speedup:"Superpolynomial",description:" Let <i>G</i> be a finite group. To every element of <i>G</i> is assigned an arbitrary label (bit string). Given an ordered pair of labels of group elements, the group oracle returns the label of their product. Given access to the group oracles for two groups <i>G</i> and <i>G'</i> , and a list of generators for each group, we must decide whether <i>G</i> and <i>G'</i> are isomorphic. For Abelian groups, we can solve this problem using poly(log | <i>G</i> |, log | <i>G'</i> |) queries to the oracle by applying the quantum algorithm of [ <a href=\"#Cheung_Mosca\">127</a> ], which decomposes any Abelian group into a canonical direct product of cyclic groups. The quantum algorithm of [ <a href=\"#LeGall\">128</a> ] solves the group isomorphism problem using poly(log | <i>G</i> |, log | <i>G'</i> |) queries for a certain class of non-Abelian groups. Specifically, a group <i>G</i> is in this class if <i>G</i> has a normal Abelian subgroup <i>A</i> and an element <i>y</i> of order coprime to | <i>A</i> | such that G = <i>A</i> , <i>y</i> . Zatloukal has recently given an exponential quantum speedup for some instances of a problem closely related to group isomorphism, namely testing equivalence of group extensions [ <a href=\"#Z13\">202</a> ]. ",references:[127,128,202],category:"Oracular Algorithms"},"21":{alg_id:35,name:"Statistical Difference",speedup:"Polynomial",description:" Suppose we are given two black boxes <i>A</i> and <i>B</i> whose domain is the integers 1 through <i>T</i> and whose range is the integers 1 through <i>N</i> . By choosing uniformly at random among allowed inputs we obtain a probability distribution over the possible outputs. We wish to approximate to constant  precision the L1 distance between the probability distributions determined by <i>A</i> and <i>B</i> . Classically the number of necessary queries scales essentially linearly  with N. As shown in [ <a href=\"#Bravyi_difference\">117</a> ], a quantum computer can achieve this using <span>\\( O(\\sqrt{N}) \\)</span> queries. Approximate uniformity and orthogonality of probability distributions can also be decided on a quantum computer using  <span>\\( O(N^{1/3}) \\)</span> queries. The main tool is the quantum counting algorithm of  [ <a href=\"#BHT98\">16</a> ]. A further improved quantum algorithm for this task is obtained in [ <a href=\"#M15b\">265</a> ]. ",references:[117,16,265],category:"Oracular Algorithms"},"22":{alg_id:36,name:"Finite Rings and Ideals",speedup:"Superpolynomial",description:" Suppose we are given black boxes implementing the addition and multiplication operations on a finite ring <i>R</i> , not necessarily commutative, along with a set of generators for <i>R</i> . With respect to addition, <i>R</i> forms a  finite Abelian group ( <i>R</i> ,+). As shown in [ <a href=\"#Arvind\">119</a> ], on a quantum computer one can find in poly(log | <i>R</i> |) time a set of additive generators <span>\\( \\{h_1,\\ldots,h_m\\} \\subset R \\)</span> such that  <span>\\( (R,+) \\simeq \\langle h_1 \\rangle \\times \\ldots \\times \\langle h_M \\rangle\\)</span> and <i>m</i> is polylogarithmic in | <i>R</i> |. This allows efficient computation of a  multiplication tensor for <i>R</i> . As shown in [ <a href=\"#WJAB\">118</a> ], one can  similarly find an additive generating set for any ideal in <i>R</i> . This allows one  to find the intersection of two ideals, find their quotient, prove whether a given ring element belongs to a given ideal, prove whether a given element is a unit and if so  find its inverse, find the additive and multiplicative identities, compute the order of an ideal, solve linear equations over rings, decide whether an ideal is maximal, find  annihilators, and test the injectivity and surjectivity of ring homomorphisms. As shown  in [ <a href=\"#Arvind2\">120</a> ], one can also use a quantum computer to efficiently  decide whether a given polynomial is identically zero on a given finite black box ring.  Known classical algorithms for these problems scale as poly(| <i>R</i> |). ",references:[119,118,120],category:"Oracular Algorithms"},"23":{alg_id:37,name:"Counterfeit Coins",speedup:"Polynomial",description:" Suppose we are given <i>N</i> coins, <i>k</i> of which are  counterfeit. The real coins are all of equal weight, and the counterfeit coins are  all of some other equal weight. We have a pan balance and can compare the weight of any pair of subsets of the coins. Classically, we need <span>\\( \\Omega(k \\log(N/k)) \\)</span> weighings to identify all of the counterfeit coins. We can introduce an oracle such that given a pair of subsets of the coins of equal cardinality, it outputs one bit indicating balanced or unbalanced. Building on previous work by Terhal and Smolin [ <a href=\"#TS\">137</a> ], Iwama <i>et al.</i> have shown [ <a href=\"#Iwama\">136</a> ]  that on a quantum computer, one can identify all of the counterfeit coins using <span>\\( O(k^{1/4}) \\)</span> queries. The core techniques behind the quantum speedup are amplitude amplification and the Bernstein-Vazirani algorithm. ",references:[137,136],category:"Oracular Algorithms"},"24":{alg_id:38,name:"Matrix Rank",speedup:"Polynomial",description:" Suppose we are given oracle access to the (integer) entries of an <span>\\( n \\times m \\)</span> matrix <i>A</i> . We wish to determine the rank of the matrix.  Classically this requires order <i>nm</i> queries. Building on  [ <a href=\"#Reichardt2010\">149</a> ], Belovs [ <a href=\"#Belovs_Rank\">150</a> ] gives a quantum algorithm that can use fewer queries given a promise that the rank of the  matrix is at least <i>r</i> . Specifically, Belovs' algorithm uses  <span>\\( O(\\sqrt{r(n-r+1)}LT) \\)</span> queries, where <i>L</i> is the root-mean-square of the reciprocals of the <i>r</i> largest singular values of <i>A</i> and <i>T</i> is a factor that depends on the sparsity of the matrix. For general <i>A</i> , <span>\\( T = O(\\sqrt{nm}) \\)</span>. If <i>A</i> has at most <i>k</i> nonzero entries in any row or column then <span>\\( T = O(k \\log(n+m)) \\)</span>. (To achieve the corresponding query complexity in  the <i>k</i> -sparse case, the oracle must take a column index as input, and provide a  list of the nonzero matrix elements from that column as output.) As an important special case, one can use these quantum algorithms for the problem of determining whether a  square matrix is singular, which is sometimes referred to as the determinant problem.  For general <i>A</i> the quantum query complexity of the determinant problem is no  lower than the classical query complexity [ <a href=\"#Dorn\">151</a> ]. However,  [ <a href=\"#Dorn\">151</a> ] does not rule out a quantum speedup given a promise on <i>A</i> ,  such as sparseness or lack of small singular values. ",references:[149,150,151,151],category:"Oracular Algorithms"},"25":{alg_id:39,name:"Matrix Multiplication over Semirings",speedup:"Polynomial",description:" A semiring is a set endowed with addition and multiplication operations that obey all the axioms of a ring except the existence additive inverses. Matrix multiplication over various semirings has many applications to graph problems. Matrix multiplication over semirings can be sped up by straightforward Grover improvements upon schoolbook multiplication, yielding a quantum algorithm that multiplies a pair of <span>\\(n \\times n\\)</span> matrices in <span>\\( \\widetilde{O}(n^{5/2}) \\)</span> time. For some semirings this algorithm outperforms the fastest known classical algorithms and for some semirings it does not [ <a href=\"#LeGall_Nishimura13\">206</a> ]. A case of particular interest is the Boolean semiring, in which OR serves as addition and AND serves as multiplication. No quantum algorithm is known for Boolean semiring matrix multiplication in the general case that beats the best classical algorithm, which has complexity <span>\\( n^{2.373} \\)</span>. However, for sparse input our output, quantum speedups are known. Specifically, let <i>A,B</i> be <i>n</i> by <i>n</i> Boolean matrices. Let <i>C</i> = <i>AB</i> , and let <i>l</i> be the number of entries of <i>C</i> that are equal to 1 ( <em>i.e.</em> TRUE). Improving upon  [ <a href=\"#Buhrman_matrix\">19</a> , <a href=\"#LeGall_Matrix\">155</a> , <a href=\"#Williams_Williams\">157</a> ], the best known upper bound on quantum query complexity is <span>\\(\\widetilde{O}(n \\sqrt{l}) \\)</span>, as shown in [ <a href=\"#JKM\">161</a> ]. If instead the input matrices are sparse, a quantum speedup over the fastest known classical algorithm also has been found in a certain regime [ <a href=\"#LeGall_Nishimura13\">206</a> ]. For detailed comparison to classical algorithms, see [ <a href=\"#LeGall_Matrix\">155</a> , <a href=\"#LeGall_Nishimura13\">206</a> ]. Quantum algorithms have been found to perform matrix multiplication over the (max,min) semiring in <span>\\(\\widetilde{O}(n^{2.473})\\)</span> time and over the distance dominance semiring in <span>\\(\\widetilde{O}(n^{2.458})\\)</span> time [ <a href=\"#LeGall_Nishimura13\">206</a> ]. The fastest known classical algorithm for both of these problems has <span>\\(\\widetilde{O}(n^{2.687})\\)</span> complexity. ",references:[206,19,155,157,161,206,155,206,206],category:"Oracular Algorithms"},"26":{alg_id:40,name:"Subset finding",speedup:"Polynomial",description:" We are oracle access to a function <span>\\( f:D \\to R \\)</span> where <i>D</i> and <i>R</i> are finite sets. Some property <span>\\( P \\subset (D \\times R)^k \\)</span> is specified, for  example as an explicit list. Our task is to find a size- <i>k</i> subset of <i>D</i> satisfying <i>P</i> , <i>i.e.</i> <span>\\( ((x_1,f(x_1)),\\ldots,(x_k,f(x_k))) \\in P \\)</span>, or reject if none exists. As usual, we wish to do this with the minimum number of queries to <i>f</i> . Generalizing the  result of [ <a href=\"#Ambainis_distinctness\">7</a> ], it was shown in  [ <a href=\"#Childs_Eisenberg\">162</a> ] that this can be achieved using <span>\\(O(|D|^{k/(k+1)}) \\)</span> quantum queries. As an noteworthy special case, this algorithm  solves the <i>k</i> -subset-sum problem of finding <i>k</i> numbers from a list with some  desired sum. A matching lower bound for the quantum query complexity is proven in [ <a href=\"#Belovs_Spalek\">163</a> ]. ",references:[7,162,163],category:"Oracular Algorithms"},"27":{alg_id:41,name:"Search with Wildcards",speedup:"Polynomial",description:" The search with wildcards problem is to identify a hidden <i>n</i> -bit string <i>x</i> by making queries to an oracle <i>f</i> . Given <span>\\( S \\subseteq \\{1,2,\\ldots,n\\} \\)</span> and <span>\\( y \\in \\{0,1\\}^{|S|} \\)</span>, <i>f</i> returns one if the substring of <i>x</i> specified by <i>S</i> is equal to <i>y</i> , and returns zero otherwise. Classically, this problem has query complexity <span>\\(\\Theta(n)\\)</span>. As shown in [ <a href=\"#Ambainis_Montanaro12\">167</a> ], the quantum query complexity of this problem is <span>\\( \\Theta(\\sqrt{n}) \\)</span>. Interestingly, this quadratic speedup is achieved not through amplitude amplification or quantum walks, but rather through use of the so-called Pretty Good Measurement. The paper [ <a href=\"#Ambainis_Montanaro12\">167</a> ] also gives a quantum speedup for the related problem of combinatorial group testing. This result and subsequent faster quantum algorithms for group testing are discussed in the entry on Junta Testing and Group Testing.",references:[167],category:"Oracular Algorithms"},"28":{alg_id:42,name:"Network flows",speedup:"Polynomial",description:"A network is a directed graph whose edges are labeled with numbers indicating their carrying capacities, and two of whose vertices are designated as the source and the sink. A flow on a network is an assignment of flows to the edges such that no flow exceeds that edge's capacity, and for each vertex other than the source and sink, the total inflow is equal to the total outflow. The network flow problem is, given a network, to find the flow that maximizes the total flow going from source to sink. For a network with <i>n</i> vertices, <i>m</i> edges, and integer capacities of maximum magnitude <i>U</i> , [ <a href='#Ambainis_Spalek05'>168</a> ] gives a quantum algorithm to find the maximal flow in time <span>\\( O(\\min \\{n^{7/6} \\sqrt{m} \\ U^{1/3}, \\sqrt{nU}m\\} \\times \\log n) \\)</span>. The network flow problem is closely related to the problem of finding a maximal matching of a graph, that is, a maximal-size subset of edges that connects each vertex to at most one other vertex. The paper [ <a href='#Ambainis_Spalek05'>168</a> ] gives algorithms for finding maximal matchings that run in time <span>\\( O(n \\sqrt{m+n} \\log n) \\)</span> if the graph is bipartite, and <span>\\( O(n^2 ( \\sqrt{m/n} + \\log n) \\log n) \\)</span> in the general case. The core of these algorithms is Grover search. The known upper bounds on classical complexity of the network flow and matching problems are complicated to state because different classical algorithms are preferable in different parameter regimes. However, in certain regimes, the above quantum algorithms beat all known classical algorithms. (See [ <a href='#Ambainis_Spalek05'>168</a> ] for details.)",references:[168],category:"Oracular Algorithms"},"29":{alg_id:43,name:"Electrical resistance",speedup:"Exponential",description:"We are given oracle access to a weighted graph of <i>n</i> vertices and maximum degree <i>d</i> whose edge weights are to be interpreted as electrical resistances. Our task is to compute the resistance between a chosen pair of vertices. Wang gave two quantum algorithms in [ <a href='#Wang14'>210</a> ] for this task that run in time <span>\\(\\mathrm{poly}( \\log n, d, 1/\\phi, 1/\\epsilon) \\)</span>, where <span>\\( \\phi \\)</span> is the expansion of the graph, and the answer is to be given to within a factor of <span>\\( 1+\\epsilon \\)</span>. Known classical algorithms for this problem are polynomial in <i>n</i> rather than <span>\\( \\log n \\)</span>. One of Wang's algorithms is based on a novel use of quantum walks. The other is based on the quantum algorithm of [ <a href='#HHL08'>104</a> ] for solving linear systems of equations. The first quantum query complexity upper bounds for the electrical resistance problem in the adjacency query model are given in [ <a href='#IJ15'>280</a> ] using approximate span programs.",references:[210,104,280],category:"Oracular Algorithms"},"30":{alg_id:44,name:"Junta Testing and Group Testing",speedup:"Polynomial",description:"A function <span>\\(f:\\{0,1\\}^n \\to \\{0,1\\}\\)</span> is a <i>k</i> -junta if it depends on at most <i>k</i> of its input bits. The <i>k</i> -junta testing problem is to decide whether a given function is a <i>k</i> -junta or is <span>\\( \\epsilon \\)</span>-far from any <i>k</i> -junta. Althoug it is not obvious, this problem is closely related to group testing. A group testing problem is defined by a function <span>\\(f:\\{1,2,\\ldots,n\\} \\to \\{0,1\\}\\)</span>. One is given oracle access to <i>F</i> , which takes as input subsets of <span>\\( \\{1,2,\\ldots,n\\} \\)</span>. <i>F</i> ( <i>S</i> ) = 1 if there exists <span>\\(x \\in   S \\)</span> such that <i>f</i> ( <i>x</i> ) = 1 and <i>F</i> ( <i>S</i> ) = 0 otherwise. In [ <a href='#ABRW15'>266</a> ] a quantum algorithm is given solving the <i>k</i> -junta problem using <span>\\( \\widetilde{O}(\\sqrt{k/\\epsilon}) \\)</span> queries and <span>\\( \\widetilde{O}(n \\sqrt{k/\\epsilon}) \\)</span> time. This is a quadratic speedup over the classical complexity, and improves upon a previous quantum algorithm for <i>k</i> -junta testing given in [ <a href='#AS07'>267</a> ]. A polynomial speedup for a gapped ( <i>i.e.</i> approximation) version of group testing is also given in [ <a href='#ABRW15'>266</a> ], improving upon the earlier results of [ <a href='#Ambainis_Montanaro12'>167</a> , <a href='#B13'>268</a> ].",references:[266,267,167,268],category:"Oracular Algorithms"}},"Approximation and Simulation Algorithms":{"0":{alg_id:45,name:"Quantum Simulation",speedup:"Superpolynomial",description:" It is believed that for any physically realistic Hamiltonian <i>H</i> on <i>n</i> degrees of freedom, the corresponding time evolution operator  <span>\\( e^{-i H t} \\)</span> can be implemented using poly( <i>n,t</i> ) gates. Unless BPP=BQP, this problem is not solvable in general on a classical computer in polynomial time. Many techniques for quantum simulation have been developed for general classes of Hamiltonians [ <a href=\"#Childs_thesis\">25</a> , <a href=\"#Zalka_sim\">95</a> , <a href=\"#Wiesner_sim\">92</a> , <a href=\"#Aharonov_Tashma\">5</a> , <a href=\"#Cleve_sim\">12</a> , <a href=\"#Childs_Wiebe12\">170</a> , <a href=\"#BCS13\">205</a> , <a href=\"#BCCKS14\">211</a> , <a href=\"#BCCKS14b\">244</a> , <a href=\"#BCK15\">245</a> , <a href=\"#Som15\">278</a> , <a href=\"#Som15\">293</a> , <a href=\"#LC16\">294</a> , <a href=\"#BN16\">295</a> , <a href=\"#BT97\">372</a> , <a href=\"#LC16b\">382</a> ], chemical dynamics [ <a href=\"#Kassal_sim\">63</a> , <a href=\"#Lidar_sim\">68</a> , <a href=\"#HWBT15\">227</a> , <a href=\"#RWSWT16\">310</a> , <a href=\"#SW17\">375</a> ], condensed matter physics [ <a href=\"#Abrams_sim\">1</a> , <a href=\"#Wu_sim\">99</a> , <a href=\"#Ortiz\">145</a> ], relativistic quantum mechanics (the Dirac and Klein-Gordon equations) [ <a href=\"#AW16\">367</a> , <a href=\"#CJO17\">369</a> , <a href=\"#Yepez11\">370</a> , <a href=\"Yepez13\">371</a> ], open quantum systems [ <a href=\"#CW16\">376</a> , <a href=\"#KBGKE11\">377</a> , <a href=\"#CL16\">378</a> , <a href=\"#DPCSC15\">379</a> ],  and quantum field theory [ <a href=\"#Byrnes\">107</a> , <a href=\"#JLP12\">166</a> , <a href=\"#JLP14a\">228</a> , <a href=\"#JLP14b\">229</a> , <a href=\"#BRSS14\">230</a> , <a href=\"#MJ17\">368</a> ]. The exponential complexity of classically simulating quantum systems led Feynman to  first propose that quantum computers might outperform classical computers on certain tasks [ <a href=\"#Feynman\">40</a> ]. Although the problem of finding ground energies of local  Hamiltonians is QMA-complete and therefore probably requires exponential time on a quantum  computer in the worst case, quantum algorithms have been developed to approximate ground [ <a href=\"#Aspuru_science\">102</a> , <a href=\"#WKAH08\">231</a> , <a href=\"#KA09\">232</a> , <a href=\"#WBA11\">233</a> , <a href=\"#TL13\">234</a> , <a href=\"#W13\">235</a> , <a href=\"#FKT16\">308</a> , <a href=\"#SA15\">321</a> , <a href=\"#SCV13\">322</a> , <a href=\"#BBK17\">380</a> , <a href=\"#PKS17\">381</a> ] as well as thermal states [ <a href=\"#Metropolis\">132</a> , <a href=\"#Poulin_Wocjan\">121</a> , <a href=\"#RGE12\">281</a> , <a href=\"#KB16\">282</a> , <a href=\"#CS16\">307</a> ] for some classes of Hamiltonians and equilibrium states for some classes of master equations [ <a href=\"#RS20\">429</a> ]. Efficient quantum algorithms have been also obtained for preparing certain classes of tensor network states [ <a href=\"#SSVCW05\">323</a> , <a href=\"#SHWCS07\">324</a> , <a href=\"#GMC16\">325</a> , <a href=\"#STV12\">326</a> , <a href=\"#SCTVP13\">327</a> , <a href=\"#SBE16\">328</a> ]. ",references:[25,95,92,5,12,170,205,211,244,245,278,293,294,295,372,382,63,68,227,310,375,1,99,145,367,369,370,371,376,377,378,379,107,166,228,229,230,368,40,102,231,232,233,234,235,308,321,322,380,381,132,121,281,282,307,429,323,324,325,326,327,328],category:"Approximation and Simulation Algorithms"},"1":{alg_id:46,name:"Knot Invariants",speedup:"Superpolynomial",description:" As shown by Freedman [ <a href=\"#Freedman\">42</a> , <a href=\"#Freedman2\">41</a> ], <i>et al.</i> , finding a certain additive approximation to the Jones polynomial of the plat closure of a braid at <span>\\( e^{i 2 \\pi/5} \\)</span> is a BQP-complete problem. This  result was reformulated and extended to <span>\\( e^{i 2 \\pi/k} \\)</span> for arbitrary <i>k</i> by Aharonov <i>et al.</i> [ <a href=\"#Aharonov1\">4</a> , <a href=\"#Aharonov2\">2</a> ]. Wocjan and Yard further generalized this, obtaining a quantum algorithm to estimate the HOMFLY polynomial  [ <a href=\"#Wocjan\">93</a> ], of which the Jones polynomial is a special case. Aharonov <i>et al.</i> subsequently showed that quantum computers can in polynomial time estimate a certain additive approximation to the even more general Tutte polynomial for planar  graphs [ <a href=\"#Aharonov3\">3</a> ]. It is not fully understood for what range of parameters  the approximation obtained in [ <a href=\"#Aharonov3\">3</a> ] is BQP-hard. (See also <a href=\"#part_func\">partition  functions</a> .) Polynomial-time quantum algorithms have also been discovered for additively approximating link invariants arising from quantum doubles of finite groups [ <a href=\"#Krovi_Russell12\">174</a> ]. (This problem is not known to be BQP-hard.) As shown in [ <a href=\"#Shor_Jordan\">83</a> ], the problem of finding a certain additive approximation to the Jones polynomial of the <em>trace</em> closure of a braid at <span>\\( e^{i 2 \\pi/5} \\)</span> is DQC1-complete. ",references:[42,41,4,2,93,3,3,174,83],category:"Approximation and Simulation Algorithms"},"2":{alg_id:47,name:"Three-manifold Invariants",speedup:"Superpolynomial",description:" The Turaev-Viro invariant is a function that takes three-dimensional manifolds as input and produces a real number as output. Homeomorphic manifolds yield the same number. Given a three-manifold specified by a Heegaard splitting, a quantum computer can efficiently find a certain additive approximation to its Turaev-Viro invariant, and this approximation is BQP-complete [ <a href=\"#AJKR\">129</a> ]. Earlier, in [ <a href=\"#Garnerone\">114</a> ], a polynomial-time quantum algorithm was given to additively approximate the Witten-Reshitikhin-Turaev (WRT) invariant of a manifold given by a surgery presentation. Squaring the WRT invariant yields the Turaev-Viro invariant. However, it is unknown whether the approximation achieved in  [ <a href=\"#Garnerone\">114</a> ] is BQP-complete. A suggestion of a possible link between quantum computation and three-manifold invariants was also given in  [ <a href=\"#Kauffman\">115</a> ].  <a name=\"part_func\"></a> ",references:[129,114,114,115],category:"Approximation and Simulation Algorithms"},"3":{alg_id:48,name:"Partition Functions",speedup:"Superpolynomial",description:" For a classical system with a finite set of states <i>S</i> the partition function is <span>\\( Z = \\sum_{s \\in S} e^{-E(s)/kT} \\)</span>, where <i>T</i> is the temperature and <i>k</i> is Boltzmann's constant. Essentially every thermodynamic  quantity can be calculated by taking an appropriate partial derivative of the partition function. The partition function of the Potts model is a special case of the Tutte polynomial. A quantum algorithm for approximating the Tutte polynomial is given in  [ <a href=\"#Aharonov3\">3</a> ]. Some connections between these approaches are discussed in [ <a href=\"#Lidar_Ising\">67</a> ]. Additional algorithms for estimating partition functions on quantum computers are given in [ <a href=\"#Arad_Landau\">112</a> , <a href=\"#VdN\">113</a> , <a href=\"#Geraci_QWGT1\">45</a> , <a href=\"#Geraci_exact\">47</a> ].  A BQP-completeness result (where the \"energies\" are allowed to be complex) is also given in  [ <a href=\"#VdN\">113</a> ]. A method for approximating partition functions by simulating  thermalization processes is given in [ <a href=\"#Poulin_Wocjan\">121</a> ]. A quadratic speedup for the approximation of general partition functions is given in [ <a href=\"#WCAN\">122</a> ]. A method based on quantum walks, achieving polynomial speedup for evaluating partition functions is given in [ <a href=\"#M15b\">265</a> ]. ",references:[3,67,112,113,45,47,113,121,122,265],category:"Approximation and Simulation Algorithms"},"4":{alg_id:49,name:"Quantum Approximate Optimization",description:" For many combinatorial optimization problems, finding the exact optimal solution is NP-complete. There are also hardness-of-approximation results proving that finding an approximation with sufficiently small error bound is NP-complete. For certain problems there is a gap between the best error bound achieved by a polynomial-time classical approximation algorithm and the error bound proven to be NP-hard. In this regime there is potential for exponential speedup by quantum computation. In [ <a href=\"#FGG14a\">242</a> ] a new quantum algorithmic technique called the Quantum Approximate Optimization Algorithm (QAOA) was proposed for finding approximate solutions to combinatorial optimization problems. In [ <a href=\"#FGG14b\">243</a> ] it was subsequently shown that QAOA solves a combinatorial optimization problem called Max E3LIN2 with a better approximation ratio than any polynomial-time classical algorithm known at the time. However, an efficient classical algorithm achieving an even better approximation ratio (in fact, the approximation ratio saturating the limit set by hardness-of-approximation) was subsequently discovered [ <a href=\"#BMO15\">260</a> ]. Presently, the power of QAOA relative to classical computing is an active area of research [ <a href=\"#LZ16\">300</a> , <a href=\"#WHT16\">301</a> , <a href=\"#FH16\">302</a> , <a href=\"#Chamon\">314</a> ]. ",references:[242,243,260,300,301,302,314],category:"Approximation and Simulation Algorithms"},"5":{alg_id:50,name:"Semidefinite Programming",speedup:"Polynomial (with some exceptions)",description:" Given a list of <i>m</i> + 1 Hermitian <span>\\(n \\times n \\)</span> matrices <span>\\(C, A_1, A_2, \\ldots, A_m\\)</span> and <i>m</i> numbers <span>\\(b_1, \\ldots, b_m \\)</span>, the problem of semidefinite programming is to find the positive semidefinite <span>\\( n \\times n \\)</span> matrix <i>X</i> that maximizes tr( <i>CX</i> ) subject to the constraints <span>\\( \\mathrm{tr} (A_j X) \\leq b_j \\)</span> for <span>\\( j = 1,2,\\ldots, m \\)</span>. Semidefinite programming has many applications in operations research, combinatorial optimization, and quantum information, and it includes linear programming as a special case. Introduced in [ <a href=\"#BS16\">313</a> ], and subsequently improved in [ <a href=\"#BKL17\">383</a> , <a href=\"#AGG20\">425</a> ], quantum algorithms are now known that can approximately solve semidefinite programs to within <span>\\( \\pm \\epsilon \\)</span> in time <span>\\( O (\\sqrt{m} \\log m \\cdot \\mathrm{poly}(\\log n, r, \\epsilon^{-1})) \\)</span>, where <i>r</i> is the rank of the semidefinite program. This constitutes a quadratic speedup over the fastest classical algorithms when <i>r</i> is small compared to <i>n</i> . The quantum algorithm is based on amplitude amplification and quantum Gibbs sampling [ <a href=\"#Poulin_Wocjan\">121</a> , <a href=\"#CS16\">307</a> ]. In a model in which input is provided in the form of quantum states the quantum algorithm for semidefinite programming can achieve superpolynomial speedup, as discussed in [ <a href=\"#BKL17\">383</a> ], although recent dequantization results [ <a href=\"#CGL20\">421</a> ] delineate limitations on the context in which superpolynomial quantum speedup for semidefinite programs is possible. ",references:[313,383,425,121,307,383,421],category:"Approximation and Simulation Algorithms"},"6":{alg_id:51,name:"Zeta Functions",speedup:"Superpolynomial",description:" Let <i>f</i> ( <i>x</i> , <i>y</i> ) be a degree- <i>d</i> polynomial over a finite field <span>\\( \\mathbb{F}_p \\)</span>. Let <span>\\( N_r \\)</span> be the number of projective solutions to <i>f</i> ( <i>x</i> , <i>y</i> = 0 over the extension field <span>\\( \\mathbb{F}_{p^r} \\)</span>. The zeta function for <i>f</i> is defined to be <span>\\( Z_f(T) = \\exp \\left( \\sum_{r=1}^\\infty \\frac{N_r}{r} T^r \\right) \\)</span>. Remarkably, <span>\\( Z_f(T) \\)</span> always has the form <span>\\( Z_f(T) = \\frac{Q_f(T)}{(1-pT)(1-T)} \\)</span> where <span>\\( Q_f(T) \\)</span> is a polynomial of degree 2 <i>g</i> and <span>\\(g = \\frac{1}{2} (d-1)(d-2) \\)</span> is called the genus of <i>f</i> . Given <span>\\( Z_f(T) \\)</span> one can easily compute the number of zeros of <i>f</i> over any extension field <span>\\( \\mathbb{F}_{p^r} \\)</span>. One can similarly define the zeta function when the original field over which <i>f</i> is defined does not have prime order. As shown by Kedlaya [ <a href=\"#Kedlaya\">64</a> ], quantum computers can determine the zeta function of a genus <i>g</i> curve over a finite field <span>\\( \\mathbb{F}_{p^r} \\)</span> in <span>\\( \\mathrm{poly}(\\log p, r, g) \\)</span> time. The fastest known classical algorithms are all exponential in either log( <i>p</i> ) or <i>g</i> . In a diffent, but somewhat related contex, van Dam has conjectured that due to a connection between the zeros of <em>Riemann</em> zeta functions and the eigenvalues of certain quantum operators, quantum computers might be able to efficiently approximate the number of solutions to equations over finite fields [ <a href=\"#vanDam_zeros\">87</a> ]. ",references:[64,87],category:"Approximation and Simulation Algorithms"},"7":{alg_id:52,name:"Weight Enumerators",speedup:"Superpolynomial",description:" Let <i>C</i> be a code on <i>n</i> bits, <i>i.e.</i> a subset of  <span>\\( \\mathbb{Z}_2^n \\)</span>. The weight enumerator of <i>C</i> is  <span>\\( S_C(x,y) = \\sum_{c \\in C} x^{|c|} y^{n-|c|} \\)</span> where  | <i>c</i> | denotes the Hamming weight of <i>c</i> . Weight enumerators have many uses in the study of classical codes. If <i>C</i> is a linear code, it can be defined by <span>\\( C = \\{c: Ac = 0\\} \\)</span> where <i>A</i> is a matrix over <span>\\( \\mathbb{Z}_2 \\)</span> In this case <span>\\( S_C(x,y) = \\sum_{c:Ac=0} x^{|c|} y^{n-|c|} \\)</span>. Quadratically signed weight enumerators (QWGTs) are a generalization of this:  <span>\\( S(A,B,x,y) = \\sum_{c:Ac=0} (-1)^{c^T B c} x^{|c|} y^{n-|c|} \\)</span>. Now consider the following special case. Let <i>A</i> be an <span>\\( n \\times n \\)</span> matrix over <span>\\( \\mathbb{Z}_2 \\)</span> such that diag( <i>A</i> )=I. Let lwtr( <i>A</i> ) be the lower triangular matrix resulting from setting all entries above the diagonal in <i>A</i> to zero. Let <i>l,k</i> be positive integers. Given the promise that  <span>\\( |S(A,\\mathrm{lwtr}(A),k,l)| \\geq \\frac{1}{2} (k^2+l^2)^{n/2} \\)</span> the problem of determining the sign of <span>\\( S(A,\\mathrm{lwtr}(A),k,l) \\)</span> is BQP-complete, as shown by Knill and Laflamme in [ <a href=\"#Knill_QWGT\">65</a> ]. The evaluation of QWGTs is also closely related to the evaluation of Ising and Potts model partition functions  [ <a href=\"#Lidar_Ising\">67</a> , <a href=\"#Geraci_QWGT1\">45</a> , <a href=\"#Geraci_QWGT2\">46</a> ]. ",references:[65,67,45,46],category:"Approximation and Simulation Algorithms"},"8":{alg_id:53,name:"Simulated Annealing",speedup:"Polynomial",description:" In simulated annealing, one has a series of Markov chains defined by stochastic matrices <span>\\( M_1, M_2,\\ldots,M_n \\)</span>. These are slowly varying in the sense that their limiting distributions <span>\\( pi_1, \\pi_2, \\ldots, \\pi_n \\)</span> satisfy <span>\\( |\\pi_{t+1} -\\pi_t| \\lt \\epsilon \\)</span> for some small <span>\\( \\epsilon \\)</span>. These distributions can often be thought of as thermal distributions at successively lower temperatures. If <span>\\( \\pi_1 \\)</span> can be easily prepared, then by applying this series of Markov chains one can sample from <span>\\( \\pi_n \\)</span>. Typically, one wishes for <span>\\( \\pi_n \\)</span> to be a distribution over good solutions to some optimization problem. Let  <span>\\( \\delta_i \\)</span> be the gap between the largest and second largest eigenvalues of <span>\\( M_i \\)</span>. Let <span>\\( \\delta = \\min_i \\delta_i \\)</span>. The run time of this classical algorithm is proportional to <span>\\( 1/\\delta \\)</span>. Building upon results of Szegedy  [ <a href=\"#Szegedy_arxiv\">135</a> , <a href=\"#Szegedy\">85</a> ], Somma <i>et al.</i> have  shown [ <a href=\"#Somma\">84</a> , <a href=\"#SBBK08\">177</a> ] that quantum computers can sample from <span>\\( \\pi_n \\)</span> with a runtime proportional to <span>\\( 1/\\sqrt{\\delta} \\)</span>. Additional methods by which classical Markov chain Monte Carlo algorithms can be sped up using quantum walks are given in [ <a href=\"#M15b\">265</a> ]. ",references:[135,85,84,177,265],category:"Approximation and Simulation Algorithms"},"9":{alg_id:54,name:"String Rewriting",speedup:"Superpolynomial",description:" String rewriting is a fairly general model of computation. String rewriting systems (sometimes called grammars) are specified by a list of rules by which certain substrings are allowed to be replaced by certain other substrings. For example, context free grammars, are equivalent to the pushdown automata. In [ <a href=\"#Wocjan_strings\">59</a> ], Janzing and Wocjan showed that a certain string rewriting problem is PromiseBQP-complete. Thus quantum computers can solve it in polynomial time, but classical computers probably cannot. Given three strings <i>s,t,t'</i> , and a set of string rewriting rules satisfying certain promises, the problem is to find a certain approximation to the difference between the number of ways of obtaining <i>t</i> from <i>s</i> and the number of ways of obtaining <i>t'</i> from <i>s</i> . Similarly, certain problems of approximating the difference in number of paths between pairs of vertices in a graph, and difference in transition probabilities between pairs of states in a random walk are also BQP-complete [ <a href=\"#Wocjan_walks\">58</a> ]. ",references:[59,58],category:"Approximation and Simulation Algorithms"},"10":{alg_id:55,name:"Matrix Powers",speedup:"Superpolynomial",description:" Quantum computers have an exponential advantage in approximating matrix elements of powers of exponentially large sparse matrices. Suppose we are have an <span>\\( N \\times N \\)</span> symmetric matrix <i>A</i> such that there are at most polylog( <i>N</i> ) nonzero entries in each row, and given a row index, the set of nonzero entries can be efficiently computed. The task is, for any 1 < <i>i</i> < <i>N</i> , and any <i>m</i> polylogarithmic in <i>N</i> , to approximate <span>\\( (A^m)_{ii} \\)</span> the <span>\\( i^{\\mathrm{th}} \\)</span> diagonal matrix element of <span>\\( A^m \\)</span>. The approximation is additive to within <span>\\( b^m \\epsilon \\)</span> where <i>b</i> is a given upper bound on | <i>A</i> | and <span>\\( \\epsilon \\)</span> is of order 1/polylog( <i>N</i> ). As shown by Janzing and Wocjan, this problem is PromiseBQP-complete, as is the corresponding problem for off-diagonal matrix elements [ <a href=\"#Wocjan_matrix\">60</a> ]. Thus, quantum computers can solve it in polynomial time, but classical computers probably cannot.  <hr/>  <a name=\"ONML\"></a> ",references:[60],category:"Approximation and Simulation Algorithms"}},"Optimization, Numerics, and Machine Learning":{"0":{alg_id:56,name:"Constraint Satisfaction",speedup:"Polynomial",description:" Constraint satisfaction problems, many of which are NP-hard, are ubiquitous in computer science, a canonical example being 3-SAT. If one wishes to satisfy as many constraints as possible rather than all of them, these become combinatorial optimization problems. (See also <a href=\"#adiabiatic\">adiabatic algorithms</a> .) The brute force solution to constraint satisfaction problems can be quadratically sped up using Grover's algorithm. However, most constraint satisfaction problems are solvable by classical algorithms that (although still exponential-time) run more than quadratically faster than brute force checking of all possible solutions. Nevertheless, a polynomial quantum speedup over the fastest known classical algorithm for 3-SAT is given in [ <a href=\"#Ambainis_SIGACT\">133</a> ], and polynomial quantum speedups for some other constraint satisfaction problems are given in [ <a href=\"#CGF\">134</a> , <a href=\"#MGAG15\">298</a> ]. In [ <a href=\"#BKF19\">423</a> ] a quadratic quantum speedup for approximate solutions to homogeneous QUBO/Ising problems is obtained by building upon the quantum algorithm for semidefinite programming. A commonly used classical algorithm for constraint satisfaction is backtracking, and for some problems this algorithm is the fastest known. A general quantum speedup for backtracking algorithms is given in [ <a href=\"#M15a\">264</a> ] and further improved in [ <a href=\"#AK17\">422</a> ].  <a name=\"adiabatic\"></a> ",references:[133,134,298,423,264,422],category:"Optimization, Numerics, and Machine Learning"},"1":{alg_id:57,name:"Adiabatic Algorithms",speedup:"Unknown",description:" In adiabatic quantum computation one starts with an initial Hamiltonian whose ground state is easy to prepare, and slowly varies the Hamiltonian to one whose ground state encodes the solution to some computational problem. By the adiabatic theorem, the system will track the instantaneous ground state provided the variation of the Hamiltonian is sufficiently slow. The runtime of an adiabatic algorithm scales at worst as <span>\\(1/ \\gamma^3 \\)</span> where <span>\\( \\gamma \\)</span> is the minimum eigenvalue gap between the ground state and the first excited state [ <a href=\"#JRS06\">185</a> ]. If the Hamiltonian is varied sufficiently smoothly, one can improve this to <span>\\( \\widetilde{O}(1/\\gamma^2) \\)</span> [ <a href=\"#EH12\">247</a> ]. Adiabatic quantum computation was first proposed by Farhi <i>et al.</i> as a method for solving NP-complete combinatorial optimization problems [ <a href=\"#Farhi_adiabatic\">96</a> , <a href=\"#FGGLLP01\">186</a> ]. Adiabatic quantum algorithms for optimization problems typically use \"stoquastic\" Hamiltonians, which do not suffer from the sign problem. Such algorithms are sometimes referred to as quantum annealing. Adiabatic quantum computation with non-stoquastic Hamiltonians is as powerful as the quantum circuit model [ <a href=\"#Aharonov_adiabatic\">97</a> ]. Adiabatic algorithms using stoquastic Hamiltonians are probably less powerful [ <a href=\"#BDOT06\">183</a> ], but are likely more powerful than classical computation [ <a href=\"#H20a\">429</a> ]. The asymptotic runtime of adiabatic optimization algorithms is notoriously difficult to analyze, but some progress has been achieved [ <a href=\"#AKR09\">179</a> , <a href=\"#R04\">180</a> , <a href=\"#FGG02\">181</a> , <a href=\"#FGGGMS09\">182</a> , <a href=\"#FGGN05\">187</a> , <a href=\"#FGGS10\">188</a> , <a href=\"#FGG02B\">189</a> , <a href=\"#vDMV01\">190</a> , <a href=\"#FGHSSYZ12\">191</a> , <a href=\"#IM08\">226</a> ]. (Also relevant is an earlier literature on quantum annealing, which originally referred to a classical optimization algorithm that works by simulating a quantum process, much as simulated annealing is a classical optimization algorithm that works by simulating a thermal process. See <em>e.g.</em> [ <a href=\"#FGSSD94\">199</a> , <a href=\"#MN08\">198</a> ].) Adiabatic quantum computers can perform a process somewhat analogous to Grover search in <span>\\( O(\\sqrt{N}) \\)</span> time [ <a href=\"#Roland_Cerf\">98</a> ]. Adiabatic quantum algorithms achieving quadratic speedup for a more general class of problems are constructed in [ <a href=\"#SB12\">184</a> ] by adapting techniques from [ <a href=\"#Szegedy\">85</a> ]. Adiabatic quantum algorithms have been proposed for several specific problems, including PageRank [ <a href=\"#GZL12\">176</a> ], machine learning [ <a href=\"#PL12\">192</a> , <a href=\"#NDRM08\">195</a> ], finding Hadamard matrices [ <a href=\"#SM19\">406</a> ], and graph problems [ <a href=\"#GC11\">193</a> , <a href=\"#GC13\">194</a> ]. Some quantum simulation algorithms also use adiabatic state preparation. ",references:[185,247,96,186,97,183,429,179,180,181,182,187,188,189,190,191,226,199,198,98,184,85,176,192,195,406,193,194],category:"Optimization, Numerics, and Machine Learning"},"2":{alg_id:58,name:"Gradients, Structured Search, and Learning Polynomials",speedup:"Polynomial",description:" Suppose we are given a oracle for computing some smooth function <span>\\( f:\\mathbb{R}^d \\to \\mathbb{R} \\)</span>. The inputs and outputs to <i>f</i> are given to the oracle with finitely many bits of precision. The task is to estimate <span>\\( \\nabla f \\)</span> at some specified point <span>\\( \\mathbf{x}_0 \\in \\mathbb{R}^d \\)</span>. As shown in [ <a href=\"#Jordan_gradient\">61</a> ], a quantum computer can achieve this using one query, whereas a classical computer needs at least <i>d+1</i> queries. In [ <a href=\"#Bulger\">20</a> ], Bulger suggested potential applications for optimization problems. As shown in appendix D of [ <a href=\"#mythesis\">62</a> ], a quantum computer can use the gradient algorithm to find the minimum of a quadratic form in <i>d</i> dimensions using <i>O(d)</i> queries, whereas, as shown in [ <a href=\"#Yao\">94</a> ], a classical computer needs at least <span>\\( \\Omega(d^2) \\)</span> queries. Single query quantum algorithms for finding the minima of basins based on Hamming distance were given in [ <a href=\"#Hogg\">147</a> , <a href=\"#Hunziker_Meyer\">148</a> , <a href=\"#MP09\">223</a> ]. The quantum algorithm of [ <a href=\"#mythesis\">62</a> ] can also extract all <span>\\( d^2 \\)</span> matrix elements of the quadratic form using <i>O(d)</i> queries, and more generally, all <span>\\( d^n \\)</span> <i>n</i> th derivatives of a smooth function of <i>d</i> variables in <span>\\( O(d^{n-1}) \\)</span> queries. Remarkably general results in [ <a href=\"#CML18\">418</a> , <a href=\"#CMH19\">419</a> , <a href=\"#AGG18\">420</a> ] give quantum speedups for convex optimization and volume estimation of convex bodies, as well as query complexity lower bounds. Roughly speaking these results show that for convex optimization and volume estimation in <i>d</i> dimensions one gets a quadratic speedup in <i>d</i> just as was found earlier for the special case of minimizing quadratic forms. As shown in [ <a href=\"#Roetteler_quad\">130</a> , <a href=\"#Montanaro_polynomials\">146</a> ], quadratic forms and multilinear polynomials in <i>d</i> variables over a finite field may be extracted with a factor of <i>d</i> fewer quantum queries than are required classically. ",references:[61,20,62,94,147,148,223,62,418,419,420,130,146],category:"Optimization, Numerics, and Machine Learning"},"3":{alg_id:59,name:"Linear Systems",speedup:"Superpolynomial",description:" We are given oracle access to an <span>\\( n \\times n \\)</span> matrix <i>A</i> and some description of a vector <i>b</i> . We wish to find some property of <i>f(A)b</i> for some efficiently computable function <i>f</i> . Suppose <i>A</i> is a Hermitian matrix with <i>O</i> (polylog <i>n</i> ) nonzero entries in each row and condition number <i>k</i> . As shown in [ <a href=\"#HHL08\">104</a> ], a quantum computer can in <span>\\( O(k^2 \\log n) \\)</span> time compute to polynomial precision various expectation values of operators with respect to the vector <i>f(A)b</i> (provided that a quantum state proportional to <i>b</i> is efficiently constructable). For certain functions, such as <i>f(x)=1/x</i> , this procedure can be extended to non-Hermitian and even non-square <i>A</i> . The runtime of this algorithm was subsequently improved to <span>\\( O(k \\log^3 k \\log n) \\)</span> in [ <a href=\"#Ambainis_linear\">138</a> ]. Exponentially improved scaling of runtime with precision was obtained in [ <a href=\"#CKS15\">263</a> ]. Some methods to extend this algorithm to apply to non-sparse matrices have been proposed [ <a href=\"#KP16\">309</a> , <a href=\"#WZP17\">402</a> ], although these require certain partial sums of the matrix elements to be pre-computed. Extensions of this quantum algorithm have been applied to problems of estimating electromagnetic scattering crossections [ <a href=\"#CJS13\">249</a> ] (see also [ <a href=\"#CJO17\">369</a> ] for a different approach), solving linear differential equations [ <a href=\"#Berry10\">156</a> , <a href=\"#MP16\">296</a> ], estimating electrical resistance of networks [ <a href=\"#Wang14\">210</a> ], least-squares curve-fitting [ <a href=\"#Wiebe_Braun_Lloyd12\">169</a> ], solving Toeplitz systems [ <a href=\"#WYPGW16\">297</a> ], and machine learning [ <a href=\"#LMR13\">214</a> , <a href=\"#LGZ14\">222</a> , <a href=\"#LMR13b\">250</a> , <a href=\"#RML13\">251</a> , <a href=\"#KP16\">309</a> ]. However, the linear-systems-based quantum algorithms for recommendation systems [ <a href=\"#KP16\">309</a> ] and principal component analysis [ <a href=\"#LMR13b\">250</a> ] were subsequently \"dequantized\" by Tang [ <a href=\"#Tang18a\">400</a> , <a href=\"#Tang18b\">401</a> ]. That is, Tang obtained polynomial time classical randomized algorithms for these problems, thus proving that the proposed quantum algorithms for these tasks do not achieve exponential speedup. Some limitations of the quantum machine learning algorithms based on linear systems are nicely summarized in [ <a href=\"#Aa15\">246</a> ]. In [ <a href=\"#Ta-Shma13\">220</a> ] it was shown that quantum computers can invert well-conditioned <span>\\( n \\times n \\)</span> matrices using only <span>\\( O( \\log n ) \\)</span> qubits, whereas the best classical algorithm uses order <span>\\( \\log^2 n \\)</span> bits. Subsequent improvements to this quantum algorithm are given in [ <a href=\"#FL16\">279</a> ].",references:[104,138,263,309,402,249,369,156,296,210,169,297,214,222,250,251,309,309,250,400,401,309,246,220,279],category:"Optimization, Numerics, and Machine Learning"},"4":{alg_id:60,name:"Machine Learning",speedup:"Varies",description:"Maching learning encompasses a wide variety of computational problems and can be attacked by a wide variety of algorithmic techniques. This entry summarizes quantum algorithmic techniques for improved machine learning. Many of the quantum algorithms here are cross-listed under other headings. In [ <a href='#LMR13'>214</a> , <a href='#LGZ14'>222</a> , <a href='#LMR13b'>250</a> , <a href='#RML13'>251</a> , <a href='#KP16'>309</a> , <a href='#SSP16'>338</a> , <a href='#ZFF15'>339</a> , <a href='#KP17'>359</a> , <a href='#ZPK19'>403</a> ], quantum algorithms for solving linear systems [ <a href='#HHL08'>104</a> ] are applied to speed up cluster-finding, principal component analysis, binary classification, training of neural networks, and various forms of regression, provided the data satisfies certain conditions. However, a number of quantum machine learning algorithms based on linear systems have subsequently been 'dequantized'. Specifically, Tang showed in [ <a href='#Tang18a'>400</a> , <a href='#Tang18b'>401</a> ] that the problems of recommendation systems and principal component analysis solved by the quantum algorithms of [ <a href='#RML13'>251</a> , <a href='#KP16'>309</a> ] can in fact also be solved in polynomial time randomized classical algorithms. A cluster-finding method not based on the linear systems algorithm of [ <a href='#HHL08'>104</a> ] is given in [ <a href='#WKS15'>336</a> ]. The papers [ <a href='#PL12'>192</a> , <a href='#NDRM08'>195</a> , <a href='#CLGOR16'>344</a> , <a href='#AH15'>345</a> , <a href='#BRRP16'>346</a> , <a href='#AARBM16'>348</a> ] explore the use of adiabatic optimization techniques to speed up the training of classifiers. In [ <a href='#WKS14'>221</a> ], a method is proposed for training Boltzmann machines by manipulating coherent quantum states with amplitudes proportional to the Boltzmann weights. Polynomial speedups can be obtained by applying Grover search and related techniques such as amplitude amplification to amenable subroutines of state of the art classical machine learning algorithms. See, for example [ <a href='#ABG07'>358</a> , <a href='#ABG13'>340</a> , <a href='#WKS16'>341</a> , <a href='#PDMMB14'>342</a> , <a href='#DCLT08'>343</a> ]. Other quantum machine learning algorithms not falling into one of the above categories include [ <a href='#YBLL14'>337</a> , <a href='#WG17'>349</a> ]. Some limitations of quantum machine learning algorithms are nicely summarized in [ <a href='#Aa15'>246</a> ]. Many other quantum query algorithms that extract hidden structure of the black-box function could be cast as machine learning algorithms. See for example [ <a href='#Montanaro_polynomials'>146</a> , <a href='#Childs_nonlinear'>23</a> , <a href='#Bernstein_Vazirani'>11</a> , <a href='#Wocjan_nonlinear'>31</a> , <a href='#DHIS13'>212</a> ]. Query algorithms for learning the majority and 'battleship' functions are given in [ <a href='#HMPPR03'>224</a> ]. Large quantum advantages for learning from noisy oracles are given in [ <a href='#CSS14'>236</a> , <a href='#HR11'>237</a> ]. In [ <a href='#LAT20'>428</a> ] quantum kernel estimation is used to implement a support-vector classifier solving a learning problem that is provably as hard as discrete logarithm. Several recent review articles [ <a href='#Ad15'>299</a> , <a href='#SSP14'>332</a> , <a href='#BWPRWL16'>333</a> ] and a book [ <a href='#QMLbook'>331</a> ] are available which summarize the state of the field. There is a related body of work, not strictly within the standard setting of quantum algorithms, regarding quantum learning in the case that the data itself is quantum coherent. See <i>e.g.</i> [ <a href='#BJ99'>350</a> , <a href='#ABG06'>334</a> , <a href='#DTB16'>335</a> , <a href='#AW17'>351</a> , <a href='#SG04'>352</a> , <a href='#AW16'>353</a> , <a href='#MSW16'>354</a> , <a href='#BCDFP10'>355</a> , <a href='#SCJ01'>356</a> , <a href='#SC02'>357</a> ].",references:[214,222,250,251,309,338,339,359,403,104,400,401,251,309,104,336,192,195,344,345,346,348,221,358,340,341,342,343,337,349,246,146,23,11,31,212,224,236,237,428,299,332,333,331,350,334,335,351,352,353,354,355,356,357],category:"Optimization, Numerics, and Machine Learning"},"5":{alg_id:61,name:"Tensor Principal Component Analysis",speedup:"Polynomial (quartic)",description:"In [ <a href=\"#H19\">424</a> ] a quantum algorithm is given for an idealized problem motivated by machine learning applications on high-dimensional data sets. Consider <span>\\(T = \\lambda v_{\\mathrm{sig}}^{\\otimes p} + G \\)</span> where <i>G</i> is a <i>p</i> -index tensor of Gaussian random variables, symmetrized over all permutations of indices, and <span>\\(v_{\\mathrm{sig}}\\)</span> is an <i>N</i> -dimensional vector of magnitude <span>\\(\\sqrt{N}\\)</span>. The task is to recover <span>\\(v_{\\mathrm{sig}}\\)</span>. Consider <span>\\( \\lambda = \\alpha N^{-p/4}\\)</span>. The best classical algorithms succeed when <span>\\( \\alpha \\gg 1\\)</span> and have time and space complexity that scale exponentially in <span>\\( \\alpha^{-1}\\)</span>. The quantum algorithm of [ <a href=\"#H19\">424</a> ] solves this problem in polynomial space and with runtime scaling quartically better in <span>\\( \\alpha^{-1} \\)</span> than the classical spectral algorithm. The quantum algorithm works by encoding the problem into the eigenspectrum of a many-body Hamiltonian and applying phase estimation together with amplitude amplification.",references:[424],category:"Optimization, Numerics, and Machine Learning"},"6":{alg_id:62,name:"Solving Differential Equations",speedup:"Superpolynomial",description:" Consider linear first order differential equation <span>\\( \\frac{d}{dt} \\mathbf{x} = A(t) \\mathbf{x} + \\mathbf{b}(t) \\)</span>, where <span>\\( \\mathbf{x} \\)</span> and <span>\\( \\mathbf{b} \\)</span> are <i>N</i> -dimensional vectors and <i>A</i> is an <span>\\(N \\times N\\)</span> matrix. Given an initial condition <span>\\( \\mathbf{x}(0) \\)</span> one wishes to compute the solution <span>\\( \\mathbf{x}(t) \\)</span> at some later time <i>t</i> to some precision <span>\\( \\epsilon \\)</span> in the sense that the normalized vector <span>\\( x(t)/\\|x(t)\\| \\)</span> produced has distance at most <span>\\( \\epsilon \\)</span> from the exact solution. In [ <a href=\"#Berry10\">156</a> ], Berry gives a quantum algorithm for this problem that runs in time <span>\\( O(t^2 \\mathrm{poly}(1/\\epsilon) \\mathrm{poly log} N) \\)</span>, whereas the fastest classical algorithms run in time <span>\\( O ( t \\mathrm{poly} N ) \\)</span>. The final result is produced in the form of a quantum superposition state on <span>\\( O(log N) \\)</span> qubits whose amplitudes contain the components of <span>\\( \\mathbf{x}(t) \\)</span>. The algorithm works by reducing the problem to linear algebra via a high-order finite difference method and applying the quantum linear algebra primitive of [ <a href=\"#HHL08\">104</a> ]. In [ <a href=\"#BCOW17\">410</a> ] an improved quantum algorithm for this problem was given which brings the epsilon dependence down to <span>\\( \\mathrm{poly log}(1/\\epsilon) \\)</span>. A quantum algorithm for solving nonlinear differential equations (again in the sense of obtaining a solution encoded in the amplitudes) is described in [ <a href=\"#LO08\">411</a> ], which has exponential scaling in <i>t</i> . In [ <a href=\"#LKK20\">426</a> , <a href=\"#LDP20\">427</a> ] quantum algorithms are given for solving nonlinear differential equations that scale as <span>\\( O(t^2) \\)</span>. These are applicable to a restricted class of nonlinear differential equations. In particular, their solutions must not grow or shrink in magnitude too rapidly. Partial differential equations can be reduced to ordinary differential equations through discretization, and higher order differential equations can be reduced to first order through additiona of auxiliary variables. Consequently, these more general problems can be solved through the methods of [ <a href=\"#Berry10\">156</a> , <a href=\"#HHL08\">104</a> ]. However, quantum algorithms designed to solve these problems directly may be more efficient (and for specific problems one may analyze the complexity of tasks that are unspecified in a more general formulation such as preparation of relevant initial states). In [ <a href=\"#CJS13\">249</a> ] a quantum algorithm is given which solves the wave equation by applying finite-element methods to reduce it to linear algebra and then applying the quantum linear algebra algorithm of [ <a href=\"#HHL08\">104</a> ] with preconditioning. In [ <a href=\"#CJO17\">369</a> ] a quantum algorithm is given for solving the wave equation by discretizing it with finite differences and massaging it into the form of a Schrodinger equation which is then simulated using the method of [ <a href=\"#BCK15\">245</a> ]. The problem solved by [ <a href=\"#CJO17\">369</a> ] is not equivalent to that solved by [ <a href=\"#CJS13\">249</a> ] because in [ <a href=\"#CJS13\">249</a> ] the problem is reduced to a time-indepent one through assuming sinusoidal time dependence and applying separation of variables, whereas [ <a href=\"#CJO17\">369</a> ] solves the time-dependent problem. The quantum speedup achieved over classical methods for solving the wave equation in <i>d</i> -dimensiona is polynomial for fixed <i>d</i> but expontial in <i>d</i> . Concrete resource estimates for quantum algorithms to solve differential equations are given in [ <a href=\"#CPP13\">412</a> , <a href=\"#WWL19\">413</a> , <a href=\"#SVM17\">414</a> ]. A quantum algorithm for solving linear partial differential equations using continuous-variable quantum computing is given in [ <a href=\"#AKW19\">415</a> ]. In [ <a href=\"#MP16\">296</a> ] quantum finite element methods are analyzed in a general setting. A quantum spectral method for solving differential equations is given in [ <a href=\"#CL19\">416</a> ]. A quantum algorithm for solving the Vlasov equation is given in [ <a href=\"#ESP19\">417</a> ]. ",references:[156,104,410,411,426,427,156,104,249,104,369,245,369,249,249,369,412,413,414,415,296,416,417],category:"Optimization, Numerics, and Machine Learning"},"7":{alg_id:63,name:"Quantum Dynamic Programming",speedup:"Polynomial",description:" In [ <a href=\"#ABI18\">409</a> ] the authors introduce a problem called path-in-the-hypercube. In this problem, one given a subgraph of the hypercube and asked whether there is a path along this subgraph that starts from the all zeros vertex, ends at the all ones vertex, and makes only Hamming weight increasing moves. (The vertices of the hypercube graph correspond to bit strings of length <i>n</i> and the hypercube graph joins vertices of Hamming distance one.) Many NP-complete problems for which the best classical algorithm is dynamic programming can be modeled as instances of path-in-the-hypercube. By combining Grover search with dynamic programming methods, a quantum algorithm can solve path-in-the-hypercube in time <span>\\( O^*(1.817^n) \\)</span>, where the notation <span>\\( O^* \\)</span> indicates that polynomial factors are being omitted. The fastest known classical algorithm for this problem runs in time <span>\\( O^*(2^n) \\)</span>. Using this primitive quantum algorithms can be constructed that solve vertex ordering problems in <span>\\( O^*(1.817^n) \\)</span> vs. <span>\\( O^* (2^n) \\)</span> classically, graph bandwidth in <span>\\( O^*(2.946^n) \\)</span> vs. <span>\\( O^*(4.383^n) \\)</span> classically, travelling salesman and feedback arc set in <span>\\( O^*(1.729^n) \\)</span> vs. <span>\\( O^*(2^n) \\)</span> classically, and minimum set cover in <span>\\( O( \\mathrm{poly}(m,n) 1.728^n ) \\)</span> vs. <span>\\( O(nm2^n) \\)</span> classically.  <hr/>  <a name=\"acknowledgments\"></a> ",references:[409],category:"Optimization, Numerics, and Machine Learning"}}};

    var algorithms_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': algorithms$1
    });

    var references$1 = {"1":{ref_id:1,authors:"Daniel S. Abrams and Seth Lloyd",title:"Simulation of many-body Fermi systems on a universal quantum computer.",links:{"arXiv:quant-ph/9703054":"http://arxiv.org/abs/quant-ph/9703054"},extra:"<em>Physical Review Letters</em>, 79(13):2586-2589, 1997."},"2":{ref_id:2,authors:"Dorit Aharonov and Itai Arad",title:"The BQP-hardness of approximating the Jones polynomial.",links:{"arXiv:quant-ph/0605181":"http://arxiv.org/abs/quant-ph/0605181"},extra:"<em>New Journal of Physics</em> 13:035019, 2011."},"3":{ref_id:3,authors:"Dorit Aharonov, Itai Arad, Elad Eban, and Zeph Landau",title:"Polynomial quantum algorithms for additive approximations of the Potts model and other points of the Tutte plane.",links:{"arXiv:quant-ph/0702008":"http://arxiv.org/abs/quant-ph/0702008"},extra:""},"4":{ref_id:4,authors:"Dorit Aharonov, Vaughan Jones, and Zeph Landau",title:"A polynomial quantum algorithm for approximating the Jones polynomial.",links:{"arXiv:quant-ph/0511096":"http://arxiv.org/abs/quant-ph/0511096"},extra:"In <em>Proceedings of the 38th ACM Symposium on Theory of Computing</em>, 2006."},"5":{ref_id:5,authors:"Dorit Aharonov and Amnon Ta-Shma",title:"Adiabatic quantum state generation and statistical zero knowledge.",links:{"arXiv:quant-ph/0301023":"http://arxiv.org/abs/quant-ph/0301023"},extra:"In <em>Proceedings of the 35th ACM Symposium on Theory of Computing</em>, 2003."},"6":{ref_id:6,authors:"A. Ambainis, H. Buhrman, P. Høyer, M. Karpinizki, and P. Kurur",title:"Quantum matrix verification.",links:{},extra:"Unpublished Manuscript, 2002."},"7":{ref_id:7,authors:"Andris Ambainis",title:"Quantum walk algorithm for element distinctness.",links:{"arXiv:quant-ph/0311001":"http://arxiv.org/abs/quant-ph/0311001"},extra:"<em>SIAM Journal on Computing</em>, 37:210-239, 2007."},"8":{ref_id:8,authors:"Andris Ambainis, Andrew M. Childs, Ben W.Reichardt, Robert Špalek, and Shengyu Zheng",title:"Every AND-OR formula of size N can be evaluated in time \\( n^{1/2+o(1)} \\) on a quantum computer.",links:{"arXiv:quant-ph/0703015":"http://arxiv.org/abs/quant-ph/0703015","arXiv:0704.3628":"http://arxiv.org/abs/0704.3628"},extra:"In <em>Proceedings of the 48th IEEE Symposium on the Foundations of Computer Science</em>, pages 363-372, 2007."},"9":{ref_id:9,authors:"Dave Bacon, Andrew M. Childs, and Wim van Dam",title:"From optimal measurement to efficient quantum algorithms for the hidden subgroup problem over semidirect product groups.",links:{"arXiv:quant-ph/0504083":"http://arxiv.org/abs/quant-ph/0504083"},extra:"In <em>Proceedings of the 46th IEEE Symposium on Foundations of Computer Science</em>, pages 469-478, 2005."},"10":{ref_id:10,authors:"Michael Ben-Or and Avinatan Hassidim",title:"Quantum search in an ordered list via adaptive learning.",links:{"arXiv:quant-ph/0703231":"http://arxiv.org/abs/quant-ph/0703231"},extra:""},"11":{ref_id:11,authors:"Ethan Bernstein and Umesh Vazirani",title:"Quantum complexity theory.",links:{},extra:"In <em>Proceedings of the 25th ACM Symposium on the Theory of Computing</em>, pages 11-20, 1993."},"12":{ref_id:12,authors:"D.W. Berry, G. Ahokas, R. Cleve, and B. C. Sanders",title:"Efficient quantum algorithms for simulating sparse Hamiltonians.",links:{"arXiv:quant-ph/0508139":"http://arxiv.org/abs/quant-ph/0508139"},extra:"<em>Communications in Mathematical Physics</em>, 270(2):359-371, 2007."},"13":{ref_id:13,authors:"A. Berzina, A. Dubrovsky, R. Frivalds, L. Lace, and O. Scegulnaja",title:"Quantum query complexity for some graph problems.",links:{},extra:"In <em>Proceedings of the 30th Conference on Current Trends in Theory and Practive of Computer Science</em>, pages 140-150, 2004."},"14":{ref_id:14,authors:"D. Boneh and R. J. Lipton",title:"Quantum cryptanalysis of hidden linear functions.",links:{},extra:"In Don Coppersmith, editor, <em>CRYPTO '95</em>, Lecture Notes in Computer Science, pages 424-437. Springer-Verlag, 1995."},"15":{ref_id:15,authors:"M. Boyer, G. Brassard, P. Høyer, and A. Tapp",title:"Tight bounds on quantum searching.",links:{},extra:"<em>Fortschritte der Physik</em>, 46:493-505, 1998."},"16":{ref_id:16,authors:"G. Brassard, P. Høyer, and A. Tapp",title:"Quantum counting.",links:{"arXiv:quant-ph/9805082":"http://arxiv.org/abs/quant-ph/9805082"},extra:""},"17":{ref_id:17,authors:"Gilles Brassard, Peter Høyer, Michele Mosca, and Alain Tapp",title:"Quantum amplitude amplification and estimation.",links:{"arXiv:quant-ph/0005055":"http://arxiv.org/abs/quant-ph/0005055"},extra:"In Samuel J. Lomonaco Jr. and Howard E. Brandt, editors, <em>Quantum Computation and Quantum Information: A Millennium Volume</em>, volume 305 of <em> AMS Contemporary Mathematics Series</em> . American Mathematical Society, 2002."},"18":{ref_id:18,authors:"Gilles Brassard, Peter Høyer, and Alain Tapp",title:"Quantum algorithm for the collision problem.",links:{"arXiv:quant-ph/9705002":"http://arxiv.org/abs/quant-ph/9705002"},extra:"<em>ACM SIGACT News</em>, 28:14-19, 1997."},"19":{ref_id:19,authors:"Harry Buhrman and Robert Špalek",title:"Quantum verification of matrix products.",links:{"arXiv:quant-ph/0409035":"http://arxiv.org/abs/quant-ph/0409035"},extra:"In <em>Proceedings of the 17th ACM-SIAM Symposium on Discrete Algorithms</em>, pages 880-889, 2006."},"20":{ref_id:20,authors:"David Bulger",title:"Quantum basin hopping with gradient-based local optimisation.",links:{"arXiv:quant-ph/0507193":"http://arxiv.org/abs/quant-ph/0507193"},extra:""},"21":{ref_id:21,authors:"Harry Burhrman, Christoph Dürr, Mark Heiligman, Peter Høyer, Frédéric Magniez, Miklos Santha, and Ronald de Wolf",title:"Quantum algorithms for element distinctness.",links:{"arXiv:quant-ph/0007016":"http://arxiv.org/abs/quant-ph/0007016"},extra:"In <em>Proceedings of the 16th IEEE Annual Conference on Computational Complexity</em>, pages 131-137, 2001."},"22":{ref_id:22,authors:"Dong Pyo Chi, Jeong San Kim, and Soojoon Lee",title:"Notes on the hidden subgroup problem on some semi-direct product groups.",links:{"arXiv:quant-ph/0604172":"http://arxiv.org/abs/quant-ph/0604172"},extra:"<i> Phys. Lett. A</i> 359(2):114-116, 2006."},"23":{ref_id:23,authors:"A. M. Childs, L. J. Schulman, and U. V. Vazirani",title:"Quantum algorithms for hidden nonlinear structures.",links:{"arXiv:0705.2784":"http://arxiv.org/abs/0705.2784"},extra:"In <em>Proceedings of the 48th IEEE Symposium on Foundations of Computer Science</em>, pages 395-404, 2007."},"24":{ref_id:24,authors:"Andrew Childs and Troy Lee",title:"Optimal quantum adversary lower bounds for ordered search.",links:{"arXiv:0708.3396":"http://arxiv.org/abs/0708.3396"},extra:"<i>Proceedings of ICALP 2008</i>"},"25":{ref_id:25,authors:"Andrew M. Childs",title:"<em><a target='_blank' href=\"http://www.math.uwaterloo.ca/~amchilds/papers/thesis.pdf\">Quantum information processing in continuous time</a></em>",links:{},extra:""},"26":{ref_id:26,authors:"Andrew M. Childs, Richard Cleve, Enrico Deotto, Edward Farhi, Sam Gutmann, and Daniel A. Spielman",title:"Exponential algorithmic speedup by quantum walk.",links:{"arXiv:quant-ph/0209131":"http://arxiv.org/abs/quant-ph/0209131"},extra:"In <em>Proceedings of the 35th ACM Symposium on Theory of Computing</em>, pages 59-68, 2003."},"27":{ref_id:27,authors:"Andrew M. Childs, Richard Cleve, Stephen P. Jordan, and David Yonge-Mallo",title:"Discrete-query quantum algorithm for NAND trees.",links:{"arXiv:quant-ph/0702160":"http://arxiv.org/abs/quant-ph/0702160"},extra:"<em>Theory of Computing</em>, 5:119-123, 2009."},"28":{ref_id:28,authors:"Andrew M. Childs and Wim van Dam",title:"Quantum algorithm for a generalized hidden shift problem.",links:{"arXiv:quant-ph/0507190":"http://arxiv.org/abs/quant-ph/0507190"},extra:"In <em>Proceedings of the 18th ACM-SIAM Symposium on Discrete Algorithms</em>, pages 1225-1232, 2007."},"29":{ref_id:29,authors:"Richard Cleve, Dmitry Gavinsky, and David L. Yonge-Mallo",title:"Quantum algorithms for evaluating MIN-MAX trees.",links:{"arXiv:0710.5794":"http://arxiv.org/abs/0710.5794"},extra:"In <em>Theory of Quantum Computation, Communication, andCryptography</em>, pages 11-15, Springer, 2008. (LNCS Vol. 5106)"},"30":{ref_id:30,authors:"J. Niel de Beaudrap, Richard Cleve, and John Watrous",title:"Sharp quantum versus classical query complexity separations.",links:{"arXiv:quant-ph/0011065v2":"http://arxiv.org/abs/quant-ph/0011065"},extra:"<em>Algorithmica</em>, 34(4):449-461, 2002."},"31":{ref_id:31,authors:"Thomas Decker, Jan Draisma, and Pawel Wocjan",title:"Quantum algorithm for identifying hidden polynomials.",links:{"arXiv:0706.1219":"http://arxiv.org/abs/0706.1219"},extra:"<em>Quantum Information and Computation</em>, 9(3):215-230, 2009."},"32":{ref_id:32,authors:"David Deutsch",title:"Quantum theory, the Church-Turing principle, and the universal quantum computer.",links:{},extra:"<em>Proceedings of the Royal Society of London Series A</em>, 400:97-117, 1985."},"33":{ref_id:33,authors:"David Deutsch and Richard Jozsa",title:"Rapid solution of problems by quantum computation.",links:{},extra:"<em>Proceedings of the Royal Society of London Series A</em>, 493:553-558, 1992."},"34":{ref_id:34,authors:"Christoph Dürr, Mark Heiligman, Peter Høyer, and Mehdi Mhalla",title:"Quantum query complexity of some graph problems.",links:{"arXiv:quant-ph/0401091":"http://arxiv.org/abs/quant-ph/0401091"},extra:"<em>SIAM Journal on Computing</em>, 35(6):1310-1328, 2006."},"35":{ref_id:35,authors:"Christoph Dürr and Peter Høyer",title:"A quantum algorithm for finding the minimum.",links:{"arXiv:quant-ph/9607014":"http://arxiv.org/abs/quant-ph/9607014"},extra:""},"36":{ref_id:36,authors:"Christoph Dürr, Mehdi Mhalla, and Yaohui Lei",title:"Quantum query complexity of graph connectivity.",links:{"arXiv:quant-ph/0303169":"http://arxiv.org/abs/quant-ph/0303169"},extra:""},"37":{ref_id:37,authors:"Mark Ettinger, Peter Høyer, and Emanuel Knill",title:"The quantum query complexity of the hidden subgroup problem is polynomial.",links:{"arXiv:quant-ph/0401083":"http://arxiv.org/abs/quant-ph/0401083"},extra:"<em>Information Processing Letters</em>, 91(1):43-48, 2004."},"38":{ref_id:38,authors:"Edward Farhi, Jeffrey Goldstone, and Sam Gutmann",title:"A quantum algorithm for the Hamiltonian NAND tree.",links:{"arXiv:quant-ph/0702144":"http://arxiv.org/abs/quant-ph/0702144"},extra:"<em>Theory of Computing</em> 4:169-190, 2008."},"39":{ref_id:39,authors:"Edward Farhi, Jeffrey Goldstone, Sam Gutmann, and Michael Sipser",title:"Invariant quantum algorithms for insertion into an ordered list.",links:{"arXiv:quant-ph/9901059":"http://arxiv.org/abs/quant-ph/9901059"},extra:""},"40":{ref_id:40,authors:"Richard P. Feynman",title:"Simulating physics with computers.",links:{},extra:"<em>International Journal of Theoretical Physics</em>, 21(6/7):467-488, 1982."},"41":{ref_id:41,authors:"Michael Freedman, Alexei Kitaev, and Zhenghan Wang",title:"Simulation of topological field theories by quantum computers.",links:{},extra:"<em>Communications in Mathematical Physics</em>, 227:587-603, 2002."},"42":{ref_id:42,authors:"Michael Freedman, Michael Larsen, and Zhenghan Wang",title:"A modular functor which is universal for quantum computation.",links:{"arXiv:quant-ph/0001108":"http://arxiv.org/abs/quant-ph/0001108"},extra:"<i>Comm. Math. Phys.</i> 227(3):605-622, 2002."},"43":{ref_id:43,authors:"K. Friedl, G. Ivanyos, F. Magniez, M. Santha, and P. Sen",title:"Hidden translation and translating coset in quantum computing.",links:{"arXiv:quant-ph/0211091":"http://arxiv.org/abs/quant-ph/0211091"},extra:"<em>SIAM Journal on Computing</em> Vol. 43, pp. 1-24, 2014. Appeared earlier in <em>Proceedings of the 35th ACM Symposium on Theory of Computing</em>, pages 1-9, 2003."},"44":{ref_id:44,authors:"D. Gavinsky",title:"Quantum solution to the hidden subgroup problem for poly-near-Hamiltonian-groups.",links:{},extra:"<em>Quantum Information and Computation</em>, 4:229-235, 2004."},"45":{ref_id:45,authors:"Joseph Geraci",title:"A new connection between quantum circuits, graphs and the Isingpartition function",links:{"arXiv:0801.4833":"http://arxiv.org/abs/0801.4833"},extra:"<em>Quantum Information Processing</em>, 7(5):227-242, 2008."},"46":{ref_id:46,authors:"Joseph Geraci and Frank Van Bussel",title:"A theorem on the quantum evaluation of weight enumerators for a certain class of cyclic Codes with a note on cyclotomic cosets.",links:{"arXiv:cs/0703129":"http://arxiv.org/abs/cs/0703129"},extra:""},"47":{ref_id:47,authors:"Joseph Geraci and Daniel A. Lidar",title:"On the exact evaluation of certain instances of the Potts partition function by quantum computers.",links:{"arXiv:quant-ph/0703023":"http://arxiv.org/abs/quant-ph/0703023"},extra:"<i>Comm. Math. Phys.</i> Vol. 279, pg. 735, 2008."},"48":{ref_id:48,authors:"Lov K. Grover",title:"Quantum mechanics helps in searching for a needle in a haystack.",links:{"arXiv:quant-ph/9605043":"http://arxiv.org/abs/quant-ph/9605043"},extra:"<em>Physical Review Letters</em>, 79(2):325-328, 1997."},"49":{ref_id:49,authors:"Sean Hallgren",title:"Polynomial-time quantum algorithms for Pell's equation and the principal ideal problem.",links:{},extra:"In <em>Proceedings of the 34th ACM Symposium on Theory of Computing</em>, 2002."},"50":{ref_id:50,authors:"Sean Hallgren",title:"Fast quantum algorithms for computing the unit group and class group of a number field.",links:{},extra:"In <em>Proceedings of the 37th ACM Symposium on Theory of Computing</em>, 2005."},"51":{ref_id:51,authors:"Sean Hallgren, Alexander Russell, and Amnon Ta-Shma",title:"Normal subgroup reconstruction and quantum computation using group representations.",links:{},extra:"<em>SIAM Journal on Computing</em>, 32(4):916-934, 2003."},"52":{ref_id:52,authors:"Mark Heiligman",title:"Quantum algorithms for lowest weight paths and spanning trees in complete graphs.",links:{"arXiv:quant-ph/0303131":"http://arxiv.org/abs/quant-ph/0303131"},extra:""},"53":{ref_id:53,authors:"Yoshifumi Inui and François Le Gall",title:"Efficient quantum algorithms for the hidden subgroup problem over a class of semi-direct product groups.",links:{"arXiv:quant-ph/0412033":"http://arxiv.org/abs/quant-ph/0412033"},extra:"<em>Quantum Information and Computation</em>, 7(5/6):559-570, 2007."},"54":{ref_id:54,authors:"Yuki Kelly Itakura",title:"Quantum algorithm for commutativity testing of a matrix set.",links:{"arXiv:quant-ph/0509206":"http://arxiv.org/abs/quant-ph/0509206"},extra:"Master's thesis, University of Waterloo, 2005."},"55":{ref_id:55,authors:"Gábor Ivanyos, Frédéric Magniez, and Miklos Santha",title:"Efficient quantum algorithms for some instances of the non-abelian hidden subgroup problem.",links:{"arXiv:quant-ph/0102014":"http://arxiv.org/abs/quant-ph/0102014"},extra:"In <em>Proceedings of the 13th ACM Symposium on Parallel Algorithms and Architectures</em>, pages 263-270, 2001."},"56":{ref_id:56,authors:"Gábor Ivanyos, Luc Sanselme, and Miklos Santha",title:"An efficient quantum algorithm for the hidden subgroup problem in extraspecial groups.",links:{"arXiv:quant-ph/0701235":"http://arxiv.org/abs/quant-ph/0701235"},extra:"In <em>Proceedings of the 24th Symposium on Theoretical Aspects of Computer Science</em>, 2007."},"57":{ref_id:57,authors:"Gábor Ivanyos, Luc Sanselme, and Miklos Santha",title:"An efficient quantum algorithm for the hidden subgroup problem in nil-2 groups.",links:{"arXiv:0707.1260":"http://arxiv.org/abs/0707.1260"},extra:"In <em>LATIN 2008: Theoretical Informatics</em>, pg. 759-771,Springer (LNCS 4957)."},"58":{ref_id:58,authors:"Dominik Janzing and Pawel Wocjan",title:"BQP-complete problems concerning mixing properties of classical random walks on sparse graphs.",links:{"arXiv:quant-ph/0610235":"http://arxiv.org/abs/quant-ph/0610235"},extra:""},"59":{ref_id:59,authors:"Dominik Janzing and Pawel Wocjan",title:"A promiseBQP-complete string rewriting problem.",links:{"arXiv:0705.1180":"http://arxiv.org/abs/0705.1180"},extra:"<em>Quantum Information and Computation</em>, 10(3/4):234-257, 2010."},"60":{ref_id:60,authors:"Dominik Janzing and Pawel Wocjan",title:"A simple promiseBQP-complete matrix problem.",links:{"arXiv:quant-ph/0606229":"http://arxiv.org/abs/quant-ph/0606229"},extra:"<em>Theory of Computing</em>, 3:61-79, 2007."},"61":{ref_id:61,authors:"Stephen P. Jordan",title:"Fast quantum algorithm for numerical gradient estimation.",links:{"arXiv:quant-ph/0405146":"http://arxiv.org/abs/quant-ph/0405146"},extra:"<em>Physical Review Letters</em>, 95:050501, 2005."},"62":{ref_id:62,authors:"Stephen P. Jordan",title:"<em>Quantum Computation Beyond the Circuit Model</em>",links:{"arXiv:0809.2307":"http://arxiv.org/abs/0809.2307"},extra:"PhD thesis, Massachusetts Institute of Technology, 2008."},"63":{ref_id:63,authors:"Ivan Kassal, Stephen P. Jordan, Peter J. Love, Masoud Mohseni, and Alán Aspuru-Guzik",title:"Quantum algorithms for the simulation of chemical dynamics.",links:{"arXiv:0801.2986":"http://arxiv.org/abs/0801.2986"},extra:"<i>Proc. Natl. Acad. Sci.</i> Vol. 105, pg. 18681, 2008."},"64":{ref_id:64,authors:"Kiran S. Kedlaya",title:"Quantum computation of zeta functions of curves.",links:{"arXiv:math/0411623":"http://arxiv.org/abs/math/0411623"},extra:"<em>Computational Complexity</em>, 15:1-19, 2006."},"65":{ref_id:65,authors:"E. Knill and R. Laflamme",title:"Quantum computation and quadratically signed weight enumerators.",links:{"arXiv:quant-ph/9909094":"http://arxiv.org/abs/quant-ph/9909094"},extra:"<em>Information Processing Letters</em>, 79(4):173-179, 2001."},"66":{ref_id:66,authors:"Greg Kuperberg",title:"A subexponential-time quantum algorithm for the dihedral hidden subgroup problem.",links:{"arXiv:quant-ph/0302112":"http://arxiv.org/abs/quant-ph/0302112"},extra:"<em>SIAM Journal on Computing</em>, 35(1):170-188, 2005."},"67":{ref_id:67,authors:"Daniel A. Lidar",title:"On the quantum computational complexity of the Ising spin glass partition function and of knot invariants.",links:{"arXiv:quant-ph/0309064":"http://arxiv.org/abs/quant-ph/0309064"},extra:"<em>New Journal of Physics</em> Vol. 6, pg. 167, 2004."},"68":{ref_id:68,authors:"Daniel A. Lidar and Haobin Wang",title:"Calculating the thermal rate constant with exponential speedup on a quantum computer.",links:{"arXiv:quant-ph/9807009":"http://arxiv.org/abs/quant-ph/9807009"},extra:"<em>Physical Review E</em>, 59(2):2429-2438, 1999."},"69":{ref_id:69,authors:"Chris Lomont",title:"The hidden subgroup problem - review and open problems.",links:{"arXiv:quant-ph/0411037":"http://arxiv.org/abs/quant-ph/0411037"},extra:""},"70":{ref_id:70,authors:"Frédéric Magniez, Miklos Santha, and Mario Szegedy",title:"Quantum algorithms for the triangle problem.",links:{"arXiv:quant-ph/0310134":"http://arxiv.org/abs/quant-ph/0310134"},extra:"<em>SIAM Journal on Computing</em>, 37(2):413-424, 2007."},"71":{ref_id:71,authors:"Carlos Magno, M. Cosme, and Renato Portugal",title:"Quantum algorithm for the hidden subgroup problem on a class of semidirect product groups.",links:{"arXiv:quant-ph/0703223":"http://arxiv.org/abs/quant-ph/0703223"},extra:""},"72":{ref_id:72,authors:"Cristopher Moore, Daniel Rockmore, Alexander Russell, and Leonard Schulman",title:"The power of basis selection in Fourier sampling: the hidden subgroup problem in affine groups.",links:{"arXiv:quant-ph/0211124":"http://arxiv.org/abs/quant-ph/0211124"},extra:"In <em>Proceedings of the 15th ACM-SIAM Symposium on Discrete Algorithms</em>, pages 1113-1122, 2004."},"73":{ref_id:73,authors:"M. Mosca",title:"Quantum searching, counting, and amplitude amplification by eigenvector analysis.",links:{},extra:"In R. Freivalds, editor, <em>Proceedings of International Workshop on Randomized Algorithms</em>, pages 90-100, 1998."},"74":{ref_id:74,authors:"Michele Mosca",title:"<em><a href=\"http://www.iqc.ca/~mmosca/web/papers/moscathesis.pdf\">Quantum Computer Algorithms</a></em>",links:{},extra:""},"75":{ref_id:75,authors:"Ashwin Nayak and Felix Wu",title:"The quantum query complexity of approximating the median and related statistics.",links:{"arXiv:quant-ph/9804066":"http://arxiv.org/abs/quant-ph/9804066"},extra:"In <em>Proceedings of 31st ACM Symposium on the Theory of Computing</em>, 1999."},"76":{ref_id:76,authors:"Michael A. Nielsen and Isaac L. Chuang.",title:"<em>Quantum Computation and Quantum Information</em>",links:{},extra:"Cambridge University Press, Cambridge, UK, 2000."},"77":{ref_id:77,authors:"Erich Novak",title:"Quantum complexity of integration.",links:{"arXiv:quant-ph/0008124":"http://arxiv.org/abs/quant-ph/0008124"},extra:"<em>Journal of Complexity</em>, 17:2-16, 2001."},"78":{ref_id:78,authors:"Oded Regev",title:"Quantum computation and lattice problems.",links:{"arXiv:cs/0304005":"http://arxiv.org/abs/cs/0304005"},extra:"In <em>Proceedings of the 43rd Symposium on Foundations of Computer Science</em>, 2002."},"79":{ref_id:79,authors:"Oded Regev",title:"A subexponential time algorithm for the dihedral hidden subgroup problem with polynomial space.",links:{"arXiv:quant-ph/0406151":"http://arxiv.org/abs/quant-ph/0406151"},extra:""},"80":{ref_id:80,authors:"Ben Reichardt and Robert Špalek",title:"Span-program-based quantum algorithm for evaluating formulas.",links:{"arXiv:0710.2630":"http://arxiv.org/abs/0710.2630"},extra:"<em>Proceedings of STOC 2008</em>"},"81":{ref_id:81,authors:"Martin Roetteler and Thomas Beth",title:"Polynomial-time solution to the hidden subgroup problem for a class of non-abelian groups.",links:{"arXiv:quant-ph/9812070":"http://arxiv.org/abs/quant-ph/9812070"},extra:""},"82":{ref_id:82,authors:"Peter W. Shor",title:"Polynomial-time algorithms for prime factorization and discrete logarithms on a quantum computer.",links:{"arXiv:quant-ph/9508027":"http://arxiv.org/abs/quant-ph/9508027"},extra:"<em>SIAM Journal on Computing</em>, 26(5):1484-1509, 1997."},"83":{ref_id:83,authors:"Peter W. Shor and Stephen P. Jordan",title:"Estimating Jones polynomials is a complete problem for one clean qubit.",links:{"arXiv:0707.2831":"http://arxiv.org/abs/0707.2831"},extra:"<em>Quantum Information and Computation</em>, 8(8/9):681-714, 2008."},"84":{ref_id:84,authors:"R. D. Somma, S. Boixo, and H. Barnum",title:"Quantum simulated annealing.",links:{"arXiv:0712.1008":"http://arxiv.org/abs/0712.1008"},extra:""},"85":{ref_id:85,authors:"M. Szegedy",title:"Quantum speed-up of Markov chain based algorithms.",links:{},extra:"In <em>Proceedings of the 45th IEEE Symposium on Foundations of Computer Science</em>, pg. 32, 2004."},"86":{ref_id:86,authors:"Wim van Dam",title:"Quantum algorithms for weighing matrices and quadratic residues.",links:{"arXiv:quant-ph/0008059":"http://arxiv.org/abs/quant-ph/0008059"},extra:"<em>Algorithmica</em>, 34(4):413-428, 2002."},"87":{ref_id:87,authors:"Wim van Dam",title:"Quantum computing and zeros of zeta functions.",links:{"arXiv:quant-ph/0405081":"http://arxiv.org/abs/quant-ph/0405081"},extra:""},"88":{ref_id:88,authors:"Wim van Dam and Sean Hallgren",title:"Efficient quantum algorithms for shifted quadratic character problems.",links:{"arXiv:quant-ph/0011067":"http://arxiv.org/abs/quant-ph/0011067"},extra:""},"89":{ref_id:89,authors:"Wim van Dam, Sean Hallgren, and Lawrence Ip",title:"Quantum algorithms for some hidden shift problems.",links:{"arXiv:quant-h/0211140":"http://arxiv.org/abs/quant-ph/0211140"},extra:"<em>SIAM Journal on Computing</em>, 36(3):763-778, 2006."},"90":{ref_id:90,authors:"Wim van Dam and Gadiel Seroussi",title:"Efficient quantum algorithms for estimating Gauss sums.",links:{"arXiv:quant-ph/0207131":"http://arxiv.org/abs/quant-ph/0207131"},extra:""},"91":{ref_id:91,authors:"John Watrous",title:"Quantum algorithms for solvable groups.",links:{"arXiv:quant-ph/0011023":"http://arxiv.org/abs/quant-ph/0011023"},extra:"In <em>Proceedings of the 33rd ACM Symposium on Theory of Computing</em>, pages 60-67, 2001."},"92":{ref_id:92,authors:"Stephen Wiesner",title:"Simulations of many-body quantum systems by a quantum computer.",links:{"arXiv:quant-ph/9603028":"http://arxiv.org/abs/quant-ph/9603028"},extra:""},"93":{ref_id:93,authors:"Pawel Wocjan and Jon Yard",title:"The Jones polynomial: quantum algorithms and applications in quantum complexity theory.",links:{"arXiv:quant-ph/0603069":"http://arxiv.org/abs/quant-ph/0603069"},extra:"<i>Quantum Information and Computation 8(1/2):147-180, 2008.</i>"},"94":{ref_id:94,authors:"Andrew Yao",title:"On computing the minima of quadratic forms.",links:{},extra:"In <em>Proceedings of the 7th ACM Symposium on Theory of Computing</em>, pages 23-26, 1975."},"95":{ref_id:95,authors:"Christof Zalka",title:"Efficient simulation of quantum systems by quantum computers.",links:{"arXiv:quant-ph/9603026":"http://arxiv.org/abs/quant-ph/9603026"},extra:"<em>Proceedings of the Royal Society of London Series A</em>, 454:313, 1996."},"96":{ref_id:96,authors:"Edward Farhi, Jeffrey Goldstone, Sam Gutmann, and Michael Sipser",title:"Quantum computation by adiabatic evolution.",links:{"arXiv:quant-ph/0001106":"http://arxiv.org/abs/quant-ph/0001106"},extra:""},"97":{ref_id:97,authors:"Dorit Aharonov, Wim van Dam, Julia Kempe, Zeph Landau, Seth Lloyd, andOded Regev",title:"Adiabatic Quantum Computation is Equivalent to Standard QuantumComputation.",links:{"arXiv:quant-ph/0405098":"http://arxiv.org/abs/quant-ph/0405098"},extra:"<em>SIAM Journal on Computing</em>, 37(1):166-194, 2007."},"98":{ref_id:98,authors:"Jérémie Roland and Nicolas J. Cerf",title:"Quantum search by local adiabatic evolution.",links:{"arXiv:quant-ph/0107015":"http://arxiv.org/abs/quant-ph/0107015"},extra:"<em>Physical Review A</em>, 65(4):042308, 2002."},"99":{ref_id:99,authors:"L.-A. Wu, M.S. Byrd, and D. A. Lidar",title:"Polynomial-Time Simulation of Pairing Models on a Quantum Computer.",links:{"arXiv:quant-ph/0108110":"http://arxiv.org/abs/quant-ph/0108110"},extra:"<em>Physical Review Letters</em>, 89(6):057904, 2002."},"100":{ref_id:100,authors:"Eli Biham, Ofer Biham, David Biron, Markus Grassl, and Daniel Lidar",title:"Grover's quantum search algorithm for an arbitrary initialamplitude distribution.",links:{"arXiv:quant-ph/9807027":"http://arxiv.org/abs/quant-ph/9807027","arXiv:quant-ph/0010077":"http://arxiv.org/abs/quant-ph/0010077"},extra:"<em>Physical Review A</em>, 60(4):2742, 1999."},"101":{ref_id:101,authors:"Andrew Childs, Shelby Kimmel, and Robin Kothari",title:"The quantum query complexity of read-many formulas",links:{"arXiv:1112.0548":"http://arxiv.org/abs/1112.0548"},extra:"In <em>Proceedings of ESA 2012</em>, pg. 337-348, Springer. (LNCS 7501)"},"102":{ref_id:102,authors:"Alán Aspuru-Guzik, Anthony D. Dutoi, Peter J. Love, and Martin Head-Gordon",title:"Simulated quantum computation of molecular energies.",links:{"arXiv:quant-ph/0604193":"http://arxiv.org/abs/quant-ph/0604193"},extra:"<em>Science</em>, 309(5741):1704-1707, 2005."},"103":{ref_id:103,authors:"A. M. Childs, A. J. Landahl, and P. A. Parrilo",title:"Quantum algorithms for the ordered search problem via semidefinite programming.",links:{"arXiv:quant-ph/0608161":"http://arxiv.org/abs/quant-ph/0608161"},extra:"<em>Physical Review A</em>, 75 032335, 2007."},"104":{ref_id:104,authors:"Aram W. Harrow, Avinatan Hassidim, and Seth Lloyd",title:"Quantum algorithm for solving linear systems of equations.",links:{"arXiv:0811.3171":"http://arxiv.org/abs/0811.3171"},extra:"<em>Physical Review Letters</em> 15(103):150502, 2009."},"105":{ref_id:105,authors:"Martin Roetteler",title:"Quantum algorithms for highly non-linear Boolean functions.",links:{"arXiv:0811.3208":"http://arxiv.org/abs/0811.3208"},extra:"<i>Proceedings of SODA 2010</i>"},"106":{ref_id:106,authors:"Stephen P. Jordan",title:"Fast quantum algorithms for approximating the irreducible representations of groups.",links:{"arXiv:0811.0562":"http://arxiv.org/abs/0811.0562"},extra:""},"107":{ref_id:107,authors:"Tim Byrnes and Yoshihisa Yamamoto",title:"Simulating lattice gauge theories on a quantum computer.",links:{"arXiv:quant-ph/0510027":"http://arxiv.org/abs/quant-ph/0510027"},extra:"<em>Physical Review A</em>, 73, 022328, 2006."},"108":{ref_id:108,authors:"D. Simon",title:"On the Power of Quantum Computation.",links:{},extra:"In <em>Proceedings of the 35th Symposium on Foundations of Computer Science</em>, pg. 116-123, 1994."},"109":{ref_id:109,authors:"John Proos and Christof Zalka",title:"Shor's discrete logarithm quantum algorithm for elliptic curves.",links:{"arXiv:quant-ph/0301141":"http://arxiv.org/abs/quant-ph/0301141"},extra:"<em>Quantum Information and Computation</em>, Vol. 3, No. 4,pg.317-344, 2003."},"110":{ref_id:110,authors:"Yi-Kai Liu",title:"Quantum algorithms using the curvelet transform.",links:{"arXiv:0810.4968":"http://arxiv.org/abs/0810.4968"},extra:"<i>Proceedings of STOC 2009</i>, pg. 391-400."},"111":{ref_id:111,authors:"Wim van Dam and Igor Shparlinski",title:"Classical and quantum algorithms for exponential congruences.",links:{"arXiv:0804.1109":"http://arxiv.org/abs/0804.1109"},extra:"<i>Proceedings of TQC 2008</i>, pg. 1-10."},"112":{ref_id:112,authors:"Itai Arad and Zeph Landau",title:"Quantum computation and the evaluation of tensor networks.",links:{"arXiv:0805.0040":"http://arxiv.org/abs/0805.0040"},extra:"<em>SIAM Journal on Computing</em>, 39(7):3089-3121, 2010."},"113":{ref_id:113,authors:"M. Van den Nest, W. Dür, R. Raussendorf, and H. J. Briegel",title:"Quantum algorithms for spin models and simulable gate sets for quantum computation.",links:{"arXiv:0805.1214":"http://arxiv.org/abs/0805.1214"},extra:"<em>Physical Review A</em>, 80:052334, 2009."},"114":{ref_id:114,authors:"Silvano Garnerone, Annalisa Marzuoli, and Mario Rasetti",title:"Efficient quantum processing of 3-manifold topologicalinvariants.",links:{"arXiv:quant-ph/0703037":"http://arxiv.org/abs/quant-ph/0703037"},extra:"<em>Advances in Theoretical and Mathematical Physics</em>,13(6):1601-1652, 2009."},"115":{ref_id:115,authors:"Louis H. Kauffman and Samuel J. Lomonaco Jr.",title:"q-deformed spin networks, knot polynomials and anyonic topological quantum computation.",links:{"arXiv:quant-ph/0606114":"http://arxiv.org/abs/quant-ph/0606114"},extra:"<i>Journal of Knot Theory</i>, Vol. 16, No. 3, pg. 267-332, 2007."},"116":{ref_id:116,authors:"Arthur Schmidt and Ulrich Vollmer",title:"Polynomial time quantum algorithm for the computation of the unit group of a number field.",links:{},extra:"In <i>Proceedings of the 37th Symposium on the Theory of Computing</i>, pg. 475-480, 2005."},"117":{ref_id:117,authors:"Sergey Bravyi, Aram Harrow, and Avinatan Hassidim",title:"Quantum algorithms for testing properties of distributions.",links:{"arXiv:0907.3920":"http://arxiv.org/abs/0907.3920"},extra:"<em>IEEE Transactions on Information Theory</em> 57(6):3971-3981, 2011."},"118":{ref_id:118,authors:"Pawel M. Wocjan, Stephen P. Jordan, Hamed Ahmadi, and Joseph P. Brennan",title:"Efficient quantum processing of ideals in finite rings.",links:{"arXiv:0908.0022":"http://arxiv.org/abs/0908.0022"},extra:""},"119":{ref_id:119,authors:"V. Arvind, Bireswar Das, and Partha Mukhopadhyay",title:"The complexity of black-box ring problems.",links:{},extra:"In <i>Proceedings of COCCOON 2006</i>, pg 126-145."},"120":{ref_id:120,authors:"V. Arvind and Partha Mukhopadhyay",title:"Quantum query complexity of multilinear identity testing.",links:{},extra:"In <i>Proceedings of STACS 2009</i>, pg. 87-98."},"121":{ref_id:121,authors:"David Poulin and Pawel Wocjan",title:"Sampling from the thermal quantum Gibbs state and evaluating partition functions with a quantum computer.",links:{"arXiv:0905.2199":"http://arxiv.org/abs/0905.2199"},extra:"<i>Physical Review Letters</i> 103:220502, 2009."},"122":{ref_id:122,authors:"Pawel Wocjan, Chen-Fu Chiang, Anura Abeyesinghe, and Daniel Nagaj",title:"Quantum speed-up for approximating partition functions.",links:{"arXiv:0811.0596":"http://arxiv.org/abs/0811.0596"},extra:"<i>Physical Review A</i> 80:022340, 2009."},"123":{ref_id:123,authors:"Ashley Montanaro",title:"Quantum search with advice.",links:{"arXiv:0908.3066":"http://arxiv.org/abs/0908.3066"},extra:"In <em>Proceedings of the 5th conference on Theory of quantumcomputation, communication, and cryptography (TQC 2010)</em>"},"124":{ref_id:124,authors:"Laszlo Babai, Robert Beals, and Akos Seress",title:"Polynomial-time theory of matrix groups.",links:{},extra:"In <i>Proceedings of STOC 2009</i>, pg. 55-64."},"125":{ref_id:125,authors:"Peter Shor",title:"Algorithms for Quantum Computation: Discrete Logarithms and Factoring.",links:{},extra:"In <i>Proceedings of FOCS 1994</i>, pg. 124-134."},"126":{ref_id:126,authors:"Aaron Denney, Cristopher Moore, and Alex Russell",title:"Finding conjugate stabilizer subgroups in PSL(2;q) and related groups.",links:{"arXiv:0809.2445":"http://arxiv.org/abs/0809.2445"},extra:"<em>Quantum Information and Computation</em> 10(3):282-291, 2010."},"127":{ref_id:127,authors:"Kevin K. H. Cheung and Michele Mosca",title:"Decomposing finite Abelian groups.",links:{"arXiv:cs/0101004":"http://arxiv.org/abs/cs/0101004"},extra:"<em>Quantum Information and Computation</em> 1(2):26-32, 2001."},"128":{ref_id:128,authors:"François Le Gall",title:"An efficient quantum algorithm for some instances of the group isomorphism problem.",links:{"arXiv:1001.0608":"http://arxiv.org/abs/1001.0608"},extra:"In <em>Proceedings of STACS 2010</em> ."},"129":{ref_id:129,authors:"Gorjan Alagic, Stephen Jordan, Robert Koenig, and Ben Reichardt",title:"Approximating Turaev-Viro 3-manifold invariants is universal for quantum computation.",links:{"arXiv:1003.0923":"http://arxiv.org/abs/1003.0923"},extra:"<em>Physical Review A</em> 82, 040302(R), 2010."},"130":{ref_id:130,authors:"Martin Rötteler",title:"Quantum algorithms to solve the hidden shift problem for quadratics and for functions of large Gowers norm.",links:{"arXiv:0911.4724":"http://arxiv.org/abs/0911.4724"},extra:"In <em>Proceedings of MFCS 2009</em>, pg 663-674."},"131":{ref_id:131,authors:"Arthur Schmidt",title:"Quantum Algorithms for many-to-one Functions to Solve the Regulator and the Principal Ideal Problem.",links:{"arXiv:0912.4807":"http://arxiv.org/abs/0912.4807"},extra:""},"132":{ref_id:132,authors:"K. Temme, T.J. Osborne, K.G. Vollbrecht, D. Poulin, and F. Verstraete",title:"Quantum Metropolis Sampling.",links:{"arXiv:0911.3635":"http://arxiv.org/abs/0911.3635"},extra:"<em>Nature</em>, Vol. 471, pg. 87-90, 2011."},"133":{ref_id:133,authors:"Andris Ambainis",title:"Quantum Search Algorithms.",links:{"arXiv:quant-ph/0504012":"http://arxiv.org/abs/quant-ph/0504012"},extra:"<em>SIGACT News</em>, 35 (2):22-35, 2004."},"134":{ref_id:134,authors:"Nicolas J. Cerf, Lov K. Grover, and Colin P. Williams",title:"Nested quantum search and NP-hard problems.",links:{},extra:"<em>Applicable Algebra in Engineering, Communication and Computing</em>, 10 (4-5):311-338, 2000."},"135":{ref_id:135,authors:"Mario Szegedy",title:"Spectra of Quantized Walks and a \\( \\sqrt{\\delta \\epsilon} \\) rule.",links:{"arXiv:quant-ph/0401053":"http://arxiv.org/abs/quant-ph/0401053"},extra:""},"136":{ref_id:136,authors:"Kazuo Iwama, Harumichi Nishimura, Rudy Raymond, and Junichi Teruyama",title:"Quantum Counterfeit Coin Problems.",links:{"arXiv:1009.0416":"http://arxiv.org/abs/1009.0416"},extra:"In <em>Proceedings of 21st International Symposium on Algorithms and Computation (ISAAC2010)</em>, LNCS 6506, pp.73-84, 2010."},"137":{ref_id:137,authors:"Barbara Terhal and John Smolin",title:"Single quantum querying of a database.",links:{"arXiv:quant-ph/9705041":"http://arxiv.org/abs/quant-ph/9705041"},extra:"<em>Physical Review A</em> 58:1822, 1998."},"138":{ref_id:138,authors:"Andris Ambainis",title:"Variable time amplitude amplification and a faster quantum algorithm for solving systems of linear equations.",links:{"arXiv:1010.4458":"http://arxiv.org/abs/1010.4458"},extra:""},"139":{ref_id:139,authors:"Frédéric Magniez and Ashwin Nayak",title:"Quantum complexity of testing group commutativity.",links:{"arXiv:quant-ph/0506265":"http://arxiv.org/abs/quant-ph/0506265"},extra:"In <em>Proceedings of 32nd International Colloquium on Automata, Languages and Programming.</em> LNCS 3580, pg. 1312-1324, 2005."},"140":{ref_id:140,authors:"Andrew Childs and Robin Kothari",title:"Quantum query complexity of minor-closed graph properties.",links:{"arXiv:1011.1443":"http://arxiv.org/abs/1011.1443"},extra:"In <em>Proceedings of the 28th Symposium on Theoretical Aspects of Computer Science (STACS 2011)</em>, pg. 661-672"},"141":{ref_id:141,authors:"Frédéric Magniez, Ashwin Nayak, Jérémie Roland, and Miklos Santha",title:"Search via quantum walk.",links:{"arXiv:quant-ph/0608026":"http://arxiv.org/abs/quant-ph/0608026"},extra:"In <em>Proceedings STOC 2007</em>, pg. 575-584."},"142":{ref_id:142,authors:"Dmitry Gavinsky, Martin Roetteler, and Jérémy Roland",title:"Quantum algorithm for the Boolean hidden shift problem.",links:{"arXiv:1103.3017":"http://arxiv.org/abs/1103.3017"},extra:"In <em>Proceedings of the 17th annual international conferenceon Computing and combinatorics (COCOON '11)</em>, 2011."},"143":{ref_id:143,authors:"Mark Ettinger and Peter Høyer",title:"On quantum algorithms for noncommutative hidden subgroups.",links:{"arXiv:quant-ph/9807029":"http://arxiv.org/abs/quant-ph/9807029"},extra:"<em>Advances in Applied Mathematics</em>, Vol. 25, No. 3, pg. 239-251, 2000."},"144":{ref_id:144,authors:"Andris Ambainis, Andrew Childs, and Yi-Kai Liu",title:"Quantum property testing for bounded-degree graphs.",links:{"arXiv:1012.3174":"http://arxiv.org/abs/1012.3174"},extra:"In <em>Proceedings of RANDOM '11</em> : Lecture Notes in Computer Science 6845, pp. 365-376, 2011."},"145":{ref_id:145,authors:"G. Ortiz, J.E. Gubernatis, E. Knill, and R. Laflamme",title:"Quantum algorithms for Fermionic simulations.",links:{"arXiv:cond-mat/0012334":"http://arxiv.org/abs/cond-mat/0012334"},extra:"<em>Physical Review A</em> 64: 022319, 2001."},"146":{ref_id:146,authors:"Ashley Montanaro",title:"The quantum query complexity of learning multilinearpolynomials.",links:{"arXiv:1105.3310":"http://arxiv.org/abs/1105.3310"},extra:"<em>Information Processing Letters</em>, 112(11):438-442, 2012."},"147":{ref_id:147,authors:"Tad Hogg",title:"Highly structured searches with quantum computers.",links:{},extra:"<em>Physical Review Letters</em> 80: 2473, 1998."},"148":{ref_id:148,authors:"Markus Hunziker and David A. Meyer",title:"Quantum algorithms for highly structured search problems.",links:{},extra:"<em>Quantum Information Processing</em>, Vol. 1, No. 3, pg. 321-341, 2002."},"149":{ref_id:149,authors:"Ben Reichardt",title:"Span programs and quantum query complexity: The general adversary bound is nearly tight for every Boolean function.",links:{"arXiv:0904.2759":"http://arxiv.org/abs/0904.2759"},extra:"In <em>Proceedings of the 50th IEEE Symposium on Foundations ofComputer Science (FOCS '09)</em>, pg. 544-551, 2009."},"150":{ref_id:150,authors:"Aleksandrs Belovs",title:"Span-program-based quantum algorithm for the rank problem.",links:{"arXiv:1103.0842":"http://arxiv.org/abs/1103.0842"},extra:""},"151":{ref_id:151,authors:"Sebastian Dörn and Thomas Thierauf",title:"The quantum query complexity of the determinant.",links:{},extra:"<em>Information Processing Letters</em> Vol. 109, No. 6, pg. 305-328, 2009."},"152":{ref_id:152,authors:"Aleksandrs Belovs",title:"Span programs for functions with constant-sized 1-certificates.",links:{"arXiv:1105.4024":"http://arxiv.org/abs/1105.4024"},extra:"In <em>Proceedings of STOC 2012</em>, pg. 77-84."},"153":{ref_id:153,authors:"Troy Lee, Frédéric Magniez, and Mikos Santha",title:"A learning graph based quantum query algorithm for findingconstant-size subgraphs.",links:{"arXiv:1109.5135":"http://arxiv.org/abs/1109.5135"},extra:"<em>Chicago Journal of Theoretical Computer Science</em>,Vol. 2012, Article 10, 2012."},"154":{ref_id:154,authors:"Aleksandrs Belovs and Troy Lee",title:"Quantum algorithm for k-distinctness with prior knowledge on the input.",links:{"arXiv:1108.3022":"http://arxiv.org/abs/1108.3022"},extra:""},"155":{ref_id:155,authors:"François Le Gall",title:"Improved output-sensitive quantum algorithms for Boolean matrix multiplication.",links:{},extra:"In <em>Proceedings of the 23rd Annual ACM-SIAM Symposium on DiscreteAlgorithms (SODA '12)</em>, 2012."},"156":{ref_id:156,authors:"Dominic Berry",title:"Quantum algorithms for solving linear differential equations.",links:{"arXiv:1010.2745":"http://arxiv.org/abs/1010.2745"},extra:"<i>J. Phys. A: Math. Theor.</i> 47, 105301, 2014."},"157":{ref_id:157,authors:"Virginia Vassilevska Williams and Ryan Williams",title:"Subcubic equivalences between path, matrix, and triangle problems.",links:{},extra:"In <em>51st IEEE Symposium on Foundations of Computer Science (FOCS '10)</em> pg. 645 - 654, 2010."},"158":{ref_id:158,authors:"Ben W. Reichardt",title:"Reflections for quantum query algorithms.",links:{"arXiv:1005.1601":"http://arxiv.org/abs/1005.1601"},extra:"In <em>Proceedings of the 22nd ACM-SIAM Symposium on Discrete Algorithms (SODA)</em>, pg. 560-569, 2011."},"159":{ref_id:159,authors:"Ben W. Reichardt",title:"Span-program-based quantum algorithm for evaluating unbalanced formulas.",links:{"arXiv:0907.1622":"http://arxiv.org/abs/0907.1622"},extra:""},"160":{ref_id:160,authors:"Ben W. Reichardt",title:"Faster quantum algorithm for evaluating game trees.",links:{"arXiv:0907.1623":"http://arxiv.org/abs/0907.1623"},extra:"In <em>Proceedings of the 22nd ACM-SIAM Symposium on Discrete Algorithms (SODA)</em>, pg. 546-559, 2011."},"161":{ref_id:161,authors:"Stacey Jeffery, Robin Kothari, and Frédéric Magniez",title:"Improving quantum query complexity of Boolean matrix multiplication using graph collision.",links:{"arXiv:1112.5855":"http://arxiv.org/abs/1112.5855"},extra:"In <em>Proceedings of ICALP 2012</em>, pg. 522-532."},"162":{ref_id:162,authors:"Andrew M. Childs and Jason M. Eisenberg",title:"Quantum algorithms for subset finding.",links:{"arXiv:quant-ph/0311038":"http://arxiv.org/abs/quant-ph/0311038"},extra:"<em>Quantum Information and Computation</em> 5(7):593-604, 2005."},"163":{ref_id:163,authors:"Aleksandrs Belovs and Robert Špalek",title:"Adversary lower bound for the k-sum problem.",links:{"arXiv:1206.6528":"http://arxiv.org/abs/1206.6528"},extra:"In <em>Proceedings of ITCS 2013</em>, pg. 323-328."},"164":{ref_id:164,authors:"Bohua Zhan, Shelby Kimmel, and Avinatan Hassidim",title:"Super-polynomial quantum speed-ups for Boolean evaluation treeswith hidden structure.",links:{"arXiv:1101.0796":"http://arxiv.org/abs/1101.0796"},extra:"<em>ITCS 2012: Proceedings of the 3rd Innovations in Theoretical Computer Science</em>, ACM, pg. 249-265."},"165":{ref_id:165,authors:"Shelby Kimmel",title:"Quantum adversary (upper) bound.",links:{"arXiv:1101.0797":"http://arxiv.org/abs/1101.0797"},extra:"<em>39th International Colloquium on Automata, Languages and Programming - ICALP 2012</em> Volume 7391, p. 557-568."},"166":{ref_id:166,authors:"Stephen Jordan, Keith Lee, and John Preskill",title:"Quantum algorithms for quantum field theories.",links:{"arXiv:1111.3633":"http://arxiv.org/abs/1111.3633"},extra:"<em>Science</em>, Vol. 336, pg. 1130-1133, 2012."},"167":{ref_id:167,authors:"Andris Ambainis and Ashley Montanaro",title:"Quantum algorithms for search with wildcards and combinatorial group testing.",links:{"arXiv:1210.1148":"http://arxiv.org/abs/1210.1148"},extra:""},"168":{ref_id:168,authors:"Andris Ambainis and Robert Špalek",title:"Quantum algorithms for matching and network flows.",links:{"arXiv:quant-ph/0508205":"http://arxiv.org/abs/quant-ph/0508205"},extra:"<em>Proceedings of STACS 2007</em>, pg. 172-183."},"169":{ref_id:169,authors:"Nathan Wiebe, Daniel Braun, and Seth Lloyd",title:"Quantum data-fitting.",links:{"arXiv:1204.5242":"http://arxiv.org/abs/1204.5242"},extra:"<em>Physical Review Letters</em> 109, 050505, 2012."},"170":{ref_id:170,authors:"Andrew Childs and Nathan Wiebe",title:"Hamiltonian simulation using linear combinations of unitaryoperations.",links:{"arXiv:1202.5822":"http://arxiv.org/abs/1202.5822"},extra:"<em>Quantum Information and Computation</em> 12, 901-924, 2012."},"171":{ref_id:171,authors:"Stacey Jeffery, Robin Kothari, and Frédéric Magniez",title:"Nested quantum walks with quantum data structures.",links:{"arXiv:1210.1199":"http://arxiv.org/abs/1210.1199"},extra:"In <em>Proceedings of the 24th ACM-SIAM Symposium on Discrete Algorithms (SODA'13)</em>, pg. 1474-1485, 2013."},"172":{ref_id:172,authors:"Aleksandrs Belovs",title:"Learning-graph-based quantum algorithm for k-distinctness.",links:{"arXiv:1205.1534":"http://arxiv.org/abs/1205.1534"},extra:"<em>Proceedings of STOC 2012</em>, pg. 77-84."},"173":{ref_id:173,authors:"Andrew Childs, Stacey Jeffery, Robin Kothari, and Frédéric Magniez",title:"A time-efficient quantum walk for 3-distinctness using nested updates.",links:{"arXiv:1302.7316":"http://arxiv.org/abs/1302.7316"},extra:""},"174":{ref_id:174,authors:"Hari Krovi and Alexander Russell",title:"Quantum Fourier transforms and the complexity of link invariantsfor quantum doubles of finite groups.",links:{"arXiv:1210.1550":"http://arxiv.org/abs/1210.1550"},extra:"<em>Commun. Math. Phys.</em> 334, 743-777, 2015"},"175":{ref_id:175,authors:"Troy Lee, Frédéric Magniez, and Miklos Santha",title:"Improved quantum query algorithms for triangle finding and associativity testing.",links:{"arXiv:1210.1014":"http://arxiv.org/abs/1210.1014"},extra:""},"176":{ref_id:176,authors:"Silvano Garnerone, Paolo Zanardi, and Daniel A. Lidar",title:"Adiabatic quantum algorithm for search engine ranking.",links:{},extra:"<em>Physical Review Letters</em> 108:230506, 2012."},"177":{ref_id:177,authors:"R. D. Somma, S. Boixo, H. Barnum, and E. Knill",title:"Quantum simulations of classical annealing.",links:{"arXiv:0804.1571":"http://arxiv.org/abs/0804.1571"},extra:"<em>Physical Review Letters</em> 101:130504, 2008."},"178":{ref_id:178,authors:"Daniel J. Bernstein, Stacey Jeffery, Tanja Lange, and Alexander Meurer",title:"Quantum algorithms for the subset-sum problem.",links:{"from cr.yp.to":"http://cr.yp.to/qsubsetsum/qsubsetsum-20130407.pdf"},extra:""},"179":{ref_id:179,authors:"Boris Altshuler, Hari Krovi, and Jérémie Roland",title:"Anderson localization casts clouds over adiabatic quantum optimization.",links:{"arXiv:0912.0746":"http://arxiv.org/abs/0912.0746"},extra:"<em>Proceedings of the National Academy of Sciences</em> 107(28):12446-12450, 2010."},"180":{ref_id:180,authors:"Ben Reichardt",title:"The quantum adiabatic optimization algorithm and local minima.",links:{Erratum:"http://www-bcf.usc.edu/~breichar/Correction.txt"},extra:"In <em>Proceedings of STOC 2004</em>, pg. 502-510."},"181":{ref_id:181,authors:"Edward Farhi, Jeffrey Goldstone, and Sam Gutmann",title:"Quantum adiabatic evolution algorithms versus simulated annealing.",links:{"arXiv:quant-ph/0201031":"http://arxiv.org/abs/quant-ph/0201031"},extra:""},"182":{ref_id:182,authors:"E. Farhi, J. Goldstone, D. Gosset, S. Gutmann, H. B. Meyer, and P. Shor",title:"Quantum adiabatic algorithms, small gaps, and different paths.",links:{"arXiv:0909.4766":"http://arxiv.org/abs/0909.4766"},extra:"<em>Quantum Information and Computation</em>, 11(3/4):181-214, 2011."},"183":{ref_id:183,authors:"Sergey Bravyi, David P. DiVincenzo, Roberto I. Oliveira, and Barbara M. Terhal",title:"The Complexity of Stoquastic Local Hamiltonian Problems.",links:{"arXiv:quant-ph/0606140":"http://arxiv.org/abs/quant-ph/0606140"},extra:"<em>Quantum Information and Computation</em>, 8(5):361-385, 2008."},"184":{ref_id:184,authors:"Rolando D. Somma and Sergio Boixo",title:"Spectral gap amplification.",links:{"arXiv:1110.2494":"http://arxiv.org/abs/1110.2494"},extra:"<em>SIAM Journal on Computing</em>, 42:593-610, 2013."},"185":{ref_id:185,authors:"Sabine Jansen, Mary-Beth Ruskai, Ruedi Seiler",title:"Bounds for the adiabatic approximation with applications to quantum computation.",links:{"arXiv:quant-ph/0603175":"http://arxiv.org/abs/quant-ph/0603175"},extra:"<em>Journal of Mathematical Physics</em>, 48:102111, 2007."},"186":{ref_id:186,authors:"E. Farhi, J. Goldstone, S. Gutmann, J. Lapan, A. Lundgren, and D. Preda",title:"A Quantum Adiabatic Evolution Algorithm Applied to Random Instances of an NP-Complete Problem.",links:{"arXiv:quant-ph/0104129":"http://arxiv.org/abs/quant-ph/0104129"},extra:"<em>Science</em>, 292(5516):472-475, 2001."},"187":{ref_id:187,authors:"Edward Farhi, Jeffrey Goldstone, Sam Gutmann, and Daniel Nagaj",title:"How to make the quantum adiabatic algorithm fail.",links:{"arXiv:quant-ph/0512159":"http://arxiv.org/abs/quant-ph/0512159"},extra:"<em>International Journal of Quantum Information</em>, 6(3):503-516, 2008."},"188":{ref_id:188,authors:"Edward Farhi, Jeffrey Goldstone, Sam Gutmann, and Daniel Nagaj",title:"Unstructured randomness, small gaps, and localization.",links:{"arXiv:1010.0009":"http://arxiv.org/abs/1010.0009"},extra:"<em>Quantum Information and Computation</em>, 11(9/10):840-854, 2011."},"189":{ref_id:189,authors:"Edward Farhi, Jeffrey Goldstone, Sam Gutmann",title:"Quantum adiabatic evolution algorithms with different paths.",links:{"arXiv:quant-ph/0208135":"http://arxiv.org/abs/quant-ph/0208135"},extra:""},"190":{ref_id:190,authors:"Wim van Dam, Michele Mosca, and Umesh Vazirani",title:"How powerful is adiabatic quantum computation?",links:{"arXiv:quant-ph/0206003":"http://arxiv.org/abs/quant-ph/0206003","this":"http://www.cs.berkeley.edu/~vazirani/pubs/qao.ps"},extra:"In <em>Proceedings of FOCS 2001</em>, pg. 279-287."},"191":{ref_id:191,authors:"E. Farhi, D. Gosset, I. Hen, A. W. Sandvik, P. Shor, A. P. Young, and F. Zamponi",title:"The performance of the quantum adiabatic algorithm on random instances of two optimization problems on regular hypergraphs.",links:{"arXiv:1208.3757":"http://arxiv.org/abs/1208.3757"},extra:"<em>Physical Review A</em>, 86:052334, 2012."},"192":{ref_id:192,authors:"Kristen L. Pudenz and Daniel A. Lidar",title:"Quantum adiabatic machine learning.",links:{"arXiv:1109.0325":"http://arxiv.org/abs/1109.0325"},extra:"<em>Quantum Information Processing</em>, 12:2027, 2013."},"193":{ref_id:193,authors:"Frank Gaitan and Lane Clark",title:"Ramsey numbers and adiabatic quantum computing.",links:{"arXiv:1103.1345":"http://arxiv.org/abs/1103.1345"},extra:"<em>Physical Review Letters</em>, 108:010501, 2012."},"194":{ref_id:194,authors:"Frank Gaitan and Lane Clark",title:"Graph isomorphism and adiabatic quantum computing.",links:{"arXiv:1304.5773":"http://arxiv.org/abs/1304.5773"},extra:"<em>Physical Review A</em>, 89(2):022342, 2014."},"195":{ref_id:195,authors:"Hartmut Neven, Vasil S. Denchev, Geordie Rose, and William G. Macready",title:"Training a binary classifier with the quantum adiabatic algorithm.",links:{"arXiv:0811.0416":"http://arxiv.org/abs/0811.0416"},extra:""},"196":{ref_id:196,authors:"Robert Beals",title:"Quantum computation of Fourier transforms over symmetric groups.",links:{},extra:"In <em>Proceedings of STOC 1997</em>, pg. 48-53."},"197":{ref_id:197,authors:"Dave Bacon, Isaac L. Chuang, and Aram W. Harrow",title:"The quantum Schur transform: I. efficient qudit circuits.",links:{"arXiv:quant-ph/0601001":"http://arxiv.org/abs/quant-ph/0601001"},extra:"In <em>Proceedings of SODA 2007</em>, pg. 1235-1244."},"198":{ref_id:198,authors:"S. Morita, H. Nishimori",title:"Mathematical foundation of quantum annealing.",links:{},extra:"<em>Journal of Methematical Physics</em>, 49(12):125210, 2008."},"199":{ref_id:199,authors:"A. B. Finnila, M. A. Gomez, C. Sebenik, C. Stenson, J. D. Doll",title:"Quantum annealing: a new method for minimizing multidimensional functions.",links:{},extra:"<em>Chemical Physics Letters</em>, 219:343-348, 1994."},"200":{ref_id:200,authors:"D. Gavinsky and T. Ito",title:"A quantum query algorithm for the graph collision problem.",links:{"arXiv:1204.1527":"http://arxiv.org/abs/1204.1527"},extra:""},"201":{ref_id:201,authors:"Andris Ambainis, Kaspars Balodis, Jānis Iraids, Raitis Ozols, and Juris Smotrovs",title:"Parameterized quantum query complexity of graph collision.",links:{"arXiv:1305.1021":"http://arxiv.org/abs/1305.1021"},extra:""},"202":{ref_id:202,authors:"Kevin C. Zatloukal",title:"Classical and quantum algorithms for testing equivalence of group extensions.",links:{"arXiv:1305.1327":"http://arxiv.org/abs/1305.1327"},extra:""},"203":{ref_id:203,authors:"Andrew Childs and Gábor Ivanyos",title:"Quantum computation of discrete logarithms in semigroups.",links:{"arXiv:1310.6238":"http://arxiv.org/abs/1310.6238"},extra:""},"204":{ref_id:204,authors:"Matan Banin and Boaz Tsaban",title:"A reduction of semigroup DLP to classic DLP.",links:{"arXiv:1310.7903":"http://arxiv.org/abs/1310.7903"},extra:""},"205":{ref_id:205,authors:"D. W. Berry, R. Cleve, and R. D. Somma",title:"Exponential improvement in precision for Hamiltonian-evolution simulation.",links:{"arXiv:1308.5424":"http://arxiv.org/abs/1308.5424"},extra:""},"206":{ref_id:206,authors:"François Le Gall and Harumichi Nishimura",title:"Quantum algorithms for matrix products over semirings.",links:{"arXiv:1310.3898":"http://arxiv.org/abs/1310.3898"},extra:""},"207":{ref_id:207,authors:"Nolan Wallach",title:"A quantum polylog algorithm for non-normal maximal cyclic hidden subgroups in the affine group of a finite field.",links:{"arXiv:1308.1415":"http://arxiv.org/abs/1308.1415"},extra:""},"208":{ref_id:208,authors:"Lov Grover",title:"Fixed-point quantum search.",links:{"arXiv:quant-ph/0503205":"http://arxiv.org/abs/quant-ph/0503205"},extra:"<em>Phys. Rev. Lett. 95(15):150501, 2005.</em>"},"209":{ref_id:209,authors:"Tathagat Tulsi, Lov Grover, and Apoorva Patel",title:"A new algorithm for fixed point quantum search.",links:{"arXiv:quant-ph/0505007":"http://arxiv.org/abs/quant-ph/0505007"},extra:"<em>Quantum Information and Computation 6(6):483-494, 2005.</em>"},"210":{ref_id:210,authors:"Guoming Wang",title:"Quantum algorithms for approximating the effective resistances of electrical networks.",links:{"arXiv:1311.1851":"http://arxiv.org/abs/1311.1851"},extra:""},"211":{ref_id:211,authors:"Dominic W. Berry, Andrew M. Childs, Richard Cleve, Robin Kothari, and Rolando D. Somma",title:"Exponential improvement in precision for simulating sparse Hamiltonians",links:{"arXiv:1312.1414":"http://arxiv.org/abs/1312.1414"},extra:""},"212":{ref_id:212,authors:"Thomas Decker, Peter Høyer, Gabor Ivanyos, and Miklos Santha",title:"Polynomial time quantum algorithms for certain bivariate hidden polynomial problems",links:{"arXiv:1305.1543":"http://arxiv.org/abs/1305.1543"},extra:""},"213":{ref_id:213,authors:"Kirsten Eisenträger, Sean Hallgren, Alexei Kitaev, and Fang Song",title:"A quantum algorithm for computing the unit group of an arbitrary degree number field",links:{},extra:"In <em>Proceedings of STOC 2014</em> pg. 293-302."},"214":{ref_id:214,authors:"Seth Lloyd, Masoud Mohseni, and Patrick Robentrost",title:"Quantum algorithms for supervised and unsupervised machine learning",links:{"arXiv:1307.0411":"http://arxiv.org/abs/1307.0411"},extra:""},"215":{ref_id:215,authors:"Ashley Montanaro",title:"Quantum pattern matching fast on average",links:{"arXiv:1408.1816":"http://arxiv.org/abs/1408.1816"},extra:""},"216":{ref_id:216,authors:"Charles H. Bennett, Ethan Bernstein, Gilles Brassard, and Umesh Vazirani",title:"Strengths and weaknesses of quantum computing",links:{"arXiv:quant-ph/9701001":"http://arxiv.org/abs/quant-ph/9701001"},extra:"<em>SIAM J. Comput. 26(5):1524-1540, 1997</em>"},"217":{ref_id:217,authors:"H. Ramesh and V. Vinay",title:"String matching in \\( \\widetilde{O}(\\sqrt{n} + \\sqrt{m}) \\)quantum time",links:{"arXiv:quant-ph/0011049":"http://arxiv.org/abs/quant-ph/0011049"},extra:"<em>Journal of Discrete Algorithms 1:103-110, 2003</em>"},"218":{ref_id:218,authors:"Greg Kuperberg",title:"Another subexponential-time quantum algorithm for the dihedral hidden subgroup problem",links:{"arXiv:1112.3333":"http://arxiv.org/abs/1112.3333"},extra:"In <em>Proceedings of TQC pg. 20-34, 2013</em>"},"219":{ref_id:219,authors:"Peter Høyer, Jan Neerbek, and Yaoyun Shi",title:"Quantum complexities of ordered searching, sorting, and elementdistinctness",links:{"arXiv:quant-ph/0102078":"http://arxiv.org/abs/quant-ph/0102078"},extra:"In <em>Proceedings of ICALP pg. 346-357, 2001</em>"},"220":{ref_id:220,authors:"Amnon Ta-Shma",title:"Inverting well conditioned matrices in quantum logspace",links:{},extra:"In <em>Proceedings of STOC 2013</em> pg. 881-890."},"221":{ref_id:221,authors:"Nathan Wiebe, Ashish Kapoor, and Krysta Svore",title:"Quantum deep learning",links:{"arXiv:1412.3489":"http://arxiv.org/abs/1412.3489"},extra:""},"222":{ref_id:222,authors:"Seth Lloyd, Silvano Garnerone, and Paolo Zanardi",title:"Quantum algorithms for topological and geometric analysis of big data",links:{"arXiv:1408.3106":"http://arxiv.org/abs/1408.3106"},extra:""},"223":{ref_id:223,authors:"David A. Meyer and James Pommersheim",title:"Single-query learning from abelian and non-abelian Hammingdistance oracles",links:{"arXiv:0912.0583":"http://arxiv.org/abs/0912.0583"},extra:""},"224":{ref_id:224,authors:"Markus Hunziker, David A. Meyer, Jihun Park, James Pommersheim, and Mitch Rothstein",title:"The geometry of quantum learning",links:{"arXiv:quant-ph/0309059":"http://arxiv.org/abs/quant-ph/0309059"},extra:"<em>Quantum Information Processing 9:321-341, 2010.</em>"},"225":{ref_id:225,authors:"Lawrence M. Ioannou and Michele Mosca",title:"Limitations on some simple adiabatic quantum algorithms",links:{"arXiv:quant-ph/0702241":"http://arxiv.org/abs/quant-ph/0702241"},extra:"<em>International Journal of Quantum Information, 6(3):419-426, 2008.</em>"},"226":{ref_id:226,authors:"Michael Jarret and Stephen P. Jordan",title:"Adiabatic optimization without local minima",links:{"arXiv:1405.7552":"http://arxiv.org/abs/1405.7552"},extra:"<em>Quantum Information and Computation, 15(3/4):0181-0199, 2015.</em>"},"227":{ref_id:227,authors:"Matthew B. Hastings, Dave Wecker, Bela Bauer, and Matthias Troyer",title:"Improving quantum algorithms for quantum chemistry",links:{"arXiv:1403.1539":"http://arxiv.org/abs/1403.1539"},extra:"<em>Quantum Information and Computation, 15(1/2):0001-0021, 2015.</em>"},"228":{ref_id:228,authors:"Stephen P. Jordan, Keith S. M. Lee, and John Preskill",title:"Quantum simulation of scattering in scalar quantum field theories",links:{"arXiv:1112.4833":"http://arxiv.org/abs/1112.4833"},extra:"<em>Quantum Information and Computation, 14(11/12):1014-1080, 2014.</em>"},"229":{ref_id:229,authors:"Stephen P. Jordan, Keith S. M. Lee, and John Preskill",title:"Quantum algorithms for fermionic quantum field theories",links:{"arXiv:1404.7115":"http://arxiv.org/abs/1404.7115"},extra:""},"230":{ref_id:230,authors:"Gavin K. Brennen, Peter Rohde, Barry C. Sanders, and Sukhi Singh",title:"Multi-scale quantum simulation of quantum field theory using wavelets",links:{"arXiv:1412.0750":"http://arxiv.org/abs/1412.0750"},extra:""},"231":{ref_id:231,authors:"Hefeng Wang, Sabre Kais, Alán Aspuru-Guzik, and Mark R. Hoffmann.",title:"Quantum algorithm for obtaining the energy spectrum of molecular systems",links:{"arXiv:0907.0854":"http://arxiv.org/abs/0907.0854"},extra:"<em>Physical Chemistry Chemical Physics, 10(35):5388-5393, 2008.</em>"},"232":{ref_id:232,authors:"Ivan Kassal and Alán Aspuru-Guzik",title:"Quantum algorithm for molecular properties and geometry optimization",links:{"arXiv:0908.1921":"http://arxiv.org/abs/0908.1921"},extra:"<em>Journal of Chemical Physics, 131(22), 2009.</em>"},"233":{ref_id:233,authors:"James D. Whitfield, Jacob Biamonte, and Alán Aspuru-Guzik",title:"Simulation of electronic structure Hamiltonians using quantum computers",links:{"arXiv:1001.3855":"http://arxiv.org/abs/1001.3855"},extra:"<em>Molecular Physics, 109(5):735-750, 2011.</em>"},"234":{ref_id:234,authors:"Borzu Toloui and Peter J. Love",title:"Quantum algorithms for quantum chemistry based on the sparsityof the CI-matrix",links:{"arXiv:1312.2529":"http://arxiv.org/abs/1312.2579"},extra:""},"235":{ref_id:235,authors:"James D. Whitfield",title:"Spin-free quantum computational simulations and symmetry adapted states",links:{"arXiv:1306.1147":"http://arxiv.org/abs/1306.1147"},extra:"<em>Journal of Chemical Physics, 139(2):021105, 2013.</em>"},"236":{ref_id:236,authors:"Andrew W. Cross, Graeme Smith, and John A. Smolin",title:"Quantum learning robust to noise",links:{"arXiv:1407.5088":"http://arxiv.org/abs/1407.5088"},extra:""},"237":{ref_id:237,authors:"Aram W. Harrow and David J. Rosenbaum",title:"Uselessness for an oracle model with internal randomness",links:{"arXiv:1111.1462":"http://arxiv.org/abs/1111.1462"},extra:"<em>Quantum Information and Computation 14(7/8):608-624, 2014</em>"},"238":{ref_id:238,authors:"Jon R. Grice and David A. Meyer",title:"A quantum algorithm for Viterbi decoding of classical convolutional codes",links:{"arXiv:1405.7479":"http://arxiv.org/abs/1405.7479"},extra:""},"239":{ref_id:239,authors:"Alexander Barg and Shiyu Zhou",title:"A quantum decoding algorithm of the simplex code",links:{"author's homepage":"http://www.ece.umd.edu/~abarg/reprints/rm1dq.pdf"},extra:"<em>Proceedings of the 36th Annual Allerton Conference, 1998</em>"},"240":{ref_id:240,authors:"Guoming Wang",title:"Span-program-based quantum algorithm for tree detection",links:{"arXiv:1309.7713":"http://arxiv.org/abs/1309.7713"},extra:""},"241":{ref_id:241,authors:"François Le Gall, Harumichi Nishimura, and Seiichiro Tani",title:"Quantum algorithm for finding constant-sized sub-hypergraphsover 3-uniform hypergraphs",links:{"arXiv:1310.4127":"http://arxiv.org/abs/1310.4127"},extra:"In <em>Proceedings of COCOON, 2014. pg. 429-440</em>"},"242":{ref_id:242,authors:"Edward Farhi, Jeffrey Goldstone, and Sam Gutmann",title:"A quantum approximate optimization algorithm",links:{"arXiv:1411.4028":"http://arxiv.org/abs/1411.4028"},extra:""},"243":{ref_id:243,authors:"Edward Farhi, Jeffrey Goldstone, and Sam Gutmann",title:"A quantum approximate optimization algorithm applied to abounded occurrence constraint problem",links:{"arXiv:1412.6062":"http://arxiv.org/abs/1412.6062"},extra:""},"244":{ref_id:244,authors:"Dominic W. Berry, Andrew M. Childs, Richard Cleve, Robin Kothari, and Rolando D. Somma",title:"Simulating Hamiltonian dynamics with a truncated Taylor series",links:{"arXiv:1412.4687":"http://arxiv.org/abs/1412.4687"},extra:""},"245":{ref_id:245,authors:"Dominic W. Berry, Andrew M. Childs, and Robin Kothari",title:"Hamiltonian simulation with nearly optimal dependence on all parameters",links:{"arXiv:1501.01715":"http://arxiv.org/abs/1501.01715"},extra:""},"246":{ref_id:246,authors:"Scott Aaronson",title:"Read the fine print",links:{fulltext:"http://www.scottaaronson.com/papers/qml.pdf"},extra:"<em>Nature Physics</em> 11:291-293, 2015."},"247":{ref_id:247,authors:"Alexander Elgart and George A. Hagedorn",title:"A note on the switching adiabatic theorem",links:{"arXiv:1204.2318":"http://arxiv.org/abs/1204.2318"},extra:"<em>Journal of Mathematical Physics</em> 53(10):102202, 2012."},"248":{ref_id:248,authors:"Daniel J. Bernstein, Johannes Buchmann, and Erik Dahmen,",title:"<i>Eds.</i>",links:{Springer:"http://www.springer.com/mathematics/numbers/book/978-3-540-88701-0"},extra:"Post-Quantum Cryptography"},"249":{ref_id:249,authors:"B. D. Clader, B. C. Jacobs, and C. R. Sprouse",title:"Preconditioned quantum linear system algorithm",links:{"arXiv:1301.2340":"http://arxiv.org/abs/1301.2340"},extra:"<em>Phys. Rev. Lett.</em> 110:250504, 2013."},"250":{ref_id:250,authors:"S. Lloyd, M. Mohseni, and P. Rebentrost",title:"Quantum principal component analysis",links:{"arXiv:1307.0401":"http://arxiv.org/abs/1307.0401"},extra:"<em>Nature Physics.</em> 10(9):631, 2014."},"251":{ref_id:251,authors:"Patrick Rebentrost, Masoud Mohseni, and Seth Lloyd",title:"Quantum support vector machine for big data classification",links:{"arXiv:1307.0471":"http://arxiv.org/abs/1307.0471"},extra:"<em>Phys. Rev. Lett.</em> 113, 130503, 2014."},"252":{ref_id:252,authors:"J. M. Pollard",title:"Theorems on factorization and primality testing",links:{},extra:"<em>Proceedings of the Cambridge Philosophical Society.</em> 76:521-228, 1974."},"253":{ref_id:253,authors:"L. Babai, R. Beals, and A. Seress",title:"Polynomial-time theory of matrix groups",links:{},extra:"In <em>Proceedings of STOC 2009</em>, pg. 55-64."},"254":{ref_id:254,authors:"Neil J. Ross and Peter Selinger",title:"Optimal ancilla-free Clifford+T approximations of z-rotations",links:{"arXiv:1403.2975":"http://arxiv.org/abs/1403.2975"},extra:""},"255":{ref_id:255,authors:"L. A. B. Kowada, C. Lavor, R. Portugal, and C. M. H. de Figueiredo",title:"A new quantum algorithm for solving the minimum searching problem",links:{},extra:"<em>International Journal of Quantum Information, Vol. 6, No. 3, pg. 427-436</em>, 2008."},"256":{ref_id:256,authors:"Sean Hallgren and Aram Harrow",title:"Superpolynomial speedups based on almost any quantum circuit",links:{"arXiv:0805.0007":"http://arxiv.org/abs/0805.0007"},extra:"<em>Proceedings of ICALP 2008</em>, pg. 782-795."},"257":{ref_id:257,authors:"Fernando G.S.L. Brandao and Michal Horodecki",title:"Exponential quantum speed-ups are generic",links:{"arXiv:1010.3654":"http://arxiv.org/abs/1010.3654"},extra:"<em>Quantum Information and Computation</em>, Vol. 13, Pg. 0901, 2013"},"258":{ref_id:258,authors:"Scott Aaronson and Andris Ambainis",title:"Forrelation: A problem that optimally separates quantum from classical computing.",links:{"arXiv:1411.5729":"http://arxiv.org/abs/1411.5729"},extra:""},"259":{ref_id:259,authors:"Z. Gedik",title:"Computational speedup with a single qutrit",links:{"arXiv:1403.5861":"http://arxiv.org/abs/1403.5861"},extra:""},"260":{ref_id:260,authors:"Boaz Barak, Ankur Moitra, Ryan O'Donnell, Prasad Raghavendra, OdedRegev, David Steurer, Luca Trevisan, Aravindan Vijayaraghavan, DavidWitmer, and John Wright",title:"Beating the random assignment on constraint satisfaction problems of bounded degree",links:{"arXiv:1505.03424":"http://arxiv.org/abs/1505.03424"},extra:""},"261":{ref_id:261,authors:"David Cornwell",title:"Amplified Quantum Transforms",links:{"arXiv:1406.0190":"http://arxiv.org/abs/1406.0190"},extra:""},"262":{ref_id:262,authors:"T. Laarhoven, M. Mosca, and J. van de Pol",title:"Solving the shortest vector problem in lattices faster using quantum search",links:{"arXiv:1301.6176":"http://arxiv.org/abs/1301.6176"},extra:"<em>Proceedings of PQCrypto13</em>, pp. 83-101, 2013."},"263":{ref_id:263,authors:"Andrew M. Childs, Robin Kothari, and Rolando D. Somma",title:"Quantum linear systems algorithm with exponentially improveddependence on precision",links:{"arXiv:1511.02306":"http://arxiv.org/abs/1511.02306"},extra:""},"264":{ref_id:264,authors:"Ashley Montanaro",title:"Quantum walk speedup of backtracking algorithms",links:{"arXiv:1509.02374":"http://arxiv.org/abs/1509.02374"},extra:""},"265":{ref_id:265,authors:"Ashley Montanaro",title:"Quantum speedup of Monte Carlo methods",links:{"arXiv:1504.06987":"http://arxiv.org/abs/1504.06987"},extra:""},"266":{ref_id:266,authors:"Andris Ambainis, Aleksandrs Belovs, Oded Regev, and Ronald de Wolf",title:"Efficient quantum algorithms for (gapped) group testing andjunta testing",links:{"arXiv:1507.03126":"http://arxiv.org/abs/1507.03126"},extra:""},"267":{ref_id:267,authors:"A. Atici and R. A. Servedio",title:"Quantum algorithms for learning and testing juntas",links:{"arXiv:0707.3479":"http://arxiv.org/abs/0707.3479"},extra:"<em>Quantum Information Processing</em>, 6(5):323-348, 2007."},"268":{ref_id:268,authors:"Aleksandrs Belovs",title:"Quantum algorithms for learning symmetric juntas via theadversary bound",links:{"arXiv:1311.6777":"http://arxiv.org/abs/1311.6777"},extra:"<em>Computational Complexity</em>, 24(2):255-293, 2015. (Also appears in proceedings of CCC'14)."},"269":{ref_id:269,authors:"Stacey Jeffery and Shelby Kimmel",title:"NAND-trees, average choice complexity, and effective resistance",links:{"arXiv:1511.02235":"http://arxiv.org/abs/1511.02235"},extra:""},"270":{ref_id:270,authors:"Scott Aaronson, Shalev Ben-David, and Robin Kothari",title:"Separations in query complexity using cheat sheets",links:{"arXiv:1511.01937":"http://arxiv.org/abs/1511.01937"},extra:""},"271":{ref_id:271,authors:"Frédéric Grosshans, Thomas Lawson, FrançoisMorain, and Benjamin Smith",title:"Factoring safe semiprimes with a single quantum query",links:{"arXiv:1511.04385":"http://arxiv.org/abs/1511.04385"},extra:""},"272":{ref_id:272,authors:"Agnis Āriņš",title:"Span-program-based quantum algorithms for graph bipartiteness and connectivity",links:{"arXiv:1510.07825":"http://arxiv.org/abs/1510.07825"},extra:""},"273":{ref_id:273,authors:"Juan Bermejo-Vega and Kevin C. Zatloukal",title:"Abelian hypergroups and quantum computation",links:{"arXiv:1509.05806":"http://arxiv.org/abs/1509.05806"},extra:""},"274":{ref_id:274,authors:"Andrew Childs and Jeffrey Goldstone",title:"Spatial search by quantum walk",links:{"arXiv:quant-ph/0306054":"http://arxiv.org/abs/quant-ph/0306054"},extra:"<em>Physical Review A</em>, 70:022314, 2004."},"275":{ref_id:275,authors:"Shantanav Chakraborty, Leonardo Novo, Andris Ambainis, and Yasser Omar",title:"Spatial search by quantum walk is optimal for almost all graphs",links:{"arXiv:1508.01327":"http://arxiv.org/abs/1508.01327"},extra:""},"276":{ref_id:276,authors:"François Le Gall",title:"Improved quantum algorithm for triangle finding viacombinatorial arguments",links:{"arXiv:1407.0085":"http://arxiv.org/abs/1407.0085"},extra:"In <em>Proceedings of the 55th IEEE Annual Symposium on Foundations of Computer Science (FOCS)</em>, pg. 216-225, 2014."},"277":{ref_id:277,authors:"Ashley Montanaro",title:"The quantum complexity of approximating the frequency moments",links:{"arXiv:1505.00113":"http://arxiv.org/abs/1505.00113"},extra:""},"278":{ref_id:278,authors:"Rolando D. Somma",title:"Quantum simulations of one dimensional quantum systems",links:{"arXiv:1503.06319":"http://arxiv.org/abs/1503.06319"},extra:""},"279":{ref_id:279,authors:"Bill Fefferman and Cedric Yen-Yu Lin",title:"A complete characterization of unitary quantum space",links:{"arXiv:1604.01384":"http://arxiv.org/abs/1604.01384"},extra:""},"280":{ref_id:280,authors:"Tsuyoshi Ito and Stacey Jeffery",title:"Approximate span programs",links:{"arXiv:1507.00432":"http://arxiv.org/abs/1507.00432"},extra:""},"281":{ref_id:281,authors:"Arnau Riera, Christian Gogolin, and Jens Eisert",title:"Thermalization in nature and on a quantum computer",links:{"arXiv:1102.2389":"http://arxiv.org/abs/1102.2389"},extra:"<em>Physical Review Letters</em>, 108:080402 (2012)"},"282":{ref_id:282,authors:"Michael J. Kastoryano and Fernando G. S. L. Brandao",title:"Quantum Gibbs Samplers: the commuting case",links:{"arXiv:1409.3435":"http://arxiv.org/abs/1409.3435"},extra:"<em>Communications in Mathematical Physics</em>, 344(3):915-957 (2016)"},"283":{ref_id:283,authors:"Andrew M. Childs, David Jao, and Vladimir Soukharev",title:"Constructing elliptic curve isogenies in quantum subexponential time",links:{"arXiv:1012.4019":"http://arxiv.org/abs/1012.4019"},extra:"<em>Journal of Mathematical Cryptology</em>, 8(1):1-29 (2014)"},"284":{ref_id:284,authors:"Markus Grassl, Brandon Langenberg, Martin Roetteler, and Rainer Steinwandt",title:"Applying Grover's algorithm to AES: quantum resource estimates",links:{"arXiv:1512.04965":"http://arxiv.org/abs/1512.04965"},extra:""},"285":{ref_id:285,authors:"M. Ami, O. Di Matteo, V. Gheorghiu, M. Mosca, A. Parent, and J. Schanck",title:"Estimating the cost of generic quantum pre-image attacks onSHA-2 and SHA-3",links:{"arXiv:1603.09383":"http://arxiv.org/abs/1603.09383"},extra:""},"286":{ref_id:286,authors:"Marc Kaplan, Gaetan Leurent, Anthony Leverrier, and Maria Naya-Plasencia",title:"Quantum differential and linear cryptanalysis",links:{"arXiv:1510.05836":"http://arxiv.org/abs/1510.05836"},extra:""},"287":{ref_id:287,authors:"Scott Fluhrer",title:"Quantum Cryptanalysis of NTRU",links:{"Cryptology ePrint Archive: Report 2015/676":"https://eprint.iacr.org/2015/676"},extra:""},"288":{ref_id:288,authors:"Marc Kaplan",title:"Quantum attacks against iterated block ciphers",links:{"arXiv:1410.1434":"http://arxiv.org/abs/1410.1434"},extra:""},"289":{ref_id:289,authors:"H. Kuwakado and M. Morii",title:"Quantum distinguisher between the 3-round Feistel cipher and the random permutation",links:{},extra:"In <em>Proceedings of IEEE International Symposium on Information Theory (ISIT)</em>, pg. 2682-2685, 2010."},"290":{ref_id:290,authors:"H. Kuwakado and M. Morii",title:"Security on the quantum-type Even-Mansour cipher",links:{},extra:"In <em>Proceedings of International Symposium on Information Theory and its Applications (ISITA)</em>, pg. 312-316, 2012."},"291":{ref_id:291,authors:"Martin Roetteler and Rainer Steinwandt",title:"A note on quantum related-key attacks",links:{"arXiv:1306.2301":"http://arxiv.org/abs/1306.2301"},extra:""},"292":{ref_id:292,authors:"Thomas Santoli and Christian Schaffner",title:"Using Simon's algorithm to attack symmetric-key cryptographic primitives",links:{"arXiv:1603.07856":"http://arxiv.org/abs/1603.07856"},extra:""},"293":{ref_id:293,authors:"Rolando D. Somma",title:"A Trotter-Suzuki approximation for Lie groups with applications to Hamiltonian simulation",links:{"arXiv:1512.03416":"http://arxiv.org/abs/1512.03416"},extra:""},"294":{ref_id:294,authors:"Guang Hao Low and Isaac Chuang",title:"Optimal Hamiltonian simulation by quantum signal processing",links:{"arXiv:1606.02685":"http://arxiv.org/abs/1606.02685"},extra:""},"295":{ref_id:295,authors:"Dominic W. Berry and Leonardo Novo",title:"Corrected quantum walk for optimal Hamiltonian simulation",links:{"arXiv:1606.03443":"http://arxiv.org/abs/1606.03443"},extra:""},"296":{ref_id:296,authors:"Ashley Montanaro and Sam Pallister",title:"Quantum algorithms and the finite element method",links:{"arXiv:1512.05903":"http://arxiv.org/abs/1512.05903"},extra:""},"297":{ref_id:297,authors:"Lin-Chun Wan, Chao-Hua Yu, Shi-Jie Pan, Fei Gao, and Qiao-Yan Wen",title:"Quantum algorithm for the Toeplitz systems",links:{"arXiv:1608.02184":"http://arxiv.org/abs/1608.02184"},extra:""},"298":{ref_id:298,authors:"Salvatore Mandra, Gian Giacomo Guerreschi, and Alan Aspuru-Guzik",title:"Faster than classical quantum algorithm for dense formulas of exact satisfiability and occupation problems",links:{"arXiv:1512.00859":"http://arxiv.org/abs/1512.00859"},extra:""},"299":{ref_id:299,authors:"J. Adcock, E. Allen, M. Day, S. Frick, J. Hinchliff, M. Johnson, S. Morley-Short, S. Pallister, A. Price, and S. Stanisic",title:"Advances in quantum machine learning",links:{"arXiv:1512.02900":"http://arxiv.org/abs/1512.02900"},extra:""},"300":{ref_id:300,authors:"Cedric Yen-Yu Lin and Yechao Zhu",title:"Performance of QAOA on typical instances of constraint satisfaction problems with bounded degree",links:{"arXiv:1601.01744":"http://arxiv.org/abs/1601.01744"},extra:""},"301":{ref_id:301,authors:"Dave Wecker, Matthew B. Hastings, and Matthias Troyer",title:"Training a quantum optimizer",links:{"arXiv:1605.05370":"http://arxiv.org/abs/1605.05370"},extra:""},"302":{ref_id:302,authors:"Edward Farhi and Aram W. Harrow",title:"Quantum supremacy through the quantum approximate optimization algorithm",links:{"arXiv:1602.07674":"http://arxiv.org/abs/1602.07674"},extra:""},"303":{ref_id:303,authors:"Thomas G. Wong",title:"Quantum walk search on Johnson graphs",links:{"arXiv:1601.04212":"http://arxiv.org/abs/1601.04212"},extra:""},"304":{ref_id:304,authors:"Jonatan Janmark, David A. Meyer, and Thomas G. Wong",title:"Global symmetry is unnecessary for fast quantum search",links:{"arXiv:1403.2228":"http://arxiv.org/abs/1403.2228"},extra:"<em>Physical Review Letters</em> 112:210502, 2014."},"305":{ref_id:305,authors:"David A. Meyer and Thomas G. Wong",title:"Connectivity is a poor indicator of fast quantum search",links:{"arXiv:1409.5876":"http://arxiv.org/abs/1409.5876"},extra:"<em>Physical Review Letters</em> 114:110503, 2014."},"306":{ref_id:306,authors:"Thomas G. Wong",title:"Spatial search by continuous-time quantum walk with multiple marked vertices",links:{"arXiv:1501.07071":"http://arxiv.org/abs/1409.5876"},extra:"<em>Quantum Information Processing</em> 15(4):1411-1443, 2016."},"307":{ref_id:307,authors:"Anirban Naryan Chowdhury and Rolando D. Somma",title:"Quantum algorithms for Gibbs sampling and hitting-time estimation",links:{"arXiv:1603.02940":"http://arxiv.org/abs/1603.02940"},extra:""},"308":{ref_id:308,authors:"Edward Farhi, Shelby Kimmel, and Kristan Temme",title:"A quantum version of Schoning's algorithm applied to quantum 2-SAT",links:{"arXiv:1603.06985":"http://arxiv.org/abs/1603.06985"},extra:""},"309":{ref_id:309,authors:"Iordanis Kerenidis and Anupam Prakash",title:"Quantum recommendation systems",links:{"arXiv:1603.08675":"http://arxiv.org/abs/1603.08675"},extra:"<em>Innovations in Theoretical Computer Science (ITCS 2017)</em>, LIPIcs, vol. <a target='_blank' href=\"http://drops.dagstuhl.de/opus/portals/lipics/index.php?semnr=16054\">67</a>, pg. <a target='_blank' href=\"http://drops.dagstuhl.de/opus/volltexte/2017/8154/pdf/LIPIcs-ITCS-2017-49.pdf\">1868-8969</a>."},"310":{ref_id:310,authors:"Markus Reiher, Nathan Wiebe, Krysta M. Svore, Dave Wecker, and Matthias Troyer",title:"Elucidating reaction mechanisms on quantum computers",links:{"arXiv:1605.03590":"http://arxiv.org/abs/1605.03590"},extra:""},"311":{ref_id:311,authors:"Aram W. Harrow and Ashley Montanaro",title:"Sequential measurements, disturbance, and property testing",links:{"arXiv:1607.03236":"http://arxiv.org/abs/1607.03236"},extra:""},"312":{ref_id:312,authors:"Martin Roetteler",title:"Quantum algorithms for abelian difference sets and applications to dihedral hidden subgroups",links:{"arXiv:1608.02005":"http://arxiv.org/abs/1608.02005"},extra:""},"313":{ref_id:313,authors:"Fernando G.S.L. Brandao and Krysta Svore",title:"Quantum speed-ups for semidefinite programming",links:{"arXiv:1609.05537":"http://arxiv.org/abs/1609.05537"},extra:""},"314":{ref_id:314,authors:"Z-C Yang, A. Rahmani, A. Shabani, H. Neven, and C. Chamon",title:"Optimizing variational quantum algorithms using Pontryagins's minimum principle",links:{"arXiv:1607.06473":"http://arxiv.org/abs/1607.06473"},extra:""},"315":{ref_id:315,authors:"Gilles Brassard, Peter Høyer, and Alain Tapp",title:"Quantum cryptanalysis of hash and claw-free functions",links:{},extra:"In <em>Proceedings of the 3rd Latin American symposium on Theoretical Informatics (LATIN'98)</em>, pg. 163-169, 1998."},"316":{ref_id:316,authors:"Daniel J. Bernstein",title:"Cost analysis of hash collisions: Will quantum computers make SHARCS obsolete?",links:{here:"https://cr.yp.to/hash/collisioncost-20090517.pdf"},extra:"In <em>Proceedings of the 4th Workshop on Special-purpose Hardware for Attacking Cryptographic Systems (SHARCS'09)</em>, pg. 105-116, 2009."},"317":{ref_id:317,authors:"Chris Cade, Ashley Montanaro, and Aleksandrs Belovs",title:"Time and space efficient quantum algorithms for detecting cycles and testing bipartiteness",links:{"arXiv:1610.00581":"http://arxiv.org/abs/1610.00581"},extra:""},"318":{ref_id:318,authors:"A. Belovs and B. Reichardt",title:"Span programs and quantum algorithms for st-connectivity and claw detection",links:{"arXiv:1203.2603":"http://arxiv.org/abs/1203.2603"},extra:"In <em>European Symposium on Algorithms (ESA'12)</em>, pg. 193-204, 2012."},"319":{ref_id:319,authors:"Titouan Carette, Mathieu Laurière, and Frédéric Magniez",title:"Extended learning graphs for triangle finding",links:{"arXiv:1609.07786":"http://arxiv.org/abs/1609.07786"},extra:""},"320":{ref_id:320,authors:"F. Le Gall and N. Shogo",title:"Quantum algorithm for triangle finding in sparse graphs",links:{},extra:"In <em>Proceedings of the 26th International Symposium on Algorithms and Computation (ISAAC'15)</em>, pg. 590-600, 2015."},"321":{ref_id:321,authors:"Or Sattath and Itai Arad",title:"A constructive quantum Lovász local lemma for commuting projectors",links:{"arXiv:1310.7766":"http://arxiv.org/abs/1310.7766"},extra:"<em>Quantum Information and Computation</em>, 15(11/12)987-996pg, 2015."},"322":{ref_id:322,authors:"Martin Schwarz, Toby S. Cubitt, and Frank Verstraete",title:"An information-theoretic proof of the constructive commutative quantum Lovász local lemma",links:{"arXiv:1311.6474":"http://arxiv.org/abs/1311.6474"},extra:""},"323":{ref_id:323,authors:"C. Shoen, E. Solano, F. Verstraete, J. I. Cirac, and M. M. Wolf",title:"Sequential generation of entangled multi-qubit states",links:{"arXiv:quant-ph/0501096":"http://arxiv.org/abs/quant-ph/0501096"},extra:"<em>Physical Review Letters</em>, 95:110503, 2005."},"324":{ref_id:324,authors:"C. Shoen, K. Hammerer, M. M. Wolf, J. I. Cirac, and E. Solano",title:"Sequential generation of matrix-product states in cavity QED",links:{"arXiv:quant-ph/0612101":"http://arxiv.org/abs/quant-ph/0612101"},extra:"<em>Physical Review A</em>, 75:032311, 2007."},"325":{ref_id:325,authors:"Yimin Ge, András Molnár, and J. Ignacio Cirac",title:"Rapid adiabatic preparation of injective PEPS and Gibbs states",links:{"arXiv:1508.00570":"http://arxiv.org/abs/1508.00570"},extra:"<em>Physical Review Letters</em>, 116:080503, 2016."},"326":{ref_id:326,authors:"Martin Schwarz, Kristan Temme, and Frank Verstraete",title:"Preparing projected entangled pair states on a quantum computer",links:{"arXiv:1104.1410":"http://arxiv.org/abs/1104.1410"},extra:"<em>Physical Review Letters</em>, 108:110502, 2012."},"327":{ref_id:327,authors:"Martin Schwarz, Toby S. Cubitt, Kristan Temme, Frank Verstraete, and David Perez-Garcia",title:"Preparing topological PEPS on a quantum computer",links:{"arXiv:1211.4050":"http://arxiv.org/abs/1211.4050"},extra:"<em>Physical Review A</em>, 88:032321, 2013."},"328":{ref_id:328,authors:"M. Schwarz, O. Buerschaper, and J. Eisert",title:"Approximating local observables on projected entangled pair states",links:{"arXiv:1606.06301":"http://arxiv.org/abs/1606.06301"},extra:""},"329":{ref_id:329,authors:"Jean-François Biasse and Fang Song",title:"Efficient quantum algorithms for computing class groups and solving the principal ideal problem in arbitrary degree number fields",links:{},extra:"<em>Proceedings of the 27th Annual ACM-SIAM Symposium on DiscreteAlgorithms (SODA '16)</em>, pg. 893-902, 2016."},"330":{ref_id:330,authors:"Peter Høyer and Mojtaba Komeili",title:"Efficient quantum walk on the grid with multiple marked elements",links:{"arXiv:1612.08958":"https://arxiv.org/abs/1612.08958"},extra:"<em>Proceedings of the 34th Symposium on Theoretical Aspects of Computer Science (STACS 2017)</em>, 42, 2016."},"331":{ref_id:331,authors:"Peter Wittek",title:"Quantum Machine Learning: what quantum computing means to data mining",links:{},extra:"Academic Press, 2014."},"332":{ref_id:332,authors:"Maria Schuld, Ilya Sinayskiy, and Francesco Petruccione",title:"An introduction to quantum machine learning",links:{"arXiv:1409.3097":"https://arxiv.org/abs/1409.3097"},extra:"<em>Contemporary Physics</em>, 56(2):172, 2014."},"333":{ref_id:333,authors:"J. Biamonte, P. Wittek, N. Pancotti, P. Rebentrost, N. Wiebe, and S. Lloyd",title:"Quantum machine learning",links:{"arXiv:1611.09347":"https://arxiv.org/abs/1611.09347"},extra:""},"334":{ref_id:334,authors:"Esma Aïmeur, Gilles Brassard, and Sébastien Gambs",title:"Machine learning in a quantum world",links:{},extra:"In <em>Advances in Artificial Intelligence: 19th Conference of the Canadian Society for Computational Studies of Intelligence</em> pg. 431-442, Springer, 2006."},"335":{ref_id:335,authors:"Vedran Dunjko, Jacob Taylor, and Hans Briegel",title:"Quantum-enhanced machine learning",links:{},extra:"<em>Phys. Rev. Lett</em> 117:130501, 2016."},"336":{ref_id:336,authors:"Nathan Wiebe, Ashish Kapoor, and Krysta Svore",title:"Quantum algorithms for nearest-neighbor methods for supervised and unsupervised learning",links:{"arXiv:1401.2142":"https://arxiv.org/abs/1401.2142"},extra:"<em>Quantum Information and Computation</em> 15(3/4): 0318-0358, 2015."},"337":{ref_id:337,authors:"Seokwon Yoo, Jeongho Bang, Changhyoup Lee, and Junhyoug Lee",title:"A quantum speedup in machine learning: finding a N-bit Boolean function for a classification",links:{"arXiv:1303.6055":"https://arxiv.org/abs/1303.6055"},extra:"<em>New Journal of Physics</em> 6(10):103014, 2014."},"338":{ref_id:338,authors:"Maria Schuld, Ilya Sinayskiy, and Francesco Petruccione",title:"Prediction by linear regression on a quantum computer",links:{"arXiv:1601.07823":"https://arxiv.org/abs/1601.07823"},extra:"<em>Physical Review A</em> 94:022342, 2016."},"339":{ref_id:339,authors:"Zhikuan Zhao, Jack K. Fitzsimons, and Joseph F. Fitzsimons",title:"Quantum assisted Gaussian process regression",links:{"arXiv:1512.03929":"https://arxiv.org/abs/1512.03929"},extra:""},"340":{ref_id:340,authors:"Esma Aïmeur, Gilles Brassard, and Sébastien Gambs",title:"Quantum speed-up for unsupervised learning",links:{},extra:"<em>Machine Learning</em>, 90(2):261-287, 2013."},"341":{ref_id:341,authors:"Nathan Wiebe, Ashish Kapoor, and Krysta Svore",title:"Quantum perceptron models",links:{"arXiv:1602.04799":"https://arxiv.org/abs/1602.04799"},extra:"Advances in Neural Information Processing Systems 29 (NIPS 2016), pg. 3999–4007, 2016."},"342":{ref_id:342,authors:"G. Paparo, V. Dunjko, A. Makmal, M. Martin-Delgado, and H. Briegel",title:"Quantum speedup for active learning agents",links:{"arXiv:1401.4997":"https://arxiv.org/abs/1401.4997"},extra:"<em>Physical Review X</em> 4(3):031002, 2014."},"343":{ref_id:343,authors:"Daoyi Dong, Chunlin Chen, Hanxiong Li, and Tzyh-Jong Tarn",title:"Quantum reinforcement learning",links:{},extra:"<em>IEEE Transactions on Systems, Man, and Cybernetics- Part B (Cybernetics)</em> 38(5):1207, 2008."},"344":{ref_id:344,authors:"Daniel Crawford, Anna Levit, Navid Ghadermarzy, Jaspreet S. Oberoi, and Pooya Ronagh",title:"Reinforcement learning using quantum Boltzmann machines",links:{"arXiv:1612.05695":"https://arxiv.org/abs/1612.05695"},extra:""},"345":{ref_id:345,authors:"Steven H. Adachi and Maxwell P. Henderson",title:"Application of Quantum Annealing to Training of Deep Neural Networks",links:{"arXiv:1510.06356":"https://arxiv.org/abs/1510.06356"},extra:""},"346":{ref_id:346,authors:"M. Benedetti, J. Realpe-Gómez, R. Biswas, and A. Perdomo-Ortiz",title:"Quantum-assisted learning of graphical models with arbitrary pairwise connectivity",links:{"arXiv:1609.02542":"https://arxiv.org/abs/1609.02542"},extra:""},"347":{ref_id:347,authors:"M. H. Amin, E. Andriyash, J. Rolfe, B. Kulchytskyy, and R. Melko",title:"Quantum Boltzmann machine",links:{"arXiv:1601.02036":"https://arxiv.org/abs/1601.02036"},extra:""},"348":{ref_id:348,authors:"Peter Wittek and Christian Gogolin",title:"Quantum enhanced inference in Markov logic networks",links:{"arXiv:1611.08104":"https://arxiv.org/abs/1611.08104"},extra:"<em>Scientific Reports</em> 7:45672, 2017."},"349":{ref_id:349,authors:"N. H. Bshouty and J. C. Jackson",title:"Learning DNF over the uniform distribution using a quantum example oracle",links:{},extra:"<em>SIAM Journal on Computing</em> 28(3):1136-1153, 1999."},"350":{ref_id:350,authors:"Srinivasan Arunachalam and Ronald de Wolf",title:"A survey of quantum learning theory",links:{"arXiv:1701.06806":"https://arxiv.org/abs/1701.06806"},extra:""},"351":{ref_id:351,authors:"Rocco A. Servedio and Steven J. Gortler",title:"Equivalences and separations between quantum and classical learnability",links:{},extra:"<em>SIAM Journal on Computing</em>, 33(5):1067-1092, 2017."},"352":{ref_id:352,authors:"Srinivasan Arunachalam and Ronald de Wolf",title:"Optimal quantum sample complexity of learning algorithms",links:{"arXiv:1607.00932":"https://arxiv.org/abs/1607.00932"},extra:""},"353":{ref_id:353,authors:"Alex Monràs, Gael Sentís, and Peter Wittek",title:"Inductive quantum learning: why you are doing it almost right",links:{"arXiv:1605.07541":"https://arxiv.org/abs/1605.07541"},extra:""},"354":{ref_id:354,authors:"A. Bisio, G. Chiribella, G. M. D'Ariano, S. Facchini, and P. Perinotti",title:"Optimal quantum learning of a unitary transformation",links:{"arXiv:0903.0543":"https://arxiv.org/abs/0903.0543"},extra:"<em>Physical Review A</em> 81:032324, 2010."},"355":{ref_id:355,authors:"M. Sasaki, A. Carlini, and R. Jozsa",title:"Quantum template matching",links:{"arXiv:quant-ph/0102020":"https://arxiv.org/abs/quant-ph/0102020"},extra:"<em>Physical Review A</em> 64:022317, 2001."},"356":{ref_id:356,authors:"Masahide Sasaki and Alberto Carlini",title:"Quantum learning and universal quantum matching machine",links:{"arXiv:quant-ph/0202173":"https://arxiv.org/abs/quant-ph/0202173"},extra:"<em>Physical Review A</em> 66:022303, 2002."},"357":{ref_id:357,authors:"Esma Aïmeur, Gilles Brassard, and Sébastien Gambs",title:"Quantum clustering algorithms",links:{},extra:"In <em>Proceedings of the 24th International Conference on Machine Learning (ICML)</em>, pg. 1-8, 2007."},"358":{ref_id:358,authors:"Iordanis Kerenidis and Anupam Prakash",title:"Quantum gradient descent for linear systems and least squares",links:{"arXiv:1704.04992":"https://arxiv.org/abs/1704.04992"},extra:""},"359":{ref_id:359,authors:"Dan Boneh and Mark Zhandry",title:"Quantum-secure message authentication codes",links:{},extra:"In <em>Proceedings of Eurocrypt</em>, pg. 592-608, 2013."},"360":{ref_id:360,authors:"A. M. Childs, W. van Dam, S-H Hung, and I. E. Shparlinski",title:"Optimal quantum algorithm for polynomial interpolation",links:{"arXiv:1509.09271":"https://arxiv.org/abs/1509.09271"},extra:"In <em>Proceedings of the 43rd International Colloquium on Automata, Languages, and Programming (ICALP)</em>, pg. 16:1-16:13, 2016."},"361":{ref_id:361,authors:"Volker Strassen",title:"Einige Resultate über Berechnungskomplexität",links:{},extra:"In <em>Jahresbericht der Deutschen Mathematiker-Vereinigung</em>, 78(1):1-8, 1976/1977."},"362":{ref_id:362,authors:"Stacey Jeffery",title:"<a target='_blank' href=\"http://uwspace.uwaterloo.ca/handle/10012/8710\">Frameworks for Quantum Algorithms</a>",links:{},extra:""},"363":{ref_id:363,authors:"Seiichiro Tani",title:"An improved claw finding algorithm using quantum walk",links:{"arXiv:0708.2584":"https://arxiv.org/abs/0708.2584"},extra:"In <em>Mathematical Foundations of Computer Science (MFCS)</em>, pg. 536-547, 2007."},"364":{ref_id:364,authors:"K. Iwama and A. Kawachi",title:"A new quantum claw-finding algorithm for three functions",links:{},extra:"<em>New Generation Computing</em>, 21(4):319-327, 2003."},"365":{ref_id:365,authors:"D. J. Bernstein, N. Heninger, P. Lou, and L. Valenta",title:"Post-quantum RSA",links:{"2017/351":"https://eprint.iacr.org/2017/351"},extra:""},"366":{ref_id:366,authors:"Francois Fillion-Gourdeau, Steve MacLean, and Raymond Laflamme",title:"Quantum algorithm for the dsolution of the Dirac equation",links:{"arXiv:1611.05484":"https://arxiv.org/abs/1611.05484"},extra:""},"367":{ref_id:367,authors:"Ali Hamed Moosavian and Stephen Jordan",title:"Faster quantum algorithm to simulate Fermionic quantum field theory",links:{"arXiv:1711.04006":"https://arxiv.org/abs/1711.04006"},extra:""},"368":{ref_id:368,authors:"Pedro C.S. Costa, Stephen Jordan, and Aaron Ostrander",title:"Quantum algorithm for simulating the wave equation",links:{"arXiv:1711.05394":"https://arxiv.org/abs/1711.05394"},extra:""},"369":{ref_id:369,authors:"Jeffrey Yepez",title:"Highly covariant quantum lattice gas model of the Dirac equation",links:{"arXiv:1106.0739":"https://arxiv.org/abs/1711.05394"},extra:""},"370":{ref_id:370,authors:"Jeffrey Yepez",title:"Quantum lattice gas model of Dirac particles in 1+1 dimensions",links:{"arXiv:1307.3595":"https://arxiv.org/abs/1307.3595"},extra:""},"371":{ref_id:371,authors:"Bruce M. Boghosian and Washington Taylor",title:"Simulating quantum mechanics on a quantum computer",links:{"arXiv:quant-ph/9701019":"https://arxiv.org/abs/quant-ph/9701019"},extra:"<em>Physica D</em> 120:30-42, 1998."},"372":{ref_id:372,authors:"Yimin Ge, Jordi Tura, and J. Ignacio Cirac",title:"Faster ground state preparation and high-precision ground energy estimation on a quantum computer",links:{"arXiv:1712.03193":"https://arxiv.org/abs/1712.03193"},extra:""},"373":{ref_id:373,authors:"Renato Portugal",title:"Element distinctness revisited",links:{"arXiv:1711.11336":"https://arxiv.org/abs/1711.11336"},extra:""},"374":{ref_id:374,authors:"Kanav Setia and James D. Whitfield",title:"Bravyi-Kitaev superfast simulation of fermions on a quantum computer",links:{"arXiv:1712.00446":"https://arxiv.org/abs/1712.00446"},extra:""},"375":{ref_id:375,authors:"Richard Cleve and Chunhao Wang",title:"Efficient quantum algorithms for simulating Lindblad evolution",links:{"arXiv:1612.09512":"https://arxiv.org/abs/1612.09512"},extra:""},"376":{ref_id:376,authors:"M. Kliesch, T. Barthel, C. Gogolin, M. Kastoryano, and J. Eisert",title:"Dissipative quantum Church-Turing theorem",links:{"arXiv:1105.3986":"https://arxiv.org/abs/1105.3986"},extra:"<em>Physical Review Letters</em> 107(12):120501, 2011."},"377":{ref_id:377,authors:"A. M. Childs and T. Li",title:"Efficient simulation of sparse Markovian quantum dynamics",links:{"arXiv:1611.05543":"https://arxiv.org/abs/1611.05543"},extra:""},"378":{ref_id:378,authors:"R. Di Candia, J. S. Pedernales, A. del Campo, E. Solano, and J. Casanova",title:"Quantum simulation of dissipative processes without reservoir engineering",links:{},extra:"<em>Scientific Reports</em> 5:9981, 2015."},"379":{ref_id:379,authors:"R. Babbush, D. Berry, M. Kieferová, G. H. Low, Y. Sanders, A. Sherer, and N. Wiebe",title:"Improved techniques for preparing eigenstates of Fermionic Hamiltonians",links:{"arXiv:1711.10460":"https://arxiv.org/abs/1711.10460"},extra:""},"380":{ref_id:380,authors:"D. Poulin, A. Kitaev, D. S. Steiger, M. B. Hasting, and M. Troyer",title:"Fast quantum algorithm for spectral properties",links:{"arXiv:1711.11025":"https://arxiv.org/abs/1711.11025"},extra:""},"381":{ref_id:381,authors:"Guang Hao Low and Isaac Chuang",title:"Hamiltonian simulation bt qubitization",links:{"arXiv:1610.06546":"https://arxiv.org/abs/1610.06546"},extra:""},"382":{ref_id:382,authors:"F.G.S.L. Brandão, A. Kalev, T. Li, C. Y.-Y. Lin, K. M. Svore, and X. Wu",title:"Quantum SDP Solvers: Large Speed-ups, Optimality, and Applications to Quantum Learning",links:{"arXiv:1710.02581":"https://arxiv.org/abs/1710.02581"},extra:"<em>Proceedings of ICALP 2019</em>"},"383":{ref_id:383,authors:"M. Ekerå and J. Håstad",title:"Quantum Algorithms for Computing Short Discrete Logarithms and Factoring RSA Integers",links:{"Proceedings of PQCrypto 2017":"https://link.springer.com/chapter/10.1007/978-3-319-59879-6_20"},extra:""},"384":{ref_id:384,authors:"M. Ekerå",title:"On post-processing in the quantum algorithm for computing short discrete logarithms",links:{"IACR ePrint Archive Report 2017/1122":"https://eprint.iacr.org/2017/1122"},extra:""},"385":{ref_id:385,authors:"D. J. Bernstein, J.-F. Biasse, and M. Mosca",title:"A low-resource quantum factoring algorithm",links:{"Proceedings of PQCrypto 2017":"https://link.springer.com/chapter/10.1007/978-3-319-59879-6_19"},extra:""},"386":{ref_id:386,authors:"Jianxin Chen, Andrew M. Childs, and Shih-Han Hung",title:"Quantum algorithm for multivariate polynomial interpolation",links:{"arXiv:1701.03990":"http://arxiv.org/abs/1701.03990"},extra:"<em>Proceedings of the Royal Society A</em>, 474:20170480, 2017."},"387":{ref_id:387,authors:"Lisa Hales and Sean Hallgren",title:"An improved quantum Fourier transform algorithm and applications.",links:{},extra:"In <i>Proceedings of FOCS 2000</i>, pg. 515-525."},"388":{ref_id:388,authors:"Igor Shparlinski and Arne Winterhof",title:"Quantum period reconstruction of approximate sequences",links:{},extra:"<em>Information Processing Letters</em>, 103:211-215, 2007."},"389":{ref_id:389,authors:"Alexander Russell and Igor E. Shparlinski",title:"Classical and quantum function reconstruction via character evaluation",links:{},extra:"<em>Journal of Complexity</em>, 20:404-422, 2004."},"390":{ref_id:390,authors:"Sean Hallgren, Alexander Russell, and Igor Shparlinski",title:"Quantum noisy rational function reconstruction",links:{},extra:"<em>Proceedings of COCOON 2005</em>, pg. 420-429."},"391":{ref_id:391,authors:"G. Ivanyos, M. Karpinski, M. Santha, N. Saxena, and I. Shparlinski",title:"Polynomial interpolation and identity testing from high powers over finite fields",links:{},extra:"<em>Algorithmica</em>, 80:560-575, 2017."},"392":{ref_id:392,authors:"Qi Cheng",title:"Primality Proving via One Round in ECPP and One Iteration in AKS",links:{},extra:"<em>Journal of Cryptology</em>, Volume 20, Issue 3, pg. 375-387, July 2007."},"393":{ref_id:393,authors:"Daniel J. Bernstein",title:"Proving primality in essentially quartic random time",links:{},extra:"<em>Mathematics of Computation</em>, Vol. 76, pg. 389-403, 2007."},"394":{ref_id:394,authors:"F. Morain",title:"Implementing the asymptotically fast version of the elliptic curve primality proving algorithm",links:{},extra:"<em>Mathematics of Computation</em>, Vol. 76, pg. 493-505, 2007."},"395":{ref_id:395,authors:"Alvaro Donis-Vela and Juan Carlos Garcia-Escartin",title:"A quantum primality test with order finding",links:{"arXiv:1711.02616":"https://arxiv.org/abs/1711.02616"},extra:""},"396":{ref_id:396,authors:"H. F. Chau and H.-K. Lo",title:"Primality test via quantum factorization",links:{"arXiv:quant-ph/9508005":"https://arxiv.org/abs/quant-ph/9508005"},extra:"<em>International Journal of Modern Physics C</em>, Vol. 8, No. 2, pg. 131-138, 1997."},"397":{ref_id:397,authors:"David Harvey and Joris Van Der Hoeven",title:"Integer multiplication in time \\( O(n \\log \\ n) \\)",links:{"hal-02070778":"https://hal.archives-ouvertes.fr/hal-02070778"},extra:""},"398":{ref_id:398,authors:"Charles Greathouse",title:"<em>personal communication</em>",links:{},extra:", 2019."},"399":{ref_id:399,authors:"Ewin Tang",title:"A quantum-inspired classical algorithm for recommendation systems",links:{"arXiv:1807.04271":"https://arxiv.org/abs/1807.04271"},extra:"In <i>Proceedings of STOC 2019</i>, pg. 217-228."},"400":{ref_id:400,authors:"Ewin Tang",title:"Quantum-inspired classical algorithms for principal component analysis and supervised clustering",links:{"arXiv:1811.00414":"https://arxiv.org/abs/1811.00414"},extra:""},"401":{ref_id:401,authors:"L. Wossnig, Z. Zhao, and A. Prakash",title:"A quantum linear system algorithm for dense matrices",links:{"arXiv:1704.06174":"https://arxiv.org/abs/1704.06174"},extra:"<em>Physical Review Letters</em> vol. 120, no. 5, pg. 050502, 2018."},"402":{ref_id:402,authors:"Zhikuan Zhao, Alejandro Pozas-Kerstjens, Patrick Rebentrost, and Peter Wittek",title:"Bayesian Deep Learning on a Quantum Computer",links:{"arXiv:1806.11463":"https://arxiv.org/abs/1806.11463"},extra:"<em>Quantum Machine Intelligence</em> vol. 1, pg. 41-51, 2019."},"403":{ref_id:403,authors:"Anja Becker, Jean-Sebastien Coron, and Antoine Joux",title:"Improved generic algorithms for hard knapsacks",links:{"IACR eprint 2011/474":"http://eprint.iacr.org/2011/474"},extra:"<em>Proceedings of Eurocrypt 2011</em> pg. 364-385"},"404":{ref_id:404,authors:"Kun Zhang and Vladimir E. Korepin",title:"Low depth quantum search algorithm",links:{"arXiv:1908.04171":"https://arxiv.org/abs/1908.04171"},extra:""},"405":{ref_id:405,authors:"Andriyan Bayo Suksmono and Yuichiro Minato",title:"Finding Hadamard matrices by a quantum annealing machine",links:{"arXiv:1902.07890":"https://arxiv.org/abs/1902.07890"},extra:"<em>Scientific Reports</em> 9:14380, 2019."},"406":{ref_id:406,authors:"Gábor Ivanyos, Anupam Prakash, and Miklos Santha",title:"On learning linear functions from subset and its applications in quantum computing",links:{"":"https://drops.dagstuhl.de/opus/portals/lipics/index.php?semnr=16083","arXiv:1806.09660":"https://arxiv.org/abs/1806.09660"},extra:"<a target='_blank' href=\"https://drops.dagstuhl.de/opus/portals/lipics/index.php?semnr=16083\"><em>26th Annual European Symposium on Algorithms (ESA 2018)</em></a>, LIPIcs volume 112, 2018."},"407":{ref_id:407,authors:"Gábor Ivanyos",title:"On solving systems of random linear disequations",links:{"arXiv:0704.2988":"https://arxiv.org/abs/0704.2988"},extra:"<em>Quantum Information and Computation</em>, 8(6):579-594, 2008."},"408":{ref_id:408,authors:"A. Ambainis, K. Balodis, J. Iraids, M. Kokainis, K. Prusis, and J. Vihrovs",title:"Quantum speedups for exponential-time dynamic programming algorithms",links:{"arXiv:1807.05209":"https://arxiv.org/abs/1807.05209"},extra:"<em>Proceedings of the 30th Annual ACM-SIAM Symposium on Discrete Algorithms (SODA 19)</em>, pg. 1783-1793, 2019."},"409":{ref_id:409,authors:"Dominic W. Berry, Andrew M. Childs, Aaron Ostrander, and Guoming Wang",title:"Quantum algorithm for linear differential equations with exponentially improved dependence on precision",links:{"arXiv:1701.03684":"https://arxiv.org/abs/1701.03684"},extra:"<em>Communications in Mathematical Physics</em>, 356(3):1057-1081, 2017."},"410":{ref_id:410,authors:"Sarah K. Leyton and Tobias J. Osborne",title:"Quantum algorithm to solve nonlinear differential equations",links:{"arXiv:0812.4423":"https://arxiv.org/abs/0812.4423"},extra:""},"411":{ref_id:411,authors:"Y. Cao, A. Papageorgiou, I. Petras, J. Traub, and S. Kais",title:"Quantum algorithm and circuit design solving the Poisson equation",links:{"arXiv:1207.2485":"https://arxiv.org/abs/1207.2485"},extra:"<em>New Journal of Physics</em> 15(1):013021, 2013."},"412":{ref_id:412,authors:"S. Wang, Z. Wang, W. Li, L. Fan, Z. Wei, and Y. Gu",title:"Quantum fast Poisson solver: the algorithm and modular circuit design",links:{"arXiv:1910.09756":"https://arxiv.org/abs/1910.09756"},extra:""},"413":{ref_id:413,authors:"A. Scherer, B. Valiron, S.-C. Mau, S. Alexander, E. van den Berg, and T. Chapuran",title:"Concrete resource analysis of the quantum linear system algorithm used to compute the electromagnetic scattering crossection of a 2D target",links:{"arXiv:1505.06552":"https://arxiv.org/abs/1505.06552"},extra:"<em>Quantum Information Processing</em> 16:60, 2017."},"414":{ref_id:414,authors:"Juan Miguel Arrazola, Timjan Kalajdziavski, Christian Weedbrook, and Seth Lloyd",title:"Quantum algorithm for nonhomogeneous linear partial differential equations",links:{"arXiv:1809.02622":"https://arxiv.org/abs/1809.02622"},extra:"<em>Physical Review A</em> 100:032306, 2019."},"415":{ref_id:415,authors:"Andrew Childs and Jin-Peng Liu",title:"Quantum spectral methods for differential equations",links:{"arXiv:1901.00961":"https://arxiv.org/abs/1901.00961"},extra:""},"416":{ref_id:416,authors:"Alexander Engle, Graeme Smith, and Scott E. Parker",title:"A quantum algorithm for the Vlasov equation",links:{"arXiv:1907.09418":"https://arxiv.org/abs/1907.09418"},extra:""},"417":{ref_id:417,authors:"Shouvanik Chakrabarti, Andrew M. Childs, Tongyang Li, and Xiaodi Wu",title:"Quantum algorithms and lower bounds for convex optimization",links:{"arXiv:1809.01731":"https://arxiv.org/abs/1809.01731"},extra:""},"418":{ref_id:418,authors:"S. Chakrabarti, A. M. Childs, S.-H. Hung, T. Li, C. Wang, and X. Wu",title:"Quantum algorithm for estimating volumes of convex bodies",links:{"arXiv:1908.03903":"https://arxiv.org/abs/1908.03903"},extra:""},"419":{ref_id:419,authors:"Joran van Apeldoorn, András Gilyén, Sander Gribling, and Ronald de Wolf",title:"Convex optimization using quantum oracles",links:{"arXiv:1809.00643":"https://arxiv.org/abs/1809.00643"},extra:""},"420":{ref_id:420,authors:"Nai-Hui Chia, Andráas Gilyén, Tongyang Li, Han-Hsuan Lin, Ewin Tang, and Chunhao Wang",title:"Sampling-based sublinear low-rank matrix arithmetic framework for dequantizing quantum machine learning",links:{"arXiv:1910.06151":"https://arxiv.org/abs/1910.06151"},extra:"<em>Proceedings of STOC 2020</em>, pg. 387-400"},"421":{ref_id:421,authors:"Andris Ambainis and Martins Kokainis",title:"Quantum algorithm for tree size estimation, with applications to backtracking and 2-player games",links:{"arXiv:1704.06774":"https://arxiv.org/abs/1704.06774"},extra:"<em>Proceedings of STOC 2017</em>, pg. 989-1002"},"422":{ref_id:422,authors:"Fernando G.S L. Brandão, Richard Kueng, Daniel Stilck França",title:"Faster quantum and classical SDP approximations for quadratic binary optimization",links:{"arXiv:1909.04613":"https://arxiv.org/abs/1909.04613"},extra:""},"423":{ref_id:423,authors:"Matthew B. Hastings",title:"Classical and Quantum Algorithms for Tensor Principal Component Analysis",links:{"arXiv:1907.12724":"https://arxiv.org/abs/1907.12724"},extra:"<em>Quantum</em> 4:237, 2020."},"424":{ref_id:424,authors:"Joran van Apeldoorn, András Gilyén, Sander Gribling, and Ronald de Wolf",title:"Quantum SDP-Solvers: Better upper and lower bounds",links:{"arXiv:1705.01843":"https://arxiv.org/abs/1705.01843"},extra:"<em>Quantum</em> 4:230, 2020."},"425":{ref_id:425,authors:"J-P Liu, H. Kolden, H. Krovi, N. Loureiro, K. Trivisa, and A. M. Childs",title:"Efficient quantum algorithm for dissipative nonlinear differential equations",links:{"arXiv:2011.03185":"https://arxiv.org/abs/2011.03185"},extra:""},"426":{ref_id:426,authors:"S. Lloyd, G. De Palma, C. Gokler, B. Kiani, Z-W Liu, M. Marvian, F. Tennie, and T. Palmer",title:"Quantum algorithm for nonlinear differential equations",links:{"arXiv:2011.06571":"https://arxiv.org/abs/2011.06571"},extra:""},"427":{ref_id:427,authors:"Yunchao Liu, Srinivasan Arunachalam, and Kristan Temme",title:"A rigorous and robust quantum speed-up in supervised machine learning",links:{"arXiv:2010.02174":"https://arxiv.org/abs/2010.02174"},extra:""},"428":{ref_id:428,authors:"Matthew B. Hastings",title:"The power of adiabatic quantum computation with no sign problem",links:{"arXiv:2005.03791":"https://arxiv.org/abs/2005.03791"},extra:""},"429":{ref_id:429,authors:"Nathan Ramusat and Vincenzo Savona",title:"A quantum algorithm for the direct estimation of the steady state of open quantum systems",links:{"arXiv:2008.07133":"https://arxiv.org/abs/2008.07133"},extra:""}};

    var references_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': references$1
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // Algorithms
    const algorithms = algorithms_;

    // References
    const references = references_;


    // Control display_info
    let to_display = writable("all_algs");
    let algs_of_cat_menu = writable(Object.keys(algorithms.default)[0]); // Just to have something
    let display_menu = writable(false);
    let display_categories = writable(false);
    let display_algorithms = writable(false);

    // Algorithm to display
    let alg_to_display = writable({});

    // Search results
    let show_search_results = writable(false);

    // Screen width, placed here for global access
    let screen_width = writable(0);
    const screen_width_breakpoint = 768;

    /* src\components\search\Search_result.svelte generated by Svelte v3.41.0 */

    const file$k = "src\\components\\search\\Search_result.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let p;
    	let raw_value = boldQuery(/*result_data*/ ctx[0].name, /*matching_text*/ ctx[1]) + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			add_location(p, file$k, 32, 4, 957);
    			attr_dev(div, "class", "svelte-1sneyte");
    			toggle_class(div, "hovered", /*hovered*/ ctx[2]);
    			add_location(div, file$k, 31, 0, 761);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			p.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseenter", /*mouseEnter*/ ctx[6], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseLeave*/ ctx[7], false, false, false),
    					listen_dev(div, "click", /*click_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*result_data, matching_text*/ 3 && raw_value !== (raw_value = boldQuery(/*result_data*/ ctx[0].name, /*matching_text*/ ctx[1]) + "")) p.innerHTML = raw_value;
    			if (dirty & /*hovered*/ 4) {
    				toggle_class(div, "hovered", /*hovered*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function boldQuery(str, query) {
    	const n = str.toUpperCase();
    	const q = query.toUpperCase();
    	const x = n.indexOf(q);

    	if (!q || x === -1) {
    		return str; // bail early
    	}

    	const l = q.length;
    	return str.substr(0, x) + '<b>' + str.substr(x, l) + '</b>' + str.substr(x + l);
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $to_display;
    	let $alg_to_display;
    	let $show_search_results;
    	validate_store(to_display, 'to_display');
    	component_subscribe($$self, to_display, $$value => $$invalidate(3, $to_display = $$value));
    	validate_store(alg_to_display, 'alg_to_display');
    	component_subscribe($$self, alg_to_display, $$value => $$invalidate(4, $alg_to_display = $$value));
    	validate_store(show_search_results, 'show_search_results');
    	component_subscribe($$self, show_search_results, $$value => $$invalidate(5, $show_search_results = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search_result', slots, []);
    	let { result_data } = $$props;
    	let { matching_text } = $$props;
    	let hovered = false;

    	function mouseEnter() {
    		$$invalidate(2, hovered = true);
    	}

    	function mouseLeave() {
    		$$invalidate(2, hovered = false);
    	}

    	const writable_props = ['result_data', 'matching_text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Search_result> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(to_display, $to_display = "algorithm", $to_display);
    		set_store_value(alg_to_display, $alg_to_display = result_data, $alg_to_display);
    		set_store_value(show_search_results, $show_search_results = false, $show_search_results);
    	};

    	$$self.$$set = $$props => {
    		if ('result_data' in $$props) $$invalidate(0, result_data = $$props.result_data);
    		if ('matching_text' in $$props) $$invalidate(1, matching_text = $$props.matching_text);
    	};

    	$$self.$capture_state = () => ({
    		to_display,
    		alg_to_display,
    		show_search_results,
    		result_data,
    		matching_text,
    		hovered,
    		mouseEnter,
    		mouseLeave,
    		boldQuery,
    		$to_display,
    		$alg_to_display,
    		$show_search_results
    	});

    	$$self.$inject_state = $$props => {
    		if ('result_data' in $$props) $$invalidate(0, result_data = $$props.result_data);
    		if ('matching_text' in $$props) $$invalidate(1, matching_text = $$props.matching_text);
    		if ('hovered' in $$props) $$invalidate(2, hovered = $$props.hovered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		result_data,
    		matching_text,
    		hovered,
    		$to_display,
    		$alg_to_display,
    		$show_search_results,
    		mouseEnter,
    		mouseLeave,
    		click_handler
    	];
    }

    class Search_result extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { result_data: 0, matching_text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search_result",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*result_data*/ ctx[0] === undefined && !('result_data' in props)) {
    			console.warn("<Search_result> was created without expected prop 'result_data'");
    		}

    		if (/*matching_text*/ ctx[1] === undefined && !('matching_text' in props)) {
    			console.warn("<Search_result> was created without expected prop 'matching_text'");
    		}
    	}

    	get result_data() {
    		throw new Error("<Search_result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set result_data(value) {
    		throw new Error("<Search_result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get matching_text() {
    		throw new Error("<Search_result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matching_text(value) {
    		throw new Error("<Search_result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\search\Search_bar.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1$6 } = globals;
    const file$j = "src\\components\\search\\Search_bar.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (28:8) {#if $show_search_results}
    function create_if_block$4(ctx) {
    	let div;
    	let current;
    	let each_value = /*getResults*/ ctx[2](/*text_search*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "dropdown-content svelte-1jblrb6");
    			add_location(div, file$j, 28, 12, 1048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getResults, text_search*/ 5) {
    				each_value = /*getResults*/ ctx[2](/*text_search*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(28:8) {#if $show_search_results}",
    		ctx
    	});

    	return block;
    }

    // (30:16) {#each getResults(text_search) as res}
    function create_each_block$6(ctx) {
    	let search_result;
    	let current;

    	search_result = new Search_result({
    			props: {
    				result_data: /*res*/ ctx[5],
    				matching_text: /*text_search*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(search_result.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(search_result, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const search_result_changes = {};
    			if (dirty & /*text_search*/ 1) search_result_changes.result_data = /*res*/ ctx[5];
    			if (dirty & /*text_search*/ 1) search_result_changes.matching_text = /*text_search*/ ctx[0];
    			search_result.$set(search_result_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_result.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_result.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(search_result, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(30:16) {#each getResults(text_search) as res}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$show_search_results*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "id", "search-input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search algorithms...");
    			attr_dev(input, "class", "svelte-1jblrb6");
    			add_location(input, file$j, 26, 8, 835);
    			attr_dev(div0, "class", "dropdown svelte-1jblrb6");
    			add_location(div0, file$j, 25, 4, 803);
    			attr_dev(div1, "id", "search-bar");
    			attr_dev(div1, "class", "svelte-1jblrb6");
    			add_location(div1, file$j, 24, 0, 776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*text_search*/ ctx[0]);
    			append_dev(div0, t);
    			if (if_block) if_block.m(div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(input, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text_search*/ 1 && input.value !== /*text_search*/ ctx[0]) {
    				set_input_value(input, /*text_search*/ ctx[0]);
    			}

    			if (/*$show_search_results*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$show_search_results*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $show_search_results;
    	validate_store(show_search_results, 'show_search_results');
    	component_subscribe($$self, show_search_results, $$value => $$invalidate(1, $show_search_results = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search_bar', slots, []);
    	let text_search = "";

    	function getResults(text) {
    		if (text === "") {
    			return []; // Return nothing if search input is empty
    		}

    		let to_return = [];
    		let cats = Object.values(algorithms.default);

    		for (let i = 0; i < cats.length; i++) {
    			let cat_algs = Object.values(cats[i]);

    			for (let j = 0; j < cat_algs.length; j++) {
    				if (cat_algs[j]['name'].toLowerCase().indexOf(text) > -1) {
    					to_return.push(cat_algs[j]);
    				}
    			}
    		}

    		return to_return;
    	}

    	const writable_props = [];

    	Object_1$6.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Search_bar> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		text_search = this.value;
    		$$invalidate(0, text_search);
    	}

    	const click_handler = () => {
    		set_store_value(show_search_results, $show_search_results = true, $show_search_results);
    		$$invalidate(0, text_search = "");
    	};

    	$$self.$capture_state = () => ({
    		algorithms,
    		show_search_results,
    		Search_result,
    		text_search,
    		getResults,
    		$show_search_results
    	});

    	$$self.$inject_state = $$props => {
    		if ('text_search' in $$props) $$invalidate(0, text_search = $$props.text_search);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text_search,
    		$show_search_results,
    		getResults,
    		input_input_handler,
    		click_handler
    	];
    }

    class Search_bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search_bar",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\components\display_info\references\Reference.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1$5 } = globals;
    const file$i = "src\\components\\display_info\\references\\Reference.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i][0];
    	child_ctx[2] = list[i][1];
    	return child_ctx;
    }

    // (23:16) {#each Object.entries(data.links) as [link_name, url]}
    function create_each_block$5(ctx) {
    	let p;
    	let a;
    	let t_value = /*link_name*/ ctx[1] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*url*/ ctx[2]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-y6159r");
    			add_location(a, file$i, 23, 23, 464);
    			attr_dev(p, "class", "svelte-y6159r");
    			add_location(p, file$i, 23, 20, 461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*link_name*/ ctx[1] + "")) set_data_dev(t, t_value);

    			if (dirty & /*data*/ 1 && a_href_value !== (a_href_value = /*url*/ ctx[2])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(23:16) {#each Object.entries(data.links) as [link_name, url]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let table;
    	let tr0;
    	let td0;
    	let p0;
    	let t0_value = /*data*/ ctx[0].ref_id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2;
    	let tr1;
    	let td2;
    	let t3;
    	let td3;
    	let p1;
    	let raw0_value = /*data*/ ctx[0].authors + "";
    	let t4;
    	let p2;
    	let raw1_value = /*data*/ ctx[0].title + "";
    	let t5;
    	let t6;
    	let p3;
    	let raw2_value = /*data*/ ctx[0].extra + "";
    	let each_value = Object.entries(/*data*/ ctx[0].links);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			t3 = space();
    			td3 = element("td");
    			p1 = element("p");
    			t4 = space();
    			p2 = element("p");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			p3 = element("p");
    			attr_dev(p0, "class", "svelte-y6159r");
    			add_location(p0, file$i, 9, 16, 115);
    			add_location(td0, file$i, 8, 12, 93);
    			add_location(td1, file$i, 11, 12, 168);
    			add_location(tr0, file$i, 7, 8, 75);
    			add_location(td2, file$i, 16, 12, 236);
    			attr_dev(p1, "class", "svelte-y6159r");
    			add_location(p1, file$i, 20, 16, 297);
    			attr_dev(p2, "class", "svelte-y6159r");
    			add_location(p2, file$i, 21, 16, 342);
    			attr_dev(p3, "class", "svelte-y6159r");
    			add_location(p3, file$i, 25, 16, 556);
    			add_location(td3, file$i, 19, 12, 275);
    			add_location(tr1, file$i, 15, 8, 218);
    			add_location(table, file$i, 6, 4, 58);
    			attr_dev(div, "class", "svelte-y6159r");
    			add_location(div, file$i, 5, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, p0);
    			append_dev(p0, t0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(table, t2);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t3);
    			append_dev(tr1, td3);
    			append_dev(td3, p1);
    			p1.innerHTML = raw0_value;
    			append_dev(td3, t4);
    			append_dev(td3, p2);
    			p2.innerHTML = raw1_value;
    			append_dev(td3, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td3, null);
    			}

    			append_dev(td3, t6);
    			append_dev(td3, p3);
    			p3.innerHTML = raw2_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*data*/ ctx[0].ref_id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && raw0_value !== (raw0_value = /*data*/ ctx[0].authors + "")) p1.innerHTML = raw0_value;			if (dirty & /*data*/ 1 && raw1_value !== (raw1_value = /*data*/ ctx[0].title + "")) p2.innerHTML = raw1_value;
    			if (dirty & /*Object, data*/ 1) {
    				each_value = Object.entries(/*data*/ ctx[0].links);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td3, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*data*/ 1 && raw2_value !== (raw2_value = /*data*/ ctx[0].extra + "")) p3.innerHTML = raw2_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reference', slots, []);
    	let { data } = $$props;
    	const writable_props = ['data'];

    	Object_1$5.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reference> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Reference extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reference",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Reference> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Reference>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Reference>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\display_info\algorithm\Algorithm.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1$4 } = globals;
    const file$h = "src\\components\\display_info\\algorithm\\Algorithm.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (49:4) {#if !alone}
    function create_if_block_1$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Show references";
    			add_location(button, file$h, 49, 8, 1534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleShowReferences*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(49:4) {#if !alone}",
    		ctx
    	});

    	return block;
    }

    // (52:4) {#if alone || show_references}
    function create_if_block$3(ctx) {
    	let div1;
    	let p;
    	let b;
    	let t1;
    	let t2;
    	let div0;
    	let div1_transition;
    	let current;
    	let each_value = /*getRelevantReferences*/ ctx[3](Object.values(/*alg_data*/ ctx[0].references));
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			b = element("b");
    			b.textContent = "References";
    			t1 = text(":");
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(b, file$h, 53, 15, 1710);
    			add_location(p, file$h, 53, 12, 1707);
    			attr_dev(div0, "id", "list-references");
    			attr_dev(div0, "class", "svelte-11ddwr5");
    			add_location(div0, file$h, 54, 12, 1746);
    			attr_dev(div1, "id", "references");
    			add_location(div1, file$h, 52, 8, 1655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, b);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getRelevantReferences, Object, alg_data*/ 9) {
    				each_value = /*getRelevantReferences*/ ctx[3](Object.values(/*alg_data*/ ctx[0].references));
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(52:4) {#if alone || show_references}",
    		ctx
    	});

    	return block;
    }

    // (56:16) {#each getRelevantReferences(Object.values(alg_data.references)) as reference}
    function create_each_block$4(ctx) {
    	let reference;
    	let current;

    	reference = new Reference({
    			props: { data: /*reference*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(reference.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(reference, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const reference_changes = {};
    			if (dirty & /*alg_data*/ 1) reference_changes.data = /*reference*/ ctx[5];
    			reference.$set(reference_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reference.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reference.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(reference, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(56:16) {#each getRelevantReferences(Object.values(alg_data.references)) as reference}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let p0;
    	let b0;
    	let t1;
    	let html_tag;
    	let raw0_value = /*alg_data*/ ctx[0].alg_id + "";
    	let t2;
    	let p1;
    	let b1;
    	let t4;
    	let html_tag_1;
    	let raw1_value = /*alg_data*/ ctx[0].name + "";
    	let t5;
    	let p2;
    	let b2;
    	let t7;
    	let html_tag_2;
    	let raw2_value = /*alg_data*/ ctx[0].category + "";
    	let t8;
    	let p3;
    	let b3;
    	let t10;
    	let html_tag_3;
    	let raw3_value = /*alg_data*/ ctx[0].speedup + "";
    	let t11;
    	let p4;
    	let b4;
    	let t13;
    	let html_tag_4;
    	let raw4_value = /*alg_data*/ ctx[0].description + "";
    	let t14;
    	let t15;
    	let div_transition;
    	let current;
    	let if_block0 = !/*alone*/ ctx[1] && create_if_block_1$2(ctx);
    	let if_block1 = (/*alone*/ ctx[1] || /*show_references*/ ctx[2]) && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "Algorithm id";
    			t1 = text(": ");
    			html_tag = new HtmlTag();
    			t2 = space();
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "Name";
    			t4 = text(": ");
    			html_tag_1 = new HtmlTag();
    			t5 = space();
    			p2 = element("p");
    			b2 = element("b");
    			b2.textContent = "Category";
    			t7 = text(": ");
    			html_tag_2 = new HtmlTag();
    			t8 = space();
    			p3 = element("p");
    			b3 = element("b");
    			b3.textContent = "Speedup";
    			t10 = text(": ");
    			html_tag_3 = new HtmlTag();
    			t11 = space();
    			p4 = element("p");
    			b4 = element("b");
    			b4.textContent = "Description";
    			t13 = text(": ");
    			html_tag_4 = new HtmlTag();
    			t14 = space();
    			if (if_block0) if_block0.c();
    			t15 = space();
    			if (if_block1) if_block1.c();
    			add_location(b0, file$h, 43, 7, 1242);
    			html_tag.a = null;
    			add_location(p0, file$h, 43, 4, 1239);
    			add_location(b1, file$h, 44, 7, 1299);
    			html_tag_1.a = null;
    			add_location(p1, file$h, 44, 4, 1296);
    			add_location(b2, file$h, 45, 7, 1346);
    			html_tag_2.a = null;
    			add_location(p2, file$h, 45, 4, 1343);
    			add_location(b3, file$h, 46, 7, 1401);
    			html_tag_3.a = null;
    			add_location(p3, file$h, 46, 4, 1398);
    			add_location(b4, file$h, 47, 7, 1454);
    			html_tag_4.a = null;
    			add_location(p4, file$h, 47, 4, 1451);
    			attr_dev(div, "id", "algorithm-wrapper");
    			attr_dev(div, "class", "svelte-11ddwr5");
    			add_location(div, file$h, 42, 0, 1188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			html_tag.m(raw0_value, p0);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, b1);
    			append_dev(p1, t4);
    			html_tag_1.m(raw1_value, p1);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, b2);
    			append_dev(p2, t7);
    			html_tag_2.m(raw2_value, p2);
    			append_dev(div, t8);
    			append_dev(div, p3);
    			append_dev(p3, b3);
    			append_dev(p3, t10);
    			html_tag_3.m(raw3_value, p3);
    			append_dev(div, t11);
    			append_dev(div, p4);
    			append_dev(p4, b4);
    			append_dev(p4, t13);
    			html_tag_4.m(raw4_value, p4);
    			append_dev(div, t14);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t15);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*alg_data*/ 1) && raw0_value !== (raw0_value = /*alg_data*/ ctx[0].alg_id + "")) html_tag.p(raw0_value);
    			if ((!current || dirty & /*alg_data*/ 1) && raw1_value !== (raw1_value = /*alg_data*/ ctx[0].name + "")) html_tag_1.p(raw1_value);
    			if ((!current || dirty & /*alg_data*/ 1) && raw2_value !== (raw2_value = /*alg_data*/ ctx[0].category + "")) html_tag_2.p(raw2_value);
    			if ((!current || dirty & /*alg_data*/ 1) && raw3_value !== (raw3_value = /*alg_data*/ ctx[0].speedup + "")) html_tag_3.p(raw3_value);
    			if ((!current || dirty & /*alg_data*/ 1) && raw4_value !== (raw4_value = /*alg_data*/ ctx[0].description + "")) html_tag_4.p(raw4_value);

    			if (!/*alone*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div, t15);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*alone*/ ctx[1] || /*show_references*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*alone, show_references*/ 6) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Algorithm', slots, []);
    	let { alg_data } = $$props;
    	let { alone } = $$props;

    	afterUpdate(() => {
    		if (alone) {
    			MathJax.typeset();
    		}
    	});

    	function getRelevantReferences(ref_ids) {
    		let added = [];
    		let to_return = [];

    		// Ref_ids start at 1, not 0
    		for (let i = 0; i < ref_ids.length; i++) {
    			if (!added.includes(ref_ids[i])) {
    				// Avoid duplicates
    				added.push(ref_ids[i]);

    				to_return.push(references.default[ref_ids[i]]);
    			}
    		}

    		// Sort the array of references according to ref_id
    		to_return.sort(function (a, b) {
    			return a.ref_id - b.ref_id;
    		});

    		return to_return;
    	}

    	let show_references = false;

    	function toggleShowReferences() {
    		$$invalidate(2, show_references = !show_references);
    	}

    	const writable_props = ['alg_data', 'alone'];

    	Object_1$4.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Algorithm> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('alg_data' in $$props) $$invalidate(0, alg_data = $$props.alg_data);
    		if ('alone' in $$props) $$invalidate(1, alone = $$props.alone);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		slide,
    		references,
    		Reference,
    		alg_data,
    		alone,
    		getRelevantReferences,
    		show_references,
    		toggleShowReferences
    	});

    	$$self.$inject_state = $$props => {
    		if ('alg_data' in $$props) $$invalidate(0, alg_data = $$props.alg_data);
    		if ('alone' in $$props) $$invalidate(1, alone = $$props.alone);
    		if ('show_references' in $$props) $$invalidate(2, show_references = $$props.show_references);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [alg_data, alone, show_references, getRelevantReferences, toggleShowReferences];
    }

    class Algorithm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { alg_data: 0, alone: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Algorithm",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*alg_data*/ ctx[0] === undefined && !('alg_data' in props)) {
    			console.warn("<Algorithm> was created without expected prop 'alg_data'");
    		}

    		if (/*alone*/ ctx[1] === undefined && !('alone' in props)) {
    			console.warn("<Algorithm> was created without expected prop 'alone'");
    		}
    	}

    	get alg_data() {
    		throw new Error("<Algorithm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alg_data(value) {
    		throw new Error("<Algorithm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alone() {
    		throw new Error("<Algorithm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alone(value) {
    		throw new Error("<Algorithm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\display_info\acknowledgments\Acknowledgments.svelte generated by Svelte v3.41.0 */
    const file$g = "src\\components\\display_info\\acknowledgments\\Acknowledgments.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let ul;
    	let li0;
    	let a0;
    	let t5;
    	let li1;
    	let a1;
    	let t7;
    	let li2;
    	let a2;
    	let t9;
    	let li3;
    	let a3;
    	let t11;
    	let li4;
    	let a4;
    	let t13;
    	let li5;
    	let a5;
    	let t15;
    	let li6;
    	let a6;
    	let t17;
    	let li7;
    	let a7;
    	let t19;
    	let li8;
    	let a8;
    	let t21;
    	let li9;
    	let a9;
    	let t23;
    	let li10;
    	let a10;
    	let t25;
    	let li11;
    	let a11;
    	let t27;
    	let li12;
    	let t29;
    	let li13;
    	let t31;
    	let li14;
    	let a12;
    	let t33;
    	let li15;
    	let t35;
    	let li16;
    	let a13;
    	let t37;
    	let li17;
    	let a14;
    	let t39;
    	let li18;
    	let a15;
    	let t41;
    	let li19;
    	let a16;
    	let t43;
    	let li20;
    	let a17;
    	let t45;
    	let li21;
    	let t47;
    	let li22;
    	let a18;
    	let t49;
    	let li23;
    	let a19;
    	let t51;
    	let li24;
    	let a20;
    	let t53;
    	let li25;
    	let t55;
    	let li26;
    	let t57;
    	let li27;
    	let a21;
    	let t59;
    	let li28;
    	let t61;
    	let li29;
    	let a22;
    	let t63;
    	let li30;
    	let a23;
    	let t65;
    	let li31;
    	let a24;
    	let t67;
    	let li32;
    	let a25;
    	let t69;
    	let li33;
    	let a26;
    	let t71;
    	let li34;
    	let a27;
    	let t73;
    	let li35;
    	let a28;
    	let t75;
    	let li36;
    	let a29;
    	let t77;
    	let li37;
    	let a30;
    	let t79;
    	let li38;
    	let a31;
    	let t81;
    	let li39;
    	let a32;
    	let t83;
    	let li40;
    	let a33;
    	let t85;
    	let li41;
    	let a34;
    	let t87;
    	let li42;
    	let a35;
    	let t89;
    	let li43;
    	let a36;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Acknowledgments";
    			t1 = space();
    			p = element("p");
    			p.textContent = "I thank the following people for contributing their expertise (in\r\n        chronological order).";
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Daniel Lidar";
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Wim van Dam";
    			t7 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Geordie Rose";
    			t9 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Yi-Kai Liu";
    			t11 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Robin Kothari";
    			t13 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Martin Schwarz";
    			t15 = space();
    			li6 = element("li");
    			a6 = element("a");
    			a6.textContent = "Dorit Aharonov";
    			t17 = space();
    			li7 = element("li");
    			a7 = element("a");
    			a7.textContent = "Alessandro Cosentino";
    			t19 = space();
    			li8 = element("li");
    			a8 = element("a");
    			a8.textContent = "Andrew Childs";
    			t21 = space();
    			li9 = element("li");
    			a9 = element("a");
    			a9.textContent = "Stacey Jeffery";
    			t23 = space();
    			li10 = element("li");
    			a10 = element("a");
    			a10.textContent = "Lov Grover";
    			t25 = space();
    			li11 = element("li");
    			a11 = element("a");
    			a11.textContent = "Eduin H. Serna";
    			t27 = space();
    			li12 = element("li");
    			li12.textContent = "Charles Greathouse";
    			t29 = space();
    			li13 = element("li");
    			li13.textContent = "Juani Bermejo-Vega";
    			t31 = space();
    			li14 = element("li");
    			a12 = element("a");
    			a12.textContent = "Luis Kowada";
    			t33 = space();
    			li15 = element("li");
    			li15.textContent = "Keith Britt";
    			t35 = space();
    			li16 = element("li");
    			a13 = element("a");
    			a13.textContent = "Aram Harrow";
    			t37 = space();
    			li17 = element("li");
    			a14 = element("a");
    			a14.textContent = "Zafer Gedik";
    			t39 = space();
    			li18 = element("li");
    			a15 = element("a");
    			a15.textContent = "David Cornwell";
    			t41 = space();
    			li19 = element("li");
    			a16 = element("a");
    			a16.textContent = "Cedric Lin";
    			t43 = space();
    			li20 = element("li");
    			a17 = element("a");
    			a17.textContent = "Shelby Kimmel";
    			t45 = space();
    			li21 = element("li");
    			li21.textContent = "Jeremy Singer";
    			t47 = space();
    			li22 = element("li");
    			a18 = element("a");
    			a18.textContent = "Dan Boneh";
    			t49 = space();
    			li23 = element("li");
    			a19 = element("a");
    			a19.textContent = "Rich Schroeppel";
    			t51 = space();
    			li24 = element("li");
    			a20 = element("a");
    			a20.textContent = "Yuan Su";
    			t53 = space();
    			li25 = element("li");
    			li25.textContent = "Tim Stevens";
    			t55 = space();
    			li26 = element("li");
    			li26.textContent = "Martin Ekerå";
    			t57 = space();
    			li27 = element("li");
    			a21 = element("a");
    			a21.textContent = "Igor Shparlinski";
    			t59 = space();
    			li28 = element("li");
    			li28.textContent = "Timothy Chase";
    			t61 = space();
    			li29 = element("li");
    			a22 = element("a");
    			a22.textContent = "Alejandro Pozas-Kerstjens";
    			t63 = space();
    			li30 = element("li");
    			a23 = element("a");
    			a23.textContent = "Nikhil Vyas";
    			t65 = space();
    			li31 = element("li");
    			a24 = element("a");
    			a24.textContent = "Kevin Lui";
    			t67 = space();
    			li32 = element("li");
    			a25 = element("a");
    			a25.textContent = "Vladimir Korepin";
    			t69 = space();
    			li33 = element("li");
    			a26 = element("a");
    			a26.textContent = "Andriyan Suksmono";
    			t71 = space();
    			li34 = element("li");
    			a27 = element("a");
    			a27.textContent = "Jack Hidari";
    			t73 = space();
    			li35 = element("li");
    			a28 = element("a");
    			a28.textContent = "Donny Greenberg";
    			t75 = space();
    			li36 = element("li");
    			a29 = element("a");
    			a29.textContent = "Nicola Vitucci";
    			t77 = space();
    			li37 = element("li");
    			a30 = element("a");
    			a30.textContent = "Kunal Marwaha";
    			t79 = space();
    			li38 = element("li");
    			a31 = element("a");
    			a31.textContent = "José Ignacio Espinoza Camacho";
    			t81 = space();
    			li39 = element("li");
    			a32 = element("a");
    			a32.textContent = "Vincenzo Savona";
    			t83 = space();
    			li40 = element("li");
    			a33 = element("a");
    			a33.textContent = "Barry Sanders";
    			t85 = space();
    			li41 = element("li");
    			a34 = element("a");
    			a34.textContent = "Jeremy Wright";
    			t87 = space();
    			li42 = element("li");
    			a35 = element("a");
    			a35.textContent = "Sarah Keiser";
    			t89 = space();
    			li43 = element("li");
    			a36 = element("a");
    			a36.textContent = "Benjamin Tokgöz";
    			add_location(h2, file$g, 5, 4, 97);
    			add_location(p, file$g, 6, 4, 127);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "http://qserver.usc.edu/group/index.php/people/daniel-lidar/");
    			attr_dev(a0, "class", "svelte-17xl9z8");
    			add_location(a0, file$g, 12, 12, 272);
    			add_location(li0, file$g, 12, 8, 268);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "http://www.cs.ucsb.edu/~vandam/");
    			attr_dev(a1, "class", "svelte-17xl9z8");
    			add_location(a1, file$g, 13, 12, 393);
    			add_location(li1, file$g, 13, 8, 389);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://twitter.com/realgeordierose");
    			attr_dev(a2, "class", "svelte-17xl9z8");
    			add_location(a2, file$g, 14, 12, 485);
    			add_location(li2, file$g, 14, 8, 481);
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "href", "https://sites.google.com/site/yikailiu00/");
    			attr_dev(a3, "class", "svelte-17xl9z8");
    			add_location(a3, file$g, 15, 12, 582);
    			add_location(li3, file$g, 15, 8, 578);
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "href", "http://www.robinkothari.com/");
    			attr_dev(a4, "class", "svelte-17xl9z8");
    			add_location(a4, file$g, 16, 12, 683);
    			add_location(li4, file$g, 16, 8, 679);
    			attr_dev(a5, "target", "_blank");
    			attr_dev(a5, "href", "http://martinschwarz.wordpress.com/");
    			attr_dev(a5, "class", "svelte-17xl9z8");
    			add_location(a5, file$g, 17, 12, 774);
    			add_location(li5, file$g, 17, 8, 770);
    			attr_dev(a6, "target", "_blank");
    			attr_dev(a6, "href", "http://www.cs.huji.ac.il/~doria/");
    			attr_dev(a6, "class", "svelte-17xl9z8");
    			add_location(a6, file$g, 18, 12, 873);
    			add_location(li6, file$g, 18, 8, 869);
    			attr_dev(a7, "target", "_blank");
    			attr_dev(a7, "href", "https://cosenal.github.io/");
    			attr_dev(a7, "class", "svelte-17xl9z8");
    			add_location(a7, file$g, 19, 12, 969);
    			add_location(li7, file$g, 19, 8, 965);
    			attr_dev(a8, "target", "_blank");
    			attr_dev(a8, "href", "http://www.cs.umd.edu/~amchilds/");
    			attr_dev(a8, "class", "svelte-17xl9z8");
    			add_location(a8, file$g, 20, 12, 1065);
    			add_location(li8, file$g, 20, 8, 1061);
    			attr_dev(a9, "target", "_blank");
    			attr_dev(a9, "href", "https://homepages.cwi.nl/~jeffery/");
    			attr_dev(a9, "class", "svelte-17xl9z8");
    			add_location(a9, file$g, 21, 12, 1160);
    			add_location(li9, file$g, 21, 8, 1156);
    			attr_dev(a10, "target", "_blank");
    			attr_dev(a10, "href", "http://arxiv.org/find/quant-ph/1/au:+Grover_L/0/1/0/all/0/1");
    			attr_dev(a10, "class", "svelte-17xl9z8");
    			add_location(a10, file$g, 22, 12, 1258);
    			add_location(li10, file$g, 22, 8, 1254);
    			attr_dev(a11, "target", "_blank");
    			attr_dev(a11, "href", "http://adaptun.com/ehs.html");
    			attr_dev(a11, "class", "svelte-17xl9z8");
    			add_location(a11, file$g, 23, 12, 1377);
    			add_location(li11, file$g, 23, 8, 1373);
    			add_location(li12, file$g, 24, 8, 1464);
    			add_location(li13, file$g, 25, 8, 1501);
    			attr_dev(a12, "target", "_blank");
    			attr_dev(a12, "href", "http://www.professores.uff.br/kowada/");
    			attr_dev(a12, "class", "svelte-17xl9z8");
    			add_location(a12, file$g, 26, 12, 1542);
    			add_location(li14, file$g, 26, 8, 1538);
    			add_location(li15, file$g, 27, 8, 1636);
    			attr_dev(a13, "target", "_blank");
    			attr_dev(a13, "href", "http://www.mit.edu/~aram");
    			attr_dev(a13, "class", "svelte-17xl9z8");
    			add_location(a13, file$g, 28, 12, 1670);
    			add_location(li16, file$g, 28, 8, 1666);
    			attr_dev(a14, "target", "_blank");
    			attr_dev(a14, "href", "http://people.sabanciuniv.edu/~gedik/");
    			attr_dev(a14, "class", "svelte-17xl9z8");
    			add_location(a14, file$g, 29, 12, 1755);
    			add_location(li17, file$g, 29, 8, 1751);
    			attr_dev(a15, "target", "_blank");
    			attr_dev(a15, "href", "https://www.linkedin.com/in/davidjcornwellphd");
    			attr_dev(a15, "class", "svelte-17xl9z8");
    			add_location(a15, file$g, 30, 12, 1853);
    			add_location(li18, file$g, 30, 8, 1849);
    			attr_dev(a16, "target", "_blank");
    			attr_dev(a16, "href", "http://quics.umd.edu/people/cedric-lin");
    			attr_dev(a16, "class", "svelte-17xl9z8");
    			add_location(a16, file$g, 31, 12, 1962);
    			add_location(li19, file$g, 31, 8, 1958);
    			attr_dev(a17, "target", "_blank");
    			attr_dev(a17, "href", "http://shelbykimmel.com/");
    			attr_dev(a17, "class", "svelte-17xl9z8");
    			add_location(a17, file$g, 32, 12, 2060);
    			add_location(li20, file$g, 32, 8, 2056);
    			add_location(li21, file$g, 33, 8, 2143);
    			attr_dev(a18, "target", "_blank");
    			attr_dev(a18, "href", "https://crypto.stanford.edu/~dabo/");
    			attr_dev(a18, "class", "svelte-17xl9z8");
    			add_location(a18, file$g, 34, 12, 2179);
    			add_location(li22, file$g, 34, 8, 2175);
    			attr_dev(a19, "target", "_blank");
    			attr_dev(a19, "href", "http://www.multimagie.com/English/Schroeppel.htm");
    			attr_dev(a19, "class", "svelte-17xl9z8");
    			add_location(a19, file$g, 35, 12, 2272);
    			add_location(li23, file$g, 35, 8, 2268);
    			attr_dev(a20, "target", "_blank");
    			attr_dev(a20, "href", "http://quics.umd.edu/people/yuan-su");
    			attr_dev(a20, "class", "svelte-17xl9z8");
    			add_location(a20, file$g, 36, 12, 2385);
    			add_location(li24, file$g, 36, 8, 2381);
    			add_location(li25, file$g, 37, 8, 2473);
    			add_location(li26, file$g, 38, 8, 2503);
    			attr_dev(a21, "target", "_blank");
    			attr_dev(a21, "href", "http://web.maths.unsw.edu.au/~igorshparlinski/");
    			attr_dev(a21, "class", "svelte-17xl9z8");
    			add_location(a21, file$g, 39, 12, 2538);
    			add_location(li27, file$g, 39, 8, 2534);
    			add_location(li28, file$g, 40, 8, 2646);
    			attr_dev(a22, "target", "_blank");
    			attr_dev(a22, "href", "https://www.icfo.eu/lang/about-icfo/people/people_details?people_id=892");
    			attr_dev(a22, "class", "svelte-17xl9z8");
    			add_location(a22, file$g, 41, 12, 2682);
    			add_location(li29, file$g, 41, 8, 2678);
    			attr_dev(a23, "target", "_blank");
    			attr_dev(a23, "href", "https://www.csail.mit.edu/person/nikhil-vyas");
    			attr_dev(a23, "class", "svelte-17xl9z8");
    			add_location(a23, file$g, 42, 12, 2828);
    			add_location(li30, file$g, 42, 8, 2824);
    			attr_dev(a24, "target", "_blank");
    			attr_dev(a24, "href", "https://kevinlui.org/");
    			attr_dev(a24, "class", "svelte-17xl9z8");
    			add_location(a24, file$g, 43, 12, 2933);
    			add_location(li31, file$g, 43, 8, 2929);
    			attr_dev(a25, "target", "_blank");
    			attr_dev(a25, "href", "http://insti.physics.sunysb.edu/~korepin/");
    			attr_dev(a25, "class", "svelte-17xl9z8");
    			add_location(a25, file$g, 44, 12, 3013);
    			add_location(li32, file$g, 44, 8, 3009);
    			attr_dev(a26, "target", "_blank");
    			attr_dev(a26, "href", "https://www.stei.itb.ac.id/file/stei-script/andriyan.html");
    			attr_dev(a26, "class", "svelte-17xl9z8");
    			add_location(a26, file$g, 45, 12, 3120);
    			add_location(li33, file$g, 45, 8, 3116);
    			attr_dev(a27, "target", "_blank");
    			attr_dev(a27, "href", "https://en.wikipedia.org/wiki/Jack_Hidary");
    			attr_dev(a27, "class", "svelte-17xl9z8");
    			add_location(a27, file$g, 46, 12, 3244);
    			add_location(li34, file$g, 46, 8, 3240);
    			attr_dev(a28, "target", "_blank");
    			attr_dev(a28, "href", "https://researcher.watson.ibm.com/researcher/view.php?person=ibm-donny");
    			attr_dev(a28, "class", "svelte-17xl9z8");
    			add_location(a28, file$g, 47, 12, 3346);
    			add_location(li35, file$g, 47, 8, 3342);
    			attr_dev(a29, "target", "_blank");
    			attr_dev(a29, "href", "https://github.com/nvitucci");
    			attr_dev(a29, "class", "svelte-17xl9z8");
    			add_location(a29, file$g, 48, 12, 3481);
    			add_location(li36, file$g, 48, 8, 3477);
    			attr_dev(a30, "target", "_blank");
    			attr_dev(a30, "href", "https://kunalmarwaha.com");
    			attr_dev(a30, "class", "svelte-17xl9z8");
    			add_location(a30, file$g, 49, 12, 3572);
    			add_location(li37, file$g, 49, 8, 3568);
    			attr_dev(a31, "target", "_blank");
    			attr_dev(a31, "href", "https://mx.linkedin.com/in/jos%C3%A9-ignacio-espinoza-camacho-0a7603146");
    			attr_dev(a31, "class", "svelte-17xl9z8");
    			add_location(a31, file$g, 50, 12, 3659);
    			add_location(li38, file$g, 50, 8, 3655);
    			attr_dev(a32, "target", "_blank");
    			attr_dev(a32, "href", "https://www.epfl.ch/labs/ltpn/index-html/savona/");
    			attr_dev(a32, "class", "svelte-17xl9z8");
    			add_location(a32, file$g, 51, 12, 3809);
    			add_location(li39, file$g, 51, 8, 3805);
    			attr_dev(a33, "target", "_blank");
    			attr_dev(a33, "href", "http://iqst.ca/people/peoplepage.php?id=4");
    			attr_dev(a33, "class", "svelte-17xl9z8");
    			add_location(a33, file$g, 52, 12, 3922);
    			add_location(li40, file$g, 52, 8, 3918);
    			attr_dev(a34, "target", "_blank");
    			attr_dev(a34, "href", "https://github.com/chinchalupa");
    			attr_dev(a34, "class", "svelte-17xl9z8");
    			add_location(a34, file$g, 53, 12, 4026);
    			add_location(li41, file$g, 53, 8, 4022);
    			attr_dev(a35, "target", "_blank");
    			attr_dev(a35, "href", "https://github.com/crazy4pi314");
    			attr_dev(a35, "class", "svelte-17xl9z8");
    			add_location(a35, file$g, 54, 12, 4119);
    			add_location(li42, file$g, 54, 8, 4115);
    			attr_dev(a36, "target", "_blank");
    			attr_dev(a36, "href", "https://github.com/benjamintokgoez");
    			attr_dev(a36, "class", "svelte-17xl9z8");
    			add_location(a36, file$g, 55, 12, 4211);
    			add_location(li43, file$g, 55, 8, 4207);
    			add_location(ul, file$g, 11, 4, 254);
    			add_location(div, file$g, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(div, t3);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t9);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t11);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(ul, t13);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(ul, t15);
    			append_dev(ul, li6);
    			append_dev(li6, a6);
    			append_dev(ul, t17);
    			append_dev(ul, li7);
    			append_dev(li7, a7);
    			append_dev(ul, t19);
    			append_dev(ul, li8);
    			append_dev(li8, a8);
    			append_dev(ul, t21);
    			append_dev(ul, li9);
    			append_dev(li9, a9);
    			append_dev(ul, t23);
    			append_dev(ul, li10);
    			append_dev(li10, a10);
    			append_dev(ul, t25);
    			append_dev(ul, li11);
    			append_dev(li11, a11);
    			append_dev(ul, t27);
    			append_dev(ul, li12);
    			append_dev(ul, t29);
    			append_dev(ul, li13);
    			append_dev(ul, t31);
    			append_dev(ul, li14);
    			append_dev(li14, a12);
    			append_dev(ul, t33);
    			append_dev(ul, li15);
    			append_dev(ul, t35);
    			append_dev(ul, li16);
    			append_dev(li16, a13);
    			append_dev(ul, t37);
    			append_dev(ul, li17);
    			append_dev(li17, a14);
    			append_dev(ul, t39);
    			append_dev(ul, li18);
    			append_dev(li18, a15);
    			append_dev(ul, t41);
    			append_dev(ul, li19);
    			append_dev(li19, a16);
    			append_dev(ul, t43);
    			append_dev(ul, li20);
    			append_dev(li20, a17);
    			append_dev(ul, t45);
    			append_dev(ul, li21);
    			append_dev(ul, t47);
    			append_dev(ul, li22);
    			append_dev(li22, a18);
    			append_dev(ul, t49);
    			append_dev(ul, li23);
    			append_dev(li23, a19);
    			append_dev(ul, t51);
    			append_dev(ul, li24);
    			append_dev(li24, a20);
    			append_dev(ul, t53);
    			append_dev(ul, li25);
    			append_dev(ul, t55);
    			append_dev(ul, li26);
    			append_dev(ul, t57);
    			append_dev(ul, li27);
    			append_dev(li27, a21);
    			append_dev(ul, t59);
    			append_dev(ul, li28);
    			append_dev(ul, t61);
    			append_dev(ul, li29);
    			append_dev(li29, a22);
    			append_dev(ul, t63);
    			append_dev(ul, li30);
    			append_dev(li30, a23);
    			append_dev(ul, t65);
    			append_dev(ul, li31);
    			append_dev(li31, a24);
    			append_dev(ul, t67);
    			append_dev(ul, li32);
    			append_dev(li32, a25);
    			append_dev(ul, t69);
    			append_dev(ul, li33);
    			append_dev(li33, a26);
    			append_dev(ul, t71);
    			append_dev(ul, li34);
    			append_dev(li34, a27);
    			append_dev(ul, t73);
    			append_dev(ul, li35);
    			append_dev(li35, a28);
    			append_dev(ul, t75);
    			append_dev(ul, li36);
    			append_dev(li36, a29);
    			append_dev(ul, t77);
    			append_dev(ul, li37);
    			append_dev(li37, a30);
    			append_dev(ul, t79);
    			append_dev(ul, li38);
    			append_dev(li38, a31);
    			append_dev(ul, t81);
    			append_dev(ul, li39);
    			append_dev(li39, a32);
    			append_dev(ul, t83);
    			append_dev(ul, li40);
    			append_dev(li40, a33);
    			append_dev(ul, t85);
    			append_dev(ul, li41);
    			append_dev(li41, a34);
    			append_dev(ul, t87);
    			append_dev(ul, li42);
    			append_dev(li42, a35);
    			append_dev(ul, t89);
    			append_dev(ul, li43);
    			append_dev(li43, a36);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Acknowledgments', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Acknowledgments> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide });
    	return [];
    }

    class Acknowledgments extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Acknowledgments",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\display_info\references\References.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1$3 } = globals;
    const file$f = "src\\components\\display_info\\references\\References.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[1] = list[i][1];
    	return child_ctx;
    }

    // (13:4) {#each Object.entries(references.default) as [ref_id, reference]}
    function create_each_block$3(ctx) {
    	let reference;
    	let current;

    	reference = new Reference({
    			props: { data: /*reference*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(reference.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(reference, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reference.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reference.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(reference, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(13:4) {#each Object.entries(references.default) as [ref_id, reference]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let div_transition;
    	let current;
    	let each_value = Object.entries(references.default);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "References";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$f, 11, 4, 310);
    			add_location(div, file$f, 10, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, references*/ 0) {
    				each_value = Object.entries(references.default);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('References', slots, []);

    	afterUpdate(() => {
    		MathJax.typeset();
    	});

    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<References> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		references,
    		Reference,
    		afterUpdate,
    		slide
    	});

    	return [];
    }

    class References extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "References",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\display_info\all_algs\All_algs.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1$2 } = globals;
    const file$e = "src\\components\\display_info\\all_algs\\All_algs.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[1] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    // (16:8) {#each Object.entries(algs) as [alg_id, alg]}
    function create_each_block_1(ctx) {
    	let algorithm;
    	let t;
    	let hr;
    	let current;

    	algorithm = new Algorithm({
    			props: { alg_data: /*alg*/ ctx[5], alone: false },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(algorithm.$$.fragment);
    			t = space();
    			hr = element("hr");
    			add_location(hr, file$e, 17, 12, 540);
    		},
    		m: function mount(target, anchor) {
    			mount_component(algorithm, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(algorithm.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(algorithm.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(algorithm, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(16:8) {#each Object.entries(algs) as [alg_id, alg]}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#each Object.entries(algorithms.default) as [category, algs]}
    function create_each_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = Object.entries(/*algs*/ ctx[1]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, algorithms*/ 0) {
    				each_value_1 = Object.entries(/*algs*/ ctx[1]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(15:4) {#each Object.entries(algorithms.default) as [category, algs]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let div_transition;
    	let current;
    	let each_value = Object.entries(algorithms.default);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "All algorithms";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$e, 13, 4, 325);
    			add_location(div, file$e, 12, 0, 297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, algorithms*/ 0) {
    				each_value = Object.entries(algorithms.default);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('All_algs', slots, []);

    	afterUpdate(() => {
    		MathJax.typeset();
    	});

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<All_algs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		algorithms,
    		Algorithm,
    		afterUpdate,
    		slide
    	});

    	return [];
    }

    class All_algs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "All_algs",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\display_info\translations\Translations.svelte generated by Svelte v3.41.0 */
    const file$d = "src\\components\\display_info\\translations\\Translations.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let a0;
    	let br0;
    	let t5;
    	let a1;
    	let br1;
    	let br2;
    	let div1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Translations";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This page has been translated into:";
    			t3 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Japanese";
    			br0 = element("br");
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "Chinese";
    			br1 = element("br");
    			br2 = element("br");
    			add_location(h2, file$d, 5, 4, 97);
    			add_location(p, file$d, 6, 4, 124);
    			attr_dev(a0, "href", "https://www.qmedia.jp/algorithm-zoo/");
    			attr_dev(a0, "class", "svelte-17xl9z8");
    			add_location(a0, file$d, 8, 8, 203);
    			add_location(br0, file$d, 8, 67, 262);
    			attr_dev(a1, "href", "https://www.qtumist.com/quantum-algorithm-zoo");
    			attr_dev(a1, "class", "svelte-17xl9z8");
    			add_location(a1, file$d, 9, 8, 276);
    			add_location(br1, file$d, 9, 75, 343);
    			add_location(br2, file$d, 9, 79, 347);
    			attr_dev(div0, "class", "navlist");
    			add_location(div0, file$d, 7, 4, 172);
    			add_location(div1, file$d, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, br0);
    			append_dev(div0, t5);
    			append_dev(div0, a1);
    			append_dev(div0, br1);
    			append_dev(div0, br2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Translations', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Translations> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide });
    	return [];
    }

    class Translations extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Translations",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\display_info\other_surveys\Other_surveys.svelte generated by Svelte v3.41.0 */
    const file$c = "src\\components\\display_info\\other_surveys\\Other_surveys.svelte";

    function create_fragment$c(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let a0;
    	let t5;
    	let br0;
    	let t6;
    	let a1;
    	let br1;
    	let t8;
    	let a2;
    	let br2;
    	let t10;
    	let a3;
    	let br3;
    	let t12;
    	let a4;
    	let br4;
    	let t14;
    	let a5;
    	let br5;
    	let t16;
    	let a6;
    	let br6;
    	let t18;
    	let a7;
    	let br7;
    	let t20;
    	let a8;
    	let br8;
    	let br9;
    	let div1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Other Surveys";
    			t1 = space();
    			p = element("p");
    			p.textContent = "For overviews of quantum algorithms I recommend:";
    			t3 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Nielsen\r\n            and Chuang";
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			a1 = element("a");
    			a1.textContent = "Childs";
    			br1 = element("br");
    			t8 = space();
    			a2 = element("a");
    			a2.textContent = "Preskill";
    			br2 = element("br");
    			t10 = space();
    			a3 = element("a");
    			a3.textContent = "Mosca";
    			br3 = element("br");
    			t12 = space();
    			a4 = element("a");
    			a4.textContent = "Childs and van Dam";
    			br4 = element("br");
    			t14 = space();
    			a5 = element("a");
    			a5.textContent = "van Dam and Sasaki";
    			br5 = element("br");
    			t16 = space();
    			a6 = element("a");
    			a6.textContent = "Bacon and van Dam";
    			br6 = element("br");
    			t18 = space();
    			a7 = element("a");
    			a7.textContent = "Montanaro";
    			br7 = element("br");
    			t20 = space();
    			a8 = element("a");
    			a8.textContent = "Hidary";
    			br8 = element("br");
    			br9 = element("br");
    			add_location(h2, file$c, 5, 4, 97);
    			add_location(p, file$c, 6, 4, 125);
    			attr_dev(a0, "href", "http://www.amazon.com/Quantum-Computation-Information-Cambridge-Sciences/dp/0521635039");
    			attr_dev(a0, "class", "svelte-17xl9z8");
    			add_location(a0, file$c, 8, 8, 217);
    			add_location(br0, file$c, 9, 27, 350);
    			attr_dev(a1, "href", "http://www.cs.umd.edu/~amchilds/qa/");
    			attr_dev(a1, "class", "svelte-17xl9z8");
    			add_location(a1, file$c, 10, 8, 364);
    			add_location(br1, file$c, 10, 64, 420);
    			attr_dev(a2, "href", "http://theory.caltech.edu/~preskill/ph229/");
    			attr_dev(a2, "class", "svelte-17xl9z8");
    			add_location(a2, file$c, 11, 8, 434);
    			add_location(br2, file$c, 11, 73, 499);
    			attr_dev(a3, "href", "http://arxiv.org/abs/0808.0369");
    			attr_dev(a3, "class", "svelte-17xl9z8");
    			add_location(a3, file$c, 12, 8, 513);
    			add_location(br3, file$c, 12, 58, 563);
    			attr_dev(a4, "href", "http://arxiv.org/abs/0812.0380");
    			attr_dev(a4, "class", "svelte-17xl9z8");
    			add_location(a4, file$c, 13, 8, 577);
    			add_location(br4, file$c, 13, 71, 640);
    			attr_dev(a5, "href", "http://arxiv.org/abs/1206.6126");
    			attr_dev(a5, "class", "svelte-17xl9z8");
    			add_location(a5, file$c, 14, 8, 654);
    			add_location(br5, file$c, 14, 71, 717);
    			attr_dev(a6, "href", "http://cacm.acm.org/magazines/2010/2/69352-recent-progress-in-quantum-algorithms/fulltext");
    			attr_dev(a6, "class", "svelte-17xl9z8");
    			add_location(a6, file$c, 15, 8, 731);
    			add_location(br6, file$c, 15, 129, 852);
    			attr_dev(a7, "href", "http://arxiv.org/abs/1511.04206");
    			attr_dev(a7, "class", "svelte-17xl9z8");
    			add_location(a7, file$c, 16, 8, 866);
    			add_location(br7, file$c, 16, 63, 921);
    			attr_dev(a8, "href", "https://www.amazon.com/Quantum-Computing-Approach-Jack-Hidary/dp/3030239217/");
    			attr_dev(a8, "class", "svelte-17xl9z8");
    			add_location(a8, file$c, 17, 8, 935);
    			add_location(br8, file$c, 17, 105, 1032);
    			add_location(br9, file$c, 17, 109, 1036);
    			attr_dev(div0, "class", "navlist");
    			add_location(div0, file$c, 7, 4, 186);
    			add_location(div1, file$c, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t5);
    			append_dev(div0, br0);
    			append_dev(div0, t6);
    			append_dev(div0, a1);
    			append_dev(div0, br1);
    			append_dev(div0, t8);
    			append_dev(div0, a2);
    			append_dev(div0, br2);
    			append_dev(div0, t10);
    			append_dev(div0, a3);
    			append_dev(div0, br3);
    			append_dev(div0, t12);
    			append_dev(div0, a4);
    			append_dev(div0, br4);
    			append_dev(div0, t14);
    			append_dev(div0, a5);
    			append_dev(div0, br5);
    			append_dev(div0, t16);
    			append_dev(div0, a6);
    			append_dev(div0, br6);
    			append_dev(div0, t18);
    			append_dev(div0, a7);
    			append_dev(div0, br7);
    			append_dev(div0, t20);
    			append_dev(div0, a8);
    			append_dev(div0, br8);
    			append_dev(div0, br9);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Other_surveys', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Other_surveys> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide });
    	return [];
    }

    class Other_surveys extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Other_surveys",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\display_info\terminology\Terminology.svelte generated by Svelte v3.41.0 */
    const file$b = "src\\components\\display_info\\terminology\\Terminology.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p;
    	let t2;
    	let span0;
    	let span9;
    	let nobr0;
    	let span7;
    	let span5;
    	let span4;
    	let span2;
    	let span1;
    	let span3;
    	let span6;
    	let span8;
    	let math0;
    	let mi0;
    	let t4;
    	let script0;
    	let t6;
    	let span10;
    	let span23;
    	let nobr1;
    	let span21;
    	let span19;
    	let span18;
    	let span16;
    	let span12;
    	let t7;
    	let span11;
    	let span13;
    	let span14;
    	let span15;
    	let span17;
    	let span20;
    	let span22;
    	let math1;
    	let mi1;
    	let t11;
    	let mo0;
    	let t12;
    	let mi2;
    	let t13;
    	let mo1;
    	let t14;
    	let script1;
    	let t16;
    	let span24;
    	let span36;
    	let nobr2;
    	let span34;
    	let span32;
    	let span31;
    	let span29;
    	let span25;
    	let span26;
    	let span27;
    	let span28;
    	let span30;
    	let span33;
    	let span35;
    	let math2;
    	let mi3;
    	let t21;
    	let mo2;
    	let t22;
    	let mi4;
    	let t23;
    	let mo3;
    	let t24;
    	let script2;
    	let t26;
    	let span37;
    	let span68;
    	let nobr3;
    	let span66;
    	let span64;
    	let span63;
    	let span61;
    	let span39;
    	let t27;
    	let span38;
    	let span40;
    	let span60;
    	let span59;
    	let span43;
    	let span41;
    	let span42;
    	let span58;
    	let span56;
    	let span55;
    	let span44;
    	let span45;
    	let span53;
    	let span52;
    	let span48;
    	let span46;
    	let span47;
    	let span51;
    	let span49;
    	let span50;
    	let span54;
    	let span57;
    	let span62;
    	let span65;
    	let span67;
    	let math3;
    	let mi5;
    	let t35;
    	let mo4;
    	let t36;
    	let msup1;
    	let mn;
    	let t37;
    	let mrow0;
    	let mi6;
    	let t38;
    	let mo5;
    	let t39;
    	let msup0;
    	let mi7;
    	let t40;
    	let mi8;
    	let t41;
    	let mo6;
    	let t42;
    	let script3;
    	let t44;
    	let span69;
    	let span98;
    	let nobr4;
    	let span96;
    	let span94;
    	let span93;
    	let span91;
    	let span70;
    	let span71;
    	let span72;
    	let span73;
    	let span74;
    	let span75;
    	let span86;
    	let span85;
    	let span84;
    	let span83;
    	let span78;
    	let span76;
    	let span77;
    	let span82;
    	let span80;
    	let span79;
    	let span81;
    	let span87;
    	let span88;
    	let span89;
    	let span90;
    	let span92;
    	let span95;
    	let span97;
    	let math4;
    	let mi9;
    	let t57;
    	let mo7;
    	let t58;
    	let mi10;
    	let t59;
    	let mo8;
    	let t60;
    	let mi11;
    	let t61;
    	let mo9;
    	let t62;
    	let mrow1;
    	let mover;
    	let mi12;
    	let t63;
    	let mo10;
    	let t64;
    	let mo11;
    	let t65;
    	let mo12;
    	let t66;
    	let mo13;
    	let t67;
    	let mo14;
    	let t68;
    	let script4;
    	let t70;
    	let a;
    	let t72;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Terminology";
    			t1 = space();
    			p = element("p");
    			t2 = text("If there exists a positive constant ");
    			span0 = element("span");
    			span9 = element("span");
    			nobr0 = element("nobr");
    			span7 = element("span");
    			span5 = element("span");
    			span4 = element("span");
    			span2 = element("span");
    			span1 = element("span");
    			span1.textContent = "α";
    			span3 = element("span");
    			span6 = element("span");
    			span8 = element("span");
    			math0 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
    			mi0 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t4 = text("α");
    			script0 = element("script");
    			script0.textContent = "\\alpha";
    			t6 = text("\r\n        such that the runtime ");
    			span10 = element("span");
    			span23 = element("span");
    			nobr1 = element("nobr");
    			span21 = element("span");
    			span19 = element("span");
    			span18 = element("span");
    			span16 = element("span");
    			span12 = element("span");
    			t7 = text("C");
    			span11 = element("span");
    			span13 = element("span");
    			span13.textContent = "(";
    			span14 = element("span");
    			span14.textContent = "n";
    			span15 = element("span");
    			span15.textContent = ")";
    			span17 = element("span");
    			span20 = element("span");
    			span22 = element("span");
    			math1 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
    			mi1 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t11 = text("C");
    			mo0 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t12 = text("(");
    			mi2 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t13 = text("n");
    			mo1 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t14 = text(")");
    			script1 = element("script");
    			script1.textContent = "C(n)";
    			t16 = text(" of the best known classical algorithm and the runtime\r\n        ");
    			span24 = element("span");
    			span36 = element("span");
    			nobr2 = element("nobr");
    			span34 = element("span");
    			span32 = element("span");
    			span31 = element("span");
    			span29 = element("span");
    			span25 = element("span");
    			span25.textContent = "Q";
    			span26 = element("span");
    			span26.textContent = "(";
    			span27 = element("span");
    			span27.textContent = "n";
    			span28 = element("span");
    			span28.textContent = ")";
    			span30 = element("span");
    			span33 = element("span");
    			span35 = element("span");
    			math2 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
    			mi3 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t21 = text("Q");
    			mo2 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t22 = text("(");
    			mi4 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t23 = text("n");
    			mo3 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t24 = text(")");
    			script2 = element("script");
    			script2.textContent = "Q(n)";
    			t26 = text(" of the quantum algorithm satisfy ");
    			span37 = element("span");
    			span68 = element("span");
    			nobr3 = element("nobr");
    			span66 = element("span");
    			span64 = element("span");
    			span63 = element("span");
    			span61 = element("span");
    			span39 = element("span");
    			t27 = text("C");
    			span38 = element("span");
    			span40 = element("span");
    			span40.textContent = "=";
    			span60 = element("span");
    			span59 = element("span");
    			span43 = element("span");
    			span41 = element("span");
    			span41.textContent = "2";
    			span42 = element("span");
    			span58 = element("span");
    			span56 = element("span");
    			span55 = element("span");
    			span44 = element("span");
    			span44.textContent = "Ω";
    			span45 = element("span");
    			span45.textContent = "(";
    			span53 = element("span");
    			span52 = element("span");
    			span48 = element("span");
    			span46 = element("span");
    			span46.textContent = "Q";
    			span47 = element("span");
    			span51 = element("span");
    			span49 = element("span");
    			span49.textContent = "α";
    			span50 = element("span");
    			span54 = element("span");
    			span54.textContent = ")";
    			span57 = element("span");
    			span62 = element("span");
    			span65 = element("span");
    			span67 = element("span");
    			math3 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
    			mi5 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t35 = text("C");
    			mo4 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t36 = text("=");
    			msup1 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "msup");
    			mn = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mn");
    			t37 = text("2");
    			mrow0 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
    			mi6 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t38 = text("Ω");
    			mo5 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t39 = text("(");
    			msup0 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "msup");
    			mi7 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t40 = text("Q");
    			mi8 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t41 = text("α");
    			mo6 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t42 = text(")");
    			script3 = element("script");
    			script3.textContent = "C = 2^{\\Omega(Q^\\alpha)}";
    			t44 = text("\r\n        then I call the speedup superpolynomial. Otherwise I call it polynomial.\r\n        For a review of the ");
    			span69 = element("span");
    			span98 = element("span");
    			nobr4 = element("nobr");
    			span96 = element("span");
    			span94 = element("span");
    			span93 = element("span");
    			span91 = element("span");
    			span70 = element("span");
    			span70.textContent = "O";
    			span71 = element("span");
    			span71.textContent = ",";
    			span72 = element("span");
    			span72.textContent = "Ω";
    			span73 = element("span");
    			span73.textContent = ",";
    			span74 = element("span");
    			span74.textContent = "Θ";
    			span75 = element("span");
    			span75.textContent = ",";
    			span86 = element("span");
    			span85 = element("span");
    			span84 = element("span");
    			span83 = element("span");
    			span78 = element("span");
    			span76 = element("span");
    			span76.textContent = "O";
    			span77 = element("span");
    			span82 = element("span");
    			span80 = element("span");
    			span79 = element("span");
    			span79.textContent = "˜";
    			span81 = element("span");
    			span87 = element("span");
    			span87.textContent = ",";
    			span88 = element("span");
    			span88.textContent = ".";
    			span89 = element("span");
    			span89.textContent = ".";
    			span90 = element("span");
    			span90.textContent = ".";
    			span92 = element("span");
    			span95 = element("span");
    			span97 = element("span");
    			math4 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
    			mi9 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t57 = text("O");
    			mo7 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t58 = text(",");
    			mi10 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t59 = text("Ω");
    			mo8 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t60 = text(",");
    			mi11 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t61 = text("Θ");
    			mo9 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t62 = text(",");
    			mrow1 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
    			mover = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mover");
    			mi12 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
    			t63 = text("O");
    			mo10 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t64 = text("~");
    			mo11 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t65 = text(",");
    			mo12 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t66 = text(".");
    			mo13 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t67 = text(".");
    			mo14 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
    			t68 = text(".");
    			script4 = element("script");
    			script4.textContent = "O, \\Omega, \\Theta, \\widetilde{O}, ...";
    			t70 = text(" notations see the\r\n        ");
    			a = element("a");
    			a.textContent = "Wikipedia article";
    			t72 = text(".");
    			add_location(h2, file$b, 5, 4, 97);
    			attr_dev(span0, "class", "MathJax_Preview");
    			set_style(span0, "color", "inherit");
    			set_style(span0, "display", "none");
    			add_location(span0, file$b, 6, 43, 162);
    			attr_dev(span1, "class", "mi");
    			attr_dev(span1, "id", "MathJax-Span-3975");
    			set_style(span1, "font-family", "MathJax_Math-italic");
    			add_location(span1, file$b, 6, 706, 825);
    			attr_dev(span2, "class", "mrow");
    			attr_dev(span2, "id", "MathJax-Span-3974");
    			add_location(span2, file$b, 6, 664, 783);
    			set_style(span3, "display", "inline-block");
    			set_style(span3, "width", "0px");
    			set_style(span3, "height", "1.908em");
    			add_location(span3, file$b, 6, 803, 922);
    			set_style(span4, "position", "absolute");
    			set_style(span4, "clip", "rect(1.313em, 1000.6em, 2.086em, -999.997em)");
    			set_style(span4, "top", "-1.902em");
    			set_style(span4, "left", "0em");
    			add_location(span4, file$b, 6, 552, 671);
    			set_style(span5, "display", "inline-block");
    			set_style(span5, "position", "relative");
    			set_style(span5, "width", "0.658em");
    			set_style(span5, "height", "0px");
    			set_style(span5, "font-size", "120%");
    			add_location(span5, file$b, 6, 449, 568);
    			set_style(span6, "display", "inline-block");
    			set_style(span6, "overflow", "hidden");
    			set_style(span6, "vertical-align", "-0.068em");
    			set_style(span6, "border-left", "0px solid");
    			set_style(span6, "width", "0px");
    			set_style(span6, "height", "0.718em");
    			add_location(span6, file$b, 6, 890, 1009);
    			attr_dev(span7, "class", "math");
    			attr_dev(span7, "id", "MathJax-Span-3973");
    			set_style(span7, "width", "0.836em");
    			set_style(span7, "display", "inline-block");
    			add_location(span7, file$b, 6, 360, 479);
    			attr_dev(nobr0, "aria-hidden", "true");
    			add_location(nobr0, file$b, 6, 335, 454);
    			add_location(mi0, file$b, 6, 1149, 1268);
    			attr_dev(math0, "xmlns", "http://www.w3.org/1998/Math/MathML");
    			add_location(math0, file$b, 6, 1100, 1219);
    			attr_dev(span8, "class", "MJX_Assistive_MathML");
    			attr_dev(span8, "role", "presentation");
    			add_location(span8, file$b, 6, 1045, 1164);
    			attr_dev(span9, "class", "MathJax");
    			attr_dev(span9, "id", "MathJax-Element-345-Frame");
    			attr_dev(span9, "tabindex", "0");
    			attr_dev(span9, "data-mathml", "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mi>&#x03B1;</mi></math>");
    			attr_dev(span9, "role", "presentation");
    			set_style(span9, "position", "relative");
    			add_location(span9, file$b, 6, 119, 238);
    			attr_dev(script0, "type", "math/tex");
    			attr_dev(script0, "id", "MathJax-Element-345");
    			add_location(script0, file$b, 6, 1180, 1299);
    			attr_dev(span10, "class", "MathJax_Preview");
    			set_style(span10, "color", "inherit");
    			set_style(span10, "display", "none");
    			add_location(span10, file$b, 7, 30, 1397);
    			set_style(span11, "display", "inline-block");
    			set_style(span11, "overflow", "hidden");
    			set_style(span11, "height", "1px");
    			set_style(span11, "width", "0.063em");
    			add_location(span11, file$b, 7, 850, 2217);
    			attr_dev(span12, "class", "mi");
    			attr_dev(span12, "id", "MathJax-Span-3978");
    			set_style(span12, "font-family", "MathJax_Math-italic");
    			add_location(span12, file$b, 7, 767, 2134);
    			attr_dev(span13, "class", "mo");
    			attr_dev(span13, "id", "MathJax-Span-3979");
    			set_style(span13, "font-family", "MathJax_Main");
    			add_location(span13, file$b, 7, 948, 2315);
    			attr_dev(span14, "class", "mi");
    			attr_dev(span14, "id", "MathJax-Span-3980");
    			set_style(span14, "font-family", "MathJax_Math-italic");
    			add_location(span14, file$b, 7, 1031, 2398);
    			attr_dev(span15, "class", "mo");
    			attr_dev(span15, "id", "MathJax-Span-3981");
    			set_style(span15, "font-family", "MathJax_Main");
    			add_location(span15, file$b, 7, 1121, 2488);
    			attr_dev(span16, "class", "mrow");
    			attr_dev(span16, "id", "MathJax-Span-3977");
    			add_location(span16, file$b, 7, 725, 2092);
    			set_style(span17, "display", "inline-block");
    			set_style(span17, "width", "0px");
    			set_style(span17, "height", "2.205em");
    			add_location(span17, file$b, 7, 1211, 2578);
    			set_style(span18, "position", "absolute");
    			set_style(span18, "clip", "rect(1.253em, 1002.03em, 2.622em, -999.997em)");
    			set_style(span18, "top", "-2.199em");
    			set_style(span18, "left", "0em");
    			add_location(span18, file$b, 7, 612, 1979);
    			set_style(span19, "display", "inline-block");
    			set_style(span19, "position", "relative");
    			set_style(span19, "width", "2.146em");
    			set_style(span19, "height", "0px");
    			set_style(span19, "font-size", "120%");
    			add_location(span19, file$b, 7, 509, 1876);
    			set_style(span20, "display", "inline-block");
    			set_style(span20, "overflow", "hidden");
    			set_style(span20, "vertical-align", "-0.354em");
    			set_style(span20, "border-left", "0px solid");
    			set_style(span20, "width", "0px");
    			set_style(span20, "height", "1.361em");
    			add_location(span20, file$b, 7, 1298, 2665);
    			attr_dev(span21, "class", "math");
    			attr_dev(span21, "id", "MathJax-Span-3976");
    			set_style(span21, "width", "2.622em");
    			set_style(span21, "display", "inline-block");
    			add_location(span21, file$b, 7, 420, 1787);
    			attr_dev(nobr1, "aria-hidden", "true");
    			add_location(nobr1, file$b, 7, 395, 1762);
    			add_location(mi1, file$b, 7, 1557, 2924);
    			attr_dev(mo0, "stretchy", "false");
    			add_location(mo0, file$b, 7, 1567, 2934);
    			add_location(mi2, file$b, 7, 1594, 2961);
    			attr_dev(mo1, "stretchy", "false");
    			add_location(mo1, file$b, 7, 1604, 2971);
    			attr_dev(math1, "xmlns", "http://www.w3.org/1998/Math/MathML");
    			add_location(math1, file$b, 7, 1508, 2875);
    			attr_dev(span22, "class", "MJX_Assistive_MathML");
    			attr_dev(span22, "role", "presentation");
    			add_location(span22, file$b, 7, 1453, 2820);
    			attr_dev(span23, "class", "MathJax");
    			attr_dev(span23, "id", "MathJax-Element-346-Frame");
    			attr_dev(span23, "tabindex", "0");
    			attr_dev(span23, "data-mathml", "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mi>C</mi><mo stretchy=\"false\">(</mo><mi>n</mi><mo stretchy=\"false\">)</mo></math>");
    			attr_dev(span23, "role", "presentation");
    			set_style(span23, "position", "relative");
    			add_location(span23, file$b, 7, 106, 1473);
    			attr_dev(script1, "type", "math/tex");
    			attr_dev(script1, "id", "MathJax-Element-346");
    			add_location(script1, file$b, 7, 1652, 3019);
    			attr_dev(span24, "class", "MathJax_Preview");
    			set_style(span24, "color", "inherit");
    			set_style(span24, "display", "none");
    			add_location(span24, file$b, 8, 8, 3147);
    			attr_dev(span25, "class", "mi");
    			attr_dev(span25, "id", "MathJax-Span-3984");
    			set_style(span25, "font-family", "MathJax_Math-italic");
    			add_location(span25, file$b, 8, 745, 3884);
    			attr_dev(span26, "class", "mo");
    			attr_dev(span26, "id", "MathJax-Span-3985");
    			set_style(span26, "font-family", "MathJax_Main");
    			add_location(span26, file$b, 8, 835, 3974);
    			attr_dev(span27, "class", "mi");
    			attr_dev(span27, "id", "MathJax-Span-3986");
    			set_style(span27, "font-family", "MathJax_Math-italic");
    			add_location(span27, file$b, 8, 918, 4057);
    			attr_dev(span28, "class", "mo");
    			attr_dev(span28, "id", "MathJax-Span-3987");
    			set_style(span28, "font-family", "MathJax_Main");
    			add_location(span28, file$b, 8, 1008, 4147);
    			attr_dev(span29, "class", "mrow");
    			attr_dev(span29, "id", "MathJax-Span-3983");
    			add_location(span29, file$b, 8, 703, 3842);
    			set_style(span30, "display", "inline-block");
    			set_style(span30, "width", "0px");
    			set_style(span30, "height", "2.205em");
    			add_location(span30, file$b, 8, 1098, 4237);
    			set_style(span31, "position", "absolute");
    			set_style(span31, "clip", "rect(1.253em, 1002.09em, 2.622em, -999.997em)");
    			set_style(span31, "top", "-2.199em");
    			set_style(span31, "left", "0em");
    			add_location(span31, file$b, 8, 590, 3729);
    			set_style(span32, "display", "inline-block");
    			set_style(span32, "position", "relative");
    			set_style(span32, "width", "2.205em");
    			set_style(span32, "height", "0px");
    			set_style(span32, "font-size", "120%");
    			add_location(span32, file$b, 8, 487, 3626);
    			set_style(span33, "display", "inline-block");
    			set_style(span33, "overflow", "hidden");
    			set_style(span33, "vertical-align", "-0.354em");
    			set_style(span33, "border-left", "0px solid");
    			set_style(span33, "width", "0px");
    			set_style(span33, "height", "1.361em");
    			add_location(span33, file$b, 8, 1185, 4324);
    			attr_dev(span34, "class", "math");
    			attr_dev(span34, "id", "MathJax-Span-3982");
    			set_style(span34, "width", "2.682em");
    			set_style(span34, "display", "inline-block");
    			add_location(span34, file$b, 8, 398, 3537);
    			attr_dev(nobr2, "aria-hidden", "true");
    			add_location(nobr2, file$b, 8, 373, 3512);
    			add_location(mi3, file$b, 8, 1444, 4583);
    			attr_dev(mo2, "stretchy", "false");
    			add_location(mo2, file$b, 8, 1454, 4593);
    			add_location(mi4, file$b, 8, 1481, 4620);
    			attr_dev(mo3, "stretchy", "false");
    			add_location(mo3, file$b, 8, 1491, 4630);
    			attr_dev(math2, "xmlns", "http://www.w3.org/1998/Math/MathML");
    			add_location(math2, file$b, 8, 1395, 4534);
    			attr_dev(span35, "class", "MJX_Assistive_MathML");
    			attr_dev(span35, "role", "presentation");
    			add_location(span35, file$b, 8, 1340, 4479);
    			attr_dev(span36, "class", "MathJax");
    			attr_dev(span36, "id", "MathJax-Element-347-Frame");
    			attr_dev(span36, "tabindex", "0");
    			attr_dev(span36, "data-mathml", "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mi>Q</mi><mo stretchy=\"false\">(</mo><mi>n</mi><mo stretchy=\"false\">)</mo></math>");
    			attr_dev(span36, "role", "presentation");
    			set_style(span36, "position", "relative");
    			add_location(span36, file$b, 8, 84, 3223);
    			attr_dev(script2, "type", "math/tex");
    			attr_dev(script2, "id", "MathJax-Element-347");
    			add_location(script2, file$b, 8, 1539, 4678);
    			attr_dev(span37, "class", "MathJax_Preview");
    			set_style(span37, "color", "inherit");
    			set_style(span37, "display", "none");
    			add_location(span37, file$b, 8, 1637, 4776);
    			set_style(span38, "display", "inline-block");
    			set_style(span38, "overflow", "hidden");
    			set_style(span38, "height", "1px");
    			set_style(span38, "width", "0.063em");
    			add_location(span38, file$b, 8, 2623, 5762);
    			attr_dev(span39, "class", "mi");
    			attr_dev(span39, "id", "MathJax-Span-3990");
    			set_style(span39, "font-family", "MathJax_Math-italic");
    			add_location(span39, file$b, 8, 2540, 5679);
    			attr_dev(span40, "class", "mo");
    			attr_dev(span40, "id", "MathJax-Span-3991");
    			set_style(span40, "font-family", "MathJax_Main");
    			set_style(span40, "padding-left", "0.301em");
    			add_location(span40, file$b, 8, 2721, 5860);
    			attr_dev(span41, "class", "mn");
    			attr_dev(span41, "id", "MathJax-Span-3993");
    			set_style(span41, "font-family", "MathJax_Main");
    			add_location(span41, file$b, 8, 3101, 6240);
    			set_style(span42, "display", "inline-block");
    			set_style(span42, "width", "0px");
    			set_style(span42, "height", "3.991em");
    			add_location(span42, file$b, 8, 3184, 6323);
    			set_style(span43, "position", "absolute");
    			set_style(span43, "clip", "rect(3.158em, 1000.48em, 4.17em, -999.997em)");
    			set_style(span43, "top", "-3.985em");
    			set_style(span43, "left", "0em");
    			add_location(span43, file$b, 8, 2989, 6128);
    			attr_dev(span44, "class", "mi");
    			attr_dev(span44, "id", "MathJax-Span-3996");
    			set_style(span44, "font-size", "70.7%");
    			set_style(span44, "font-family", "MathJax_Main");
    			add_location(span44, file$b, 8, 3415, 6554);
    			attr_dev(span45, "class", "mo");
    			attr_dev(span45, "id", "MathJax-Span-3997");
    			set_style(span45, "font-size", "70.7%");
    			set_style(span45, "font-family", "MathJax_Main");
    			add_location(span45, file$b, 8, 3516, 6655);
    			attr_dev(span46, "class", "mi");
    			attr_dev(span46, "id", "MathJax-Span-3999");
    			set_style(span46, "font-size", "70.7%");
    			set_style(span46, "font-family", "MathJax_Math-italic");
    			add_location(span46, file$b, 8, 3861, 7000);
    			set_style(span47, "display", "inline-block");
    			set_style(span47, "width", "0px");
    			set_style(span47, "height", "3.991em");
    			add_location(span47, file$b, 8, 3969, 7108);
    			set_style(span48, "position", "absolute");
    			set_style(span48, "clip", "rect(3.336em, 1000.54em, 4.289em, -999.997em)");
    			set_style(span48, "top", "-3.985em");
    			set_style(span48, "left", "0em");
    			add_location(span48, file$b, 8, 3748, 6887);
    			attr_dev(span49, "class", "mi");
    			attr_dev(span49, "id", "MathJax-Span-4000");
    			set_style(span49, "font-size", "50%");
    			set_style(span49, "font-family", "MathJax_Math-italic");
    			add_location(span49, file$b, 8, 4113, 7252);
    			set_style(span50, "display", "inline-block");
    			set_style(span50, "width", "0px");
    			set_style(span50, "height", "3.991em");
    			add_location(span50, file$b, 8, 4219, 7358);
    			set_style(span51, "position", "absolute");
    			set_style(span51, "top", "-4.283em");
    			set_style(span51, "left", "0.539em");
    			add_location(span51, file$b, 8, 4049, 7188);
    			set_style(span52, "display", "inline-block");
    			set_style(span52, "position", "relative");
    			set_style(span52, "width", "0.955em");
    			set_style(span52, "height", "0px");
    			add_location(span52, file$b, 8, 3662, 6801);
    			attr_dev(span53, "class", "msubsup");
    			attr_dev(span53, "id", "MathJax-Span-3998");
    			add_location(span53, file$b, 8, 3617, 6756);
    			attr_dev(span54, "class", "mo");
    			attr_dev(span54, "id", "MathJax-Span-4001");
    			set_style(span54, "font-size", "70.7%");
    			set_style(span54, "font-family", "MathJax_Main");
    			add_location(span54, file$b, 8, 4313, 7452);
    			attr_dev(span55, "class", "mrow");
    			attr_dev(span55, "id", "MathJax-Span-3995");
    			add_location(span55, file$b, 8, 3373, 6512);
    			attr_dev(span56, "class", "texatom");
    			attr_dev(span56, "id", "MathJax-Span-3994");
    			add_location(span56, file$b, 8, 3328, 6467);
    			set_style(span57, "display", "inline-block");
    			set_style(span57, "width", "0px");
    			set_style(span57, "height", "3.991em");
    			add_location(span57, file$b, 8, 4428, 7567);
    			set_style(span58, "position", "absolute");
    			set_style(span58, "top", "-4.402em");
    			set_style(span58, "left", "0.479em");
    			add_location(span58, file$b, 8, 3264, 6403);
    			set_style(span59, "display", "inline-block");
    			set_style(span59, "position", "relative");
    			set_style(span59, "width", "2.562em");
    			set_style(span59, "height", "0px");
    			add_location(span59, file$b, 8, 2903, 6042);
    			attr_dev(span60, "class", "msubsup");
    			attr_dev(span60, "id", "MathJax-Span-3992");
    			set_style(span60, "padding-left", "0.301em");
    			add_location(span60, file$b, 8, 2827, 5966);
    			attr_dev(span61, "class", "mrow");
    			attr_dev(span61, "id", "MathJax-Span-3989");
    			add_location(span61, file$b, 8, 2498, 5637);
    			set_style(span62, "display", "inline-block");
    			set_style(span62, "width", "0px");
    			set_style(span62, "height", "2.205em");
    			add_location(span62, file$b, 8, 4529, 7668);
    			set_style(span63, "position", "absolute");
    			set_style(span63, "clip", "rect(1.074em, 1004.71em, 2.384em, -999.997em)");
    			set_style(span63, "top", "-2.199em");
    			set_style(span63, "left", "0em");
    			add_location(span63, file$b, 8, 2385, 5524);
    			set_style(span64, "display", "inline-block");
    			set_style(span64, "position", "relative");
    			set_style(span64, "width", "4.705em");
    			set_style(span64, "height", "0px");
    			set_style(span64, "font-size", "120%");
    			add_location(span64, file$b, 8, 2282, 5421);
    			set_style(span65, "display", "inline-block");
    			set_style(span65, "overflow", "hidden");
    			set_style(span65, "vertical-align", "-0.068em");
    			set_style(span65, "border-left", "0px solid");
    			set_style(span65, "width", "0px");
    			set_style(span65, "height", "1.289em");
    			add_location(span65, file$b, 8, 4616, 7755);
    			attr_dev(span66, "class", "math");
    			attr_dev(span66, "id", "MathJax-Span-3988");
    			set_style(span66, "width", "5.658em");
    			set_style(span66, "display", "inline-block");
    			add_location(span66, file$b, 8, 2193, 5332);
    			attr_dev(nobr3, "aria-hidden", "true");
    			add_location(nobr3, file$b, 8, 2168, 5307);
    			add_location(mi5, file$b, 8, 4875, 8014);
    			add_location(mo4, file$b, 8, 4885, 8024);
    			add_location(mn, file$b, 8, 4901, 8040);
    			attr_dev(mi6, "mathvariant", "normal");
    			add_location(mi6, file$b, 8, 4941, 8080);
    			attr_dev(mo5, "stretchy", "false");
    			add_location(mo5, file$b, 8, 4972, 8111);
    			add_location(mi7, file$b, 8, 5005, 8144);
    			add_location(mi8, file$b, 8, 5015, 8154);
    			add_location(msup0, file$b, 8, 4999, 8138);
    			attr_dev(mo6, "stretchy", "false");
    			add_location(mo6, file$b, 8, 5032, 8171);
    			attr_dev(mrow0, "class", "MJX-TeXAtom-ORD");
    			add_location(mrow0, file$b, 8, 4911, 8050);
    			add_location(msup1, file$b, 8, 4895, 8034);
    			attr_dev(math3, "xmlns", "http://www.w3.org/1998/Math/MathML");
    			add_location(math3, file$b, 8, 4826, 7965);
    			attr_dev(span67, "class", "MJX_Assistive_MathML");
    			attr_dev(span67, "role", "presentation");
    			add_location(span67, file$b, 8, 4771, 7910);
    			attr_dev(span68, "class", "MathJax");
    			attr_dev(span68, "id", "MathJax-Element-348-Frame");
    			attr_dev(span68, "tabindex", "0");
    			attr_dev(span68, "data-mathml", "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mi>C</mi><mo>=</mo><msup><mn>2</mn><mrow class=\"MJX-TeXAtom-ORD\"><mi mathvariant=\"normal\">&#x03A9;</mi><mo stretchy=\"false\">(</mo><msup><mi>Q</mi><mi>&#x03B1;</mi></msup><mo stretchy=\"false\">)</mo></mrow></msup></math>");
    			attr_dev(span68, "role", "presentation");
    			set_style(span68, "position", "relative");
    			add_location(span68, file$b, 8, 1713, 4852);
    			attr_dev(script3, "type", "math/tex");
    			attr_dev(script3, "id", "MathJax-Element-348");
    			add_location(script3, file$b, 8, 5094, 8233);
    			attr_dev(span69, "class", "MathJax_Preview");
    			set_style(span69, "color", "inherit");
    			set_style(span69, "display", "none");
    			add_location(span69, file$b, 10, 28, 8429);
    			attr_dev(span70, "class", "mi");
    			attr_dev(span70, "id", "MathJax-Span-4004");
    			set_style(span70, "font-family", "MathJax_Math-italic");
    			add_location(span70, file$b, 10, 948, 9349);
    			attr_dev(span71, "class", "mo");
    			attr_dev(span71, "id", "MathJax-Span-4005");
    			set_style(span71, "font-family", "MathJax_Main");
    			add_location(span71, file$b, 10, 1038, 9439);
    			attr_dev(span72, "class", "mi");
    			attr_dev(span72, "id", "MathJax-Span-4006");
    			set_style(span72, "font-family", "MathJax_Main");
    			set_style(span72, "padding-left", "0.182em");
    			add_location(span72, file$b, 10, 1121, 9522);
    			attr_dev(span73, "class", "mo");
    			attr_dev(span73, "id", "MathJax-Span-4007");
    			set_style(span73, "font-family", "MathJax_Main");
    			add_location(span73, file$b, 10, 1227, 9628);
    			attr_dev(span74, "class", "mi");
    			attr_dev(span74, "id", "MathJax-Span-4008");
    			set_style(span74, "font-family", "MathJax_Main");
    			set_style(span74, "padding-left", "0.182em");
    			add_location(span74, file$b, 10, 1310, 9711);
    			attr_dev(span75, "class", "mo");
    			attr_dev(span75, "id", "MathJax-Span-4009");
    			set_style(span75, "font-family", "MathJax_Main");
    			add_location(span75, file$b, 10, 1416, 9817);
    			attr_dev(span76, "class", "mi");
    			attr_dev(span76, "id", "MathJax-Span-4013");
    			set_style(span76, "font-family", "MathJax_Math-italic");
    			add_location(span76, file$b, 10, 1863, 10264);
    			set_style(span77, "display", "inline-block");
    			set_style(span77, "width", "0px");
    			set_style(span77, "height", "3.991em");
    			add_location(span77, file$b, 10, 1953, 10354);
    			set_style(span78, "position", "absolute");
    			set_style(span78, "clip", "rect(3.098em, 1000.72em, 4.17em, -999.997em)");
    			set_style(span78, "top", "-3.985em");
    			set_style(span78, "left", "0em");
    			add_location(span78, file$b, 10, 1751, 10152);
    			set_style(span79, "font-family", "MathJax_Size1");
    			add_location(span79, file$b, 10, 2199, 10600);
    			attr_dev(span80, "class", "mo");
    			attr_dev(span80, "id", "MathJax-Span-4014");
    			attr_dev(span80, "style", "");
    			add_location(span80, file$b, 10, 2150, 10551);
    			set_style(span81, "display", "inline-block");
    			set_style(span81, "width", "0px");
    			set_style(span81, "height", "3.991em");
    			add_location(span81, file$b, 10, 2256, 10657);
    			set_style(span82, "position", "absolute");
    			set_style(span82, "clip", "rect(3.098em, 1000.54em, 3.574em, -999.997em)");
    			set_style(span82, "top", "-4.223em");
    			set_style(span82, "left", "0.182em");
    			add_location(span82, file$b, 10, 2033, 10434);
    			set_style(span83, "display", "inline-block");
    			set_style(span83, "position", "relative");
    			set_style(span83, "width", "0.777em");
    			set_style(span83, "height", "0px");
    			add_location(span83, file$b, 10, 1665, 10066);
    			attr_dev(span84, "class", "munderover");
    			attr_dev(span84, "id", "MathJax-Span-4012");
    			add_location(span84, file$b, 10, 1617, 10018);
    			attr_dev(span85, "class", "mrow");
    			attr_dev(span85, "id", "MathJax-Span-4011");
    			add_location(span85, file$b, 10, 1575, 9976);
    			attr_dev(span86, "class", "texatom");
    			attr_dev(span86, "id", "MathJax-Span-4010");
    			set_style(span86, "padding-left", "0.182em");
    			add_location(span86, file$b, 10, 1499, 9900);
    			attr_dev(span87, "class", "mo");
    			attr_dev(span87, "id", "MathJax-Span-4015");
    			set_style(span87, "font-family", "MathJax_Main");
    			add_location(span87, file$b, 10, 2364, 10765);
    			attr_dev(span88, "class", "mo");
    			attr_dev(span88, "id", "MathJax-Span-4016");
    			set_style(span88, "font-family", "MathJax_Main");
    			set_style(span88, "padding-left", "0.182em");
    			add_location(span88, file$b, 10, 2447, 10848);
    			attr_dev(span89, "class", "mo");
    			attr_dev(span89, "id", "MathJax-Span-4017");
    			set_style(span89, "font-family", "MathJax_Main");
    			set_style(span89, "padding-left", "0.182em");
    			add_location(span89, file$b, 10, 2553, 10954);
    			attr_dev(span90, "class", "mo");
    			attr_dev(span90, "id", "MathJax-Span-4018");
    			set_style(span90, "font-family", "MathJax_Main");
    			set_style(span90, "padding-left", "0.182em");
    			add_location(span90, file$b, 10, 2659, 11060);
    			attr_dev(span91, "class", "mrow");
    			attr_dev(span91, "id", "MathJax-Span-4003");
    			add_location(span91, file$b, 10, 906, 9307);
    			set_style(span92, "display", "inline-block");
    			set_style(span92, "width", "0px");
    			set_style(span92, "height", "2.205em");
    			add_location(span92, file$b, 10, 2772, 11173);
    			set_style(span93, "position", "absolute");
    			set_style(span93, "clip", "rect(1.074em, 1006.01em, 2.562em, -999.997em)");
    			set_style(span93, "top", "-2.199em");
    			set_style(span93, "left", "0em");
    			add_location(span93, file$b, 10, 793, 9194);
    			set_style(span94, "display", "inline-block");
    			set_style(span94, "position", "relative");
    			set_style(span94, "width", "6.074em");
    			set_style(span94, "height", "0px");
    			set_style(span94, "font-size", "120%");
    			add_location(span94, file$b, 10, 690, 9091);
    			set_style(span95, "display", "inline-block");
    			set_style(span95, "overflow", "hidden");
    			set_style(span95, "vertical-align", "-0.282em");
    			set_style(span95, "border-left", "0px solid");
    			set_style(span95, "width", "0px");
    			set_style(span95, "height", "1.575em");
    			add_location(span95, file$b, 10, 2859, 11260);
    			attr_dev(span96, "class", "math");
    			attr_dev(span96, "id", "MathJax-Span-4002");
    			set_style(span96, "width", "7.324em");
    			set_style(span96, "display", "inline-block");
    			add_location(span96, file$b, 10, 601, 9002);
    			attr_dev(nobr4, "aria-hidden", "true");
    			add_location(nobr4, file$b, 10, 576, 8977);
    			add_location(mi9, file$b, 10, 3118, 11519);
    			add_location(mo7, file$b, 10, 3128, 11529);
    			attr_dev(mi10, "mathvariant", "normal");
    			add_location(mi10, file$b, 10, 3138, 11539);
    			add_location(mo8, file$b, 10, 3169, 11570);
    			attr_dev(mi11, "mathvariant", "normal");
    			add_location(mi11, file$b, 10, 3179, 11580);
    			add_location(mo9, file$b, 10, 3210, 11611);
    			add_location(mi12, file$b, 10, 3257, 11658);
    			add_location(mo10, file$b, 10, 3267, 11668);
    			add_location(mover, file$b, 10, 3250, 11651);
    			attr_dev(mrow1, "class", "MJX-TeXAtom-ORD");
    			add_location(mrow1, file$b, 10, 3220, 11621);
    			add_location(mo11, file$b, 10, 3292, 11693);
    			add_location(mo12, file$b, 10, 3302, 11703);
    			add_location(mo13, file$b, 10, 3312, 11713);
    			add_location(mo14, file$b, 10, 3322, 11723);
    			attr_dev(math4, "xmlns", "http://www.w3.org/1998/Math/MathML");
    			add_location(math4, file$b, 10, 3069, 11470);
    			attr_dev(span97, "class", "MJX_Assistive_MathML");
    			attr_dev(span97, "role", "presentation");
    			add_location(span97, file$b, 10, 3014, 11415);
    			attr_dev(span98, "class", "MathJax");
    			attr_dev(span98, "id", "MathJax-Element-349-Frame");
    			attr_dev(span98, "tabindex", "0");
    			attr_dev(span98, "data-mathml", "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mi>O</mi><mo>,</mo><mi mathvariant=\"normal\">&#x03A9;</mi><mo>,</mo><mi mathvariant=\"normal\">&#x0398;</mi><mo>,</mo><mrow class=\"MJX-TeXAtom-ORD\"><mover><mi>O</mi><mo>&#x007E;</mo></mover></mrow><mo>,</mo><mo>.</mo><mo>.</mo><mo>.</mo></math>");
    			attr_dev(span98, "role", "presentation");
    			set_style(span98, "position", "relative");
    			add_location(span98, file$b, 10, 104, 8505);
    			attr_dev(script4, "type", "math/tex");
    			attr_dev(script4, "id", "MathJax-Element-349");
    			add_location(script4, file$b, 10, 3353, 11754);
    			attr_dev(a, "href", "http://en.wikipedia.org/wiki/Big_O_notation");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$b, 11, 8, 11879);
    			add_location(p, file$b, 6, 4, 123);
    			add_location(div, file$b, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(p, span0);
    			append_dev(p, span9);
    			append_dev(span9, nobr0);
    			append_dev(nobr0, span7);
    			append_dev(span7, span5);
    			append_dev(span5, span4);
    			append_dev(span4, span2);
    			append_dev(span2, span1);
    			append_dev(span4, span3);
    			append_dev(span7, span6);
    			append_dev(span9, span8);
    			append_dev(span8, math0);
    			append_dev(math0, mi0);
    			append_dev(mi0, t4);
    			append_dev(p, script0);
    			append_dev(p, t6);
    			append_dev(p, span10);
    			append_dev(p, span23);
    			append_dev(span23, nobr1);
    			append_dev(nobr1, span21);
    			append_dev(span21, span19);
    			append_dev(span19, span18);
    			append_dev(span18, span16);
    			append_dev(span16, span12);
    			append_dev(span12, t7);
    			append_dev(span12, span11);
    			append_dev(span16, span13);
    			append_dev(span16, span14);
    			append_dev(span16, span15);
    			append_dev(span18, span17);
    			append_dev(span21, span20);
    			append_dev(span23, span22);
    			append_dev(span22, math1);
    			append_dev(math1, mi1);
    			append_dev(mi1, t11);
    			append_dev(math1, mo0);
    			append_dev(mo0, t12);
    			append_dev(math1, mi2);
    			append_dev(mi2, t13);
    			append_dev(math1, mo1);
    			append_dev(mo1, t14);
    			append_dev(p, script1);
    			append_dev(p, t16);
    			append_dev(p, span24);
    			append_dev(p, span36);
    			append_dev(span36, nobr2);
    			append_dev(nobr2, span34);
    			append_dev(span34, span32);
    			append_dev(span32, span31);
    			append_dev(span31, span29);
    			append_dev(span29, span25);
    			append_dev(span29, span26);
    			append_dev(span29, span27);
    			append_dev(span29, span28);
    			append_dev(span31, span30);
    			append_dev(span34, span33);
    			append_dev(span36, span35);
    			append_dev(span35, math2);
    			append_dev(math2, mi3);
    			append_dev(mi3, t21);
    			append_dev(math2, mo2);
    			append_dev(mo2, t22);
    			append_dev(math2, mi4);
    			append_dev(mi4, t23);
    			append_dev(math2, mo3);
    			append_dev(mo3, t24);
    			append_dev(p, script2);
    			append_dev(p, t26);
    			append_dev(p, span37);
    			append_dev(p, span68);
    			append_dev(span68, nobr3);
    			append_dev(nobr3, span66);
    			append_dev(span66, span64);
    			append_dev(span64, span63);
    			append_dev(span63, span61);
    			append_dev(span61, span39);
    			append_dev(span39, t27);
    			append_dev(span39, span38);
    			append_dev(span61, span40);
    			append_dev(span61, span60);
    			append_dev(span60, span59);
    			append_dev(span59, span43);
    			append_dev(span43, span41);
    			append_dev(span43, span42);
    			append_dev(span59, span58);
    			append_dev(span58, span56);
    			append_dev(span56, span55);
    			append_dev(span55, span44);
    			append_dev(span55, span45);
    			append_dev(span55, span53);
    			append_dev(span53, span52);
    			append_dev(span52, span48);
    			append_dev(span48, span46);
    			append_dev(span48, span47);
    			append_dev(span52, span51);
    			append_dev(span51, span49);
    			append_dev(span51, span50);
    			append_dev(span55, span54);
    			append_dev(span58, span57);
    			append_dev(span63, span62);
    			append_dev(span66, span65);
    			append_dev(span68, span67);
    			append_dev(span67, math3);
    			append_dev(math3, mi5);
    			append_dev(mi5, t35);
    			append_dev(math3, mo4);
    			append_dev(mo4, t36);
    			append_dev(math3, msup1);
    			append_dev(msup1, mn);
    			append_dev(mn, t37);
    			append_dev(msup1, mrow0);
    			append_dev(mrow0, mi6);
    			append_dev(mi6, t38);
    			append_dev(mrow0, mo5);
    			append_dev(mo5, t39);
    			append_dev(mrow0, msup0);
    			append_dev(msup0, mi7);
    			append_dev(mi7, t40);
    			append_dev(msup0, mi8);
    			append_dev(mi8, t41);
    			append_dev(mrow0, mo6);
    			append_dev(mo6, t42);
    			append_dev(p, script3);
    			append_dev(p, t44);
    			append_dev(p, span69);
    			append_dev(p, span98);
    			append_dev(span98, nobr4);
    			append_dev(nobr4, span96);
    			append_dev(span96, span94);
    			append_dev(span94, span93);
    			append_dev(span93, span91);
    			append_dev(span91, span70);
    			append_dev(span91, span71);
    			append_dev(span91, span72);
    			append_dev(span91, span73);
    			append_dev(span91, span74);
    			append_dev(span91, span75);
    			append_dev(span91, span86);
    			append_dev(span86, span85);
    			append_dev(span85, span84);
    			append_dev(span84, span83);
    			append_dev(span83, span78);
    			append_dev(span78, span76);
    			append_dev(span78, span77);
    			append_dev(span83, span82);
    			append_dev(span82, span80);
    			append_dev(span80, span79);
    			append_dev(span82, span81);
    			append_dev(span91, span87);
    			append_dev(span91, span88);
    			append_dev(span91, span89);
    			append_dev(span91, span90);
    			append_dev(span93, span92);
    			append_dev(span96, span95);
    			append_dev(span98, span97);
    			append_dev(span97, math4);
    			append_dev(math4, mi9);
    			append_dev(mi9, t57);
    			append_dev(math4, mo7);
    			append_dev(mo7, t58);
    			append_dev(math4, mi10);
    			append_dev(mi10, t59);
    			append_dev(math4, mo8);
    			append_dev(mo8, t60);
    			append_dev(math4, mi11);
    			append_dev(mi11, t61);
    			append_dev(math4, mo9);
    			append_dev(mo9, t62);
    			append_dev(math4, mrow1);
    			append_dev(mrow1, mover);
    			append_dev(mover, mi12);
    			append_dev(mi12, t63);
    			append_dev(mover, mo10);
    			append_dev(mo10, t64);
    			append_dev(math4, mo11);
    			append_dev(mo11, t65);
    			append_dev(math4, mo12);
    			append_dev(mo12, t66);
    			append_dev(math4, mo13);
    			append_dev(mo13, t67);
    			append_dev(math4, mo14);
    			append_dev(mo14, t68);
    			append_dev(p, script4);
    			append_dev(p, t70);
    			append_dev(p, a);
    			append_dev(p, t72);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Terminology', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Terminology> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide });
    	return [];
    }

    class Terminology extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Terminology",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\display_info\about\About.svelte generated by Svelte v3.41.0 */
    const file$a = "src\\components\\display_info\\about\\About.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let a0;
    	let img;
    	let img_src_value;
    	let t4;
    	let p2;
    	let a1;
    	let t6;
    	let p3;
    	let a2;
    	let t8;
    	let br0;
    	let t9;
    	let p4;
    	let t11;
    	let p5;
    	let t13;
    	let br1;
    	let t14;
    	let p6;
    	let t15;
    	let a3;
    	let t17;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "About";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Author:";
    			t3 = space();
    			p1 = element("p");
    			a0 = element("a");
    			img = element("img");
    			t4 = space();
    			p2 = element("p");
    			a1 = element("a");
    			a1.textContent = "Stephen Jordan";
    			t6 = space();
    			p3 = element("p");
    			a2 = element("a");
    			a2.textContent = "Microsoft Quantum";
    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "Last updated: February 1st, 2021";
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "Date created: April 22nd, 2011";
    			t13 = space();
    			br1 = element("br");
    			t14 = space();
    			p6 = element("p");
    			t15 = text("This is a comprehensive catalog of quantum algorithms. If you notice any errors or\r\n        omissions, please email me at stephen.jordan@microsoft.com. (Alternatively, you may\r\n        submit a pull request to the ");
    			a3 = element("a");
    			a3.textContent = "repository";
    			t17 = text(" on github.)\r\n        Your help is appreciated and will be acknowledged.");
    			add_location(h2, file$a, 5, 4, 97);
    			add_location(p0, file$a, 6, 4, 117);
    			if (!src_url_equal(img.src, img_src_value = "images/sjordanface2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50");
    			attr_dev(img, "height", "66");
    			attr_dev(img, "alt", "author photo");
    			set_style(img, "float", "left");
    			set_style(img, "margin-right", "5px");
    			add_location(img, file$a, 8, 8, 217);
    			attr_dev(a0, "href", "https://www.microsoft.com/en-us/research/people/stjorda/");
    			add_location(a0, file$a, 7, 7, 140);
    			add_location(p1, file$a, 7, 4, 137);
    			attr_dev(a1, "href", "https://www.microsoft.com/en-us/research/people/stjorda/");
    			add_location(a1, file$a, 10, 7, 356);
    			add_location(p2, file$a, 10, 4, 353);
    			attr_dev(a2, "href", "https://www.microsoft.com/en-us/research/group/microsoft-quantum-redmond-quarc/");
    			add_location(a2, file$a, 11, 7, 454);
    			add_location(p3, file$a, 11, 4, 451);
    			add_location(br0, file$a, 12, 4, 575);
    			add_location(p4, file$a, 13, 4, 585);
    			add_location(p5, file$a, 14, 4, 630);
    			add_location(br1, file$a, 15, 4, 673);
    			attr_dev(a3, "href", "https://github.com/stephenjordan/stephenjordan.github.io");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$a, 18, 37, 900);
    			add_location(p6, file$a, 16, 4, 683);
    			add_location(div, file$a, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, a0);
    			append_dev(a0, img);
    			append_dev(div, t4);
    			append_dev(div, p2);
    			append_dev(p2, a1);
    			append_dev(div, t6);
    			append_dev(div, p3);
    			append_dev(p3, a2);
    			append_dev(div, t8);
    			append_dev(div, br0);
    			append_dev(div, t9);
    			append_dev(div, p4);
    			append_dev(div, t11);
    			append_dev(div, p5);
    			append_dev(div, t13);
    			append_dev(div, br1);
    			append_dev(div, t14);
    			append_dev(div, p6);
    			append_dev(p6, t15);
    			append_dev(p6, a3);
    			append_dev(p6, t17);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\display_info\algorithm\Display_algorithm.svelte generated by Svelte v3.41.0 */
    const file$9 = "src\\components\\display_info\\algorithm\\Display_algorithm.svelte";

    // (17:4) {#key unique}
    function create_key_block(ctx) {
    	let algorithm;
    	let current;

    	algorithm = new Algorithm({
    			props: {
    				alg_data: /*$alg_to_display*/ ctx[0],
    				alone: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(algorithm.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(algorithm, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const algorithm_changes = {};
    			if (dirty & /*$alg_to_display*/ 1) algorithm_changes.alg_data = /*$alg_to_display*/ ctx[0];
    			algorithm.$set(algorithm_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(algorithm.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(algorithm.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(algorithm, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(17:4) {#key unique}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let previous_key = /*unique*/ ctx[1];
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Algorithm information";
    			t1 = space();
    			key_block.c();
    			add_location(h2, file$9, 15, 4, 340);
    			add_location(div, file$9, 14, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			key_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*unique*/ 2 && safe_not_equal(previous_key, previous_key = /*unique*/ ctx[1])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $alg_to_display;
    	validate_store(alg_to_display, 'alg_to_display');
    	component_subscribe($$self, alg_to_display, $$value => $$invalidate(0, $alg_to_display = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Display_algorithm', slots, []);
    	let unique = {};

    	function restart() {
    		$$invalidate(1, unique = {});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Display_algorithm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		alg_to_display,
    		Algorithm,
    		unique,
    		restart,
    		$alg_to_display
    	});

    	$$self.$inject_state = $$props => {
    		if ('unique' in $$props) $$invalidate(1, unique = $$props.unique);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$alg_to_display*/ 1) {
    			// Restart the component whenever the algorithm to display changes
    			(restart());
    		}
    	};

    	return [$alg_to_display, unique];
    }

    class Display_algorithm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Display_algorithm",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\display_info\Display_info.svelte generated by Svelte v3.41.0 */
    const file$8 = "src\\components\\display_info\\Display_info.svelte";

    // (30:38) 
    function create_if_block_7(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(30:38) ",
    		ctx
    	});

    	return block;
    }

    // (28:44) 
    function create_if_block_6(ctx) {
    	let terminology;
    	let current;
    	terminology = new Terminology({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(terminology.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminology, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminology.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminology.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminology, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(28:44) ",
    		ctx
    	});

    	return block;
    }

    // (26:46) 
    function create_if_block_5(ctx) {
    	let other_surveys;
    	let current;
    	other_surveys = new Other_surveys({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(other_surveys.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(other_surveys, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(other_surveys.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(other_surveys.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(other_surveys, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(26:46) ",
    		ctx
    	});

    	return block;
    }

    // (24:45) 
    function create_if_block_4(ctx) {
    	let translations;
    	let current;
    	translations = new Translations({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(translations.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(translations, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(translations.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(translations.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(translations, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(24:45) ",
    		ctx
    	});

    	return block;
    }

    // (22:43) 
    function create_if_block_3(ctx) {
    	let references;
    	let current;
    	references = new References({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(references.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(references, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(references.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(references.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(references, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(22:43) ",
    		ctx
    	});

    	return block;
    }

    // (20:48) 
    function create_if_block_2(ctx) {
    	let acknowledgments;
    	let current;
    	acknowledgments = new Acknowledgments({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(acknowledgments.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(acknowledgments, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(acknowledgments.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(acknowledgments.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(acknowledgments, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(20:48) ",
    		ctx
    	});

    	return block;
    }

    // (18:42) 
    function create_if_block_1$1(ctx) {
    	let display_algorithm;
    	let current;
    	display_algorithm = new Display_algorithm({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(display_algorithm.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(display_algorithm, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(display_algorithm.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(display_algorithm.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(display_algorithm, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(18:42) ",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if $to_display === "all_algs"}
    function create_if_block$2(ctx) {
    	let all_algs;
    	let current;
    	all_algs = new All_algs({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(all_algs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(all_algs, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(all_algs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(all_algs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(all_algs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:4) {#if $to_display === \\\"all_algs\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	const if_block_creators = [
    		create_if_block$2,
    		create_if_block_1$1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$to_display*/ ctx[0] === "all_algs") return 0;
    		if (/*$to_display*/ ctx[0] === "algorithm") return 1;
    		if (/*$to_display*/ ctx[0] === "acknowledgments") return 2;
    		if (/*$to_display*/ ctx[0] === "references") return 3;
    		if (/*$to_display*/ ctx[0] === "translations") return 4;
    		if (/*$to_display*/ ctx[0] === "other_surveys") return 5;
    		if (/*$to_display*/ ctx[0] === "terminology") return 6;
    		if (/*$to_display*/ ctx[0] === "about") return 7;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "display-info");
    			attr_dev(div, "class", "svelte-ul1a8l");
    			add_location(div, file$8, 14, 0, 692);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $to_display;
    	validate_store(to_display, 'to_display');
    	component_subscribe($$self, to_display, $$value => $$invalidate(0, $to_display = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Display_info', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Display_info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Algorithm,
    		to_display,
    		algorithms,
    		alg_to_display,
    		Acknowledgments,
    		References,
    		All_algs,
    		Translations,
    		Other_surveys,
    		Terminology,
    		About,
    		Display_algorithm,
    		$to_display
    	});

    	return [$to_display];
    }

    class Display_info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Display_info",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\menu\categories_menu\Categories_menu_tab.svelte generated by Svelte v3.41.0 */

    const file$7 = "src\\components\\menu\\categories_menu\\Categories_menu_tab.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let t_value = /*data*/ ctx[0].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "cat_menu_tab w3-round-xlarge svelte-1ezed7d");
    			toggle_class(div, "all-algs", /*data*/ ctx[0].name === "All algorithms");
    			add_location(div, file$7, 16, 0, 380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*act*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*data*/ ctx[0].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*data*/ 1) {
    				toggle_class(div, "all-algs", /*data*/ ctx[0].name === "All algorithms");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $display_algorithms;
    	let $algs_of_cat_menu;
    	let $to_display;
    	validate_store(display_algorithms, 'display_algorithms');
    	component_subscribe($$self, display_algorithms, $$value => $$invalidate(2, $display_algorithms = $$value));
    	validate_store(algs_of_cat_menu, 'algs_of_cat_menu');
    	component_subscribe($$self, algs_of_cat_menu, $$value => $$invalidate(3, $algs_of_cat_menu = $$value));
    	validate_store(to_display, 'to_display');
    	component_subscribe($$self, to_display, $$value => $$invalidate(4, $to_display = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Categories_menu_tab', slots, []);
    	let { data } = $$props;

    	function act() {
    		if (data.name === "All algorithms") {
    			set_store_value(to_display, $to_display = "all_algs", $to_display);
    		} else {
    			set_store_value(algs_of_cat_menu, $algs_of_cat_menu = data.name, $algs_of_cat_menu);
    			set_store_value(display_algorithms, $display_algorithms = true, $display_algorithms);
    		}
    	}

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Categories_menu_tab> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		to_display,
    		algs_of_cat_menu,
    		display_algorithms,
    		data,
    		act,
    		$display_algorithms,
    		$algs_of_cat_menu,
    		$to_display
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, act];
    }

    class Categories_menu_tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Categories_menu_tab",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Categories_menu_tab> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Categories_menu_tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Categories_menu_tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\menu\categories_menu\Categories_menu.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src\\components\\menu\\categories_menu\\Categories_menu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i][0];
    	child_ctx[1] = list[i][1];
    	return child_ctx;
    }

    // (11:8) {#each Object.entries(algorithms.default) as [cat, algs]}
    function create_each_block$1(ctx) {
    	let categories_menu_tab;
    	let current;

    	categories_menu_tab = new Categories_menu_tab({
    			props: { data: { "name": /*cat*/ ctx[0] } },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(categories_menu_tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(categories_menu_tab, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categories_menu_tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categories_menu_tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(categories_menu_tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:8) {#each Object.entries(algorithms.default) as [cat, algs]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let categories_menu_tab;
    	let t;
    	let div0_transition;
    	let current;

    	categories_menu_tab = new Categories_menu_tab({
    			props: { data: { "name": "All algorithms" } },
    			$$inline: true
    		});

    	let each_value = Object.entries(algorithms.default);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(categories_menu_tab.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "id", "menu");
    			attr_dev(div0, "class", "svelte-a1qz3u");
    			add_location(div0, file$6, 8, 4, 213);
    			add_location(div1, file$6, 7, 0, 202);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(categories_menu_tab, div0, null);
    			append_dev(div0, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, algorithms*/ 0) {
    				each_value = Object.entries(algorithms.default);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categories_menu_tab.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categories_menu_tab.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(categories_menu_tab);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div0_transition) div0_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Categories_menu', slots, []);
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Categories_menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide, Categories_menu_tab, algorithms });
    	return [];
    }

    class Categories_menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Categories_menu",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\menu\Menu_tab.svelte generated by Svelte v3.41.0 */

    const file$5 = "src\\components\\menu\\Menu_tab.svelte";

    // (29:4) {#if local_display_categories && $display_categories}
    function create_if_block$1(ctx) {
    	let categories_menu;
    	let current;
    	categories_menu = new Categories_menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(categories_menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(categories_menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categories_menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categories_menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(categories_menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:4) {#if local_display_categories && $display_categories}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*data*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*local_display_categories*/ ctx[1] && /*$display_categories*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "menu_tab w3-round-xlarge svelte-1k4w6yn");
    			add_location(div0, file$5, 25, 4, 753);
    			add_location(div1, file$5, 24, 0, 742);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*act*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*data*/ 1) && t0_value !== (t0_value = /*data*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (/*local_display_categories*/ ctx[1] && /*$display_categories*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*local_display_categories, $display_categories*/ 6) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $to_display;
    	let $display_categories;
    	validate_store(to_display, 'to_display');
    	component_subscribe($$self, to_display, $$value => $$invalidate(4, $to_display = $$value));
    	validate_store(display_categories, 'display_categories');
    	component_subscribe($$self, display_categories, $$value => $$invalidate(2, $display_categories = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu_tab', slots, []);
    	let { data } = $$props;
    	let local_display_categories = false;

    	function act() {
    		// Only changeable if menu tab is "Algorithm categories
    		if (data.name === "Algorithm categories") {
    			$$invalidate(1, local_display_categories = true);

    			// Toggle display_categories
    			set_store_value(display_categories, $display_categories = !$display_categories, $display_categories);
    		} else {
    			set_store_value(to_display, $to_display = data.to_display, $to_display);
    		}
    	}

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu_tab> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Categories_menu,
    		to_display,
    		data,
    		display_categories,
    		local_display_categories,
    		act,
    		$to_display,
    		$display_categories
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('local_display_categories' in $$props) $$invalidate(1, local_display_categories = $$props.local_display_categories);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, local_display_categories, $display_categories, act];
    }

    class Menu_tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu_tab",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Menu_tab> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Menu_tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Menu_tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\menu\categories_menu\algorithms_menu\Algorithms_menu_tab.svelte generated by Svelte v3.41.0 */
    const file$4 = "src\\components\\menu\\categories_menu\\algorithms_menu\\Algorithms_menu_tab.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t_value = /*data*/ ctx[0].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "alg_menu_tab w3-round-xlarge svelte-rhui3l");
    			add_location(div, file$4, 15, 0, 283);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*act*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*data*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function res() {
    	
    } // Do nothing

    function instance$4($$self, $$props, $$invalidate) {
    	let $to_display;
    	let $alg_to_display;
    	validate_store(to_display, 'to_display');
    	component_subscribe($$self, to_display, $$value => $$invalidate(2, $to_display = $$value));
    	validate_store(alg_to_display, 'alg_to_display');
    	component_subscribe($$self, alg_to_display, $$value => $$invalidate(3, $alg_to_display = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Algorithms_menu_tab', slots, []);
    	let { data } = $$props;

    	function act() {
    		set_store_value(alg_to_display, $alg_to_display = data, $alg_to_display);
    		set_store_value(to_display, $to_display = "algorithm", $to_display);
    	}

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Algorithms_menu_tab> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		alg_to_display,
    		to_display,
    		data,
    		res,
    		act,
    		$to_display,
    		$alg_to_display
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, act];
    }

    class Algorithms_menu_tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Algorithms_menu_tab",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Algorithms_menu_tab> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Algorithms_menu_tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Algorithms_menu_tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\menu\categories_menu\algorithms_menu\Algorithms_menu.svelte generated by Svelte v3.41.0 */

    const { Object: Object_1 } = globals;
    const file$3 = "src\\components\\menu\\categories_menu\\algorithms_menu\\Algorithms_menu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i][0];
    	child_ctx[2] = list[i][1];
    	return child_ctx;
    }

    // (9:4) {#each Object.entries(algorithms.default[$algs_of_cat_menu]) as [cat, algs]}
    function create_each_block(ctx) {
    	let algorithms_menu_tab;
    	let current;

    	algorithms_menu_tab = new Algorithms_menu_tab({
    			props: { data: /*algs*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(algorithms_menu_tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(algorithms_menu_tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const algorithms_menu_tab_changes = {};
    			if (dirty & /*$algs_of_cat_menu*/ 1) algorithms_menu_tab_changes.data = /*algs*/ ctx[2];
    			algorithms_menu_tab.$set(algorithms_menu_tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(algorithms_menu_tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(algorithms_menu_tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(algorithms_menu_tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:4) {#each Object.entries(algorithms.default[$algs_of_cat_menu]) as [cat, algs]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = Object.entries(algorithms.default[/*$algs_of_cat_menu*/ ctx[0]]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "menu");
    			attr_dev(div, "class", "svelte-iudhsp");
    			add_location(div, file$3, 7, 0, 223);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, algorithms, $algs_of_cat_menu*/ 1) {
    				each_value = Object.entries(algorithms.default[/*$algs_of_cat_menu*/ ctx[0]]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { "duration": 500 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { "duration": 500 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $algs_of_cat_menu;
    	validate_store(algs_of_cat_menu, 'algs_of_cat_menu');
    	component_subscribe($$self, algs_of_cat_menu, $$value => $$invalidate(0, $algs_of_cat_menu = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Algorithms_menu', slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Algorithms_menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		slide,
    		algorithms,
    		algs_of_cat_menu,
    		Algorithms_menu_tab,
    		$algs_of_cat_menu
    	});

    	return [$algs_of_cat_menu];
    }

    class Algorithms_menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Algorithms_menu",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\menu\Menu.svelte generated by Svelte v3.41.0 */
    const file$2 = "src\\components\\menu\\Menu.svelte";

    // (17:4) {#if $display_menu}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let menu_tab0;
    	let t0;
    	let menu_tab1;
    	let t1;
    	let menu_tab2;
    	let t2;
    	let menu_tab3;
    	let t3;
    	let menu_tab4;
    	let t4;
    	let menu_tab5;
    	let t5;
    	let menu_tab6;
    	let t6;
    	let div1_transition;
    	let current;

    	menu_tab0 = new Menu_tab({
    			props: {
    				data: {
    					"name": "Algorithm categories",
    					"to_display": "-"
    				}
    			},
    			$$inline: true
    		});

    	menu_tab1 = new Menu_tab({
    			props: {
    				data: {
    					"name": "Acknowledgments",
    					"to_display": "acknowledgments"
    				}
    			},
    			$$inline: true
    		});

    	menu_tab2 = new Menu_tab({
    			props: {
    				data: {
    					"name": "References",
    					"to_display": "references"
    				}
    			},
    			$$inline: true
    		});

    	menu_tab3 = new Menu_tab({
    			props: {
    				data: {
    					"name": "Translations",
    					"to_display": "translations"
    				}
    			},
    			$$inline: true
    		});

    	menu_tab4 = new Menu_tab({
    			props: {
    				data: {
    					"name": "Other Surveys",
    					"to_display": "other_surveys"
    				}
    			},
    			$$inline: true
    		});

    	menu_tab5 = new Menu_tab({
    			props: {
    				data: {
    					"name": "Terminology",
    					"to_display": "terminology"
    				}
    			},
    			$$inline: true
    		});

    	menu_tab6 = new Menu_tab({
    			props: {
    				data: { "name": "About", "to_display": "about" }
    			},
    			$$inline: true
    		});

    	let if_block = /*$display_categories*/ ctx[2] && /*$display_algorithms*/ ctx[3] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(menu_tab0.$$.fragment);
    			t0 = space();
    			create_component(menu_tab1.$$.fragment);
    			t1 = space();
    			create_component(menu_tab2.$$.fragment);
    			t2 = space();
    			create_component(menu_tab3.$$.fragment);
    			t3 = space();
    			create_component(menu_tab4.$$.fragment);
    			t4 = space();
    			create_component(menu_tab5.$$.fragment);
    			t5 = space();
    			create_component(menu_tab6.$$.fragment);
    			t6 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "menu-tabs svelte-1r3ouor");
    			add_location(div0, file$2, 18, 12, 808);
    			attr_dev(div1, "id", "menu");
    			attr_dev(div1, "class", "grid-container svelte-1r3ouor");
    			add_location(div1, file$2, 17, 8, 739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(menu_tab0, div0, null);
    			append_dev(div0, t0);
    			mount_component(menu_tab1, div0, null);
    			append_dev(div0, t1);
    			mount_component(menu_tab2, div0, null);
    			append_dev(div0, t2);
    			mount_component(menu_tab3, div0, null);
    			append_dev(div0, t3);
    			mount_component(menu_tab4, div0, null);
    			append_dev(div0, t4);
    			mount_component(menu_tab5, div0, null);
    			append_dev(div0, t5);
    			mount_component(menu_tab6, div0, null);
    			append_dev(div1, t6);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$display_categories*/ ctx[2] && /*$display_algorithms*/ ctx[3]) {
    				if (if_block) {
    					if (dirty & /*$display_categories, $display_algorithms*/ 12) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu_tab0.$$.fragment, local);
    			transition_in(menu_tab1.$$.fragment, local);
    			transition_in(menu_tab2.$$.fragment, local);
    			transition_in(menu_tab3.$$.fragment, local);
    			transition_in(menu_tab4.$$.fragment, local);
    			transition_in(menu_tab5.$$.fragment, local);
    			transition_in(menu_tab6.$$.fragment, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu_tab0.$$.fragment, local);
    			transition_out(menu_tab1.$$.fragment, local);
    			transition_out(menu_tab2.$$.fragment, local);
    			transition_out(menu_tab3.$$.fragment, local);
    			transition_out(menu_tab4.$$.fragment, local);
    			transition_out(menu_tab5.$$.fragment, local);
    			transition_out(menu_tab6.$$.fragment, local);
    			transition_out(if_block);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(menu_tab0);
    			destroy_component(menu_tab1);
    			destroy_component(menu_tab2);
    			destroy_component(menu_tab3);
    			destroy_component(menu_tab4);
    			destroy_component(menu_tab5);
    			destroy_component(menu_tab6);
    			if (if_block) if_block.d();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:4) {#if $display_menu}",
    		ctx
    	});

    	return block;
    }

    // (28:12) {#if $display_categories && $display_algorithms}
    function create_if_block_1(ctx) {
    	let div;
    	let algorithms_menu;
    	let current;
    	algorithms_menu = new Algorithms_menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(algorithms_menu.$$.fragment);
    			attr_dev(div, "class", "alg-tabs svelte-1r3ouor");
    			add_location(div, file$2, 28, 16, 1553);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(algorithms_menu, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(algorithms_menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(algorithms_menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(algorithms_menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(28:12) {#if $display_categories && $display_algorithms}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let i;
    	let i_class_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$display_menu*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(i, "id", "menu-icon");

    			attr_dev(i, "class", i_class_value = "fa fa-bars w3-button w3-ripple w3-hover-blue w3-round-large " + (/*$screen_width*/ ctx[0] > screen_width_breakpoint
    			? 'w3-large'
    			: 'w3-xxlarge') + " svelte-1r3ouor");

    			add_location(i, file$2, 15, 4, 435);
    			attr_dev(div, "class", "menu-wrapper");
    			add_location(div, file$2, 14, 0, 403);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$screen_width*/ 1 && i_class_value !== (i_class_value = "fa fa-bars w3-button w3-ripple w3-hover-blue w3-round-large " + (/*$screen_width*/ ctx[0] > screen_width_breakpoint
    			? 'w3-large'
    			: 'w3-xxlarge') + " svelte-1r3ouor")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (/*$display_menu*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$display_menu*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $screen_width;
    	let $display_menu;
    	let $display_categories;
    	let $display_algorithms;
    	validate_store(screen_width, 'screen_width');
    	component_subscribe($$self, screen_width, $$value => $$invalidate(0, $screen_width = $$value));
    	validate_store(display_menu, 'display_menu');
    	component_subscribe($$self, display_menu, $$value => $$invalidate(1, $display_menu = $$value));
    	validate_store(display_categories, 'display_categories');
    	component_subscribe($$self, display_categories, $$value => $$invalidate(2, $display_categories = $$value));
    	validate_store(display_algorithms, 'display_algorithms');
    	component_subscribe($$self, display_algorithms, $$value => $$invalidate(3, $display_algorithms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(display_menu, $display_menu = !$display_menu, $display_menu);
    		set_store_value(display_categories, $display_categories = false, $display_categories);
    		set_store_value(display_algorithms, $display_algorithms = false, $display_algorithms);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		Menu_tab,
    		display_menu,
    		display_categories,
    		display_algorithms,
    		screen_width,
    		screen_width_breakpoint,
    		Algorithms_menu,
    		$screen_width,
    		$display_menu,
    		$display_categories,
    		$display_algorithms
    	});

    	return [
    		$screen_width,
    		$display_menu,
    		$display_categories,
    		$display_algorithms,
    		click_handler
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\footer\Footer.svelte generated by Svelte v3.41.0 */

    const file$1 = "src\\components\\footer\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let small;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let br2;
    	let t9;
    	let a3;
    	let t11;
    	let a4;
    	let t13;
    	let a5;
    	let t15;
    	let br3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			small = element("small");
    			t0 = text("Portions of this document were written by Stephen Jordan while he was\r\n        an employee of the National Institute of Standards and Technology");
    			br0 = element("br");
    			t1 = text("\r\n        (NIST), an agency of the U.S. Commerce Department.");
    			br1 = element("br");
    			t2 = space();
    			a0 = element("a");
    			a0.textContent = "Privacy policy / security notice\r\n            / accessibility statement";
    			t4 = text(" /\r\n        ");
    			a1 = element("a");
    			a1.textContent = "Disclaimer";
    			t6 = text(" /\r\n        ");
    			a2 = element("a");
    			a2.textContent = "Freedom of Information Act (FOIA)";
    			t8 = text(" /\r\n        ");
    			br2 = element("br");
    			t9 = space();
    			a3 = element("a");
    			a3.textContent = "No Fear Act Policy";
    			t11 = text(" /\r\n        ");
    			a4 = element("a");
    			a4.textContent = "NIST Information Quality\r\n            Standards";
    			t13 = text(" /\r\n        ");
    			a5 = element("a");
    			a5.textContent = "Environmental Policy\r\n            Statement";
    			t15 = space();
    			br3 = element("br");
    			add_location(br0, file$1, 2, 73, 174);
    			add_location(br1, file$1, 3, 58, 238);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "http://www.nist.gov/public_affairs/privacy.cfm");
    			add_location(a0, file$1, 5, 8, 254);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "http://www.nist.gov/public_affairs/disclaimer.cfm");
    			add_location(a1, file$1, 7, 8, 414);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "http://www.nist.gov/director/foia/");
    			add_location(a2, file$1, 8, 8, 516);
    			add_location(br2, file$1, 9, 8, 626);
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "href", "http://www.nist.gov/director/civil/nofearpolicy.cfm");
    			add_location(a3, file$1, 11, 8, 642);
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "href", "http://www.nist.gov/director/quality_standards.cfm");
    			add_location(a4, file$1, 12, 8, 754);
    			attr_dev(a5, "target", "_blank");
    			attr_dev(a5, "href", "http://www.nist.gov/public_affairs/envpolicy.cfm");
    			add_location(a5, file$1, 14, 8, 894);
    			add_location(br3, file$1, 16, 8, 1026);
    			add_location(small, file$1, 1, 4, 23);
    			attr_dev(div, "id", "footer");
    			attr_dev(div, "class", "svelte-1cfq9wc");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, small);
    			append_dev(small, t0);
    			append_dev(small, br0);
    			append_dev(small, t1);
    			append_dev(small, br1);
    			append_dev(small, t2);
    			append_dev(small, a0);
    			append_dev(small, t4);
    			append_dev(small, a1);
    			append_dev(small, t6);
    			append_dev(small, a2);
    			append_dev(small, t8);
    			append_dev(small, br2);
    			append_dev(small, t9);
    			append_dev(small, a3);
    			append_dev(small, t11);
    			append_dev(small, a4);
    			append_dev(small, t13);
    			append_dev(small, a5);
    			append_dev(small, t15);
    			append_dev(small, br3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.41.0 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let header;
    	let t0;
    	let div1;
    	let search_bar;
    	let t1;
    	let div2;
    	let menu;
    	let t2;
    	let div3;
    	let display_info;
    	let t3;
    	let div4;
    	let footer;
    	let main_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[1]);
    	header = new Header({ $$inline: true });
    	search_bar = new Search_bar({ $$inline: true });
    	menu = new Menu({ $$inline: true });
    	display_info = new Display_info({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(search_bar.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(menu.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(display_info.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "header svelte-14nzddd");
    			add_location(div0, file, 54, 4, 1850);
    			attr_dev(div1, "id", "search");
    			attr_dev(div1, "class", "search-bar svelte-14nzddd");
    			add_location(div1, file, 57, 4, 1904);
    			attr_dev(div2, "id", "men");
    			attr_dev(div2, "class", "menu svelte-14nzddd");
    			add_location(div2, file, 60, 4, 1978);
    			attr_dev(div3, "class", "display-info svelte-14nzddd");
    			add_location(div3, file, 63, 4, 2037);
    			attr_dev(div4, "class", "footer svelte-14nzddd");
    			add_location(div4, file, 66, 4, 2103);

    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(/*$screen_width*/ ctx[0] > screen_width_breakpoint
    			? "grid-container"
    			: "grid-container-mobile") + " svelte-14nzddd"));

    			add_location(main, file, 53, 0, 1746);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(header, div0, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(search_bar, div1, null);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			mount_component(menu, div2, null);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			mount_component(display_info, div3, null);
    			append_dev(main, t3);
    			append_dev(main, div4);
    			mount_component(footer, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$screen_width*/ 1 && main_class_value !== (main_class_value = "" + (null_to_empty(/*$screen_width*/ ctx[0] > screen_width_breakpoint
    			? "grid-container"
    			: "grid-container-mobile") + " svelte-14nzddd"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(search_bar.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			transition_in(display_info.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(search_bar.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			transition_out(display_info.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(search_bar);
    			destroy_component(menu);
    			destroy_component(display_info);
    			destroy_component(footer);
    			mounted = false;
    			dispose();
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
    	let $show_search_results;
    	let $display_algorithms;
    	let $screen_width;
    	validate_store(show_search_results, 'show_search_results');
    	component_subscribe($$self, show_search_results, $$value => $$invalidate(2, $show_search_results = $$value));
    	validate_store(display_algorithms, 'display_algorithms');
    	component_subscribe($$self, display_algorithms, $$value => $$invalidate(3, $display_algorithms = $$value));
    	validate_store(screen_width, 'screen_width');
    	component_subscribe($$self, screen_width, $$value => $$invalidate(0, $screen_width = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	document.addEventListener("click", evt => {
    		const flyoutElement = document.getElementById("men");
    		let targetElement = evt.target; // clicked element

    		do {
    			if (targetElement === flyoutElement) {
    				// This is a click inside. Do nothing, just return.
    				return;
    			}

    			// Go up the DOM
    			targetElement = targetElement.parentNode;
    		} while (targetElement);

    		// This is a click outside.
    		set_store_value(display_algorithms, $display_algorithms = false, $display_algorithms);
    	});

    	// Check for clicks inside and outside of the search bar
    	document.addEventListener("click", evt => {
    		const flyoutElement = document.getElementById("search");
    		let targetElement = evt.target; // clicked element

    		do {
    			if (targetElement === flyoutElement) {
    				// This is a click inside. Do nothing, just return.
    				return;
    			}

    			// Go up the DOM
    			targetElement = targetElement.parentNode;
    		} while (targetElement);

    		// This is a click outside.
    		set_store_value(show_search_results, $show_search_results = false, $show_search_results);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		screen_width.set($screen_width = window.innerWidth);
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		Search_bar,
    		Display_info,
    		Menu,
    		Footer,
    		display_algorithms,
    		show_search_results,
    		screen_width,
    		screen_width_breakpoint,
    		$show_search_results,
    		$display_algorithms,
    		$screen_width
    	});

    	return [$screen_width, onwindowresize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
