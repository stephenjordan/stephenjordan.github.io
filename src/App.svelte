<script>
	import Header from "./components/header/Header.svelte";
    import Search_bar from "./components/search/Search_bar.svelte";
    import Display_info from "./components/display_info/Display_info.svelte";
    import Menu from "./components/menu/Menu.svelte";
    import Footer from "./components/footer/Footer.svelte";
    import {display_algorithms, display_categories, display_menu, show_search_results} from "./storage/globalStore";

    // Check for clicks inside and out of the menu
    document.addEventListener("click", (evt) => {
        const flyoutElement = document.getElementById("men");
        let targetElement = evt.target; // clicked element

        do {
            if (targetElement === flyoutElement) {
                // This is a click inside. Do nothing, just return.
                return;
            }
            // Go up the DOM
            targetElement = targetElement.parentNode;
        } while (targetElement);

        // This is a click outside.
        $display_algorithms = false;
    });

    // Check for clicks inside and outside of the search bar
    document.addEventListener("click", (evt) => {
        const flyoutElement = document.getElementById("search");
        let targetElement = evt.target; // clicked element

        do {
            if (targetElement === flyoutElement) {
                // This is a click inside. Do nothing, just return.
                return;
            }
            // Go up the DOM
            targetElement = targetElement.parentNode;
        } while (targetElement);

        // This is a click outside.
        $show_search_results = false;
    });

</script>

<main class="grid-container">
    <div class="header">
        <Header/>
    </div>
    <div id="search" class="search-bar">
        <Search_bar/>
    </div>
    <div id="men" class="menu">
        <Menu/>
    </div>
    <div class="display-info">
        <Display_info/>
    </div>
    <div class="footer">
        <Footer/>
    </div>
</main>

<style>
    .header { grid-area: header; }
    .search-bar { grid-area: search-bar; }
    .menu { grid-area: menu;}
    .display-info { grid-area: display-info;}
    .footer { grid-area: footer; }

    .grid-container {
        display: grid;
        grid-template-areas:
    'header header'
    'search-bar search-bar'
    'menu display-info'
    'footer footer';
        grid-template-columns: min-content;
    }

</style>