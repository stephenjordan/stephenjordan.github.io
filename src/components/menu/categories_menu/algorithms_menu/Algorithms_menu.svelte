<script>
    import {slide} from 'svelte/transition';
    import {algorithms, algs_of_cat_menu} from "../../../../storage/globalStore";
    import Algorithms_menu_tab from "./Algorithms_menu_tab.svelte";

    console.log(algorithms.default[$algs_of_cat_menu]);

</script>

<div>
    <div id="menu" transition:slide>
        {#each Object.entries(algorithms.default[$algs_of_cat_menu]) as [cat, algs]}
            <Algorithms_menu_tab data={algs}/>
        {/each}
    </div>
</div>

<style>
    #menu {
        text-align: center;
        padding: 0 15px;
    }
</style>
