import { Component } from '@angular/core';
import { MarkerService } from '../../models/marker/marker.service';
import { GlobalMarkersService} from '../../models/marker/globalMarkers.service';
import { DisplayMarkerService} from '../../models/marker/displayMarker.service';
import { PopupService } from '../../models/marker/popup.service';
import { BikePathService } from '../../models/bikePath/bikePath.service';
import { DisplayBikePathService } from '../../models/bikePath/displayBikePath.service';
import { GlobalBikePathsService} from '../../models/bikePath/globalBikePaths.service';
import { GeolocalisationService} from '../../models/geolocalisation/geolocalisation.service';
import { NavController } from 'ionic-angular';

declare var ol: any;
declare var cordova: any;
declare var device: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'

})


export class MapPage {



  olMap: any;

  marker_features: any[];
  bike_path_features: any[];

  markers: any[];
  bike_paths: any[];

  source: any;
  positionFeature: any;
  source_path: any;

  markers_state: any;
  bikePaths_state: any;

  view: any;
  geoVector: any;
  could_locate: any;

  gms: any;
  gbps: any;
  popupService: any;
  display_marker: any;
  display_bike_path: any;
  geo: any;



  constructor(public navCtrl: NavController,private geolocalisation: GeolocalisationService, private markerService: MarkerService, private globalMarkersService: GlobalMarkersService, private bikePathService: BikePathService, private globalBikePathsService: GlobalBikePathsService, private displayMarker: DisplayMarkerService, private popup: PopupService, private displayBikePath: DisplayBikePathService) {

    this.popupService = popup;
    this.display_marker = displayMarker;
    this.display_bike_path = displayBikePath;
    this.gms = globalMarkersService;
    this.gbps = globalBikePathsService;
    this.geo = geolocalisation;
    this.markers_state = globalMarkersService.getState();
    this.bikePaths_state = globalBikePathsService.getState();



    if(this.markers_state == 0 || this.markers_state == 2) {
      this.markers = globalMarkersService.getMarkers();
      this.marker_features = [];
    }


    if(this.bikePaths_state == 0) {
      this.bike_paths = globalBikePathsService.getBikePaths();
      this.bike_path_features = [];
    }

    if(this.markers_state == 1 || this.bikePaths_state == 1 || this.markers_state == 2) {
      alert("Problème de connexion, certaines données peuvent être indisponibles");
    }
  }

  manageBikePaths() {
    var self = this;
    this.bike_path_features = this.displayBikePath.buildBikePathFeatures(this.bike_paths);
    this.source_path.addFeatures(this.bike_path_features);
    var check_bike_paths = document.getElementById('check_bike_paths');
    check_bike_paths.addEventListener('change', function(evt) {
      if(check_bike_paths['checked']) {
        self.source_path.addFeatures(self.bike_path_features);
      } else {
        self.source_path.clear();
      }
    });
  }

  manageMarkers() {
    var self = this;
    this.marker_features = this.displayMarker.buildMarkerFeatures(this.markers, this.markers_state);
    this.source.addFeatures(this.marker_features);
    this.popupService.managePopup(document.getElementById('popup'),this.olMap);

    this.manageButtonSearch();

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

        var check_stations = document.getElementById('check_stations');
        check_stations.addEventListener('change', function(evt) {
          if(check_stations['checked']) {
            self.source.addFeatures(self.marker_features);
          } else {
            self.source.clear();
          }
        });
  }



  manageButtonSearch() {
    var self = this;
    var button1 = document.getElementById('getClosestStation');
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
      self.view.setCenter(closestStation.getGeometry().getCoordinates());
      self.view.setZoom(18);
    }

    if(this.markers_state == 0) {
      var button2 = document.getElementById('getClosestStationBikes');
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
        self.view.setCenter(closestStationBikes.getGeometry().getCoordinates());
        self.view.setZoom(18);
      }

      var button3 = document.getElementById('getClosestStationStands');
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
        self.view.setCenter(closestStationStands.getGeometry().getCoordinates());
        self.view.setZoom(18);
      }
    }

  }










  manageDisplay() {
     if(this.markers_state == 1 && this.bikePaths_state == 1 && !this.could_locate) {
       document.getElementById("select").style.display="none";
     } else if (this.markers_state == 1) {
       document.getElementById("p_check_stations").style.display="none";
     } else if (this.bikePaths_state ==1) {
       document.getElementById("p_check_bike_Paths").style.display="none";
     }
  }


  ionViewDidLoad() {

    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }

    this.markers_state = this.gms.getState();
    this.bikePaths_state = this.gbps.getState();

    if(typeof this.markers_state != undefined && typeof this.bikePaths_state != undefined) {

      var self = this;
      this.source = new ol.source.Vector();
      this.source_path = new ol.source.Vector();
      this.geoVector = new ol.source.Vector();



      this.view = new ol.View({
        center: ol.proj.transform([4.8323750495910645,45.7574933281114], 'EPSG:4326','EPSG:3857'),
        zoom: 13 ,
        minZoom: 12,
        maxZoom: 20
      });

    document.addEventListener("deviceready", onDeviceReady, false);

      var permissions = cordova.plugins.permissions;
      if(device.platform =='Android' && !permissions.hasPermission(permissions.ACCESS_COARSE_LOCATION, null, null) && !permissions.hasPermission(permissions.ACCESS_FINE_LOCATION, null, null)) {
        permissions.requestPermission(permissions.ACCESS_COARSE_LOCATION, null, null);
        permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, null, null);
      }


    this.geo.manageGeolocalisation(this.could_locate, this.geoVector, this.view, this.positionFeature);



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
          new ol.layer.Vector({

            source: this.geoVector
          })
        ],
        controls: ol.control.defaults({
          attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
          })
        }),
        view: this.view
      });
      if (this.markers_state == 0 || this.markers_state == 2) {
        this.manageMarkers();
      }

      if (this.bikePaths_state == 0) {
        this.manageBikePaths();
      }

      this.manageDisplay();



    var check_self = document.getElementById('check_self');
    check_self.addEventListener('change', function(evt) {
      if(check_self['checked']) {
        self.geoVector.addFeature(self.positionFeature);
      } else {
        self.geoVector.clear();
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
}
