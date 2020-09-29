import React, { useState } from 'react';
import ReactMapGL, { FullscreenControl, Source, Layer } from 'react-map-gl';
import { useDispatch, useSelector } from 'react-redux';

//Importing distance calculator lib
import * as turf from '@turf/turf';

import { addPoint, measureDistance } from './actions/index';
import useEffectSkipInitialRender from './hook';
import './App.css';

//Importing required mapbox-gl styles
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
	//Initial settings for map view
	const [viewport, setViewport] = useState({
		width: '100wv',
		height: '100vh',
		latitude: 54.685297,
		longitude: 25.287274,
		zoom: 12,
	});

	//All of the selected points coordinates
	const [lineCoordinates, setLineCoordinates] = useState('');

	const dispatch = useDispatch();
	const points = useSelector((state) => state.pointReducer);

	//Receiving calculated distance from redux
	const totalDistance = useSelector((state) => state.distanceReducer.distance);

	//This array is filled with data from redux, then via map --> push() methods inserted in geojson
	let featuresArray = [
		{
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: lineCoordinates,
			},
		},
	];

	points.mapPoint.map((single) => featuresArray.push(single));

	let geojson = {
		type: 'FeatureCollection',
		features: featuresArray,
	};

	//If theres more than one point on the map, calculations of distance are sent to redux
	if (geojson.features[0].geometry.coordinates.length > 1) {
		dispatch(measureDistance(turf.length(geojson.features[0])));
	}

	// This custom hook skips initial execution of useEffect
	useEffectSkipInitialRender(() => {
		setLineCoordinates(points.allPoints);
		return;
	}, [points]);

	//This function sends coordinates that user clicked on
	const mapClick = (e) => {
		const selectedCoordinates = [e.lngLat[0], e.lngLat[1]];
		dispatch(addPoint(selectedCoordinates));
	};
	return (
		<div className="mapContainer">
			<ReactMapGL
				{...viewport}
				mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
				mapStyle="mapbox://styles/mopixels/ckfmbcvun0jhk19nkgbh79tow"
				onClick={(e) => mapClick(e)}
				onViewportChange={(nextViewport) => {
					setViewport({
						...viewport,
						latitude: nextViewport.latitude,
						longitude: nextViewport.longitude,
						zoom: nextViewport.zoom,
					});
				}}
			>
				<Source id="point" type="geojson" data={geojson}>
					<Layer
						id="measure-points"
						type="circle"
						source="geojson"
						paint={{
							'circle-radius': 5,
							'circle-color': '#000',
						}}
						filter={['in', '$type', 'Point']}
					/>
					<Layer
						id="measure-lines"
						type="line"
						source="geojson"
						layout={{
							'line-cap': 'round',
							'line-join': 'round',
						}}
						paint={{
							'line-color': '#000',
							'line-width': 3.5,
						}}
						filter={['in', '$type', 'LineString']}
					/>
				</Source>
				{totalDistance > 0 && (
					<div className="distance-container">
						Total distance: {totalDistance.toFixed(2)} km
					</div>
				)}
			</ReactMapGL>
			<div className="fullScreenButton">
				<FullscreenControl container={document.querySelector('body')} />
			</div>
		</div>
	);
}

export default App;
