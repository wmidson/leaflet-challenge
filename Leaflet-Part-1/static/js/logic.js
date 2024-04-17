//store URL as queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//perform GET request to queryUrl
d3.json(queryUrl).then(function(data) {
    //print data recieved
    console.log(data.features);
    //once response is retrieved, send data.features object to CreateFeatures function
    createFeatures(data.features);
});

//function for marker size
function markerSize(magnitude) {
    return magnitude*2500;
};

//create function to determine marker color based on depth 
function chooseColor(depth){
    if (depth<15) return "green"; 
    else if (depth <30) return "greenyellow";
    else if (depth <45) return "yellow";
    else if (depth <60) return "orange"; 
    else if (depth <75) return "orangered";
    else return "red";
};

//create map that plots all earthquakes from dataset based on logitude and latitude 
function createFeatures(earthquakeData){
    //define a function that runs once for each feature in features array
    //give each feature a popup that describes the place and time of earthquake
    function onEachFeature(feature, layer){ 
        layer.bindPopup(`<h3>Place:${feature.properties.place}</h3><hr><p>Time:${new Date(feature.properties.time)}</p></h3><hr><p>Magnitude: ${feature.properties.mag}</p>`);
    }
    //create GeoJson layer that has features array on earthquakeData object
    //run the eachFeature function for each piece of data in array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        //point to layer used to alter markers
        pointToLayer: function (feature, latlng){
            //determine style of markers based on properties
            var markers = {
                radius: markerSize(7*feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                color: "black",
                weight: 1,
                opacity: 1,
                stroke: true,
                fillOpacity: 0.8
            };
            return L.circle(latlng, markers);

        }
    });
    //send eq layer to createMap function
    createMap(earthquakes);
}

function createMap(earthquakes){
    //Create base layers
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    //create map giving it grayscale map and eq layers to display on load
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [street, earthquakes]  
    });
    //add legend 
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(){
        var div = L.DomUtil.create('div', 'info legend'),
        depth = [0, 15, 30, 45, 60, 75];

        div.innerHTML+='Depth<br><hr>'
        //loop through densities
        for (var i=0; i<depth.length; i++){
            div.innerHTML +=
            '<i style="background:' + chooseColor(depth[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');

        }
        return div;
    };

    legend.addTo(myMap);

};