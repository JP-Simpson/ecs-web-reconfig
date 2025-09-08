// Import Leaflet and Esri Leaflet
        import L from 'leaflet';
        import 'leaflet/dist/leaflet.css';
        import * as esri from 'esri-leaflet';

        // Get URL parameters for map_id functionality
        function getUrlParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        var map_id = getUrlParam('map_id');
        var con_name = getUrlParam('con_name');

        var filterCondition = "1=1";
        if (map_id && map_id !== 'NOT') {
            filterCondition = "State LIKE '%" + con_name + "%'";
        }

        // Layer styling functions
        function styleEEZpoly(feature) {
            let style = {
                color: '#0d1e7eff',
                weight: 1.2,
                opacity: 0.2,
                fillOpacity: 0.2,
                fillColor: '#0d1e7eff'
            };

            // switch (feature.properties.POL_TYPE) {
            //     case '200NM':
            //         style.fillColor = '#0000FF';
            //         break;
            //     case 'Joint regime':
            //         style.fillColor = '#00FF00';
            //         break;
            //     case 'Overlapping claim':
            //         style.fillColor = '#FF0000';
            //         break;
            // }
            return style;
        }

        function styleEEZline(feature) {
            let style = {
                color: '#0d1e7eff',
                weight: 1.2,
                opacity: 0.1,
                fillOpacity: 0,
                fillColor: '#0d1e7eff'
            };

            // switch (feature.properties.LINE_TYPE) {
            //     case '200 NM':
            //     case '12 NM':
            //         style.color = '#ADD8E6';
            //         break;
            //     case 'Treaty':
            //     case 'Court ruling':
            //         style.color = '#0000FF';
            //         break;
            //     case 'Connection line':
            //     case 'Median line':
            //         style.color = '#FFFF00';
            //         break;
            //     case 'Joint regime':
            //         style.color = '#00FF00';
            //         break;
            //     case 'Unilateral claim (undisputed)':
            //     case 'Unsettled (land)':
            //     case 'Unsettled (maritime)':
            //     case 'Unsettled median line (land)':
            //     case 'Unsettled median line (maritime)':
            //         style.color = '#FF0000';
            //         break;
            // }
            return style;
        }

        function styleECSline(feature) {
            let style = {
                color: '#000000',
                weight: 2.4,
                opacity: 1,
                fillOpacity: 0,
                fillColor: '#FFFFFF'
            };

            switch (feature.properties.Status) {
                case 'Submission awaiting consideration':
                    style.color = '#d3d3d3';
                    break;
                case 'Submission under active consideration':
                    style.color = '#FFCCCB';
                    break;
                case 'Submission with recommendations':
                    style.color = '#98FB98';
                    break;
                case 'Submission with recommendations followed by deposit':
                    style.color = '#00FFFF';
                    break;
            }
            return style;
        }

        function styleHitZone(feature) {
            return {
                color: "#000000",
                weight: 15,         // big clickable zone
                opacity: 0,         // invisible
                interactive: true
            };
        }


        function styleWorldBoundaries(feature) {
            return {
                color: 'white',
                weight: 0,
                opacity: 0
            };
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Leaflet map
            const oceanLayer = esri.basemapLayer("Oceans");
            const arcgisOnline = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; arcgisonline.com',
                    maxZoom: 18,
                }
            );

            const map = L.map('leafletMap', {
                zoom: 3,
                minZoom: 2,
                maxZoom: 10,
                maxBounds: [[-90, -200],[90, 200]],
                center: [22.355, 21.109],
                layers: [oceanLayer],
                zoomControl: false,
                attributionControl: false
            });

            // map.setMaxBounds([
            //     [-90, -200],
            //     [90, 200]
            // ]);

            // map.setMaxZoom(3);

            // Base URLs for your layers
            const base_url = "https://services1.arcgis.com/ZdmoaKLXhx5EdwBs/arcgis/rest/services";
            const EEZ_poly_url = base_url + "/eez_v12_lowres_feature/FeatureServer/0";
            // const EEZ_line_url = base_url + "/MarineRegions_EEZ_line/FeatureServer/0";
            const ECS_line_url = base_url + "/ECSsubmissions_line_20250908/FeatureServer/1";
            const boundaries_url = base_url + "/WorldAdminBoundaries/FeatureServer/0";

            // Create panes
            map.createPane('paneBoundaries');
            map.getPane('paneBoundaries').style.zIndex = 400;

            map.createPane('paneEEZ');
            map.getPane('paneEEZ').style.zIndex = 450;

            map.createPane('paneECS');
            map.getPane('paneECS').style.zIndex = 500;

            // Create feature layers
            const EEZ_boundary_poly = esri.featureLayer({
                url: EEZ_poly_url,
                style: styleEEZpoly,
                pane: 'paneEEZ',
                wrap: true
            });

            // const EEZ_boundary_line = esri.featureLayer({
            //     url: EEZ_line_url,
            //     style: styleEEZline,
            //     where: "LINE_TYPE NOT IN ('Archipelagic baseline', 'Normal baseline (official)', 'Straight baseline')"
            // });

            const ECS_submission_line_buffer = esri.featureLayer({
                url: ECS_line_url,
                style: styleHitZone,
                where: filterCondition,
                pane: 'paneECS',
                wrap: true
            });

            const ECS_submission_line = esri.featureLayer({
                url: ECS_line_url,
                style: styleECSline,
                where: filterCondition,
                pane: 'paneECS',
                wrap: true
            });

            const national_boundaries = esri.featureLayer({
                url: boundaries_url,
                style: styleWorldBoundaries,
                pane: 'paneBoundaries',
                wrap: true
            });

            // Add layers to map

            // EEZ_boundary_line.addTo(map);
            ECS_submission_line.addTo(map);
            ECS_submission_line_buffer.addTo(map)
            EEZ_boundary_poly.addTo(map);
            national_boundaries.addTo(map);

            // Add controls
            const zoomControl = L.control.zoom({
                position: "bottomright"
            });
            map.addControl(zoomControl);

            const attributionControl = L.control({
                position: "bottomright"
            });
            attributionControl.onAdd = function (map) {
                const div = L.DomUtil.create("div", "leaflet-control-attribution");
                div.innerHTML = "<span class='hidden-xs'><a href='http://www.grida.no/' target='_blank'>GRID-Arendal</a></span>";
                return div;
            };
            map.addControl(attributionControl);

            // Layer control
            const baseMaps = {
                "Aerial Imagery": arcgisOnline,
                "Oceans": oceanLayer
            };

            const overlays = {
                "EEZ Boundaries": EEZ_boundary_poly,
                // "EEZ Lines": EEZ_boundary_line,
                "ECS Submission Lines": ECS_submission_line
            };

            const layerControl = L.control.layers(baseMaps, overlays, {
                collapsed: false
            });
            layerControl.addTo(map);

            // Add legends
            const legendECS = L.control({ position: "bottomleft" });
            legendECS.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                div.innerHTML = '<h4>Submissions to the CLCS</h4>';
                div.innerHTML += '<i style="background: #d3d3d3; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Awaiting consideration</span><br>';
                div.innerHTML += '<i style="background: #FFCCCB; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Under active consideration</span><br>';
                div.innerHTML += '<i style="background: #98FB98; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Recommendations</span><br>';
                div.innerHTML += '<i style="background: #00FFFF; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Recommendations followed by deposit</span><br>';
                return div;
            };
            legendECS.addTo(map);

            const legendEEZ = L.control({ position: "bottomleft" });
            legendEEZ.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                div.innerHTML = '<h4>EEZ boundaries</h4>';
                div.innerHTML += '<i style="background: #ADD8E6; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>200 NM</span><br>';
                div.innerHTML += '<i style="background: #0000FF; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Treaty/court ruling</span><br>';
                div.innerHTML += '<i style="background: #FFFF00; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Median line</span><br>';
                div.innerHTML += '<i style="background: #00FF00; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Joint regime</span><br>';
                div.innerHTML += '<i style="background: #FF0000; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i><span>Contested/unilateral</span><br>';
                return div;
            };
            // legendEEZ.addTo(map);

            function formatDate(timestamp) {
                if (!timestamp) return "Unknown";
                const d = new Date(timestamp); // AGOL dates are ms since epoch
                return d.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }

            // Add popup handlers
            const pdfPrefix = "https://jp-simpson.github.io/ECS-PDFs/pdfs/"
            ECS_submission_line_buffer.on('click', function(e) {
                const feature = e.layer.feature;
                const properties = feature.properties;
                let popupContent = '<div>';
                popupContent += '<h3><strong>' + properties.State + '</strong></h3>';
                popupContent += '<p>Date submitted: ' + formatDate(properties.SubmissionDate) + '</p>';
                popupContent += '<p>Status: ' + properties.Status + '</p>';
                if (properties.Link) {
                    popupContent += '<p>View original submission: <a href="' + properties.Link + '" target="_blank">Click Here</a></p>';
                }
                if (properties.Rec_pdf) {
                    popupContent += '<p>View commentary on this submission: <a href="' + pdfPrefix + properties.Rec_pdf + '" target="_blank">Click Here</a></p>';
                }
                popupContent += '</div>';
                console.log(properties)

                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(popupContent)
                    .openOn(map);
            });

            EEZ_boundary_poly.on('click', function(e) {
                const feature = e.layer.feature;
                const properties = feature.properties;
                const popupContent = '<p><h4>' + properties.GEONAME + '</h4></p>';

                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(popupContent)
                    .openOn(map);
            });

            // Zoom to feature functionality
            let zoomed = false;
            if (map_id && map_id !== 'NOT') {
                ECS_submission_line.on('load', function() {
                    if (!zoomed) {
                        const query = esri.query({
                            url: ECS_line_url
                        });

                        query.where("State LIKE '%" + con_name + "%'").run(function(error, featureCollection) {
                            if (featureCollection && featureCollection.features.length > 0) {
                                const bounds = L.geoJson(featureCollection).getBounds();
                                map.flyToBounds(bounds);
                                zoomed = true;
                            }
                        });
                    }
                });
            }

            // Store map globally for potential search integration
            window.leafletMap = map;
            console.log('Leaflet map initialized successfully');

            // Add scroll functionality
            const scrollIndicator = document.getElementById('scrollIndicator');
            const searchSection = document.getElementById('searchSection');
            
            if (scrollIndicator && searchSection) {
                scrollIndicator.addEventListener('click', function() {
                    
                    document.getElementById('searchSection').scrollIntoView({behavior: 'smooth'});
                    });
                };

            // Add search functionality placeholder
            const searchButton = document.getElementById('searchButton');
            const searchInput = document.getElementById('searchInput');
            
            if (searchButton && searchInput) {
                searchButton.addEventListener('click', function() {
                    const searchTerm = searchInput.value.trim();
                    if (searchTerm) {
                        console.log('Searching for:', searchTerm);
                        // TODO: Implement search functionality with map_id lookup
                    }
                });
                
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchButton.click();
                    }
                });
            }
        });

        // Auto-jump on wheel/scroll
        let isScrolling = false;
        window.addEventListener('wheel', function(e) {
            if (!isScrolling && window.scrollY === 0 && e.deltaY > 0) {
                isScrolling = true;
                document.getElementById('searchSection').scrollIntoView({behavior: 'smooth'});
                setTimeout(() => {
                    isScrolling = false;
                }, 500);
            }
        });

        // Basic search interactivity
        document.getElementById('searchButton').addEventListener('click', function() {
            const searchTerm = document.getElementById('searchInput').value;
            if (searchTerm.trim()) {
                console.log('Searching for:', searchTerm);
                // TODO: Implement search functionality with Cesium
                if (window.cesiumViewer) {
                    console.log('Cesium viewer available for search integration');
                }
            }
        });

        // Enter key support for search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('searchButton').click();
            }
        });