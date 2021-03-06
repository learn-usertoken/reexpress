// barycentric alpha blending demo.
// Authors: Steven Ruppert and Daria Tolmacheva
// For Final Project, CSCI 561 Advanced Graphics, Spring 2014,
// at the Colorado School of Mines
//
// Based on the techniques described in
// "Performance-Driven Hand-Drawn Animation"
// http://gfx.cs.princeton.edu/gfx/pubs/Buck_2000_PHA/index.php
"use strict";

var otx = document.getElementById('output').getContext('2d');

var points = [
  [50, 50],
  [450, 50],
  [250, 450],
];

var cursor = [250, 200];

var inputs = [
  document.getElementById('i1'),
  document.getElementById('i2'),
  document.getElementById('i3'),
];

var images = [
  new Image,
  new Image,
  new Image,
];

var $triangle = d3.select('#triangle')
  , $cursor = d3.select('#cursor')
  , $images = d3.selectAll('.image');

$images.data(points)
  .attr('x', function (d) { return d[0] - 50; })
  .attr('y', function (d) { return d[1] - 50; })
  .attr('width', 100)
  .attr('height', 100);

$triangle.attr('d', d3.svg.line()(points) + 'Z');

// ((x1, y1), (x2, y2), (x3, y3)) -> (x, y) -> (u, v, w)
// w is technically redundant, since u + v + w = 1
// https://en.wikipedia.org/wiki/Barycentric_coordinate_system#Converting_to_barycentric_coordinates
function barycentric(t, cursor) {
  var x = cursor[0], y = cursor[1]
    , x1 = t[0][0], y1 = t[0][1]
    , x2 = t[1][0], y2 = t[1][1]
    , x3 = t[2][0], y3 = t[2][1]
    , det = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3))
    , u, v;

  return [
    u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / det,
    v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / det,
    1 - u - v
  ];
}

function draw() {
  $cursor.attr('cx', cursor[0]).attr('cy', cursor[1]);
  // calculate barycentric coordinates of cursor
  var bary = barycentric(points, cursor);

  // now draw output, with barycentric points as weight
  otx.clearRect(0, 0, 500, 500);
  otx.globalAlpha = bary[0];
  otx.drawImage(images[0], 0, 0);
  otx.globalAlpha = bary[1];
  otx.drawImage(images[1], 0, 0);
  otx.globalAlpha = bary[2];
  otx.drawImage(images[2], 0, 0);
}

var debounced = debounce(10, draw);

inputs.forEach(function (input, i) {
  function bind() {
    if (input.files.length === 0) return;

    var url = window.URL.createObjectURL(input.files[0]);
    var img = images[i];
    img.src = url;

    var simg = d3.select('#si' + i);
    simg.attr('xlink:href', url);

    img.onload = function () {
      window.URL.revokeObjectURL(img.src); // don't need it anymore
      debounced();
    };
  }

  input.addEventListener('change', bind);

  // when page is loaded, the input element should
  // retain its selection, so also try to bind right now.
  bind();
});

var drag = d3.behavior.drag()
  .origin(function () {
    return {x: cursor[0], y: cursor[1]};
  })
  .on('drag', function () {
    cursor[0] = d3.event.x;
    cursor[1] = d3.event.y;
    debounced();
  });

$cursor.call(drag);

draw();
