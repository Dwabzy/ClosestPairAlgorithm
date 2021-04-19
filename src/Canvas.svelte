<script>
  import { fabric } from "fabric-with-gestures";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let canv;
  let canvas;

  //Arrays to store the positions of ruling numbers
  let horizontalRuling = [];
  let verticalRuling = [];

  // Passed as prop from App.svelte. If it is true, do not add any more points.
  export let hasStarted = false;

  /*
    --> Iniates the Fabric Canvas and sets its height and width according to window's height and width after the component is mounted.
    --> A graph is drawn with proper ruling.
  */
  onMount(() => {
    canvas = new fabric.Canvas(canv);
    canvas.selectable = false;

    let canvasHeight = window.innerHeight - 200 - (window.innerHeight % 100);
    let canvasWidth = window.innerWidth - 200 - (window.innerWidth % 100);

    canvas.setHeight(canvasHeight + 1);
    canvas.setWidth(canvasWidth + 1);

    // Send canvas to Parent ( App.svelte ), because the "canvas" variable is needed to add objects and to animate the objects.
    dispatch("canvas", canvas);

    // Draw the graph with ruling

    console.log(canvasWidth, canvasHeight);
    // Hardcoded based on chrome, May not be the same in other browsers.
    let widthOfEachCharacter = 8.625;
    // Horizontal Lines
    for (let i = 0; i <= canvasHeight + 10; i += 10) {
      var line = new fabric.Line([0, i, window.innerWidth - 100, i], {
        stroke: (i % 100) - (canvasHeight % 100) == 0 ? "gray" : "lightgray",
        selectable: false,
        hasControls: false,
      });
      canvas.add(line);

      // Add Top and Left
      if (i % 100 === 0 && i > 0) {
        let yStart = canvasHeight;
        // Subtracting 10.5, to Centre the number vertically along with it's line.
        let top = yStart - i - 10.5;
        let left;
        let number = i / 10;

        let noOfCharacters = Math.max(Math.floor(Math.log10(number)), 0);

        // Centre all the numbers
        left = -25 - (noOfCharacters * widthOfEachCharacter) / 2;
        verticalRuling = [...verticalRuling, { top, left, number }];
      }
    }

    // Vertical lines
    for (let i = 0; i <= canvasWidth; i += 10) {
      var line = new fabric.Line([i, 0, i, canvasHeight], {
        stroke: (i % 100) - (canvasWidth % 100) == 0 ? "gray" : "lightgray",
        selectable: false,
        hasControls: false,
      });
      canvas.add(line);

      if (i % 100 === 0 && i > 0) {
        let xStart = 0;
        let bottom = -30;
        let left = xStart + i - 10.5;
        let number = i / 10;

        horizontalRuling = [...horizontalRuling, { bottom, left, number }];
      }
    }

    /*
      --> Listens to the mouse down event on the canvas and if the location is in the graph. A Fabric Circle object is created (denotes a point) and
      a "createPoint" is dispatched with the Fabric Object and the coordinates.
      
      --> The "createPoint" event is handled in the parent component (App.svelte)
    */
    canvas.on("mouse:down", function (options) {
      let x = options.e.clientX - (options.e.clientX % 10);
      let y = options.e.clientY - (options.e.clientY % 10);
      createPoint(x, y);
    });
  });

  function createPoint(x, y) {
    if (!hasStarted) {
      // Check to see if point already exists.

      if (x > 90 && y <= window.innerHeight - 200) {
        var point = new fabric.Circle({
          radius: 5,
          fill: "black",
          left: x,
          top: y,
          originX: "center",
          originY: "top",
          selectable: false,
        });

        // Add point to DOM and to the list of Point Elements
        canvas.add(point);
        dispatch("createPoint", { coordinates: { x, y }, element: point });
      }
    }
  }
</script>

<canvas bind:this={canv} width="500" height="300"> Hello </canvas>

{#each verticalRuling as ruling}
  <span class="number" style="top:{ruling.top}px; left:{ruling.left}px;">{ruling.number}</span>
{/each}
<span class="number" style="bottom:-30px; left:-25px;">0</span>
{#each horizontalRuling as ruling}
  <span class="number" style="bottom:{ruling.bottom}px; left:{ruling.left}px;">{ruling.number}</span
  >
{/each}

<style>
  .number {
    position: absolute;
    font-size: 16px;
  }
  canvas {
    cursor: default !important;
    z-index: 10;
  }
</style>
