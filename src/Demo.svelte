<script>
    import Youtube from "./Youtube.svelte";
    if(window.location.hash != '#r') {
        window.location.hash = 'r';
        window.location.reload(1);
    }
</script>

<div class="main-containers">
    <div id=" titles" class="titles">
        <h1>Demo Video of Closest Pair Algorithm ( Divide and Conquer )</h1>
        <Youtube videoId="V1qnXiWJlB8" />
    </div>
</div>

<style>
    .main-containers {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        height: 100vh;
    }

    .titles {
        position: relative;
        height: auto;
        width: 100%;

        background: rgb(255, 255, 255);
        box-shadow: 0px 1px 4px hsl(0, 0%, 50%);
        z-index: 5;

        justify-content: center;
        align-items: center;
        flex-wrap: wrap;

        font-family: Arial, Helvetica, sans-serif;
        text-align: center;
    }

    h1 {
        padding: 0 10px;
        font-size: 2rem;
        color: rgb(82, 6, 145);
    }

    div {
        position: relative;
    }

    
</style>
