import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalPage } from '../modal/modal';

@Component({
  selector: 'page-directory',
  templateUrl: 'directory.html'
})
export class DirectoryPage {
  title: string = "";
  users: any = [];
  tempUsers: any = [];
  searchKey: string = '';
  result: any = '';
  colors = ['#005aff', '#86d59b', '#00c0ff', '#7200ff'];
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private modalCtrl: ModalController
  ) {
    this.title = 'Facility Directory';
    this.db.list("/userList").subscribe(data => {
      let facility = '';
      data.map(user => {
        if(localStorage.getItem("email") === user.email && localStorage.getItem("phone") === user.phoneNumber) {
          facility = user.facility;
        }
      });

      data.map(user => {
        if(facility === user.facility) {
          user.photoUrl = localStorage.getItem("photo");
          this.users.push(user);
          this.tempUsers.push(user);
        }
      });
    });
  }

  ionViewDidLoad() {
    
  }

  presentModal() {
    let modal = this.modalCtrl.create(ModalPage);
    modal.present();
  }

  getUsers(event) {
    console.log(event)
    this.searchKey = event.target.value;
    this.users = [];

    this.tempUsers.map(user => {
      let username = user.firstName + " " + user.lastName;
      if(username.toLowerCase().indexOf(this.searchKey.toLowerCase()) >= 0) {
        this.users.push(user);
      }
    });

    this.result = this.users.length + " results";
  }

}
