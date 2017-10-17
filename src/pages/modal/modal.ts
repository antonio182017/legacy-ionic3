import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { UserProvider } from '../../providers/user';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {
  inviteData = {
    firstName: '',
    lastName: '',
    facilityName: '',
    email: '',
    number: '(1)',
    type: '',
    patient: '',
    inviteDate: new Date()
  };
  inviteType = '';
  patients: any = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private view: ViewController,
    private user: UserProvider, 
    private db: AngularFireDatabase, 
    private toast: ToastController
  ) {
    this.inviteType = this.navParams.get("type");
    this.inviteData.type = this.inviteType;
    user.patients.subscribe(d => {
      user.getPatients().then(data => {
        this.patients = data;
      });
    });
  }

  ionViewDidLoad() {
  }

  closeModal() {
    this.view.dismiss();
  }

  sendInvite() {
    this.inviteData.email = this.inviteData.email.toLowerCase();
    this.inviteData.facilityName = this.inviteData.facilityName.toLowerCase();
    this.closeModal();
    let message = 'Sent invitation.';
    this.presentToast(message);
    this.inviteData.facilityName = localStorage.getItem("facility") ? localStorage.getItem("facility") : '';
    this.user.sendInvitation(this.inviteData).then(data => {
      let message = 'Sent invitation successfully.';
      this.presentToast(message);
    })
    .catch(err => {
    });
  }

  addPatient() {
    this.user.patients.subscribe(data => {
      console.log(data, localStorage.getItem("patientId"));
      if(typeof localStorage.getItem("patientId") === 'undefined' || localStorage.getItem("patientId") === '') {
        this.db.list("/patients").push({facility: localStorage.getItem("facility"), patients: [this.inviteData.firstName + " " + this.inviteData.lastName]});
      } else {
        if(typeof data !== 'undefined' && data.indexOf(this.inviteData.firstName + " " + this.inviteData.lastName) < 0) {
          data.push(this.inviteData.firstName + " " + this.inviteData.lastName);
          this.db.list("/patients").update(localStorage.getItem("patientId"), {facility: localStorage.getItem("facility"), patients: data});          
        } else if (typeof data === 'undefined') {
          this.db.list("/patients").update(localStorage.getItem("patientId"), {facility: localStorage.getItem("facility"), patients: [this.inviteData.firstName + " " + this.inviteData.lastName]});          
        }
      }
    });
    let message = 'Added new patient successfully.';
    this.presentToast(message);
    this.closeModal();
  }

  presentToast(message) {
    let toast = this.toast.create({
      message: message,
      duration: 1500,
      position: 'top'
    });
  
    toast.onDidDismiss(() => {
    });
  
    toast.present();
  }
}
