import { Component } from '@angular/core';
import { MarkerService } from '../../models/marker.service';
import { GlobalMarkersService} from '../../models/globalMarkers.service';
import { BikePathService } from '../../models/bikePath.service';
import { GlobalBikePathsService} from '../../models/globalBikePaths.service';
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
  style: any;
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
  gms: any;
  gbps: any;
  could_locate: any;
  iconStyle100: any;
  iconStyle75_100: any;
  iconStyle50_75: any;
  iconStyle25_50: any;
  iconStyle0_25: any;

  iconStyle0: any;
  iconStyle100f: any;
  iconStyle75_100f: any;
  iconStyle50_75f: any;
  iconStyle25_50f: any;
  iconStyle0_25f: any;
  iconStyle0f: any;


  constructor(public navCtrl: NavController,private markerService: MarkerService, private globalMarkersService: GlobalMarkersService, private bikePathService: BikePathService, private globalBikePathsService: GlobalBikePathsService) {

    this.gms = globalMarkersService;
    this.gbps = globalBikePathsService;
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
    this.buildBikePathFeatures();
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
    this.buildMarkerFeatures();
    this.source.addFeatures(this.marker_features);
    this.managePopup();

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


  managePopup() {
    var markers_state = this.gms.getState();
    var self = this;
    var storage = window.localStorage;
    var element = document.getElementById('popup');


        var popup = new ol.Overlay({
          element: document.getElementById('popup'),
          positioning: 'bottom-left',
          stopEvent: true,
          autoPan: true
        });

        this.olMap.addOverlay(popup);
        this.olMap.on('click', function(evt) {
          element.style.display="";
          var container = document.getElementById('popup');
          var feature = self.olMap.forEachFeatureAtPixel(evt.pixel,
              function(feature, layer) {
                return feature;
              });


          if (feature && !(feature.get("name")=="bikePath") && (!popup.getPosition() || feature.getGeometry().getCoordinates()[0]!=popup.getPosition()[0] || feature.getGeometry().getCoordinates()[1]!=popup.getPosition()[1])) {
            if(feature.get("name")=="self") {
              container.innerHTML="<p id ='title1' display='inline-block'> C'est vous ! </p>";
            } else {
              container.innerHTML =  "<p id='title1' display='inline-block'>"+feature.get("name")+"</p>";
              container.innerHTML += "<p id ='title2' display='inline-block'>"+feature.get("address")+"</p><br/>";
              container.innerHTML += "<div id='infos'>";
              if(markers_state == 2) {
                container.innerHTML += "<p><span id='subtitle'> Vélos disponibles : </span> indisponible </p>";
                container.innerHTML += "<p><span id='subtitle'> Emplacements disponibles : </span> indisponible </p>";
              } else {
                container.innerHTML += "<p><span id='subtitle'> Vélos disponibles : </span>"+feature.get("available_bikes")+"</p>";
                container.innerHTML += "<p><span id='subtitle'> Emplacements disponibles : </span>"+feature.get("available_bike_stands")+"</p>";
              }

              container.innerHTML += "</div>";
              if(storage.getItem(feature.get('number')) === null) {
                container.innerHTML += "<div id=favourite><p><span id='subtitle'> Ajouter aux favoris : </span><img id='check_favourite' src='assets/icon/star_empty.PNG' alt='star' /></p>";
              } else {
                container.innerHTML += "<div id=favourite><p><span id='subtitle'> Retirer des favoris : </span><img id='check_favourite' src='assets/icon/star_full.PNG' alt='star' /></p>";
              }

              var check_favourite = document.getElementById('check_favourite');
              check_favourite.addEventListener('click', function(evt) {
                self.manageFavourite(feature,element);
              });

            }
            popup.setOffset([feature.getStyle().getImage().getSize()[0]/2, - feature.getStyle().getImage().getSize()[1]]);
            popup.setPosition(feature.getGeometry().getCoordinates());


          } else {
            container.innerHTML = "";
            popup.setPosition(undefined);
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

  setFeatureStyle(feature) {
    var available_bike_stands = feature.get("available_bike_stands");
    var ratio = feature.get("ratio");
    var available_bikes = feature.get("available_bikes");
    var storage = window.localStorage;
    if(storage.getItem(feature.get('number')) === null) {
      if(this.markers_state == 2) {
        feature.setStyle(this.iconStyle100);
      } else if (available_bike_stands == 0) {
        feature.setStyle(this.iconStyle100);
      } else if(available_bikes == 0) {
        feature.setStyle(this.iconStyle0);
      } else if (ratio <= 0.25){
        feature.setStyle(this.iconStyle0_25);
      } else if (ratio <= 0.5) {
        feature.setStyle(this.iconStyle25_50);
      } else if (ratio <= 0.75) {
        feature.setStyle(this.iconStyle50_75);
      } else if (ratio < 1) {
        feature.setStyle(this.iconStyle75_100);
      } else {
        feature.setStyle(this.iconStyle100);
      }
    } else {
      if(this.markers_state == 2) {
        feature.setStyle(this.iconStyle100f);
      }else if (available_bike_stands == 0) {
        feature.setStyle(this.iconStyle100f);
      }else if(available_bikes == 0) {
        feature.setStyle(this.iconStyle0f);
      } else if (ratio <= 0.25){
        feature.setStyle(this.iconStyle0_25f);
      } else if (ratio <= 0.5) {
        feature.setStyle(this.iconStyle25_50f);
      } else if (ratio <= 0.75) {
        feature.setStyle(this.iconStyle50_75f);
      } else if (ratio < 1) {
        feature.setStyle(this.iconStyle75_100f);
      } else {
        feature.setStyle(this.iconStyle100f);
      }
    }
  }

  manageFavourite(feature,element) {
    var self = this;
    var storage = window.localStorage;
    if(storage.getItem(feature.get('number')) === null) {
      storage.setItem(feature.get("number"), feature.get("name"));
      document.getElementById('favourite').innerHTML = "<p><span id='subtitle'> Retirer des favoris : </span><img id='check_favourite' src='assets/icon/star_full.PNG' alt='star' /></p>";
      document.getElementById("popup").style.boxShadow = "1px 1px 12px #F8E511;"
    } else {
      storage.removeItem(feature.get("number"));
      document.getElementById('favourite').innerHTML = "<p><span id='subtitle'> Ajouter aux favoris : </span><img id='check_favourite' src='assets/icon/star_empty.PNG' alt='star'/></p>";
      document.getElementById("popup").style.boxShadow = "1px 1px 12px #555;"
    }
    this.setFeatureStyle(feature);
    var check_favourite = document.getElementById('check_favourite');
    check_favourite.addEventListener('click', function(evt) {
      self.manageFavourite(feature,element);
    });
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
    if (this.markers == undefined)
      return;

    this.iconStyle100 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker100.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle75_100 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker75-100.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle50_75 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker50-75.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle25_50 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker25-50.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle0_25 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker0-25.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });

    this.iconStyle0 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker0.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });

    this.iconStyle100f = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker100f.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle75_100f = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker75-100f.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle50_75f = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker50-75f.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle25_50f = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker25-50f.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });
    this.iconStyle0_25f = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker0-25f.png',
        anchor: [0.5,1]
      })),
      zIndex:2000
    });

    this.iconStyle0f = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: 'assets/icon/Marker0f.png',
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
      feature.set("ratio",ratio);
      feature.set("number", number);
      feature.setGeometry(point)
      this.setFeatureStyle(feature);

      this.marker_features.push(feature);
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
  manageGeolocalisation() {
    this.could_locate = false;
    var self = this;
    this.positionFeature = new ol.Feature();
  }

  ionViewDidLoad() {

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }
    var permissions = cordova.plugins.permissions;
    if(device.platform =='Android' && !permissions.hasPermission(permissions.ACCESS_COARSE_LOCATION, null, null) && !permissions.hasPermission(permissions.ACCESS_FINE_LOCATION, null, null)) {
      permissions.requestPermission(permissions.ACCESS_COARSE_LOCATION, null, null);
      permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, null, null);
      navigator.geolocation.getCurrentPosition(setPosition, onError, { timeout: 30000, enableHighAccuracy:true });
    }
    var storage = window.localStorage;
    

    this.markers_state = this.gms.getState();
    this.bikePaths_state = this.gbps.getState();

    this.manageGeolocalisation();
    function setPosition(position){
      self.could_locate = true;
      document.getElementById("search_stations").style.display="";
      document.getElementById("p_check_self").style.display="";
      var coordinates = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857');
      self.positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
      self.view.setCenter(coordinates);
      self.view.setZoom(16);
      self.geoVector.addFeature(self.positionFeature);
    }

    function changePosition(position){
      self.could_locate = true;
      document.getElementById("search_stations").style.display="";
      document.getElementById("p_check_self").style.display="";
      var coordinates = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857');
      self.positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
      self.geoVector.addFeature(self.positionFeature);
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

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

      navigator.geolocation.getCurrentPosition(setPosition, onError, { timeout: 30000, enableHighAccuracy:true });
      navigator.geolocation.watchPosition(changePosition, onError, { timeout: 30000, enableHighAccuracy:true });
      this.positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          opacity: 1,
          src: 'assets/icon/self.png',
          anchor: [0.5,1]
        })),
        zIndex:2000
      }));
    
      this.positionFeature.set("name","self");
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

    }

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