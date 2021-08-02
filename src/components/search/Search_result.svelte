<script>
    import {to_display, alg_to_display, show_search_results} from "../../storage/globalStore";

    export let result_data;

    let hovered = false;

    function mouseEnter() {
        hovered = true;
    }

    function mouseLeave() {
        hovered = false;
    }

</script>


<div class:hovered={hovered} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} on:click={() => {$to_display = "algorithm"; $alg_to_display = result_data; $show_search_results = false;}}>
    <p>{result_data.name}</p>
</div>

<style>
    div {
        cursor: pointer;
        margin: 0;
        padding: 1px 0;
    }

    .hovered {
        background-color: #c1c1c2;
    }

</style>

