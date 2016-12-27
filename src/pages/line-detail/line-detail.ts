import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the LineDetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/line-detail/line-detail.html',
})
export class LineDetailPage {
  BusInfo : any;
  constructor(public navCtrl: NavController ,NavParams: NavParams) {
  		this.BusInfo = NavParams.get("item");
  }

}
