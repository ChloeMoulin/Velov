import { Injectable } from '@angular/core';
import { MarkerStyleService} from '../../models/marker/markerStyle.service';

declare var ol: any;

@Injectable()
export class DisplayMarkerService {

  ms: any;

  constructor(private markerStyleService: MarkerStyleService) {
    this.ms = markerStyleService;
  }



  buildMarkerFeatures(markers, state) : any[] {
    var marker_features = [];
    if (markers == undefined)
      return;


    for(let marker in markers){

      var ratio = markers[marker].properties.available_bikes/markers[marker].properties.bike_stands;
      var coordinates = markers[marker].geometry.coordinates;
      var name = markers[marker].properties.name;
      var number = markers[marker].properties.number;
      var address = markers[marker].properties.address;
      var city = markers[marker].properties.commune;
      var available_bikes = markers[marker].properties.available_bikes;
      var available_bike_stands = markers[marker].properties.available_bike_stands;

      var point = new ol.geom.Point(ol.proj.transform(coordinates, 'EPSG:4326','EPSG:3857'));
      var feature = new ol.Feature();
      feature.set("name",name + " - "+city);
      feature.set("address",address);
      feature.set("available_bikes", available_bikes);
      feature.set("available_bike_stands",available_bike_stands);
      feature.set("ratio",ratio);
      feature.set("number", number);
      feature.setGeometry(point)
      this.ms.setFeatureStyle(feature);

      marker_features.push(feature);
    }

    return marker_features;
  }

}
