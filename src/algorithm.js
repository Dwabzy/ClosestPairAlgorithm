// Closest Pair Algorithm

/*
  --> "frames" is an array that stores javascript object containing each frame in the algorithm (divide, bruteforce, compare, strip, stripClosest)
  --> yStart and yEnd are variables to define the start and end position of the middle line. yStart corresponds to the y Value of the topmost point
    and yEnd corresponds to the y value of the bottom most point.
  --> frameNumber, as the name suggests, keeps count of the number of frames and helps identify each frame.
*/
var frames = [];
var yStart, yEnd;
var frameNumber = 0;

// Getter method to return frames to App.svelte, so that the algorithm can be visualized.
let getFrames = () => {
  return frames;
};

let findClosestPair = (pointElements, pointsCoordinates) => {
  frameNumber = 0;
  frames = [];
  let { points: sortedX, elements: eX } = insertionSort(
    pointsCoordinates.slice(),
    pointElements.slice(),
    "x"
  );
  let { points: sortedY, elements: eY } = insertionSort(
    pointsCoordinates.slice(),
    pointElements.slice(),
    "y"
  );
  let n = pointsCoordinates.length;

  // Initialize the start coordinate with the lowest Y value and end Coordinate with Highest Y value for proper visualization.
  yStart = sortedY[0].y - 10;
  yEnd = sortedY[n - 1].y + 20;

  return closestPair(sortedX, n, eX);
};

let getDistance = (a, b) => {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
};

let bruteForce = (p, n, elements) => {
  // Brute Force Algorithm
  let distance = Infinity;
  let p1, p2;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let newDistance = getDistance(p[i], p[j]);
      if (newDistance < distance) {
        distance = newDistance;
        p1 = p[i];
        p2 = p[j];
      }
    }
  }

  distance = Math.sqrt(distance);
  let frame = {
    frameNumber: frameNumber++,
    type: "bruteforce",
    p1,
    p2,
    elements,
    distance,
  };
  frames.push(frame);
  return { d: distance, points: { p1, p2 } };
};

let stripClosest = (strip, n, distance, points, elements) => {
  // Points sorted in ascending order based on y co-ordinate
  let distanceSq = distance * distance;
  let { p1, p2 } = points;
  let hasCloserPointsInStrip = false;

  // Sort elements based on y coordinate.
  let { points: stripPoints, elements: stripElements } = insertionSort(
    strip.slice(),
    elements.slice(),
    "y"
  );

  for (let i = 0; i < n - 1; i++) {
    let j = i + 1;
    while (j < n && Math.pow(stripPoints[j].y - stripPoints[i].y, 2) < distanceSq) {
      if (getDistance(stripPoints[i], stripPoints[j]) < distanceSq) {
        distanceSq = getDistance(stripPoints[i], stripPoints[j]);
        p1 = stripPoints[i];
        p2 = stripPoints[j];
        hasCloserPointsInStrip = true;
      }
      j++;
    }
  }
  distance = Math.sqrt(distanceSq);
  let frame = {
    frameNumber: frameNumber++,
    type: "stripClosest",
    p1,
    p2,
    hasCloserPointsInStrip,
    elements: stripElements,
    distance,
  };
  frames.push(frame);

  return { d: distance, points: { p1, p2 } };
};

let closestPair = (p, n, eX) => {
  if (n <= 3) {
    // Brute Force algorithm is used when there are 3 points are lesser.
    return bruteForce(p, n, eX);
  } else {
    let mid = Math.floor(n / 2);
    let midPoint = p[mid];

    /* Split into 2 sub arrays
        pLeft and pRight are subArrays of P ( Sorted based on X Co-ordinate)
        qLeft and qRight are subArrays of Q ( Sorted based on Y Co-ordinate)

        Also Splits the element arrays into subarrays ( eX: Sorted based on X Co-ordinate, eY: Sorted based on Y Co-ordinate)
      */
    let pLeft = p.slice(0, mid);
    let pRight = p.slice(mid, n);
    let exLeft = eX.slice(0, mid);
    let exRight = eX.slice(mid, n);

    // Split into two frame, (Draws midline)
    let frame = {
      frameNumber: frameNumber++,
      type: "divide",
      x1: midPoint.x,
      y1: yStart,
      x2: midPoint.x,
      y2: yEnd,
    };
    frames.push(frame);

    // Get Shortest Distance from Left Side
    let left = closestPair(pLeft, pLeft.length, exLeft);
    let { d: dLeft, points: pointsLeft } = left;

    // Get Shortest Distance from Right Side
    let right = closestPair(pRight, pRight.length, exRight);
    let { d: dRight, points: pointsRight } = right;

    // Find the shortest distance and highlight the 2 lines that are being compared.
    let distance = Math.min(dLeft, dRight);
    let points;
    if (distance === dLeft) {
      points = pointsLeft;
    } else {
      points = pointsRight;
    }

    // Compare shortest distance between left half and right half
    frame = {
      frameNumber: frameNumber++,
      type: "compare",
    };
    frames.push(frame);

    // Check strip near midline
    let strip = [];
    let stripElements = [];
    for (let i = 0; i < n; i++) {
      if (Math.abs(p[i].x - midPoint.x) < distance) {
        strip.push(p[i]);
        stripElements.push(eX[i]);
      }
    }

    // Show the points inside the split, that is points that are within *distance* from the mid line
    frame = {
      frameNumber: frameNumber++,
      type: "strip",
      x1: Math.abs(midPoint.x - distance),
      y1: yStart,
      x2: Math.abs(midPoint.x + distance),
      y2: yEnd,
      elements: stripElements,
    };
    frames.push(frame);

    return stripClosest(strip, strip.length, distance, points, stripElements);
  }
};

// Could change to merge sort later for better time complexity.

function insertionSort(points, elements, prop) {
  let n = points.length;
  for (let i = 1; i < n; i++) {
    // Choosing the first element in our unsorted subarray
    let current = points[i];
    let currentElement = elements[i];
    // The last element of our sorted subarray
    let j = i - 1;
    while (j > -1 && current[prop] < points[j][prop]) {
      points[j + 1] = points[j];
      elements[j + 1] = elements[j];
      j--;
    }
    points[j + 1] = current;
    elements[j + 1] = currentElement;
  }
  return { points, elements };
}

export default { getFrames, findClosestPair };
