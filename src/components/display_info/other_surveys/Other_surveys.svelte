<script>
    import {slide} from 'svelte/transition';
</script>

<div transition:slide>
    <h2>Other Surveys</h2>
    <p>For overviews of quantum algorithms I recommend:</p>
    <div class="navlist">
        <a href="http://www.amazon.com/Quantum-Computation-Information-Cambridge-Sciences/dp/0521635039">Nielsen
            and Chuang</a> <br>
        <a href="http://www.cs.umd.edu/~amchilds/qa/">Childs</a><br>
        <a href="http://theory.caltech.edu/~preskill/ph229/">Preskill</a><br>
        <a href="http://arxiv.org/abs/0808.0369">Mosca</a><br>
        <a href="http://arxiv.org/abs/0812.0380">Childs and van Dam</a><br>
        <a href="http://arxiv.org/abs/1206.6126">van Dam and Sasaki</a><br>
        <a href="http://cacm.acm.org/magazines/2010/2/69352-recent-progress-in-quantum-algorithms/fulltext">Bacon and van Dam</a><br>
        <a href="http://arxiv.org/abs/1511.04206">Montanaro</a><br>
        <a href="https://www.amazon.com/Quantum-Computing-Approach-Jack-Hidary/dp/3030239217/">Hidary</a><br><br>
    </div>
</div>


<style>
    a {
        color: blue;
    }
</style>
