import { Injectable } from '@angular/core';
import { GlobalMarkersService} from '../../models/marker/globalMarkers.service';
import { FavouriteService} from '../../models/marker/favourite.service';

declare var ol: any;

@Injectable()
export class PopupService {

  gms: any;
  fs: any;


  constructor(private globalMarkersService: GlobalMarkersService, private favouriteService: FavouriteService) {
    this.gms= globalMarkersService;
    this.fs = favouriteService;
  }

  managePopup(popupElement,map) {
    var markers_state = this.gms.getState();
    var self = this;
    var storage = window.localStorage;


        var popup = new ol.Overlay({
          element: popupElement,
          positioning: 'bottom-left',
          stopEvent: true,
          autoPan: true
        });

        map.addOverlay(popup);
        map.on('click', function(evt) {
          popupElement.style.display="";
          var container = popupElement;
          var feature = map.forEachFeatureAtPixel(evt.pixel,
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
                self.fs.manageFavourite(document.getElementById("favourite"),feature,popupElement);
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

}
