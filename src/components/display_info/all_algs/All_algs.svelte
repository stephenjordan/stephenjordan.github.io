<script>
    import {algorithms} from "../../../storage/globalStore";
    import Algorithm from "../algorithm/Algorithm.svelte";
    import {afterUpdate} from "svelte";

    afterUpdate(() => {
        MathJax.typeset();
    })

</script>

<div>
    <h2>All algorithms</h2>
    {#each Object.entries(algorithms.default) as [category, algs]}
        {#each Object.entries(algs) as [alg_id, alg]}
            <Algorithm alg_data={alg} alone={false}/>
            <hr/>
        {/each}
    {/each}
</div>
