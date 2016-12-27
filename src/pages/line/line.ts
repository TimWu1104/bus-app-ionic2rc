
import { Component, SimpleChange, Input, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LineDetailPage } from '../line-detail/line-detail';
import { LineMapPage } from '../line-map/line-map';
import { BusToolbar } from '../../components/bus-toolbar/bus-toolbar';


@Component({
  templateUrl: 'build/pages/line/line.html',
  directives:[BusToolbar]
})
export class LinePage {
  selectedItem: any;
  items: Array<{busName: string, driver: string, numberPlate: string, startStates: string,showTool:boolean }>;

  constructor(public navCtrl: NavController, navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.items = [];
    for (let i = 1; i < 10; i++) {
      this.items.push({
        busName: i + '号班车',
        driver: '张杰：1891000200' + i,
        numberPlate: '粤C1234' + i,
        startStates: '公司大门(上)-公司',
        showTool:false
      });
    }
  };

  showToolBar(item){
    if(item.showTool){
      item.showTool = false;
    }else{
      item.showTool = true;
    }
   
  };

  openDetailsPage(item){
  	this.navCtrl.push(LineDetailPage, { item: item });
  };

  openLineMapPage(item){
    this.navCtrl.push(LineMapPage, { item: item });
  };
}