import { Injectable } from '@angular/core';
import { GlobalMarkersService} from '../../models/marker/globalMarkers.service';
import { GlobalBikePathsService} from '../../models/bikePath/globalBikePaths.service';

declare var ol: any;

@Injectable()
export class GeolocalisationService {

  gms: any;
  gbps: any;

  constructor(private globalMarkersService : GlobalMarkersService, private globalBikePathsService: GlobalBikePathsService) {
    this.gms = globalMarkersService;
    this.gbps = globalBikePathsService;
  }


manageGeolocalisation(could_locate, geoVector, view, positionFeature) {

    function setPosition(position){

      could_locate = true;
      document.getElementById("search_stations").style.display="";
      document.getElementById("p_check_self").style.display="";
      var coordinates = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857');
      positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
      view.setCenter(coordinates);
      view.setZoom(16);
      geoVector.addFeature(positionFeature);
    }
    could_locate = false;
    var self = this;
    positionFeature = new ol.Feature();
    function changePosition(position){
      could_locate = true;
      document.getElementById("search_stations").style.display="";
      document.getElementById("p_check_self").style.display="";
      var coordinates = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857');
      positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
      geoVector.addFeature(positionFeature);
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }




      navigator.geolocation.getCurrentPosition(setPosition, onError, { timeout: 30000, enableHighAccuracy:true });
      navigator.geolocation.watchPosition(changePosition, onError, { timeout: 30000, enableHighAccuracy:true });
      positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          opacity: 1,
          src: 'assets/icon/self.png',
          anchor: [0.5,1]
        })),
        zIndex:2000
      }));

      positionFeature.set("name","self");
  }



}
