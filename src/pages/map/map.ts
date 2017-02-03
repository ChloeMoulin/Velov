import { Component } from '@angular/core';
import { MarkerService } from '../../models/marker.service';
import { GlobalMarkersService} from '../../models/globalMarkers.service';
import { BikePathService } from '../../models/bikePath.service';
import { GlobalBikePathsService} from '../../models/globalBikePaths.service';
import { NavController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';

declare var ol: any;


@Component({
  selector: 'page-map',
  templateUrl: 'map.html'

})


export class MapPage {



  olMap: any;
  style: any;
  marker_features: any[];
  bike_path_features: any[];
  markers: any[];
  bike_paths: any[];
  source: any;
  source_path: any;

  constructor(public navCtrl: NavController,private markerService: MarkerService, private globalMarkersService: GlobalMarkersService, private bikePathService: BikePathService, private globalBikePathsService: GlobalBikePathsService) {

    this.markers = globalMarkersService.getMarkers();
    this.marker_features = [];

    this.bike_paths = globalBikePathsService.getBikePaths();
    this.bike_path_features = [];




  }

  buildBikePathFeatures() {
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#4AA440',
        width: 2
      }),

    });
    for(let bikePath in this.bike_paths) {
      var test = this.bike_paths[bikePath].geometry.coordinates;
      var path = new ol.geom.LineString();
      if (this.bike_paths[bikePath].geometry.type == "LineString") {
        for(let coordinates in this.bike_paths[bikePath].geometry.coordinates) {
          var coord = this.bike_paths[bikePath].geometry.coordinates[coordinates];
          var coord2 = ol.proj.transform(coord, 'EPSG:4326','EPSG:3857');

          path.appendCoordinate(coord2);
        }
        var feature = new ol.Feature({
          geometry: path
        })
        feature.set("name","bikePath");
        feature.setStyle(style);
        this.bike_path_features.push(feature);
      } else if (this.bike_paths[bikePath].geometry.type == "MultiLineString") {
        for(let coordinates in this.bike_paths[bikePath].geometry.coordinates) {
          for(let subcoordinates in this.bike_paths[bikePath].geometry.coordinates[coordinates]) {
            var coord = this.bike_paths[bikePath].geometry.coordinates[coordinates][subcoordinates];
            var coord2 = ol.proj.transform(coord, 'EPSG:4326','EPSG:3857');

            path.appendCoordinate(coord2);
          }
          var feature = new ol.Feature({
            geometry: path
          })
          feature.set("name","bikePath");
          feature.setStyle(style);
          this.bike_path_features.push(feature);
          }

    }
  }
}

  buildMarkerFeatures() {
    var iconStyle100 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker100.png'
      })),
      zIndex:2000
    });
    var iconStyle75 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker75.png'
      })),
      zIndex:2000
    });
    var iconStyle50 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker50.png'
      })),
      zIndex:2000
    });
    var iconStyle25 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker25.png'
      })),
      zIndex:2000
    });
    var iconStyle0 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker0.png'
      })),
      zIndex:2000
    });
    for(let marker in this.markers){

      var ratio = this.markers[marker].properties.available_bikes/this.markers[marker].properties.bike_stands;
      var coordinates = this.markers[marker].geometry.coordinates;
      var name = this.markers[marker].properties.name;
      var address = this.markers[marker].properties.address;
      var city = this.markers[marker].properties.commune;
      var available_bikes = this.markers[marker].properties.available_bikes;
      var available_bike_stands = this.markers[marker].properties.available_bike_stands;
      var point = new ol.geom.Point(ol.proj.transform(coordinates, 'EPSG:4326','EPSG:3857'));
      var feature = new ol.Feature();
      feature.set("name",name + " - "+city);
      feature.set("address",address);
      feature.set("available_bikes", available_bikes);
      feature.set("available_bike_stands",available_bike_stands);
      feature.setGeometry(point);
      if(this.markers[marker].properties.available_bikes == 0) {
        feature.setStyle(iconStyle0);
      } else if (ratio <= 0.25){
        feature.setStyle(iconStyle25);
      } else if (ratio <= 0.5) {
        feature.setStyle(iconStyle50);
      } else if (ratio <= 0.75) {
        feature.setStyle(iconStyle75);
      } else {
        feature.setStyle(iconStyle100);
      }
      this.marker_features.push(feature);
    }
  }

  ionViewDidLoad() {

    var self = this;


this.buildMarkerFeatures();
this.buildBikePathFeatures();
  this.source = new ol.source.Vector({
    features: this.marker_features
  });

this.source_path = new ol.source.Vector({
  features: this.bike_path_features
});
  var view = new ol.View({
    center: ol.proj.transform([4.8323750495910645,45.7574933281114], 'EPSG:4326','EPSG:3857'),
    zoom: 13 ,
    minZoom: 12,
    maxZoom: 20
  });



    var geolocation = new ol.Geolocation({
      projection: view.getProjection()
    });

    function el(id) {
      return document.getElementById(id);
    }

      geolocation.setTracking(true);

    // update the HTML page when the position changes.
    geolocation.on('change', function() {
      el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
      el('altitude').innerText = geolocation.getAltitude() + ' [m]';
      el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
      el('heading').innerText = geolocation.getHeading() + ' [rad]';
      el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
    });

    // handle geolocation error.
    geolocation.on('error', function(error) {
      var info = document.getElementById('info');
      info.innerHTML = error.message;
      info.style.display = '';
    });

    var positionFeature = new ol.Feature();
    positionFeature.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/self.png'
      }))
    }));

    positionFeature.set("name","self");

    geolocation.on('change:position', function() {
      var coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
      view.setCenter(coordinates);
      view.setZoom(16);
    });

    var geoVectorSource = new ol.source.Vector({
      features: [positionFeature]
    });

    var geoVector = new ol.layer.Vector({
      source: geoVectorSource
    });


    var element = document.getElementById('popup');





    this.olMap = new ol.Map({
      target:"map",

      layers: [new ol.layer.Tile({
          source:new ol.source.OSM()
        }),
        new ol.layer.Vector({
            source: this.source_path
        }),
        new ol.layer.Vector({
              source: this.source
            }),
            geoVector

      ],
      controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      }),
      view: view
    });


    var popup = new ol.Overlay({
      element: document.getElementById('popup'),
      positioning: 'bottom-center',
      stopEvent: false
    });

    this.olMap.addOverlay(popup);
    this.olMap.on('click', function(evt) {
      var container = document.getElementById('popup');
      var feature = self.olMap.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
            return feature;
          });
      if (feature && !(feature.get("name")=="bikePath")) {
        if(feature.get("name")=="self") {
          container.innerHTML="<p id ='title1' display='inline-block'> C'est vous ! </p>";
        } else {
          container.innerHTML =  "<p id='title1' display='inline-block'>"+feature.get("name")+"</p>";
          container.innerHTML += "<p id ='title2' display='inline-block'>"+feature.get("address")+"</p><br/>";
          container.innerHTML += "<div id='infos'>";
          container.innerHTML += "<p><span id='subtitle'> Vélos disponibles : </span>"+feature.get("available_bikes")+"</p>";
          container.innerHTML += "<p><span id='subtitle'> Emplacements disponibles : </span>"+feature.get("available_bike_stands")+"</p>";
          container.innerHTML += "</div>";

        }
        popup.setPosition(evt.coordinate);

      } else {
        container.innerHTML = "";
        popup.setPosition(undefined);
      }
    });

    var check_self = document.getElementById('check_self');
    check_self.addEventListener('change', function(evt) {
      if(check_self['checked']) {
        geoVectorSource.addFeature(positionFeature);
      } else {
        geoVectorSource.clear();
      }
    });
    var check_stations = document.getElementById('check_stations');
    check_stations.addEventListener('change', function(evt) {
      if(check_stations['checked']) {
        self.source.addFeatures(self.marker_features);
      } else {
        self.source.clear();
      }
    });
    var check_bike_paths = document.getElementById('check_bike_paths');
    check_bike_paths.addEventListener('change', function(evt) {
      if(check_bike_paths['checked']) {
        self.source_path.addFeatures(self.bike_path_features);
      } else {
        self.source_path.clear();
      }
    });

  }


}
