<script>
  import Canvas from "./Canvas.svelte";
  import Footer from "./Footer.svelte";
  import Algorithm from "./algorithm";

  /*
    --> "pointElements" is an array of Fabric circle objects corresponding to the points on the canvas.
    --> "pointCoordinates" stores the coordinates of the points on the canvas.
  
    --> Both "pointElements" and "pointCoordinates" are used in the algorithm to find the closest pair.

    --> "points" is an array of graph coordinates that displays a rectangle next to the point to identify it's position in the graph. It is sent as props to Canvas.svelte

    --> "frames" is an array of javascript objects that are used to visualize the algorithm. They are obtained after the closest pair algorithm is 
      executed.

    --> "canvas" is used to to store the "canvas" object that is dispatched from Canvas.svelte component for animation and addition of objects.
  */
  let pointElements = [];
  let pointsCoordinates = [];
  let points = [];
  let frames = [];
  var canvas;

  // "hasStarted" is set to true when the start button is clicked. false when reset or at before clicking start button
  var hasStarted = false;

  // Called when the "canvas" event is dispatched from Canvas.svelte.
  function setCanvas(event) {
    canvas = event.detail;
  }

  // Called when the "createPoint" event is dispatched from Canvas.svelte. Checks for duplicates before adding the coordinates and Fabric object
  // to their respective arrays.
  function addPoints(event) {
    let { coordinates, element, graphCoordinates } = event.detail;

    // Check For duplicate point, So that there are no 2 points in same coordinates resulting in a shortest distance of 0.
    let duplicatePoint = pointsCoordinates.find(
      (point) => point.x === coordinates.x && point.y === coordinates.y
    );
    if (!duplicatePoint) {
      pointElements = [...pointElements, element];
      pointsCoordinates = [...pointsCoordinates, coordinates];
      points = [...points, graphCoordinates];
    }
  }

  // Called when the "start" event is dispatched from "Footer.svelte"
  function startAlgorithm() {
    hasStarted = true;
    Algorithm.findClosestPair(pointElements, pointsCoordinates);
    frames = Algorithm.getFrames();
  }

  /* 
    "isPlaying" is a boolean variable that is true when the animation is being played and false when it is paused. 
    It is sent to "Footer.svelte" asa prop

    "currentFrame" keeps track of the frame which is being animated or the last frame that was animated before being paused. 
    "duration" is the time taken to animate each object. (Developer Note: User should be able to change the duration of the animations, Change later)
  */
  var isPlaying = false;
  var currentFrame = 0;
  var duration = 2000;

  /*
    --> Called when the "play" event is dispatched from "Footer.svelte"
    --> This event is dispatched once when the start button is clicked ( and there are atleast 2 points ), and when the pause/play button is pressed.
    --> Sets "isplaying" to either "true" or "false" based on the value sent from "Footer.svelte." If "isPlaying" is true, the animation is started.

    *Note*: Animation starts from the frame after the one where is was paused. The frame being animated or paused at is tracked using the 
      "currentFrame" variable.
  */
  function playOrPause(event) {
    if (pointsCoordinates.length > 1) isPlaying = event.detail;
    if (isPlaying) startAnimation(frames);
  }

  /*
    --> Used to call the right function according to the type of the frame.
      --> "divide" when the points are split into two halves
      --> "bruteforce" when there are 3 or less than 3 points in the divided portion.
      --> "compare" when comparing the shortest distances in the two halves that were split in the "divide" frame.
      --> "strip" when the region near the midline and the points that are in this region are highlighted .
      --> "stripClosest" after the region is highlighted to draw a new line if theres a closer pair present in the strip region.
  */
  async function animateFrame(frame, duration) {
    if (frame.type === "divide") await divideVisualization(frame, duration);
    else if (frame.type === "bruteforce") await bruteForceVisualization(frame, duration);
    else if (frame.type === "compare") await comparisonVisualization(frame, duration);
    else if (frame.type === "strip") await stripVisualization(frame, duration);
    else if (frame.type === "stripClosest") await stripClosestVisualization(frame, duration);
  }

  /*
    *Note* I am calling these arrays as "memory arrays", because I just felt like it.

    --> "history" is an array of javascript objects that contains details about the objects that have been added to the canvas in each frame. So that
      these objects can be tracked and deleted/ added when frames are skipped or moved back.
      
    --> "distanceBoxes" is the array used to store distance that is displayed on the canvas over every line drawn. This loop is iterated in
      the html part of this component to display the distances next to each line connecting two points. Helps the user visualize the shorter distance.
    
    --> "currentDistanceLineObjects" stores the Fabric line objects that are present on the canvas at any given item that connects two pairs.
      This array helps to remove the longer line and manipulate when frames are forwarded or reverted.

    --> "currentMidLines" serves a similar to purpose to that of "currentDistanceLineObjects", but stores the line drawn to separate the points into
    halves.

    --> stripRegion stores the latest rectangle (highlighting the strip region) that has been added to the canvas.
  */
  let history = [];
  let distanceBoxes = [];
  let currentDistanceLineObjects = [];
  let currentMidLines = [];
  let stripRegion;

  /*
    --> Called when the nextFrame/ previousFrame buttons are pressed and when the play button is pressed.

    --> When play button is pressed, moves the currentFrame to the next one
    --> When nextFrame button is pressed. Animates the next Frame by calling the "animateFrame" function after increasing the currentFrame count.
    --> When previousFrame button is pressed. Reverts the changes that were done in the "currentFrame".
  */
  async function changeFrame(event) {
    if (event.detail === "oneFrameForward") currentFrame += 1;
    else {
      let direction = event.detail;

      // Sets duration to 0, so that when the skipping frames, the animation is faster than normal.
      duration = 0;

      if (direction === "forward") {
        currentFrame += 1;
        await animateFrame(frames[currentFrame], duration);
      }
      // When moving backwards ( I spent hours on this nonsense cuz I suck at organizing things, Yay!)
      else if (direction === "back") {
        // Finds the details corresponding to the current frame that is stored in the history.
        let currentFrameObject = history.find((item) => item.frameNumber === currentFrame);
        console.log(history, currentFrame);
        // If the currentFrame is "divide", We simply need to remove the middle line that was drawn in this frame.
        if (currentFrameObject.type === "divide") {
          canvas.remove(currentFrameObject?.line);
        }
        // For "bruteforce", We have to remove the line that was drawn connecting the closest pair in that set of points and also remove the distance
        // box floating near the line.
        else if (currentFrameObject.type === "bruteforce") {
          canvas.remove(currentFrameObject.line);
          distanceBoxes = distanceBoxes.filter((box) => box !== currentFrameObject.box);

          currentDistanceLineObjects = currentDistanceLineObjects.filter((item) => {
            item !== currentFrameObject;
          });
        }
        // When reverting a "compare" frame, We have to add the longer line and it's distance box was removed.
        // (Add line to "currentDistanceLineobjects", so that it is consistent in keeping track of lines connecting pairs.)
        else if (currentFrameObject.type === "compare") {
          distanceBoxes = [...distanceBoxes, currentFrameObject.longerBox];
          canvas.add(currentFrameObject.longerLine);

          let lineObject = {
            frameNumber: currentFrameObject.frameNumber - 1,
            type: "bruteforce",
            line: currentFrameObject.longerLine,
            distance: currentFrameObject.longerDistance,
            box: currentFrameObject.longerBox,
          };
          currentDistanceLineObjects.push(lineObject);
        } else if (currentFrameObject.type === "strip") {
          /* 
            When reverting a "strip" frame, We have to remove the rectangle set the
            color of points back to black and radius to 5.
         */
          canvas.remove(currentFrameObject.stripRegion);
          setAttributes(currentFrameObject.elements, {
            fill: "black",
            radius: 5,
          });
        } else if (currentFrameObject.type === "stripClosest") {
          /* 
            --> When reverting a "stripClosest" frame, We should add the "stripRegion" rectangle that was removed and highlight the points in the 
            strip region. 
            --> If a new shorter line was drawn, we have to remove that line and add the previous shorter line (from the previous compare frame) and add it
              back to the canvas.
            --> The midline that was removed must also be added back to the canvas and to the array tracking midlines.
          */
          canvas.add(currentFrameObject.stripRegion);
          setAttributes(currentFrameObject.elements, {
            fill: "red",
            radius: 6,
          });

          // Remove new line (if there's one)
          if (currentFrameObject.hasCloserPointsInStrip) {
            canvas.remove(currentFrameObject.line);
            canvas.add(currentFrameObject.longerLine.line);
            distanceBoxes = [...distanceBoxes, currentFrameObject.longerLine.box];
            distanceBoxes = distanceBoxes.filter((box) => box !== currentFrameObject.box);
            currentDistanceLineObjects.push(currentFrameObject.longerLine);
          }

          // Add Midline Again.
          canvas.add(currentFrameObject.midLineObject.line);
          currentMidLines.push(currentFrameObject.midLineObject);
        }

        //Reduce the "currentFrame" variable by 1 since we have gone back one frame and
        currentFrame -= 1;

        /*
          Remove the frame that was reverted from history. Because a new
          frame will be added to it when we move forward or unpause the animation. We do not want duplicates.
        */
        history = history.filter((item) => item !== currentFrameObject);
      }
    }
  }

  // "stopAnimation" is used to (as the name suggests) stop the animation when the restart button is pressed. So that It can be removed without any
  // problems.
  var stopAnimation = false;

  /*
    Starts the animation from the "currentFrame" and keeps playing until all remaining frames are animated or until the "isPlaying" variable is set to
    "false" either by the pause, restart or reset button.
  */
  async function startAnimation(frames) {
    isPlaying = true;
    stopAnimation = false;

    // Duration is hardcoded to 2000 here, Might change to a user set value in the future.
    duration = 2000;

    for (; currentFrame < frames.length; ) {
      if (!isPlaying) {
        break;
      }
      await animateFrame(frames[currentFrame], duration);
      if (isPlaying) currentFrame += 1;
    }

    // currentFrame is set to the max Frame length so that label showing the "currentFrame" in the webpage is displayed Correctly and does not show
    // a number higher than the total no. of frames.
    if (currentFrame === frames.length) {
      currentFrame = frames.length - 1;
      return;
    }
  }

  /* 
    --> Called when the "currentFrame" is of type "divide".
    --> Adds a midline separating the two halves and animates it (Object is added to both "history" and "currentMidLines" to keep track of it)
  */
  async function divideVisualization({ frameNumber, x1, y1, x2, y2 }, duration) {
    let midLine = createLine(x1, y1, x2, y1, "purple", 3);
    canvas.add(midLine);

    let midLineObject = {
      frameNumber,
      type: "divide",
      line: midLine,
    };
    history.push(midLineObject);

    currentMidLines.push(midLineObject);

    await animate(canvas, midLine, { y2: y2 }, duration);
  }

  /* 
    --> Called when the "currentFrame" is of type "bruteforce".
    --> The points that are part of the bruteforce algorithm are highlighted in blue and have the radius is increased.
    --> Adds a line connecting the closest pair from the bruteforce algorithm and adds the distance box to it.
    --> After the line is drawn, the highligted points are reverted to their original state.
  */
  async function bruteForceVisualization({ frameNumber, p1, p2, elements, distance }, duration) {
    let { x: x1, y: y1 } = p1;
    let { x: x2, y: y2 } = p2;

    // Highlight points
    setAttributes(elements, { fill: "blue", radius: 6 });

    // Add line to canvas.
    let distanceLine = createLine(x1, y1, x1, y1, "black", 1);
    canvas.add(distanceLine);
    // Add Distance Box
    let midX = (x1 + x2) / 2;
    let midY = (y1 + y2) / 2;

    // Angle at which the line is inclined.
    let theta = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    console.log(theta);
    let distanceBox = {
      left: midX,
      top: midY,
      distance,
      frameNumber,
      distanceLine,
      angle: theta,
      visibility: "hidden",
    };
    distanceBoxes = [...distanceBoxes, distanceBox];

    // Adds object to "history" and "currentDistanceLineObjects" to keep track of it
    let bruteForceObject = {
      frameNumber,
      type: "bruteforce",
      line: distanceLine,
      distance,
      box: distanceBox,
      elements,
    };
    currentDistanceLineObjects.push(bruteForceObject);
    history.push(bruteForceObject);

    await sleep(duration / 2);
    await animate(canvas, distanceLine, { x2: x2, y2: y2 }, duration / 2);

    // Revert highlighted points to original state.
    setAttributes(elements, { fill: "black", radius: 5 });
  }

  /* 
    --> Called when the "currentFrame" is of type "compare".
    --> Gets the 2 lines that are to be compared and sets their color to "orange" so that they can be identified visually.
    --> After "duration" milliseconds, The longerline is removed along with its distance box. ( From their respective memory arrays too)
    --> Reverts the highlighted points to their original state.
  */
  async function comparisonVisualization({ frameNumber }, duration) {
    let [firstLine, secondLine] = currentDistanceLineObjects.slice(-2);

    let line1 = firstLine.line;
    let line2 = secondLine.line;

    let distance1 = firstLine.distance;
    let distance2 = secondLine.distance;

    // Highlight the lines that are being compared.
    setAttributes([line1, line2], { stroke: "orange", strokeWidth: 3 });
    await sleep(duration);

    let longerBox, longerLine, longerDistance;

    // Remove longer line
    if (distance1 > distance2) {
      canvas.remove(line1);
      currentDistanceLineObjects = currentDistanceLineObjects.filter((item) => item.line !== line1);

      longerBox = distanceBoxes.find((box) => box.distanceLine === line1);
      longerLine = line1;
      longerDistance = distance1;

      distanceBoxes = distanceBoxes.filter((box) => box.distanceLine !== line1);
    } else {
      canvas.remove(line2);
      currentDistanceLineObjects = currentDistanceLineObjects.filter((item) => item.line !== line2);

      longerBox = distanceBoxes.find((box) => box.distanceLine === line2);
      longerLine = line2;
      longerDistance = distance2;

      distanceBoxes = distanceBoxes.filter((box) => box.distanceLine !== line2);
    }

    let comparisonObject = {
      frameNumber,
      type: "compare",
      longerBox,
      longerLine,
      longerDistance,
    };

    history.push(comparisonObject);

    // Revert the lines to their original state.
    setAttributes([line1, line2], { stroke: "black", strokeWidth: 1 });
  }

  /* 
    --> Called when the "currentFrame" is of type "strip".
    --> Highlights the points in that region.
  */
  async function stripVisualization({ frameNumber, x1, y1, x2, y2, elements }, duration) {
    stripRegion = createRectangle(x1, y1, 0, 0, "yellow", 0.5);
    canvas.add(stripRegion);

    history.push({ frameNumber, type: "strip", elements });
    await animate(canvas, stripRegion, { width: x2 - x1, height: y2 - y1 }, duration);

    setAttributes(elements, { fill: "red", radius: 6 });
    await sleep(duration);
  }

  /* 
    --> Called when the "currentFrame" is of type "stripClosest".
    --> If theres a closer pair in the strip, Draws a new line connecting the pair and adds a distance box to it. Removed the line connecting
      the longer pair along with it's distance box.
    --> Reverts the highlighted points to their original state.
    --> Removed the middle line that separated the 2 halves.
  */
  async function stripClosestVisualization(
    { frameNumber, p1, p2, hasCloserPointsInStrip, elements, distance },
    duration
  ) {
    let { x: x1, y: y1 } = p1;
    let { x: x2, y: y2 } = p2;
    canvas.remove(stripRegion);

    // Get Midline
    let [midLineObject] = currentMidLines.slice(-1);
    let midLine = midLineObject.line;
    currentMidLines = currentMidLines.filter((item) => item.line !== midLine);

    // Get line connecting closest pair from "compare" operation
    let [lineObject] = currentDistanceLineObjects.slice(-1);
    let stripClosestObject = {
      frameNumber,
      type: "stripClosest",
      elements,
      hasCloserPointsInStrip,
      stripRegion,
      midLineObject,
      line: lineObject,
    };

    if (hasCloserPointsInStrip) {
      // Add shorter line
      let shorterLine = createLine(x1, y1, x1, y1, "black", 1);
      canvas.add(shorterLine);

      // Add distance box for shorter line
      let midX = (x1 + x2) / 2;
      let midY = (y1 + y2) / 2;

      // Angle at which the line is inclined.
      let theta = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      console.log(theta);
      let distanceBox = {
        left: midX,
        top: midY,
        distance,
        frameNumber,
        distanceLine: shorterLine,
        angle: theta,
        visibility: "hidden",
      };
      distanceBoxes = [...distanceBoxes, distanceBox];

      // Adds extra properties to object that is to be added to history so that these changes can be reverted when moving frames back.
      stripClosestObject.box = distanceBox;
      stripClosestObject.line = shorterLine;
      stripClosestObject.longerLine = lineObject;

      history.push(stripClosestObject);

      // Remove longer line along with it's distance box.
      canvas.remove(lineObject.line);
      distanceBoxes = distanceBoxes.filter((box) => box.distanceLine !== lineObject.line);

      currentDistanceLineObjects = currentDistanceLineObjects.filter(
        (item) => item.line !== lineObject.line
      );

      let stripObject = {
        frameNumber,
        type: "stripLine",
        line: shorterLine,
        distance,
        box: distanceBox,
        stripRegion,
      };

      currentDistanceLineObjects.push(stripObject);

      await animate(canvas, shorterLine, { x2: x2, y2: y2 }, duration);
    } else {
      history.push(stripClosestObject);
    }

    setAttributes(elements, { fill: "black", radius: 5 });

    // Remove MidLine
    canvas.remove(midLine);
  }

  /*
    --> Called when "restart" button is pressed (event is dispatched from Footer.svelte).
    --> Stops Animations
    --> removes all objects on the canvas (lines, points) and the distance boxes accompanying each line connecting the closest pair.
    --> Empty arrays that store current Objects and history

    --> After a time of "duration" seconds, The animation is started again from "currentFrame" = 0
  */
  async function restartAnimation() {
    // Since "stopAnimation" is set to true, the animations are aborted ( Thanks to Fabric's animate function, Yay!)
    stopAnimation = true;

    isPlaying = false;

    for (let i = 0; i < currentDistanceLineObjects.length; i++)
      canvas.remove(currentDistanceLineObjects[i].line);
    for (let i = 0; i < currentMidLines.length; i++) canvas.remove(currentMidLines[i].line);
    canvas.remove(stripRegion);

    history = [];
    distanceBoxes = [];
    currentDistanceLineObjects = [];
    currentMidLines = [];
    currentFrame = 0;

    await sleep(duration);

    startAnimation(frames);
  }

  /*
    --> Called when "reset" button is pressed (event is dispatched from Footer.svelte).
    --> Stops Animations
    --> removes all objects on the canvas (lines, points) and the distance boxes accompanying each line connecting the closest pair.
    --> Empty arrays that store current Objects, history, points and frames.
  */
  function reset() {
    stopAnimation = true;
    isPlaying = false;
    hasStarted = false;

    for (let i = 0; i < pointElements.length; i++) canvas.remove(pointElements[i]);
    for (let i = 0; i < currentDistanceLineObjects.length; i++)
      canvas.remove(currentDistanceLineObjects[i].line);
    for (let i = 0; i < currentMidLines.length; i++) canvas.remove(currentMidLines[i].line);
    canvas.remove(stripRegion);

    pointElements = [];
    pointsCoordinates = [];
    points = [];

    history = [];
    distanceBoxes = [];
    currentDistanceLineObjects = [];
    currentMidLines = [];

    currentFrame = 0;
    frames = [];
  }

  // Helper function that stops execution of code for a given amount of time
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper function to create a new Fabric Line Object.
  let createLine = (x1, y1, x2, y2, stroke, strokeWidth) => {
    var line = new fabric.Line([x1, y1, x2, y2], {
      stroke: stroke,
      strokeWidth: strokeWidth,
      selectable: false,
    });
    return line;
  };

  // Helper function create a Fabric Rect object to visualize the strip region.
  let createRectangle = (x1, y1, width, height, color, opacity) => {
    var rect = new fabric.Rect({
      left: x1,
      top: y1,
      width: width,
      height: height,
      fill: color,
      opacity: opacity,
    });
    return rect;
  };

  // Helper function to animate Fabric objects. Stops when "stopAnimation" is set to true.
  let animate = (canvas, object, property, duration) => {
    return new Promise((resolve) => {
      object.animate(property, {
        onChange: canvas.requestRenderAll.bind(canvas),
        onComplete: function () {
          resolve();
        },
        abort: () => {
          if (stopAnimation) resolve();
          return stopAnimation;
        },
        duration: duration,
      });
    });
  };

  // Help function to change attributes of Fabric objects.
  let setAttributes = (elements, property) => {
    for (let i = 0; i < elements.length; i++) {
      elements[i].set(property);
    }
  };

  /*
    The distance boxes that are added to the DOM are hidden at first. Then after "duration" ms, The distance boxes are made visible. 
    It is done here, Since this function is called reactively.
  */
  $: {
    // Timeout function to display the box with distance only after the line is drawn on the canvas.
    let index = distanceBoxes.length - 1;
    if (distanceBoxes.length >= 1) {
      setVisibility(index);
    }
  }

  async function setVisibility(index) {
    await sleep(duration);
    if (distanceBoxes[index]) distanceBoxes[index].visibility = "visible";
  }
</script>

<div class="main-container">
  <div id=" title" class="title">
    <h1>Closest Pair Algorithm ( Divide and Conquer )</h1>
  </div>
  <div class="canvas-box">
    <Canvas on:createPoint={addPoints} on:canvas={setCanvas} {hasStarted} {points} />
    <!-- Displays all distance boxes, iteratively -->
    {#each distanceBoxes as box}
      <div
        draggable="true"
        class={box.visibility === "visible"
          ? "distance-container visibile"
          : "distance-container hidden"}
        style="top:{box.top}px; left:{box.left - 40}px;transform: rotate({box.angle % 90}deg"
      >
        <div class="distance">
          {(box.distance / 10).toFixed(2)}
        </div>
      </div>
    {/each}
  </div>
  <div class="footer-container">
    <Footer
      on:start={startAlgorithm}
      on:play={playOrPause}
      on:move={changeFrame}
      on:restart={restartAnimation}
      on:reset={reset}
      {isPlaying}
      {pointsCoordinates}
      currentFrame={currentFrame + 1}
      noOfFrames={frames.length}
    />
  </div>
</div>

<style type="text/scss">
  .main-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    height: 100vh;
  }

  .canvas-box {
    position: relative;
    margin: 0 auto;
  }

  .footer-container {
    justify-self: end;
  }

  .title {
    height: 75px;
    width: 100%;

    background: white;
    box-shadow: 0px 1px 4px hsl(0, 0%, 50%);
    z-index: 5;

    display: flex;
    justify-content: center;
    align-items: center;

    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
  }

  h1 {
    padding: 0 10px;
    font-size: 2rem;
    font-family: cursive;
  }
  .distance-container {
    position: absolute;
    z-index: 20;
    opacity: 0.75;

    transition: 0.5s;

    &:hover {
      opacity: 1;
      z-index: 100;
    }
  }

  .distance {
    position: relative;

    height: 40px;
    width: 80px;
    background-color: white;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid #4f8ff0;
    box-shadow: 0 1px 5px #2961b5;
  }
</style>
