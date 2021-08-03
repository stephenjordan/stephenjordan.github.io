<script>
    import {alg_to_display} from "../../../storage/globalStore";
    import Algorithm from "./Algorithm.svelte";


    let unique = {};

    function restart() {
        unique = {};
    }

    // Restart the component whenever the algorithm to display changes
    $: $alg_to_display, restart();
</script>
<div>
    <h2>Algorithm information</h2>
    {#key unique}
        <Algorithm alg_data={$alg_to_display} alone={true}/>
    {/key}
</div>
