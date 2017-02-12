import { Injectable } from '@angular/core';


declare var ol: any;

@Injectable()
export class DisplayBikePathService {



  constructor() {

  }

    buildBikePathFeatures(bike_paths) : any[] {

      var style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#4AA440',
          width: 2
        }),

      });

      var bike_path_features;

      for(let bikePath in bike_paths) {
        var path = new ol.geom.LineString();
        if (bike_paths[bikePath].geometry.type == "LineString") {
          for(let coordinates in bike_paths[bikePath].geometry.coordinates) {
            var coord = bike_paths[bikePath].geometry.coordinates[coordinates];
            var coord2 = ol.proj.transform(coord, 'EPSG:4326','EPSG:3857');

            path.appendCoordinate(coord2);
          }
          var feature = new ol.Feature({
            geometry: path
          })
          feature.set("name","bikePath");
          feature.setStyle(style);
          bike_path_features.push(feature);
        } else if (bike_paths[bikePath].geometry.type == "MultiLineString") {
          for(let coordinates in bike_paths[bikePath].geometry.coordinates) {
            for(let subcoordinates in bike_paths[bikePath].geometry.coordinates[coordinates]) {
              var coord = bike_paths[bikePath].geometry.coordinates[coordinates][subcoordinates];
              var coord2 = ol.proj.transform(coord, 'EPSG:4326','EPSG:3857');

              path.appendCoordinate(coord2);
            }
            var feature = new ol.Feature({
              geometry: path
            })
            feature.set("name","bikePath");
            feature.setStyle(style);
            bike_path_features.push(feature);
          }
        }

      }
    return bike_path_features;
  }
}
