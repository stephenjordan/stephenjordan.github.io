<script>
	import Header from "./components/header/Header.svelte";
    import Search_bar from "./components/search/Search_bar.svelte";
    import Display_info from "./components/display_info/Display_info.svelte";
    import Menu from "./components/menu/Menu.svelte";
    import Footer from "./components/footer/Footer.svelte";
    import {display_menu} from "./storage/globalStore";

    let name = 'world';
    let container = document.getElementById("men");
    document.addEventListener('click', function( event ) {
        if (container !== event.target && !container.contains(event.target)) {
            console.log('clicking outside the div');
            $display_menu = false;
        }
    });
</script>

<main class="grid-container">
    <div class="header">
        <Header/>
    </div>
    <div class="search-bar">
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