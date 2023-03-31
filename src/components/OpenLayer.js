import { useEffect, useState, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { circular } from 'ol/geom/Polygon';
import Control from 'ol/control/Control';


export default function OpenLayer() {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
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
       
        setMap(initialMap);
        return () => initialMap.setTarget(null)
    }, []);



    return (
        <div
            ref={mapRef}
            style={{ width: '70%', height: '300px', alignItems: "center" }}
        />
    );
}