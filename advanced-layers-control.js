L.Control.AdvancedLayers = L.Control.extend({
    options: {
        position: 'topright',
        collapsible: true,
        color: '#007bff',
        title: '', // Optional name/title for the control
    },

    initialize: function (layers, options) {
        L.Util.setOptions(this, options);
        this.layers = layers;
    },

    onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-control-advanced-layers');
        const self = this;

        if (typeof this.options.color === 'string' && this.options.color.trim()) {
            container.style.setProperty('--alc-accent-color', this.options.color.trim());
        }

        // Add optional title
        if (this.options.title) {
            const title = L.DomUtil.create('div', 'layers-title', container);
            title.innerHTML = this.options.title;
        }

        // Collapsible toggle
        if (this.options.collapsible) {
            const toggleButton = L.DomUtil.create('div', 'layers-collapse-toggle', container);
            toggleButton.innerHTML = '-';

            if (this.options.collapsed === true) {
                container.classList.add('collapsed');
                toggleButton.innerHTML = '+';
            }

            L.DomEvent.on(toggleButton, 'click', function () {
                container.classList.toggle('collapsed');
                toggleButton.innerHTML = container.classList.contains('collapsed') ? '+' : '-';
            });
        }

        // Add layer groups and controls
        this._addGroupLayers(container, this.layers, map);

        return container;
    },

    _addGroupLayers: function (parentContainer, groupLayers, map) {
        groupLayers.forEach((item) => {
            if (item.layers) {
                // Add a group
                const groupContainer = L.DomUtil.create('div', 'layer-group', parentContainer);
    
                // Create group header with toggle button and label
                const groupHeader = L.DomUtil.create('div', 'layer-group-header', groupContainer);
    
                const groupToggle = L.DomUtil.create('button', 'group-collapse-toggle', groupHeader);
                groupToggle.innerHTML = item.collapsed ? '+' : '-';
    
                const groupLabel = L.DomUtil.create('label', '', groupHeader);
                groupLabel.innerHTML = item.name;
                groupLabel.classList.add('layer-group-label');
    
                if (item.pictogram) {
                    const pictogram = L.DomUtil.create('img', 'group-pictogram', groupHeader);
                    pictogram.src = item.pictogram;
                    pictogram.alt = 'Group Icon';
                    groupHeader.insertBefore(pictogram, groupLabel);
                }
    
                // Content for layers in the group
                const groupContent = L.DomUtil.create('div', 'group-content', groupContainer);
                if (item.collapsed) groupContent.style.display = 'none';
    
                // Toggle group collapse/expand
                L.DomEvent.on(groupHeader, 'click', function () {
                    const isCollapsed = groupContent.style.display === 'none';
                    groupContent.style.display = isCollapsed ? 'block' : 'none';
                    groupToggle.innerHTML = isCollapsed ? '-' : '+';
                });
    
                this._addGroupLayers(groupContent, item.layers, map);
            } else {
                // Add an individual layer
                const layerControl = this._createLayerControl(item, map);
                parentContainer.appendChild(layerControl);
    
                // Set initial visibility of the layer
                if (item.active) {
                    map.addLayer(item.layer);
                }
            }
        });
    },        

    _createLayerControl: function (layerInfo, map) {
        const container = L.DomUtil.create('div', 'layer-item');

        // Prevent map interactions when interacting with controls
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Layer toggle checkbox
        const checkbox = L.DomUtil.create('input', '', container);
        checkbox.type = 'checkbox';
        checkbox.checked = layerInfo.active || false;
        L.DomEvent.on(checkbox, 'change', function () {
            if (checkbox.checked) {
                map.addLayer(layerInfo.layer);
            } else {
                map.removeLayer(layerInfo.layer);
            }
        });

        // Layer label and optional pictogram
        if (layerInfo.pictogram) {
            const icon = L.DomUtil.create('img', 'layer-pictogram', container);
            icon.src = layerInfo.pictogram;
            icon.alt = 'Layer Icon';
        }
        const label = L.DomUtil.create('span', 'layer-label', container);
        label.innerHTML = layerInfo.name;

        // Opacity slider (optional)
        if (layerInfo.opacityControl) {
            const slider = L.DomUtil.create('input', 'opacity-slider', container);
            slider.type = 'range';
            slider.min = 0;
            slider.max = 1;
            slider.step = 0.01;
            slider.value = layerInfo.layer.options.opacity || 1;

            L.DomEvent.on(slider, 'mousedown', L.DomEvent.stopPropagation); // Prevent map panning
            L.DomEvent.on(slider, 'mousemove', L.DomEvent.stopPropagation); // Prevent map panning
            L.DomEvent.on(slider, 'input', function () {
                layerInfo.layer.setOpacity(slider.value);
            });
        }

        // Remove background color picker and slider (optional)
        if (layerInfo.removeBackgroundControl) {
            const colorPicker = L.DomUtil.create('input', 'color-picker', container);
            colorPicker.type = 'color';
            colorPicker.value = '#ffffff';

            const toleranceSlider = L.DomUtil.create('input', 'tolerance-slider', container);
            toleranceSlider.type = 'range';
            toleranceSlider.min = 0;
            toleranceSlider.max = 100;
            toleranceSlider.value = 0;

            // Set color picker to the most represented color
            const canvas = layerInfo.layer.getContainer();
            const ctx = canvas.getContext('2d');
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const colorFrequency = {};
            for (let i = 0; i < imgData.data.length; i += 4) {
                const color = `${imgData.data[i]},${imgData.data[i + 1]},${imgData.data[i + 2]}`;
                colorFrequency[color] = (colorFrequency[color] || 0) + 1;
            }
            const dominantColor = Object.keys(colorFrequency).reduce((a, b) => (colorFrequency[a] > colorFrequency[b] ? a : b));
            const [r, g, b] = dominantColor.split(',').map(Number);
            colorPicker.value = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

            L.DomEvent.on(toleranceSlider, 'input', function () {
                const tolerance = parseInt(toleranceSlider.value, 10);
                self._removeBackgroundColor(layerInfo.layer, colorPicker.value, tolerance);
            });
        }

        return container;
    },

    _removeBackgroundColor: function (layer, color, tolerance) {
        const [targetR, targetG, targetB] = [
            parseInt(color.slice(1, 3), 16),
            parseInt(color.slice(3, 5), 16),
            parseInt(color.slice(5, 7), 16),
        ];

        const canvas = layer.getContainer();
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];

            if (Math.abs(r - targetR) <= tolerance && Math.abs(g - targetG) <= tolerance && Math.abs(b - targetB) <= tolerance) {
                imgData.data[i + 3] = 0; // Set alpha to 0
            }
        }
        ctx.putImageData(imgData, 0, 0);
    },
});

// Factory function for creating the control
L.control.advancedLayers = function (layers, options) {
    return new L.Control.AdvancedLayers(layers, options);
};
