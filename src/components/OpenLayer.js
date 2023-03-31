import { useEffect, useState, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import '../ol.css'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { circular } from 'ol/geom/Polygon';
import Control from 'ol/control/Control';

export default function OpenLayer() {

    const[lat,setLat] = useState();

    function handleSubmit(e){
        e.preventDefault();
        const searchLat = e.target.latName.value;
        const searchLong = e.target.longName.value;
        console.log(searchLat + searchLong);
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
                    new Feature(
                        accuracy.transform('EPSG:4326', initialMap.getView().getProjection())
                    ),
                    new Feature(new Point(fromLonLat(coords))),
                ]);
            },
            function (error) {
                alert(`ERROR: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
            }
        );

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: fromLonLat([1, 2]),
                zoom: 2,
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
            <div>
                <form onSubmit={handleSubmit}>
                    <input type='text' placeholder='Enter Latitude...' name='latName' />
                    <input type='text' placeholder='Enter Longitude...' name='longName'  />
                    <button>Search</button>
                </form>
            </div>
            <div
                ref={mapRef}
                style={{ width: '70%', height: '300px', alignItems: "center" }}
            />
        </>
    );
}