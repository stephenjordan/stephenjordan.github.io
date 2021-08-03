<script>
    import {alg_to_display, to_display} from "../../../../storage/globalStore";

    export let data;
    function res() {
        // Do nothing
    }

    function act () {
        $alg_to_display = data;
        $to_display = "algorithm";
    }

</script>

<div class="alg_menu_tab w3-round-xlarge" on:click={act}>
    {data.name}
</div>

<style>
    .alg_menu_tab {
        font-size: 80%;
        color: white;
        background-color: #0f8061;
        width: 100%;
        padding: 15px;
        margin: 10px 0;
        transition: font-size 0.2s;
        box-shadow: 5px 5px 3px rgba(0,0,0,0.2);
        cursor: pointer;
    }

    .alg_menu_tab:hover {
        font-size: 90%;
    }

    .alg_menu_tab:active {
        box-shadow: 2px 2px 3px rgba(0,0,0,0.2);
        transform: translateY(3px) translateX(3px);
    }

</style>