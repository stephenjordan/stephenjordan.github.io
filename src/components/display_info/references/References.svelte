<script>
    import {references} from "../../../storage/globalStore";
    import Reference from "./Reference.svelte";
    import {afterUpdate} from "svelte";
    import {slide} from 'svelte/transition';
    afterUpdate(() => {
        MathJax.typeset();
    })
</script>

<div transition:slide>
    <h2>References</h2>
    {#each Object.entries(references.default) as [ref_id, reference]}
        <Reference data={reference}/>
        {/each}

</div>
