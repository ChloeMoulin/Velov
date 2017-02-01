import { Component } from '@angular/core';
import { MapService } from '../../models/map.service';
import { GlobalMarkersService} from '../../models/globalMarkers.service';
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
  features: any[];
  markers: any[];
  source: any;

  constructor(public navCtrl: NavController,private mapService: MapService, private globalMarkersService: GlobalMarkersService) {

    this.markers = globalMarkersService.getMarkers();
    this.features = [];


  }

  buildFeatures() {
    var iconStyle100 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker100.png'
      }))
    });
    var iconStyle75 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker75.png'
      }))
    });
    var iconStyle50 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker50.png'
      }))
    });
    var iconStyle25 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker25.png'
      }))
    });
    var iconStyle0 = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/Marker0.png'
      }))
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
      this.features.push(feature);
    }
  }

  ionViewDidLoad() {

    var self = this;


this.buildFeatures();
  this.source = new ol.source.Vector({
    features: this.features
  })




  var view = new ol.View({
    center: ol.proj.transform([4.8323750495910645,45.7574933281114], 'EPSG:4326','EPSG:3857'),
    zoom: 13,
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

    var accuracyFeature = new ol.Feature();
    geolocation.on('change:accuracyGeometry', function() {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    var positionFeature = new ol.Feature();
    positionFeature.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        opacity: 1,
        src: '../../assets/icon/self.png'
      }))
    }));

    geolocation.on('change:position', function() {
      var coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
      view.setCenter(coordinates);
      view.setZoom(16);
    });

    var geoVector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [accuracyFeature, positionFeature]
      })
    });

    var element = document.getElementById('popup');



    this.olMap = new ol.Map({
      target:"map",

      layers: [
        new ol.layer.Tile({
          source:new ol.source.OSM()
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
      if (feature) {
        container.innerHTML =  "<p id='title1' display='inline-block'>"+feature.get("name")+"</p>";
        container.innerHTML += "<p id ='title2' display='inline-block'>"+feature.get("address")+"</p><br/>";
        container.innerHTML += "<div id='infos'>";
        container.innerHTML += "<p><span id='subtitle'> Vélos disponibles : </span>"+feature.get("available_bikes")+"</p>";
        container.innerHTML += "<p><span id='subtitle'> Emplacements disponibles : </span>"+feature.get("available_bike_stands")+"</p>";
        container.innerHTML += "</div>";
        popup.setPosition(evt.coordinate);

      } else {
        container.innerHTML = "";
        popup.setPosition(undefined);
      }
    });


  }


}
