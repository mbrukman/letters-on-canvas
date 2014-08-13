// Copyright 2014 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////
//
// Renders text on HTML5 Canvas.

/**
 * @return {string} a two-character string
 */
function randomString() {
  var upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var lower = 'abcdefghijklmnopqrstuvwxyz';

  var randomLetter = function() {
    return Math.floor(Math.random() * 26);
  };

  return upper[randomLetter()] + lower[randomLetter()];
}

/**
 * @return {string} hex color, 6 characters
 */
function randomHexColor() {
  function randomHexComponent() {
    var component = Math.floor(Math.random() * 255);
    var hex = component.toString(16).toUpperCase();
    if (hex.length < 2) hex = '0' + hex;
    return hex;
  }
  var color = '';
  for (var i = 0; i < 3; ++i) {
    color += randomHexComponent();
  }
  return color;
}

/**
 * @return {string} a font family name
 */
function randomFont() {
  var FONTS = [
      'Arial',
      'Georgia',
      'Helvetica',
      'Inconsolata',
      'Lily Script One',
      'Lobster',
      'Verdana',
  ];
  return FONTS[Math.floor(Math.random() * FONTS.length)];
}

/**
 * @param {string} id
 * @param {string} color
 * @return {Object} color picker object
 */
function jsColorPicker(id, initColor) {
  var elt = document.getElementById(id);
  var picker = new jscolor.color(elt);
  picker.fromString(initColor);
  return picker;
}

/**
 * @param {string} font
 * @return {string} web-safe URI for Google Web Fonts.
 */
function webFontsFamily(font) {
  if (!font) return '';
  return font.replace(/\s+/g, ' ').replace(/ /g, '+');
}

/**
 * @param {string} hex A 6-character color spec in hex
 * @return {Array.<number>} Separate (red, green, blue) components.
 */
function hexColorToRgb(hex) {
  /**
   * @param {string} 2-character hex color
   * @return {number} Decimal equivalent of the input.
   */
  function hex2rgb(h) {
    var HEX = "0123456789ABCDEF";
    var hu = h.toUpperCase();
    return HEX.indexOf(hu[0]) * 16 + HEX.indexOf(hu[1]);
  }
  console.log('hex: ' + hex);
  var red = hex2rgb(hex.substr(0, 2));
  var grn = hex2rgb(hex.substr(2, 2));
  var blu = hex2rgb(hex.substr(4, 2));
  return [red, grn, blu];
}

/**
 * @param {Array.<number>} rgb A triplet of (red, green, blue)
 * @param {number} alpha A float in the range [0, 1]
 * @return {string} an rgb color spec: 'rgb(r, g, b, a)'
 */
function rgbAndAlphaToRgba(rgb, alpha) {
  return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
}

/**
 * @param {Object} params options for text generation
 * @return {string} rendered PNG data in URL form for embedding
 */
function renderTextHelper(params) {
  var fontLink = document.getElementById('fontLink');
  fontLink.href =
      'https://fonts.googleapis.com/css?family=' +
      webFontsFamily(params.font);

  var canvas = document.createElement('canvas');
  canvas.width = params.width;
  canvas.height = params.height;
  var context = canvas.getContext('2d');

  // Draw the background first.
  if (params.bgColor) {
    // If we have the full set of input params, this is valid.
    var rgb = hexColorToRgb(params.bgColor);
    var rgba = rgbAndAlphaToRgba(rgb, params.alpha);
    context.fillStyle = rgba;
  } else {
    // If we're in the mode of clearing the slate, take the simple path.
    context.fillStyle = '#' + params.bgColor;
  }
  context.fillRect(0, 0, params.width, params.height);

  // Draw the text on top.
  context.fillStyle = '#' + params.textColor;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.font =
    params.fontSize + params.fontSizeUnits + ' ' + params.font;
  context.fillText(params.text, params.xOffset, params.yOffset);

  return canvas.toDataURL('image/png');
}

/**
 * @param {Object} params options for text generation
 * @return {string} rendered PNG data in URL form for embedding
 */
function renderText(params) {
  // First, clear the slate by rendering with an empty font or empty text.
  renderTextHelper({});
  renderTextHelper({'font': params.font});
  renderTextHelper({});
  renderTextHelper({'text': params.text});
  renderTextHelper({});

  // Now render with the real font and real text.
  return renderTextHelper(params);
}

function LettersCtrl($scope) {

  $scope.text = randomString();

  $scope.textColor = randomHexColor();
  $scope.bgColor = randomHexColor();
  $scope.alpha = 1.0;

  $scope.textColorPicker = jsColorPicker('textColorId', $scope.textColor);
  $scope.textColorPicker.onImmediateChange = function() { $scope.$apply(); };

  $scope.bgColorPicker = jsColorPicker('bgColorId', $scope.bgColor);
  $scope.bgColorPicker.onImmediateChange = function() { $scope.$apply(); };

  $scope.fontSize = 100;
  $scope.fontSizeUnits = 'pt';

  $scope.font = 'Georgia';  // alternatively: randomFont();

  $scope.width = 250;
  $scope.height = 250;

  $scope.xOffset = $scope.width / 2;
  $scope.yOffset = $scope.height / 2;

  /**
   * @return {string} rendered PNG data in URL form for embedding
   */
  $scope.getDataUrl = function() {
    var bgColor = document.getElementById('bgColorId').value;
    var textColor = document.getElementById('textColorId').value;
    return renderText(
        {'font': $scope.font,
         'fontSize': $scope.fontSize,
         'fontSizeUnits': $scope.fontSizeUnits,
         'text': $scope.text,
         'textColor': textColor,
         'bgColor': bgColor,
         'alpha': $scope.alpha,
         'width': $scope.width,
         'height': $scope.height,
         'xOffset': $scope.xOffset,
         'yOffset': $scope.yOffset,
        });
  };
}
