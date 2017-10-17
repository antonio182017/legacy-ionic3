import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FacilitysignupPage } from '../facilitysignup/facilitysignup';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  signin() {
    this.navCtrl.push(LoginPage);
  }

  signup() {
    this.navCtrl.push(FacilitysignupPage);
  }
}
