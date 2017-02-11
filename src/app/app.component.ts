import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { MarkerService } from '../models/marker.service';
import { GlobalMarkersService} from '../models/globalMarkers.service'
import { BikePathService } from '../models/bikePath.service';
import { GlobalBikePathsService} from '../models/globalBikePaths.service'
import { StatusBar, Splashscreen } from 'ionic-native';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from 'ionic-native';
import {Headers, Http} from '@angular/http';
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



  constructor(private http: Http, platform: Platform, private markerService: MarkerService, private globalMarkersService: GlobalMarkersService, private bikePathService: BikePathService, private globalBikePathsService: GlobalBikePathsService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  getMarkers(): void {
    this.markerService.getMarkers().then(
      markers => {

        this.globalMarkersService.setMarkers(markers);
        this.markerService.saveMarkers(markers);
        this.globalMarkersService.setState(0);

      },
      error => {
        var markersLoad = this.markerService.loadMarkers();
        if (markersLoad) {
          this.globalMarkersService.setMarkers(markersLoad);
          this.globalMarkersService.setState(2);
        } else {
          this.globalMarkersService.setState(1);
        }

      }

    );

  }
    getBikePaths(): void {
      this.bikePathService.getBikePaths().then(
        bikePaths => {
          this.globalBikePathsService.setBikePaths(bikePaths);
          this.bikePathService.saveBikePaths(bikePaths);
          this.globalBikePathsService.setState(0);
      },
      error => {
        var bikePathsLoad = this.bikePathService.loadBikePaths();
        if(bikePathsLoad) {
          this.globalBikePathsService.setBikePaths(this.bikePathService.loadBikePaths());
          this.globalBikePathsService.setState(0);
        } else {
          this.globalBikePathsService.setState(1);
        }
      });
    }







  }
