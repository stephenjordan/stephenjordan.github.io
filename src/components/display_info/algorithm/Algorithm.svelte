<script>
    import {afterUpdate, onMount} from "svelte";
    import {slide} from 'svelte/transition';
    import {references} from "../../../storage/globalStore";
    import Reference from "../references/Reference.svelte";

    export let alg_data;
    export let alone;  // Determine if Mathjax needs refreshing. Helpful to avoid many unnecessary refreshes

    afterUpdate(() => {
        if (alone) {
            MathJax.typeset();
        }
    })

    function getRelevantReferences(ref_ids) {
        let added = [];
        let to_return = [];
        // Ref_ids start at 1, not 0
        for(let i = 0; i < ref_ids.length; i++) {
            if (!added.includes(ref_ids[i])) {  // Avoid duplicates
                added.push(ref_ids[i]);
                to_return.push(references.default[ref_ids[i]]);
            }
        }

        // Sort the array of references according to ref_id
        to_return.sort(function(a, b) {
            return a.ref_id - b.ref_id;
        })

        return to_return;
    }

    let show_references = false;

    function toggleShowReferences() {
        show_references = !show_references;
    }

</script>

<div>
    <p><b>Algorithm id</b>: {@html alg_data.alg_id}</p>
    <p><b>Name</b>: {@html alg_data.name}</p>
    <p><b>Speedup</b>: {@html alg_data.speedup}</p>
    <p><b>Description</b>: {@html alg_data.description}</p>
    {#if !alone}
        <button on:click={toggleShowReferences}>Show references</button>
    {/if}
    {#if alone || show_references}
        <div transition:slide={{'duration': 1000}}>
            <p><b>References</b>:</p>
            {#each getRelevantReferences(Object.values(alg_data.references)) as reference}
                <Reference data={reference}/>
            {/each}
        </div>
    {/if}

</div>