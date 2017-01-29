import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { MapService } from '../models/map.service';
import { GlobalMarkersService} from '../models/globalMarkers.service'
import { StatusBar, Splashscreen } from 'ionic-native';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';
import {OnInit} from  '@angular/core';


import { TabsPage } from '../pages/tabs/tabs';



@Component({
  templateUrl: 'app.html',
  providers: [MapService, GlobalMarkersService]
})
export class MyApp implements OnInit {
  ngOnInit(): void {
    this.getMarkers();
  }
  rootPage = TabsPage;



  constructor(platform: Platform, private mapService: MapService, private globalMarkersService: GlobalMarkersService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  getMarkers(): void {
    this.mapService.getMarkers().then(markers => {

     this.globalMarkersService.setMarkers(markers);

    });





  }



}
