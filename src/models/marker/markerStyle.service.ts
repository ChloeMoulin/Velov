import { Injectable } from '@angular/core';
import { GlobalMarkersService} from '../../models/marker/globalMarkers.service';

declare var ol: any;

@Injectable()
export class MarkerStyleService {

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

  gms: any;



  constructor(private globalMarkersService: GlobalMarkersService) {
    this.gms= globalMarkersService;

  }

  defineStyle() {
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
  }

  setFeatureStyle(feature) {
    var available_bike_stands = feature.get("available_bike_stands");
    var ratio = feature.get("ratio");
    var available_bikes = feature.get("available_bikes");
    var storage = window.localStorage;
    if(storage.getItem(feature.get('number')) === null) {
      if(this.gms.getState() == 2) {
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
      if(this.gms.getState() == 2) {
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


}
