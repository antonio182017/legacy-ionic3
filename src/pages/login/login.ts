import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FacilitysignupPage } from '../facilitysignup/facilitysignup';
import { ChatPage } from '../chat/chat';
import { UserProvider } from '../../providers/user';
import { Analytics } from '../../providers/analytics';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  loginData = {
    emailphone: '',
    password: '',
    email: '',
    phone: ''
  }
  constructor(
    private navCtrl: NavController, 
    private userProvider: UserProvider,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private analytics: Analytics
  ) { }

  login() {
    if(parseInt(this.loginData.emailphone.substring(0, 1)) > 0) {
      this.loginData.phone = this.userProvider.getPhoneNumber(this.loginData.emailphone);
    } else {
      this.loginData.email = this.loginData.emailphone.toLowerCase();
    }
    let loading = this.loading.create({
      spinner: 'hide',
      content: `
        <div class="loading">
          <h4>Legacy</h4>
        </div>`
    });
    loading.present();
    let flag = false;
    this.userProvider.login(this.loginData)
    .then(data => {
      this.userProvider.setPatients().then(d => {
        if(!flag) {
          this.analytics.sendLogin('login', true);
          this.navCtrl.setRoot(ChatPage);
          flag = true;
          loading.dismiss();
        }
      }).catch(err => {
        loading.dismiss();
      });
    })
    .catch(err => {
      loading.dismiss();
      let alert = this.alertCtrl.create({
        message: err.message,
        buttons: ['OK']
      });
      alert.present();
    });
  }
}