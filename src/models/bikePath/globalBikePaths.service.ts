import { Injectable } from '@angular/core';


@Injectable()
export class GlobalBikePathsService {

  bikePaths: any[];
  state: any;

  constructor() {
    this.bikePaths = [];
  }

  getBikePaths() : any[] {
    return this.bikePaths;
  }

  getState() : any {
    return this.state;
  }

   setState(state: any) {
     this.state = state;
   }
   
  setBikePaths(newBikePaths: any) {
    this.bikePaths = newBikePaths.features;
  }

}
