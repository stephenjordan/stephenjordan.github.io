<script>
    import Algorithm from "./algorithm/Algorithm.svelte";
    import {to_display, algorithms} from "../../storage/globalStore";

</script>

<div id="display-info">
    {#if to_display === "all_algs"}
        <h2>All algorithms</h2>
        {#each Object.entries(algorithms.default) as [category, algs]}
            {#each Object.entries(algs) as [alg_id, alg]}
                <Algorithm alg_data={alg}/>
                <hr/>
                {/each}
            {/each}
        {/if}
</div>

<style>
    #display-info {
        padding: 0 15px;
    }
</style>
