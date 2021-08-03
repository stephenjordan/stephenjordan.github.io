<script>
    import Categories_menu from "./categories_menu/Categories_menu.svelte";
    import {to_display} from "../../storage/globalStore";

    export let data;

    // Section specialized for when the menu tab is "Algorithm categories"
    import {display_categories} from "../../storage/globalStore";

    let local_display_categories = false;

    function act() {
        // Only changeable if menu tab is "Algorithm categories
        if (data.name === "Algorithm categories") {
            local_display_categories = true;
            // Toggle display_categories
            $display_categories = !$display_categories;
        } else {
            $to_display = data.to_display;
        }
    }

</script>

<div>
    <div class="menu_tab w3-round-xlarge" on:click={act}>
        {data.name}
    </div>
    {#if local_display_categories && $display_categories}
        <Categories_menu/>
    {/if}
</div>

<style>
    .menu_tab {
        color: white;
        background-color: #19a8d3;
        width: 100%;
        padding: 15px;
        margin: 10px 10px 10px 0;
        transition: font-size 0.2s;
        min-width: 200px;
        box-shadow: 5px 5px 3px rgba(0,0,0,0.2);
        cursor: pointer;
    }

    .menu_tab:hover {
        font-size: 110%;
    }

    .menu_tab:active {
        box-shadow: 2px 2px 3px rgba(0,0,0,0.2);
        transform: translateY(3px) translateX(3px);
    }

</style>