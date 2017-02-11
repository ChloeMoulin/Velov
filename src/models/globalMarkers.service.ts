import { Injectable } from '@angular/core';


@Injectable()
export class GlobalMarkersService {

  markers: any[];
  state: any;

  constructor() {
    this.markers = [];
  }

  getMarkers() : any[] {
    return this.markers;
  }

  getState() : any {
    return this.state;
  }

   setState(state: any) {
     this.state = state;
   }

  setMarkers(newMarkers: any) {
    this.markers = newMarkers.features;
  }

}
