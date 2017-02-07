import { Injectable } from '@angular/core';


@Injectable()
export class GlobalBikePathsService {

  bikePaths: any[];

  constructor() {
    this.bikePaths = [];
  }

  getBikePaths() : any[] {
    return this.bikePaths;
  }

  setBikePaths(newBikePaths: any) {
    this.bikePaths = newBikePaths.features;
  }

}
