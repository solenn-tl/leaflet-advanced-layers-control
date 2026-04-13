# Leaflet advanced layers control 

This library is a little tool to control layers on a Leaflet map. It includes layer grouping, optional opacity function associated with each layer and control layer CSS customisation.

## Documentation

### Control options
- `title` (string): Optional control title.
- `position` (string): Leaflet control position (e.g. `topright`).
- `collapsible` (boolean): Enable collapsing/expanding of the control.
- `collapsed` (boolean): Start the control collapsed when `true`.
- `color` (string): Accent color used by control buttons (any valid CSS color, e.g. `#d35400`, `rgb(0,120,200)`, `teal`).

### Layers options
- `name` (string): Name of the layer.
- `layer` (Layer): The Leaflet layer instance.
- `opacityControl` (boolean): Enable an opacity slider for this layer.
- `visibleByDefault` (boolean): Set whether the layer should be added to the map by default.

### Example
```javascript
const layers = {
    "Background maps": [
        { name: "Street Map", 
        layer: L.tileLayer('url1'), visibleByDefault: true },
        { name: "Satellite Map", 
        layer: L.tileLayer('url2'), 
        visibleByDefault: false, 
        opacityControl: true }
    ],
    "Overlays": [
        { name: "Heatmap", layer: L.imageOverlay('url3'), removeBackgroundControl: true, visibleByDefault: true }
    ]
};

const control = L.control.advancedLayers(layers, {
    collapsible: true,
    collapsed: true,
    position: 'topright',
    color: '#2f6f95',
}).addTo(map);
```

## Aknowledgement

I would like to thanks a lot the leaflet extensions who have inspired this one : 
* [Stefano Cudini / Leaflet Panel Layers](https://github.com/stefanocudini/leaflet-panel-layers)
* [jjimenezshaw / Leaflet.Control.Layers.Tree](https://github.com/jjimenezshaw/Leaflet.Control.Layers.Tree)

## Note on use of generative IA 

This application has been developped with the assistance of a generative model. 