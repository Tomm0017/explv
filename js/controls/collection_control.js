'use strict';

import {Position} from '../model/Position.js';
import {Path} from '../model/Path.js';


// Import converters
import {OSBotAreasConverter} from '../bot_api_converters/osbot/osbot_areas_converter.js';
import {OSBotPathConverter} from '../bot_api_converters/osbot/osbot_path_converter.js';
import {OSBotPolyAreaConverter} from '../bot_api_converters/osbot/osbot_polyarea_converter.js';

var converters = {
    "OSBot": {
        "areas_converter": new OSBotAreasConverter(),
        "path_converter": new OSBotPathConverter(),
        "polyarea_converter": new OSBotPolyAreaConverter()
    }
};

export var CollectionControl = L.Control.extend({    
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        this._path = new Path(this._map);

        this._currentDrawable = undefined;
        this._currentConverter = undefined;

        this._drawnMouseArea = undefined;
        this._editing = false;

        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control noselect');
        container.style.background = 'none';
        container.style.width = '70px';
        container.style.height = 'auto';

        // Copy to clipboard control
        this._createControl('<i class="fa fa-copy"></i>', container, function(e) {
            this._copyCodeToClipboard();
        });

        // Path control
        this._createControl('<img src="/css/images/path-icon.png" alt="Path" title="Draw Area"  height="30" width="30">', container, function(e) {
            this._toggleCollectionMode(this._path, "path_converter", e.target);
        });

        // Undo control
        this._createControl('<i class="fa fa-undo" aria-hidden="true"></i>', container, function(e) {
            if (this._currentDrawable !== undefined) {
                this._currentDrawable.removeLast();
                this._outputCode();
            }
        });

        // Clear control
        this._createControl('<i class="fa fa-trash" aria-hidden="true"></i>', container, function(e) {
            if (this._currentDrawable !== undefined) {
                this._currentDrawable.removeAll();
                this._outputCode();
            }
        });

        L.DomEvent.disableClickPropagation(container);

        L.DomEvent.on(this._map, 'click', this._addPosition, this);

        L.DomEvent.on(this._map, 'mousemove', this._drawMouseArea, this);

        var context = this;
        $("#output-type").on('change', () => context._outputCode());
        $("#code-output").on('input propertychange paste', () => context._loadFromText());
        $("#bot-api").on('change', () => context._outputCode());

        return container;
    },
    
    _createControl: function(html, container, onClick) {
        var control = L.DomUtil.create('a', 'leaflet-bar leaflet-control leaflet-control-custom', container);
        control.innerHTML = html;
        L.DomEvent.on(control, 'click', onClick, this);
    },

    _addPosition: function(e) {
        if (!this._editing) {
            return;
        }

        var position = Position.fromLatLng(this._map, e.latlng, this._map.plane);

        this._currentDrawable.add(position);
        this._outputCode();
    },

    _drawMouseArea: function(e) {},

    _toggleCollectionMode: function(drawable, converter, element) {
        $("a.leaflet-control-custom.active").removeClass("active");

        if (this._currentDrawable === drawable || drawable === undefined) {
            this._editing = false;

            $("#code-output-panel").hide("slide", {direction: "right"}, 300);

            this._map.removeLayer(this._currentDrawable.featureGroup);

            if (this._drawnMouseArea !== undefined) {
                this._map.removeLayer(this._drawnMouseArea);
            }
            
            this._currentDrawable = undefined;
            this._currentConverter = undefined;
            
            this._outputCode();
            return;
        }

        this._editing = true;
        $(element).closest("a.leaflet-control-custom").addClass("active");
        
        this._currentConverter = converter;

        $("#code-output-panel").show("slide", {direction: "right"}, 300);

        if (this._currentDrawable !== undefined) {
            this._map.removeLayer(this._currentDrawable.featureGroup);
        }

        if (this._drawnMouseArea !== undefined) {
            this._map.removeLayer(this._drawnMouseArea);
        }

        this._currentDrawable = drawable;

        if (this._currentDrawable !== undefined) {
            this._map.addLayer(this._currentDrawable.featureGroup);
        }

        this._outputCode();
    },

    _outputCode: function() {        
        var output = "";

        if (this._currentDrawable !== undefined) {
            var botAPI = $("#bot-api option:selected").text();
            output = converters[botAPI][this._currentConverter].toJava(this._currentDrawable);
        }

        $("#code-output").html(output);
    },
    
    _loadFromText: function() {
        if (this._currentDrawable !== undefined) {
            var botAPI = $("#bot-api option:selected").text();
            converters[botAPI][this._currentConverter].fromJava($("#code-output").text(), this._currentDrawable);
        }
    },

    _copyCodeToClipboard: function() {
        var $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val($("#code-output").text()).select();
        document.execCommand("copy");
        $temp.remove();

        Swal({
            position: 'top',
            type: 'success',
            title: `Copied to clipboard`,
            showConfirmButton: false,
            timer: 6000,
            toast: true,
        });
    }
});