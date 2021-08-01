<script>
    import {references} from "../../../storage/globalStore";
    import Reference from "./Reference.svelte";
    import {afterUpdate} from "svelte";
    afterUpdate(() => {
        MathJax.typeset();
    })
</script>

<div>
    <h2>References</h2>
    {#each Object.entries(references.default) as [ref_id, reference]}
        <Reference data={reference}/>
        {/each}

</div>
