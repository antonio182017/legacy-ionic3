import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
})
export class MessagePage {
  readers: any = [];
  name: string = '';
  colors = ['#86d59b', '#005aff'];
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public view: ViewController
  ) {
    this.readers = this.navParams.get("readers");
    this.name = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagePage');
  }

  closeModal() {
    this.view.dismiss();
  }

}
