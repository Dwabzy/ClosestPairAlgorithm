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

  // calculate the height and width of the canvas based on the size of the window.
  let canvasHeight = window.innerHeight - 200 - (window.innerHeight % 100);
  let canvasWidth = window.innerWidth - 200 - (window.innerWidth % 100);

  // Passed as prop from App.svelte. If it is true, do not add any more points.
  export let hasStarted = false;

  /*
    --> Iniates the Fabric Canvas and sets its height and width according to window's height and width after the component is mounted.
    --> A graph is drawn with proper ruling.
  */
  onMount(() => {
    canvas = new fabric.Canvas(canv);
    canvas.selectable = false;

    canvas.setHeight(canvasHeight + 11);
    canvas.setWidth(canvasWidth + 11);

    // Send canvas to Parent ( App.svelte ), because the "canvas" variable is needed to add objects and to animate the objects.
    dispatch("canvas", canvas);

    // Hardcoded based on chrome, May not be the same in other browsers.
    let widthOfEachCharacter = 8.625;

    // Draw the graph with ruling
    // Horizontal Lines
    for (let i = 0; i <= canvasHeight; i += 10) {
      var line = new fabric.Line([5, i + 5, canvasWidth + 5, i + 5], {
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
      var line = new fabric.Line([i + 5, 5, i + 5, canvasHeight + 5], {
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
      // Get Bounding Rectangle of Canvas, so that the coordinates of the left margin can be found.
      let boundingRectangle = canv.getBoundingClientRect();
      console.log(options.e.clientY, boundingRectangle.top);
      // We subtract left and options.e.clientX by their respective remainders to center the point on the line. Same applied for the Y Coordinate
      let left = boundingRectangle.left;
      let x = Math.floor(Math.round(options.e.clientX / 10) * 10 - (left - (left % 10) + 5));
      console.log();

      let top = boundingRectangle.top;
      let y = Math.ceil(options.e.clientY - (options.e.clientY % 10) - (top - (top % 10)) - 5);

      let graphX = (x - 5) / 10;
      let graphY = (canvasHeight + 5 - y) / 10;
      createPoint(x, y, graphX, graphY);
    });
  });

  // Points are used to display the coordinates of each point on the canvas reactively whenever they are created (There is a "for each" loop in html part of this component)
  export let points = [];
  function createPoint(x, y, graphX, graphY) {
    if (!hasStarted && x > 0 && y <= canvasHeight + 5) {
      // Check to see if point already exists.
      var point = new fabric.Circle({
        radius: 5,
        fill: "black",
        left: x,
        top: y,
        originX: "center",
        originY: "center",
        selectable: false,
      });

      // Add point to DOM and to the list of Point Elements
      canvas.add(point);
      dispatch("createPoint", {
        coordinates: { x, y },
        element: point,
        graphCoordinates: { x, y, graphX, graphY },
      });
    }
  }

  export let coordinatesVisible = true;
</script>

<canvas bind:this={canv} width="500" height="300"> Hello </canvas>
{#each points as point}
  <div
    draggable="true"
    class={coordinatesVisible ? "coordinates-container visibile" : "coordinates-container hidden"}
    style="top:{point.y + 5}px; left:{point.x - 20}px;"
  >
    <div class="coordinates">
      ({point.graphX},{point.graphY})
    </div>
  </div>
{/each}

<!-- Graph Rulings, Both Vertical and Horizontal. -->
{#each verticalRuling as ruling}
  <span class="number" style="top:{ruling.top}px; left:{ruling.left}px;">{ruling.number}</span>
{/each}
<span class="number" style="bottom:-30px; left:-25px;">0</span>
{#each horizontalRuling as ruling}
  <span class="number" style="bottom:{ruling.bottom}px; left:{ruling.left}px;">{ruling.number}</span
  >
{/each}

<style type="text/scss">
  .coordinates-container {
    position: absolute;
    z-index: 20;
    opacity: 0.75;
    transition: 0.5s;

    &:hover {
      opacity: 1;
      z-index: 100;
    }
  }

  .coordinates {
    position: relative;

    height: 30px;
    width: 40px;
    background-color: white;
    padding: 0 5px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid hsl(253, 79%, 63%);
    box-shadow: 0 1px 5px hsl(253, 100%, 49%);
    border-radius: 5px;

    font-size: 0.85rem;
  }

  .number {
    position: absolute;
    font-size: 16px;
  }
  canvas {
    cursor: default !important;
    z-index: 10;
  }
</style>
