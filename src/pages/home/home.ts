import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { BusToolbar } from '../../components/bus-toolbar/bus-toolbar';
@Component({
  templateUrl: 'build/pages/home/home.html',
  directives:[BusToolbar]
})
export class HomePage {
  constructor(private navCtrl: NavController) {
  
  }
}
