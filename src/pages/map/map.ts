import { Component } from '@angular/core';
import { MapService } from '../../models/map.service';
import { NavController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';

declare var ol: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'

})


export class MapPage {

  constructor(public navCtrl: NavController,private mapService: MapService) {

  }

  olMap: any;
  style: any;
  layer: any;
  markers: any;

  getMarkers() {
    this.markers = this.mapService.getMarkers();
  }

  ionViewDidLoad() {



    this.style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#ff7f50',
        width: 3
      })
    });

    this.layer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      Style: this.style,
      zIndex:5
    });

    this.olMap = new ol.Map({
      target:"map",

      layers: [this.layer,
        new ol.layer.Tile({
          source:new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.transform([4.8323750495910645,45.7574933281114], 'EPSG:4326','EPSG:3857'),
        zoom: 13,
        minZoom: 12,
        maxZoom:20

      }),
      controls: []
    });


  }


}
