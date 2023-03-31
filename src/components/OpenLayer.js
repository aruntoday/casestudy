import { useEffect, useState, useRef } from 'react';
import * as ol from 'ol'
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import '../ol.css'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import { circular } from 'ol/geom/Polygon';
import Control from 'ol/control/Control';


export default function OpenLayer() {

    const[lat,setLat] = useState();

    function handleSubmit(e){
        e.preventDefault();
        var lat = parseFloat(e.target.latName.value);
        var lon = parseFloat(e.target.longName.value);
        map.setView(
            new ol.View({
            center: fromLonLat([lat, lon]),
            zoom: 10,
            minZoom: 10,
            maxZoom: 20,
        }));
        const accuracy_1 = circular([lat, lon], [lat, lon].accuracy);
        source.addFeatures([
            new ol.Feature(
                accuracy_1.transform('EPSG:4326', map.getView().getProjection())
            ),
            new ol.Feature(new Point(fromLonLat([lat, lon]))),
        ]);
    }
    
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const source = new VectorSource();
    const layer = new VectorLayer({
        source: source,
    });
    
    useEffect(() => {
        navigator.geolocation.watchPosition(
            function (pos) {
                const coords = [pos.coords.longitude, pos.coords.latitude];
                const accuracy = circular(coords, pos.coords.accuracy);
                source.clear(true);
                source.addFeatures([
                    new ol.Feature(
                        accuracy.transform('EPSG:4326', initialMap.getView().getProjection())
                    ),
                    new ol.Feature(new Point(fromLonLat(coords))),
                ]);
            },
            function (error) {
                alert(`ERROR: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
            }
        );
        const initialMap = new ol.Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new ol.View({
                center: fromLonLat([80.198654, 13.1136077]),
                zoom: 10,
                minZoom: 10,
                maxZoom: 20,
            }),
        });
        initialMap.addLayer(layer);
        const locate = document.createElement('div');
        // locate.className = 'ol-control ol-unselectable locate';
        // locate.innerHTML = '<button title="Locate me">◎</button>';
        locate.addEventListener('click', function () {
            if (!source.isEmpty()) {
                map.getView().fit(source.getExtent(), {
                    maxZoom: 18,
                    duration: 500,
                });
            }
        });
        initialMap.addControl(
            new Control({
                element: locate,
            })
        );
        setMap(initialMap);
        return () => initialMap.setTarget(null)
    }, []);



    return (
        <>
            <div style={{margin : '20px'}}>
                <form onSubmit={handleSubmit}>
                    <input type='text' placeholder='Enter Latitude...' name='latName' />
                    <input type='text' placeholder='Enter Longitude...' name='longName'  />
                    <button>Search</button>
                </form>
            </div>
            <div
                ref={mapRef}
                style={{ margin:'20px',width: '60%', height: '500px', alignItems: "center" }}
            />
        </>
    );
}