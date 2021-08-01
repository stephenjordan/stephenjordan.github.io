import * as algorithms_ from './algorithms.json';
import * as references_ from './references.json'
import {writable} from "svelte/store";

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


export {algorithms, references, to_display, algs_of_cat_menu, display_menu, display_categories, display_algorithms, alg_to_display};
