import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { UserProvider } from '../../providers/user';
import { SignupPage } from '../signup/signup';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'page-facilitysignup',
  templateUrl: 'facilitysignup.html',
})
export class FacilitysignupPage {
  signupData = {
    facility: '',
    emailphone: '',
    email: '',
    phone: ''
  }
  facilities = [];
  tempFacilities = [];
  showList = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private provider: UserProvider,
    private loading: LoadingController,
    private alert: AlertController,
    private db: AngularFireDatabase
  ) {
    db.list("facilities").subscribe(data => {
      this.facilities = data;
      this.tempFacilities = data;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FacilitysignupPage');
  }

  ionViewWillEnter() {
    this.signupData.email = '';
    this.signupData.phone = '';
  }

  signup() {
    if(parseInt(this.signupData.emailphone.substring(0, 1)) > 0) {
      this.signupData.phone = this.signupData.emailphone;
    } else {
      this.signupData.email = this.signupData.emailphone.toLowerCase();
    }
    this.signupData.facility = this.signupData.facility.toLowerCase();
    if(this.signupData.facility.indexOf(" ") >= 0) {
      let alert = this.alert.create({
        message: 'Facility name can not include space.',
        buttons: [{text: "OK"}]
      });
      alert.present();
      return;
    }

    let loading = this.loading.create({
      spinner: 'hide',
      content: `
        <div class="loading">
          <h4>Legacy</h4>
        </div>`
    });
    loading.present();
    this.provider.isInvited(this.signupData).then(data => {
      console.log(data);
      loading.dismiss();
      if(typeof data === "boolean") {
        this.navCtrl.push(SignupPage, {isInvited: false, data: this.signupData});
      } else if (typeof data === "object") {
        this.navCtrl.push(SignupPage, {isInvited: true, data: data});
      }
    }).catch(err => {
      loading.dismiss();
      let alert = this.alert.create({
        message: err.message,
        buttons: [{text: "OK"}]
      });
      alert.present();
    });
  }

  selectFacility(value) {
    this.signupData.facility = value;
    this.showList = false;
  }

  getFilteredFacilities(event) {
    let key = event.target.value;
    this.facilities = [];

    this.tempFacilities.map(f => {
      if(f.$value.toLowerCase().indexOf(key.toLowerCase()) >= 0) {
        this.facilities.push(f);
      }
    });
  }

}
