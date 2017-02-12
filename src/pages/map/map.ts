import { Component } from '@angular/core';
import { MarkerService } from '../../models/marker.service';
import { GlobalMarkersService} from '../../models/globalMarkers.service';
import { BikePathService } from '../../models/bikePath.service';
import { GlobalBikePathsService} from '../../models/globalBikePaths.service';
import { NavController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';

declare var ol: any;
declare var cordova: any;
declare var device: any;

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
  positionFeature: any;
  source_path: any;
  coordinates: any;


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
        src: 'assets/icon/Marker100.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    var iconStyle75_100 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker75-100.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    var iconStyle50_75 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker50-75.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    var iconStyle25_50 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker25-50.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    var iconStyle0_25 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker0-25.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });

    var iconStyle0 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker0.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    for(let marker in this.markers){

      var ratio = this.markers[marker].properties.available_bikes/this.markers[marker].properties.bike_stands;
      var coordinates = this.markers[marker].geometry.coordinates;
      var name = this.markers[marker].properties.name;
      var number = this.markers[marker].properties.number;
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
      feature.set("number", number);
      feature.setGeometry(point);
      if(available_bikes == 0) {
        feature.setStyle(iconStyle0);
      } else if (ratio <= 0.25){
        feature.setStyle(iconStyle0_25);
      } else if (ratio <= 0.5) {
        feature.setStyle(iconStyle25_50);
      } else if (ratio <= 0.75) {
        feature.setStyle(iconStyle50_75);
      } else if (ratio < 1) {
        feature.setStyle(iconStyle75_100);
      } else {
        feature.setStyle(iconStyle100);
      }
      this.marker_features.push(feature);
    }
  }

  ionViewDidLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }
    var permissions = cordova.plugins.permissions;
    if(device.platform=='Android' && !permissions.hasPermission(permissions.ACCESS_COARSE_LOCATION, null, null) && !permissions.hasPermission(permissions.ACCESS_FINE_LOCATION, null, null)) {
      permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, null, null);
      navigator.geolocation.getCurrentPosition(changePosition, null);
    }
    var storage = window.localStorage;
    this.positionFeature = new ol.Feature();
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
        zoom: 13,
        maxZoom: 20
      });



    var geolocation = new ol.Geolocation({
      projection: view.getProjection()
    });

    function el(id) {
      return document.getElementById(id);
    }
    

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
        src: 'assets/icon/self.png',
        anchor: [0.5,1]
      }))
    }));
    positionFeature.set("name","self");
    navigator.geolocation.getCurrentPosition(changePosition, null, { timeout: 30000 });
    navigator.geolocation.watchPosition(changePosition, null, { timeout: 30000 })
    function changePosition(position){
      self.coordinates = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857');
      positionFeature.setGeometry(self.coordinates ? new ol.geom.Point(self.coordinates) : null);
      self.positionFeature.setGeometry(positionFeature.getGeometry());
      view.setCenter(self.coordinates);
      view.setZoom(16);
    }
    

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
      positioning: 'bottom-left',
      stopEvent: true,
      autoPan: true
    });

    var button1 = el('getClosestStation');
    var closestStation = new ol.Feature();
    button1.onclick = function() {
      var minLength = 10000000;
      var line;
      self.marker_features.forEach(function(feature) {
          line = new ol.geom.LineString([feature.getGeometry().getCoordinates(), self.positionFeature.getGeometry().getCoordinates()]);
          if(line.getLength() < minLength) {
            closestStation.setGeometry(feature.getGeometry());
            closestStation.set('name', feature.get('name'));
            minLength = line.getLength();
          }
      });
      view.setCenter(closestStation.getGeometry().getCoordinates());
      view.setZoom(18);
    }

    var button2 = el('getClosestStationBikes');
    var closestStationBikes = new ol.Feature();
    button2.onclick = function() {
      var minLength = 10000000;
      var line;
      self.marker_features.forEach(function(feature) {
          line = new ol.geom.LineString([feature.getGeometry().getCoordinates(), self.positionFeature.getGeometry().getCoordinates()]);
          if(line.getLength() < minLength && feature.get('available_bikes') > 0) {
            closestStationBikes.setGeometry(feature.getGeometry());
            closestStationBikes.set('name', feature.get('name'));
            minLength = line.getLength();
          }
      });
      view.setCenter(closestStationBikes.getGeometry().getCoordinates());
      view.setZoom(18);
    }

    var button3 = el('getClosestStationStands');
    var closestStationStands = new ol.Feature();
    button3.onclick = function() {
      var minLength = 10000000;
      var line;
      self.marker_features.forEach(function(feature) {
          line = new ol.geom.LineString([feature.getGeometry().getCoordinates(), self.positionFeature.getGeometry().getCoordinates()]);
          if(line.getLength() < minLength && feature.get('available_bike_stands') > 0) {
            closestStationStands.setGeometry(feature.getGeometry());
            closestStationStands.set('name', feature.get('name'));
            minLength = line.getLength();
          }
      });
      view.setCenter(closestStationStands.getGeometry().getCoordinates());
      view.setZoom(18);
    }

    this.olMap.on('pointermove', function(evt) {
      var hit = self.olMap.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          return true;
      });
      if (hit) {
          this.getTargetElement().style.cursor = 'pointer';
      } else {
          this.getTargetElement().style.cursor = '';
      }
  });
    this.olMap.addOverlay(popup);
    this.olMap.on('click', function(evt) {
      var container = document.getElementById('popup');
      var feature = self.olMap.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
            return feature;
          });


      if (feature && !(feature.get("name")=="bikePath") && (!popup.getPosition() || feature.getGeometry().getCoordinates()[0]!=popup.getPosition()[0] || feature.getGeometry().getCoordinates()[1]!=popup.getPosition()[1])) {
        var bwah = feature.getGeometry().getCoordinates();
        var bwoh = popup.getPosition();
        if(feature.get("name")=="self") {
          container.innerHTML="<p id ='title1' display='inline-block'> C'est vous ! </p>";
        } else {
          container.innerHTML =  "<p id='title1' display='inline-block'>"+feature.get("name")+"</p>";
          container.innerHTML += "<p id ='title2' display='inline-block'>"+feature.get("address")+"</p><br/>";
          container.innerHTML += "<div id='infos'>";
          container.innerHTML += "<p><span id='subtitle'> Vélos disponibles : </span>"+feature.get("available_bikes")+"</p>";
          container.innerHTML += "<p><span id='subtitle'> Emplacements disponibles : </span>"+feature.get("available_bike_stands")+"</p>";
          container.innerHTML += "</div>";
          if(storage.getItem(feature.get('number')) === null) {
            container.innerHTML += "<p><span id='subtitle'> Ajouter aux favoris : </span><input id='check_favourite' type='checkbox'/></p>";
          } else {
            container.innerHTML += "<p><span id='subtitle'> Retirer des favoris : </span><input id='check_favourite' type='checkbox' checked/></p>";
          }
          var check_favourite = document.getElementById('check_favourite');
          check_favourite.addEventListener('change', function(evt) {
            if(check_favourite['checked']) {
              storage.setItem(feature.get("number"), feature.get("name"));
            } else {
              storage.removeItem(feature.get("number"));
            }
          });
        }
        popup.setOffset([feature.getStyle().getImage().getSize()[0]/2, - feature.getStyle().getImage().getSize()[1]]);
        popup.setPosition(feature.getGeometry().getCoordinates());


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