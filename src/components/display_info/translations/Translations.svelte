<script>
    import {slide} from 'svelte/transition';
</script>

<div transition:slide>
    <h2>Translations</h2>
    <p>This page has been translated into:</p>
    <div class="navlist">
        <a href="https://www.qmedia.jp/algorithm-zoo/">Japanese</a><br>
        <a href="https://www.qtumist.com/quantum-algorithm-zoo">Chinese</a><br><br>
    </div>
</div>


<style>
    a {
        color: blue;
    }
</style>
