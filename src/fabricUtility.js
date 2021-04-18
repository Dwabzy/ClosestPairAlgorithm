exports.createLine = (x1, y1, x2, y2, stroke, strokeWidth) => {
  var line = new fabric.Line([x1, y1, x2, y2], {
    stroke: stroke,
    strokeWidth: strokeWidth,
  });
  return line;
};

exports.createRectangle = (x1, y1, width, height, color, opacity) => {
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

exports.animate = (canvas, object, property, duration, stopAnimation) => {
  return new Promise((resolve) => {
    object.animate(property, {
      onChange: canvas.requestRenderAll.bind(canvas),
      onComplete: function () {
        resolve();
      },
      abort: () => {
        console.log(stopAnimation);
        return stopAnimation;
      },
      duration: duration,
    });
  });
};

exports.setAttributes = (elements, property) => {
  for (let i = 0; i < elements.length; i++) {
    elements[i].set(property);
  }
};
