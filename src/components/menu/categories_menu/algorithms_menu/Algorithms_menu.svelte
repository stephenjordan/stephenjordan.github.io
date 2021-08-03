<script>
    import {slide} from 'svelte/transition';
    import {algorithms, algs_of_cat_menu} from "../../../../storage/globalStore";
    import Algorithms_menu_tab from "./Algorithms_menu_tab.svelte";
    import Algorithms_menu_cat_tab from "./Algorithms_menu_cat_tab.svelte";

</script>

<div id="menu" transition:slide={{"duration": 500}}>
    <Algorithms_menu_cat_tab category_data={{"name": $algs_of_cat_menu, "algs": algorithms.default[$algs_of_cat_menu]}} />
    {#each Object.entries(algorithms.default[$algs_of_cat_menu]) as [cat, algs]}
        <Algorithms_menu_tab data={algs}/>
    {/each}
</div>

<style>
    #menu {
        text-align: center;
        padding: 0 15px 15px 15px;
        max-height: 785px;
        overflow-y: scroll;
    }
</style>
