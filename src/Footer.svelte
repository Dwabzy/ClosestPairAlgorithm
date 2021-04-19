<!-- Footer component consists of the title and the buttons used to start the algorithm and controls the animations -->
<script>
  /* Import Svg Icons used in the footer*/
  import Play from "./svg/play.svelte";
  import NextFrame from "./svg/nextFrame.svelte";
  import PreviousFrame from "./svg/previousFrame.svelte";
  import Pause from "./svg/pause.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  /* 
    Below variables are sent as props from the parent (App.svelte)
      --> CurrentFrame and noOfFrames are used to display the frame that is being animated at any give item 

      --> pointsCoordinates is used to check if there are atleast 2 points in the canvas so that the algorithm can be visualized. If 2 points are not
      present then an error message is displayed.

      --> isPlaying variable is set to true when the animation is being played or to false when it isn't, An event is dispatched to the parent based
      on the value of isPlaying. (So that the animation can be stopped or played accordingly).
  */
  export var currentFrame = "-";
  export var noOfFrames = "-";
  export var pointsCoordinates = [];
  export var isPlaying = true;

  /*
      --> displayControls is a boolean variable that is true when the animation has started and false when it hasn't. It is set to true when the start
      button is pressed and false when the reset button is pressed. Default state is in false. This variable is used to display the play, nextframe, 
      prevFrame button or the start button according to its value.

      --> errorMessage is the variable that stores the message that is to be displayed when there are less than 2 points on the canvas.

      --> errorTop stores an integer value that is -100 by default, This is used to animate the error message dropping down on to the screen. It
      is set to *75* when an error message is to be displayed with a transition of 1s.

      -->
  */
  var displayControls = false;
  var errorMessage;
  var errorTop = -100;

  /*
  --> Called when the start button is pressed.  
  
  --> Checks if there are atleast 2 points on the canvas and then if the condition is satisfied, dispatches a start event and a play event which is 
  handled in the parent component (App.svelte). 
  
  --> If there are atleast 2 points, displayControls will be set to true (so that the play/pause, nextFrame,
  previousFrame buttons are visible for use.)
 */
  function start() {
    if (pointsCoordinates.length === 0) {
      errorMessage = "Please add points by clicking on the graph!";
      errorTop = 75;
      return;
    } else if (pointsCoordinates.length === 1) {
      errorMessage = "Please add atleast one more point by clicking on the graph!";
      errorTop = 75;
      return;
    }
    displayControls = true;
    dispatch("start", "");
    dispatch("play", true);

    // errorTop is set to -100 so that it is not visible once there are atleast 2 points on the canvas and the start button is clicked.
    errorTop = -100;
  }

  /*
    --> Called when the play/pause button is clicked.

    --> Toggles the isPlaying variable. 
      -- If isPlaying is true, dispatches a "move" event that will start animating from the next frame and a "play" event which will resume 
      the animation.
      -- If isPlaying is false, dispatches a "play" event that will pause the animation.
  */
  function playOrPause() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      dispatch("move", "oneFrameForward");
      dispatch("play", true);
    } else dispatch("play", false);
  }

  //disableNext and disablePrev are boolean variables used to disabled the nextFrame / previousFrame buttons whenever necessary.
  var disableNext = false;
  var disablePrev = false;

  /*
   --> Called when the nextFrame or PreviousFrame button is clicked.
   --> Pauses the animation and moves the animation forward or backward ( according to the button that is pressed).
   --> Disables the button that is being pressed for 1/2 seconds, so that animations do not have a problem with missing objects in canvas.
   --> Also disables the buttons when there are no more frames to move to.
  */
  function moveFrames(direction) {
    isPlaying = false;
    dispatch("play", false);
    dispatch("move", direction);

    if (direction === "forward") {
      disableNext = true;
      disablePrev = false;

      setTimeout(() => {
        disableNext = false;
        if (currentFrame === noOfFrames) disableNext = true;
      }, 500);
    } else {
      disablePrev = true;
      disableNext = false;

      setTimeout(() => {
        disablePrev = false;
        if (currentFrame === 0) disablePrev = true;
      }, 500);
    }
  }

  /* Checks everytime the "currentFrame" prop is updated, if "currentFrame" is the last frame, the nextFrame button is disabled so that the user
    cannot press the button and break the program.

    The conditions specified in *moveFrames(direction)* are only checked when the nextFrame/prevFrame buttons are pressed. Therefore, if the animation
    is played automatically, the nextFrame button will not be disabled. Therefore, this condition is checked reactively whenever the "currentFrame" 
    variable is updated.
  */
  $: {
    if (currentFrame === noOfFrames) disableNext = true;
  }

  /*
    --> Called when the reset button is clicked.
    --> sets "displayControls" to false, so that the start button is visible and the animation controls are hidden.
    --> Dispatches a reset event that is handled in the parent component (App.svelte)
  */
  function reset() {
    displayControls = false;
    disablePrev = false;
    disableNext = false;
    dispatch("reset", "");
  }

  /*
    --> Called when the restart button is clicked.
    --> Dispatches a restart event that is handled in the parent component (App.svelte)
  */
  function restart() {
    dispatch("restart", "");
  }
</script>

<!-- Displays a error message if there is one, that is when atleast 2 points are not present on the canvas -->
<div class="error-message" style="top:{errorTop}px">
  {errorMessage}
</div>
<div id=" title" class="x-axis">
  <h1>Closest Pair Algorithm ( Divide and Conquer )</h1>
</div>
<div class="footer">
  <!-- Conditonally renders either the start button or the animation controls according to the boolean variable "displayControls" -->
  {#if !displayControls}
    <button on:click={start} id="start-button" class="rect-btn">Start</button>
  {:else}
    <!-- Animation Controls -->
    <div class="spacer" />
    <button id="restart-button" on:click={restart} class="rect-btn"> Restart </button>
    <button on:click={() => moveFrames("back")} disabled={disablePrev} class="control">
      <PreviousFrame />
    </button>
    <button on:click={playOrPause} class="control" id="play">
      {#if isPlaying}
        <Pause />
      {:else}
        <Play />
      {/if}
    </button>
    <button on:click={() => moveFrames("forward")} disabled={disableNext} class="control">
      <NextFrame />
    </button>
    <button on:click={reset} id="reset-button" class="rect-btn">Reset</button>
    <div class="spacer" />

    <!-- Displays the current frame that is being animated or paused at. -->
    <div id="frame-counter" class="frame-counter">
      {currentFrame > noOfFrames ? noOfFrames : currentFrame} / {noOfFrames}
    </div>
  {/if}
</div>

<style type="text/scss">
  .error-message {
    position: absolute;
    left: 50%;

    width: clamp(200px, 400px, 600px);
    height: auto;
    padding: 10px 0;

    margin-left: -200px;
    text-align: center;

    background-color: hsl(0, 72%, 72%);
    color: hsl(0, 0%, 100%);
    box-shadow: 0px 1px 5px hsl(0, 0%, 50%);

    z-index: 30;
    transition: top 1s;

    border-radius: 5px;
    border: 2px solid hsl(0, 72%, 62%);
  }
  button {
    cursor: pointer;
    outline: none;
    border: none;
    margin: 0 10px;
    background-color: transparent;
  }

  .control {
    border-radius: 50%;
    height: 75px;
    width: 75px;

    &:hover {
      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.5);
    }

    &:active {
      box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.5);
    }

    &:disabled {
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  }

  .rect-btn {
    height: 40px;
    width: 80px;

    border: 1px solid #4f8ff0;
    border-radius: 2px;

    &:hover {
      background: linear-gradient(
        180deg,
        rgba(79, 143, 240, 0) -30.56%,
        rgba(41, 97, 181, 0.47) 22.92%,
        #4f8ff0 76.39%
      );

      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.75);
    }

    &:active {
      box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.5);
    }
  }

  .frame-counter {
    position: absolute;
    right: 50px;
    height: 40px;
    width: 80px;

    margin: 0 50px;
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.25);

    text-align: center;
    line-height: 40px;
  }
  .spacer {
    flex: 1 1 auto;
  }

  .x-axis {
    height: 75px;
    width: 100%;

    background: white;
    margin: 0 10px;
    margin-top: 1px;

    z-index: 5;

    display: flex;
    justify-content: center;
    align-items: center;

    font-family: cursive;
  }

  h1 {
    font-size: 2rem;
  }

  .footer {
    width: auto;
    margin: auto 0;
    height: 100px;

    background-color: white;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 1);

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
