<script>
    import {afterUpdate, onMount} from "svelte";

    export let alg_data;
    export let refresh;  // Determine if Mathjax needs refreshing. Helpful to avoid many unnecessary refreshes

    afterUpdate(() => {
        if (refresh) {
            MathJax.typeset();
        }
    })

</script>

<div>
    <p><b>Algorithm id</b>: {@html alg_data.alg_id}</p>
    <p><b>Name</b>: {@html alg_data.name}</p>
    <p><b>Speedup</b>: {@html alg_data.speedup}</p>
    <p><b>Description</b>: {@html alg_data.description}</p>
</div>