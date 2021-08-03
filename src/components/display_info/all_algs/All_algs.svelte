<script>
    import {algorithms} from "../../../storage/globalStore";
    import {afterUpdate} from "svelte";
    import {slide} from 'svelte/transition';
    import All_cat_algs from "./All_cat_algs.svelte";

    afterUpdate(() => {
        MathJax.typeset();
    })

</script>

<div transition:slide>
    <h2>All algorithms</h2>
    {#each Object.entries(algorithms.default) as [category, algs]}
        <All_cat_algs category_data={{"name": category, "algs": algs}} />
    {/each}
</div>
