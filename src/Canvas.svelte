<script>
  import { fabric } from "fabric";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let canv;

  // Passed as prop from App.svelte. If it is true, do not add any more points.
  export let hasStarted = false;

  /*
    --> Iniates the Fabric Canvas and sets its height and width according to window's height and width after the component is mounted.
    --> A graph is drawn with proper ruling.
  */
  onMount(() => {
    let canvas = new fabric.Canvas(canv);
    canvas.selectable = false;
    canvas.setHeight(window.innerHeight - 175);
    canvas.setWidth(window.innerWidth);

    // Send canvas to Parent ( App.svelte ), because the "canvas" variable is needed to add objects and to animate the objects.
    dispatch("canvas", canvas);

    // Draw the graph with ruling
    // Horizontal Lines
    for (let i = window.innerHeight - 200; i >= 0; i -= 10) {
      if ((i % 100) - (window.innerHeight % 100) == 0) {
        var text = new fabric.Text((window.innerHeight - i - 200) / 10 + "", {
          left: 70,
          top: i - 7,
          fontSize: 15,
        });
        canvas.add(text);
      }
      var line = new fabric.Line([100, i, window.innerWidth, i], {
        stroke: (i % 100) - (window.innerHeight % 100) == 0 ? "gray" : "lightgray",
        selectable: false,
        hasControls: false,
      });
      canvas.add(line);
    }
    // Vertical lines
    for (let i = window.innerWidth; i >= 0; i -= 100) {
      if ((i % 100) - (window.innerWidth % 100) == 0 && i - (window.innerWidth % 100) != 0) {
        let left = 93 + i - (window.innerWidth % 100);
        if (i >= 2000) left = 90 + i - (window.innerWidth % 100);
        var text = new fabric.Text((i - (window.innerWidth % 100)) / 10 + "", {
          left: left,
          top: window.innerHeight - 195,
          fontSize: 15,
          selectable: false,
          hasControls: false,
        });
        canvas.add(text);
      }
      for (let j = 0; j <= 100; j += 10) {
        var line = new fabric.Line(
          [
            i + j + 100 - (window.innerWidth % 100),
            0,
            i + j + 100 - (window.innerWidth % 100),
            window.innerHeight - 200,
          ],
          {
            stroke: ((i + j) % 100) - (window.innerWidth % 100) == 0 ? "gray" : "lightgray",
            selectable: false,
            hasControls: false,
          }
        );
        canvas.add(line);
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

    canvas.on("touch:start", function (options) {
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

<canvas bind:this={canv} width="500" height="300" />

<style>
  canvas {
    cursor: default !important;
  }
</style>
