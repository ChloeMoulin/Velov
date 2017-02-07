import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { MarkerService } from '../models/marker.service';
import { GlobalMarkersService} from '../models/globalMarkers.service'
import { BikePathService } from '../models/bikePath.service';
import { GlobalBikePathsService} from '../models/globalBikePaths.service'
import { StatusBar, Splashscreen } from 'ionic-native';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';
import {OnInit} from  '@angular/core';


import { TabsPage } from '../pages/tabs/tabs';



@Component({
  templateUrl: 'app.html',
  providers: [MarkerService, GlobalMarkersService, BikePathService, GlobalBikePathsService]
})
export class MyApp implements OnInit {
  ngOnInit(): void {
    this.getMarkers();
    this.getBikePaths();
  }
  rootPage = TabsPage;



  constructor(platform: Platform, private markerService: MarkerService, private globalMarkersService: GlobalMarkersService, private bikePathService: BikePathService, private globalBikePathsService: GlobalBikePathsService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  getMarkers(): void {
    this.markerService.getMarkers().then(markers => {

     this.globalMarkersService.setMarkers(markers);

    });

  }
    getBikePaths(): void {
      this.bikePathService.getBikePaths().then(bikePaths => {
        this.globalBikePathsService.setBikePaths(bikePaths);
      });
    }





  }
