import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Marker } from '../../src/models/marker';
import { MapService } from '../models/map.service';
import { StatusBar, Splashscreen } from 'ionic-native';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';



@Component({
  templateUrl: 'app.html',
  providers: [MapService]
})
export class MyApp {
  rootPage = TabsPage;
  markers: Marker[];


  constructor(platform: Platform, private mapService: MapService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }



}
