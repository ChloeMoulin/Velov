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

  ionViewDidLoad() {


    this.style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#3399CC'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
          })
        })
      });

  for(let marker in this.markers){
    var feature = new ol.Feature();
    feature.setStyle(this.style);
    var coordinates = this.markers[marker].geometry.coordinates;
    var point = new ol.geom.Point(ol.proj.transform(coordinates, 'EPSG:4326','EPSG:3857'));
    feature.setGeometry(point);
    this.features.push(feature);
  }

  this.source = new ol.source.Vector({
    features: this.features
  })





    this.olMap = new ol.Map({
      target:"map",

      layers: [
        new ol.layer.Tile({
          source:new ol.source.OSM()
        }),
        new ol.layer.Vector({
              source: this.source
            })
      ],
      view: new ol.View({
        center: ol.proj.transform([4.8323750495910645,45.7574933281114], 'EPSG:4326','EPSG:3857'),
        zoom: 13

      }),
      controls: []
    });


  }


}
