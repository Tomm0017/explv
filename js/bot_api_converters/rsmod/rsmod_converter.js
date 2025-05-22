'use strict';

import {Converter} from '../converter.js';
import {Position} from '../../model/Position.js';

export class RsModConverter extends Converter {

    constructor() {
        super();
    }

    fromText(text, path) {
        path.removeAll();
        text = text.replace(/\s/g, '');
        let regex = /vertex\(VertexCoord\((\d+),(\d+),(\d+),(\d+)\)\)/mg
        let match;
        while ((match = regex.exec(text))) {
            let mx = parseInt(match[1], 10);
            let mz = parseInt(match[2], 10);
            let lx = parseInt(match[3], 10);
            let lz = parseInt(match[4], 10);
            let x = (mx * 64) + lx;
            let z = (mz * 64) + lz;
            // "level" (`Position.z`) is not necessary as we do not output it.
            path.add(new Position(x, z, 0));
        }
    }

    toText(path) {
        let output = "";
        for (let i = 0; i < path.positions.length; i++) {
            let x = path.positions[i].x;
            let z = path.positions[i].y;
            let mx = (x / 64) | 0;
            let mz = (z / 64) | 0;
            let lx = x % 64;
            let lz = z % 64;
            output += `vertex(VertexCoord(${mx}, ${mz}, ${lx}, ${lz})),\n`;
        }
        output += "\n";
        return output;
    }
}