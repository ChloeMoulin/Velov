import { Injectable } from '@angular/core';


@Injectable()
export class GlobalMarkersService {

  markers: any[];

  constructor() {
    this.markers = [];
  }

  getMarkers() : any[] {
    return this.markers;
  }

  setMarkers(newMarkers: any) {
    this.markers = newMarkers.features;
  }

}
