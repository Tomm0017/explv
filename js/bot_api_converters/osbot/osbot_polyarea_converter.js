'use strict';

import {PolyArea} from '../../model/PolyArea.js';
import {Position} from '../../model/Position.js';
import {OSBotConverter} from './osbot_converter.js';

export class OSBotPolyAreaConverter extends OSBotConverter {

    /*
    API Doc:
        https://osbot.org/api/org/osbot/rs07/api/map/Area.html
        
        Area(int[][] positions)
        Area(Position[] positions)
    */
    fromJava(text, polyarea) {
        polyarea.removeAll();
        text = text.replace(/\s/g, '');
        
        var zPattern = /.setPlane\(\d\)/mg;
        var zMatch = zPattern.exec(text);
        var z = zMatch ? zMatch[1] : 0;

        var positionsPattern = /\{(\d+),(\d+)\}/mg;
        var match;
        while ((match = positionsPattern.exec(text))) {
            polyarea.add(new Position(match[1], match[2], z));
        }
    }
    
    toRaw(polyarea) {
        var output = "";
        for (var i = 0; i < polyarea.positions.length; i++) {
            output += `${polyarea.positions[i].x},${polyarea.positions[i].y}\n`;
        }
        return output;
    }
    
    toJava(polyarea) {
        if (polyarea.positions.length == 0) {
            return "";
        }
        var output = `polygon {`;
        for (var i = 0; i < polyarea.positions.length; i++) {
            output += `\n    point(${polyarea.positions[i].x}, ${polyarea.positions[i].y})`;
        }
        output += "\n}";
        return output;
    }
}