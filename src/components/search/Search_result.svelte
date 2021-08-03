<script>
    import {to_display, alg_to_display, show_search_results} from "../../storage/globalStore";

    export let result_data;
    export let matching_text;  // To know what to make bold

    let hovered = false;

    function mouseEnter() {
        hovered = true;
    }

    function mouseLeave() {
        hovered = false;
    }

    // Make searched text bold
    function boldQuery (str, query) {
        const n = str.toUpperCase();
        const q = query.toUpperCase();
        const x = n.indexOf(q);
        if (!q || x === -1) {
            return str; // bail early
        }
        const l = q.length;
        return str.substr(0, x) + '<b>' + str.substr(x, l) + '</b>' + str.substr(x + l);
    }

</script>


<div class:hovered={hovered} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} on:click={() => {$to_display = "algorithm"; $alg_to_display = result_data; $show_search_results = false;}}>
    <p>{@html boldQuery(result_data.name, matching_text)}</p>
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

