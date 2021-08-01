<script>
    export let data;
</script>


<div>
    <table>
        <tr>
            <td>
                <p>{data.ref_id}</p>
            </td>
            <td>

            </td>
        </tr>
        <tr>
            <td>

            </td>
            <td>
                <p>{@html data.authors}</p>
                <p>{@html data.title}</p>
                {#each Object.entries(data.links) as [link_name, url]}
                    <p><a href={url}>{link_name}</a></p>
                {/each}
                <p>{@html data.extra}</p>
            </td>
        </tr>
    </table>
</div>


<style>
    p {
        margin: 0;
    }
    div {
        margin: 0 0 10px 0;
    }
    a {
        color: blue;
    }
</style>
