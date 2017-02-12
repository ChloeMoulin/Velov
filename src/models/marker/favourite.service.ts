import { Injectable } from '@angular/core';
import { MarkerStyleService} from '../../models/marker/markerStyle.service';
import { GlobalMarkersService} from '../../models/marker/globalMarkers.service';


@Injectable()
export class FavouriteService {

  ms: any;
  gs: any;

  constructor(private markerStyle: MarkerStyleService, private globalMarkersService: GlobalMarkersService) {
    this.ms = markerStyle;
    this.gs = globalMarkersService;
  }

  manageFavourite(favourite,feature,element) {
    var self = this;
    var storage = window.localStorage;
    if(storage.getItem(feature.get('number')) === null) {
      storage.setItem(feature.get("number"), feature.get("name"));
      favourite.innerHTML = "<p><span id='subtitle'> Retirer des favoris : </span><img id='check_favourite' src='assets/icon/star_full.PNG' alt='star' /></p>";
    } else {
      storage.removeItem(feature.get("number"));
      favourite.innerHTML = "<p><span id='subtitle'> Ajouter aux favoris : </span><img id='check_favourite' src='assets/icon/star_empty.PNG' alt='star'/></p>";

    }
    this.ms.setFeatureStyle(feature, this.gs.getState());
    var check_favourite = document.getElementById('check_favourite');
    check_favourite.addEventListener('click', function(evt) {
      self.manageFavourite(favourite,feature,element);
    });
  }

}
