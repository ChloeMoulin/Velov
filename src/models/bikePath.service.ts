import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class BikePathService {

  private bikePathsURL = 'https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&maxfeatures=30&request=GetFeature&typename=pvo_patrimoine_voirie.pvoamenagementcyclable&SRSNAME=urn:ogc:def:crs:EPSG::4171';

  constructor(private http: Http) {}

  getBikePaths() : Promise<any> {
    return this.http.get(this.bikePathsURL)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occured', error);
    return Promise.reject(error.message || error);
  }
}
