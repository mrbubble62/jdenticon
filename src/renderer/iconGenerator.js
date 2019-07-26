/**
 * Jdenticon
 * https://github.com/dmester/jdenticon
 * Copyright © Daniel Mester Pirttijärvi
 */
"use strict";

const Transform = require("./transform");
const Graphics = require("./graphics");
const shapes = require("./shapes");
const colorTheme = require("./colorTheme");
const parseHex = require("../common/parseHex");
     
/**
 * Draws an identicon to a specified renderer.
 */
function iconGenerator(renderer, hash, x, y, size, config) {
    // Set background color
    if (config.backColor) {
        renderer.setBackground(config.backColor);
    }
    
    // Calculate padding and round to nearest integer
    var padding = (0.5 + size * config.padding) | 0;
    size -= padding * 2;
    
    var graphics = new Graphics(renderer);
    
    // Calculate cell size and ensure it is an integer
    var cell = 0 | (size / 8);
    
    // Since the cell size is integer based, the actual icon will be slightly smaller than specified => center icon
    x += 0 | (padding + size / 4 - cell * 2);
    y += 0 | (padding + size / 4 - cell * 2);

    function renderShape(colorIndex, shapes, index, rotationIndex, positions) {
        var r = rotationIndex ? parseHex(hash, rotationIndex, 1) : 0,
            shape = shapes[parseHex(hash, index, 1) % shapes.length],
            i;
        
        renderer.beginShape(availableColors[selectedColorIndexes[colorIndex]]);
        
        for (i = 0; i < positions.length; i++) {
            graphics._transform = new Transform(x + positions[i][0] * cell, y + positions[i][1] * cell, cell, r++ % 4);
            shape(graphics, cell, i);
        }
        
        renderer.endShape();
    }

    // AVAILABLE COLORS
    var hue = parseHex(hash, -7) / 0xfffffff,
    
        // Available colors for this icon
        availableColors = colorTheme(hue, config),

        // The index of the selected colors
        selectedColorIndexes = [],
        index;

    function isDuplicate(values) {
        if (values.indexOf(index) >= 0) {
            for (var i = 0; i < values.length; i++) {
                if (selectedColorIndexes.indexOf(values[i]) >= 0) {
                    return true;
                }
            }
        }
    }

    for (var i = 0; i < 3; i++) {
        index = parseHex(hash, 8 + i, 1) % availableColors.length;
        if (isDuplicate([0, 4]) || // Disallow dark gray and dark color combo
            isDuplicate([2, 3])) { // Disallow light gray and light color combo
            index = 1;
        }
        selectedColorIndexes.push(index);
    }

    // ACTUAL RENDERING
    // Center
    renderShape(0, shapes.center, 1, null, [[2, 2], [3, 2], [3, 3], [2, 3]]);
    // Corners
    renderShape(1, shapes.outer, 2, 12, [[0, 0], [5, 0], [5,5], [0, 5]]);
    // Sides
    renderShape(2, shapes.outer, 3, 16, [[1, 0], [4, 0], [4, 5], [1, 5], [0, 1], [5, 1], [5, 4], [0, 4]]);		 
    renderShape(3, shapes.outer, 4, 20, [[2, 0], [3, 0], [3, 5], [2, 5], [0, 2], [5, 2], [5, 3], [0, 3]]);	
    // inner
    renderShape(4, shapes.outer, 5, 24, [[1, 1], [4, 1], [4,4], [1, 4]]);
    renderShape(1, shapes.outer, 6, 28, [[2, 1], [3, 1], [3, 4], [2, 4], [1, 2], [4, 2], [4, 3], [1, 3]]);
    
    renderer.finish();
};

module.exports = iconGenerator;
