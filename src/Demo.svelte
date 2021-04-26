<script>
    let player1, player2;
    let player1State, player2State;
    import Youtube from "./Youtube.svelte";
</script>

<div class="main-containers">
    <div id=" titles" class="titles">
        <h1>Demo Video of Closest Pair Algorithm ( Divide and Conquer )</h1>
        <Youtube videoId="M7lc1UVf-VE" />
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
