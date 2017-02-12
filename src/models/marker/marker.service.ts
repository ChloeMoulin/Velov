  import {Injectable } from '@angular/core';
  import {Headers, Http} from '@angular/http';
  import 'rxjs/add/operator/toPromise';



  @Injectable()
  export class MarkerService {

    private markersURL = 'https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&request=GetFeature&typename=jcd_jcdecaux.jcdvelov&SRSNAME=urn:ogc:def:crs:EPSG::4171';

    constructor(private http: Http) {}

    getMarkers() : Promise<any> {
      return this.http.get(this.markersURL)
                 .toPromise()
                 .then(response => response.json())
                 .catch(this.handleError);
    }

    saveMarkers(markers) {
      var storage = window.localStorage;
      storage.setItem("MarkersDataSave",JSON.stringify(markers));


    }

    loadMarkers() : any {
      var storage = window.localStorage;
      if (storage.getItem("MarkersDataSave")=== null)
        return undefined;
      return JSON.parse(storage.getItem("MarkersDataSave"));
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occured', error);
      return Promise.reject(error.message || error);
    }
  }
