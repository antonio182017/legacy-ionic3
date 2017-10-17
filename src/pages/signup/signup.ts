import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { UserProvider } from '../../providers/user';
import { Analytics } from '../../providers/analytics';
import { ChatPage } from '../chat/chat';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signupData = {
    firstName: '',
    lastName: '',
    facilityName: '',
    phone: '(1)',
    email: '',
    password: '',
    repassword: '',
    type: 'facility',
    patient: '',
    createdAt: new Date()
  };
  isAdded: boolean = false;
  isInvited = false;
  invitedEmail = '';
  invitedPhone = '';
 
  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams, 
    private alertCtrl: AlertController, 
    private db: AngularFireDatabase,
    private userProvider: UserProvider,
    private toast: ToastController,
    private loading: LoadingController,
    private firebaseAnalytics: FirebaseAnalytics,
    private analytics: Analytics
  ) {
    this.isInvited = navParams.data.isInvited;
    if(this.isInvited) {
      let data = navParams.data.data;
      this.signupData.firstName = data.firstName;
      this.signupData.lastName = data.lastName;
      this.signupData.facilityName = data.facilityName;
      this.signupData.phone = '(1)' + data.number;
      this.signupData.email = data.email;
      this.signupData.type = data.type;
      this.signupData.patient = data.patient;
      this.invitedEmail = data.email;
      this.invitedPhone = data.number;
    } else {
      let data = navParams.data.data;
      this.signupData.facilityName = data.facility;
      this.signupData.email = data.email.toLowerCase();
      this.signupData.phone = '(1)' + data.phone;
      this.invitedEmail = data.email.toLowerCase();
      this.invitedPhone = '(1)' + data.phone;
    }
  }

  ionViewDidEnter() {

  }
 
  signup() {
    this.signupData.facilityName = this.signupData.facilityName.toLowerCase();
    this.signupData.email = this.signupData.email.toLowerCase();
    let loading = this.loading.create({
      spinner: 'hide',
      content: `
        <div class="loading">
          <h4>Legacy</h4>
        </div>`
    });
    loading.present();
    this.db.list("/facilities").subscribe(data => {
      if(this.signupData.password !== this.signupData.repassword) {
        loading.dismiss();
        let alert = this.alertCtrl.create({
          message: 'Please enter same password in re-enter password.',
          buttons: ['OK']
        });
        this.signupData.repassword = '';
        alert.present();
        return;
      }

      if(!this.isAdded) {
        this.isAdded = true;
        this.userProvider.adduser(this.signupData)
        .then(data => {
          this.firebaseAnalytics.logEvent('signup users', {email: this.signupData.email, phone: this.signupData.phone})
          .then((res: any) => console.log(res))
          .catch((error: any) => console.error(error));

          loading.dismiss();
          this.presentToast("Signed up successfully.");
          this.userProvider.setPatients().then(d => {
            this.analytics.sendSignUp('signup', true);
            this.navCtrl.setRoot(ChatPage);
          });
        })
        .catch(err => {
          loading.dismiss();
          this.isAdded = false;
          let alert = this.alertCtrl.create({
            title: 'Error',
            message: err.message,
            buttons: ['OK']
          });
          alert.present();
        });
      }
    });
  }

  presentToast(message) {
    let toast = this.toast.create({
      message: message,
      duration: 1500,
      position: 'top'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }
}