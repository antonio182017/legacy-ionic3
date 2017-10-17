import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { UserProvider } from '../../providers/user';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  facility: string;
  updateData = {
    firstname: '',
    lastname: '',
    title: '',
    password: '',
    confirmpassword: '',
  };
  constructor(public navCtrl: NavController, public navParams: NavParams, private user: UserProvider, private load: LoadingController, private toast: ToastController) {
    this.facility = localStorage.getItem("facility");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  signOut() {
    this.navCtrl.setRoot(HomePage);
    this.user.logout();
  }

  update() {
    let loading = this.load.create({
      spinner: 'hide',
      content: `
        <div class="loading">
          <h4>Legacy</h4>
        </div>`
    });
    loading.present();

    let toast = this.toast.create({
      message: "User has been updated successfully.",
      duration: 1500,
      position: 'bottom'
    });
    this.user.updateUser(this.updateData).then(res => {
      loading.dismiss();
      toast.present();
    });
  }

  sendFeedback() {

  }

  rateUs() {
    
  }
}
