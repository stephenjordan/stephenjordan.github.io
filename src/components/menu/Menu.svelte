<script>
    import {slide} from 'svelte/transition';
    import Menu_tab from "./Menu_tab.svelte";
    import {display_menu, display_categories} from "../../storage/globalStore";
    import Algorithms_menu from "./categories_menu/algorithms_menu/Algorithms_menu.svelte";

</script>

<div class="menu-wrapper">
    <i id="menu-icon" class="fa fa-bars w3-button w3-ripple w3-hover-blue w3-xlarge w3-round-large" on:click={() => {$display_menu = !$display_menu; $display_categories = false;}}></i>
    {#if $display_menu}
        <div id="menu" class="grid-container" transition:slide>
            <div class="menu-tabs">
                <Menu_tab data={{"name": "Algorithm categories"}}/>
                <Menu_tab data={{"name": "Acknowledgements"}}/>
                <Menu_tab data={{"name": "References"}}/>
                <Menu_tab data={{"name": "Translations"}}/>
                <Menu_tab data={{"name": "Other Surveys"}}/>
                <Menu_tab data={{"name": "Terminology"}}/>
                <Menu_tab data={{"name": "About"}}/>
            </div>
            <div class="alg-tabs">
                <Algorithms_menu/>
            </div>
        </div>
        {/if}
</div>

<style>
    .menu-tabs { grid-area: menu-tabs; }
    .alg-tabs { grid-area: alg-tabs;}

    .grid-container {
        display: grid;
        grid-template-areas:
    'menu-tabs alg-tabs';
        grid-template-columns: min-content;
    }

    #menu-icon {
        transition: 0.3s;
    }

    #menu {
        text-align: center;
        min-width: 250px;
        padding: 0 35px;
    }
</style>
