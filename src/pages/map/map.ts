import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

declare var ol: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'

})


export class MapPage {

  constructor(public navCtrl: NavController) {

  }

  olMap: any;

  ionViewDidLoad() {
    
    this.olMap = new ol.Map({
      target:"map",
      layers: [
        new ol.layer.Tile({
          source:new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.transform([4.8323750495910645,45.7574933281114], 'EPSG:4326','EPSG:3857'),
        zoom: 13,

      }),
      controls: []
    });

  }


}
