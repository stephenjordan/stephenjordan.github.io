<script>
    import {algorithms, show_search_results} from "../../storage/globalStore";
    import Search_result from "./Search_result.svelte";

    let text_search = "";

    function getResults(text) {
        if(text === "") {
            return [];  // Return nothing if search input is empty
        }
        let to_return = [];
        let cats = Object.values(algorithms.default);
        for(let i = 0; i < cats.length; i++) {
            let cat_algs = Object.values(cats[i]);
            for(let j = 0; j < cat_algs.length; j++) {
                if (cat_algs[j]['name'].toLowerCase().indexOf(text) > -1) {
                    to_return.push(cat_algs[j]);
                }
            }
        }
        return to_return;
    }
</script>

<div id="search-bar">
    <div class="dropdown">
        <input bind:value={text_search} id="search-input" type="text" placeholder="Search algorithms..." on:click={() => {$show_search_results = true; text_search = "";}}>
        {#if $show_search_results}
            <div class="dropdown-content">
                {#each getResults(text_search) as res}
                    <Search_result result_data={res} matching_text={text_search}/>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    #search-input {
        width: 230px;
    }
    #search-bar {
        text-align: center;
        padding: 10px;
    }

    .dropdown {
        position: relative;
        display: inline-block;
    }

    .dropdown-content {
        position: absolute;
        background-color: #f6f6f6;
        width: 230px;
        max-height: 250px;
        overflow-y: scroll;
        border: 1px solid #ddd;
        z-index: 10000;
    }

</style>