  import { Injectable } from '@angular/core';
  import {Headers, Http} from '@angular/http';
  import 'rxjs/add/operator/toPromise';


  @Injectable()
  export class MapService {

    private markersURL = 'https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&request=GetFeature&typename=jcd_jcdecaux.jcdvelov&SRSNAME=urn:ogc:def:crs:EPSG::4171';

    constructor(private http: Http) {}

    getMarkers() : Promise<any> {
      return this.http.get(this.markersURL)
                 .toPromise()
                 .then(response => response.json())
                 .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occured', error);
      return Promise.reject(error.message || error);
    }
  }
