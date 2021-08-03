<script>
    import Algorithm from "../algorithm/Algorithm.svelte";
    import {afterUpdate} from "svelte";
    import {slide} from 'svelte/transition';

    afterUpdate(() => {
        MathJax.typeset();
    })

    export let category_data;

</script>

<div transition:slide>
    <h3>{category_data.name}</h3>
    {#each Object.entries(category_data.algs) as [alg_id, alg]}
        <Algorithm alg_data={alg} alone={false}/>
        <hr/>
    {/each}
</div>



