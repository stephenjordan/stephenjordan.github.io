<script>
    import Algorithm from "./algorithm/Algorithm.svelte";
    import {to_display, algorithms, alg_to_display} from "../../storage/globalStore";
    import Acknowledgments from "./acknowledgments/Acknowledgments.svelte";
    import References from "./references/References.svelte";
    import All_algs from "./all_algs/All_algs.svelte";
    import Translations from "./translations/Translations.svelte";
    import Other_surveys from "./other_surveys/Other_surveys.svelte";
    import Terminology from "./terminology/Terminology.svelte";

</script>

<div id="display-info">
    {#if $to_display === "all_algs"}
        <All_algs />
    {:else if $to_display === "algorithm"}
        <h2>Algorithm information</h2>
        <Algorithm alg_data={$alg_to_display} alone={true}/>
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
    {/if}
</div>

<style>
    #display-info {
        padding: 0 15px;
    }
</style>
