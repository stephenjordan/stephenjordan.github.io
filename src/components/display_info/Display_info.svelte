<script>
    import Algorithm from "./algorithm/Algorithm.svelte";
    import {to_display, cat_to_display} from "../../storage/globalStore";
    import Acknowledgments from "./acknowledgments/Acknowledgments.svelte";
    import References from "./references/References.svelte";
    import All_algs from "./all_algs/All_algs.svelte";
    import Translations from "./translations/Translations.svelte";
    import Other_surveys from "./other_surveys/Other_surveys.svelte";
    import Terminology from "./terminology/Terminology.svelte";
    import About from "./about/About.svelte";
    import Display_algorithm from "./algorithm/Display_algorithm.svelte";
    import All_cat_algs from "./all_algs/All_cat_algs.svelte";

</script>

<div id="display-info">
    {#if $to_display === "all_algs"}
        <All_algs />
    {:else if $to_display === "category"}
        <All_cat_algs category_data={$cat_to_display} />
    {:else if $to_display === "algorithm"}
        <Display_algorithm />
    {:else if $to_display === "acknowledgments"}
        <Acknowledgments/>
    {:else if $to_display === "references"}
        <References/>
    {:else if $to_display === "translations"}
        <Translations/>
    {:else if $to_display === "other_surveys"}
        <Other_surveys/>
    {:else if $to_display === "terminology"}
        <Terminology/>
    {:else if $to_display === "about"}
        <About/>
    {/if}
</div>

<style>
    #display-info {
        padding: 0 15px 35px 15px;
    }
</style>
