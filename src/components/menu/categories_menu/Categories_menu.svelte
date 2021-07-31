<script>
    import {slide} from 'svelte/transition';
    import Categories_menu_tab from "./Categories_menu_tab.svelte";
    import {algorithms} from "../../../storage/globalStore";

</script>

<div>
    <div id="menu" transition:slide>
        {#each Object.entries(algorithms.default) as [cat, algs]}
            <Categories_menu_tab data={{"name": cat}}/>
            {/each}
    </div>
</div>

<style>
    #menu {
        text-align: center;
        padding: 0 15px;
    }
</style>
