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
- `active` (boolean): Set if the layer is visible or not when the map is loaded.
- `opacityControl` (boolean): Enable an opacity slider for this layer.

### Example
First define your layers (it could be any type of layers).

Then, set the control layer : 
```javascript
const layers = 
	[
		{
			name: "Maps",
			collapsed: true,
			layers: [
				{ name: "Plan IGN", layer: ign2023, active: true },
				{ name: "OpenStreetMap", layer: osm, active: false },
			]
		},
		{
			name: "Aerial images",
			collapsed: true,
			layers: [
				{ name: "1952", layer: ignaerial1950, active: false, opacityControl : true },
				{ name: "2015", layer: ignaerial2015, active: false, opacityControl: true },	
			]
		},
		{
			name: "Data",
			collapsed: true,
			layers: [
				{ name: "Points", layer: geojsonLayer, active: true },
			]
		}
	]

const parameters = {
		position: "topright",
		collapsible: true,
		collapsed: true,
		color: "#d5c5b4",
		title: "Control layer"
	}

const control = L.control.advancedLayers(layers, parameters).addTo(map);
```

## Aknowledgement

I would like to thanks the authors of the leaflet extensions who have inspired this one :
* [Stefano Cudini / Leaflet Panel Layers](https://github.com/stefanocudini/leaflet-panel-layers)
* [jjimenezshaw / Leaflet.Control.Layers.Tree](https://github.com/jjimenezshaw/Leaflet.Control.Layers.Tree)

## Note on the use of generative IA 

This application has been developped with the assistance of a generative model. 