import { Component, OnDestroy } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserProvider } from '../../providers/user';
import { Analytics } from '../../providers/analytics';
import { MessagePage } from '../message/message';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Firebase } from '@ionic-native/firebase';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {

  ref: any = [];
  newMessage: string = '';
  messages: any = [];
  title: string = '#General';
  time: any;
  user: any = {};
  name = '';
  isReadUserExist = [];
  messageDB: any;
  type = '';
  directChannel = '';
  showUserList = false;
  username = '';
  users = [];
  filteredUsers = [];
  atNumbers = 0;
  colors = ['#005aff', '#86d59b', '#00c0ff', '#7200ff'];
  
  constructor(
    public navCtrl: NavController, 
    private db: AngularFireDatabase, 
    private params: NavParams,
    private userProvider: UserProvider,
    private modal: ModalController,
    private alert: AlertController,
    private firebaseAnalytics: FirebaseAnalytics,
    private fb: Firebase,
    private analytics: Analytics
  ) {
    // this.fb.logEvent('event', 'first').then(res => {
    //   console.log(res);
    // });
    // this.fb.getToken().then(res => {
    // }).catch(err => {
    // });
    this.db.list("userList").subscribe(data => {
      data.map(d => {
        if(((d.email !== localStorage.getItem("email") && d.email !== '') || (d.phoneNumber !== localStorage.getItem("phone") && d.email === '')) && d.facility === localStorage.getItem("facility") && d.type === "facility") {
          this.users.push(d);
        }
      });
    });

    this.title = params.get("title") ? params.get("title") : "#General";
    this.type = params.get("type") ? params.get("type") : '';
    this.directChannel = params.get("sender") && params.get("receiver") ? params.get("sender") + "-" + params.get("receiver") : '';

    if(typeof localStorage.getItem("channel") !== "undefined" && typeof localStorage.getItem("type") !== "undefined" && localStorage.getItem("type") === 'family' && typeof params.get("title") === 'undefined') {
      this.title = localStorage.getItem("channel");
    }

    this.userProvider.getTrueVault();
  }

  ngOnDestroy() {
    this.messageDB.unsubscribe();
  }

  ionicViewDidLoad() {

  }

  ionViewWillEnter() {
    this.userProvider.isSeletedChannel.subscribe(flag => {
      this.messageDB = this.db.list('/messages').subscribe(data => {
        this.messages = [];
        this.name = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName");
        data.map(d => {
          if(d.facility === localStorage.getItem("facility") && d.channel === this.title && d.facility === localStorage.getItem("facility") && d.channelType === '') {
            if(typeof d.bot === 'undefined' || d.bot === '' || (d.bot === localStorage.getItem('email') && d.bot !== '') || (d.bot === localStorage.getItem('phone') && d.bot !== '')) {
              d.displayTime = this.getDisplayTime(d.time);
              this.messages.push(d);
              // let index = 0;
              this.messages.map(m => {
                if(typeof m.readUsers !== 'undefined') {
                  // let flag = false;
                  m.readUsers.map(u => {
                    u.displayTime = this.getDisplayTime(u.time);
                    // if(u.name !== '' && u.name !== this.name) {
                    //   flag = true;
                    //   this.isReadUserExist[index] = true;
                    // }
                  });
                  // if(!flag) {
                  //   this.isReadUserExist[index] = false;
                  // }
                  // index ++;
                }
              });
    
              let flag = true;
              d.readUsers.map(user => {
                // if(user.name === '' && d.name !== localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")) {
                if(user.name === '') {
                  flag = false;
                } else if(user.name === localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")) {
                  flag = true;
                  return;
                }
              });
              if(!flag) {
                d.readUsers.push({name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"), time: new Date().getTime(), displayTime: '', photoUrl: localStorage.getItem("photo")})
                this.db.list('/messages').update(d.$key, d);
              }
            }
          } else if(d.facility === localStorage.getItem("facility") && d.channelType === 'direct' && d.directChannel.indexOf(this.params.get("sender")) >= 0 && d.directChannel.indexOf(this.params.get("receiver")) >= 0) {
            d.displayTime = this.getDisplayTime(d.time);
            this.messages.push(d);
            // let index = 0;
            this.messages.map(m => {
              if(typeof m.readUsers !== 'undefined') {
                // let flag = false;
                m.readUsers.map(u => {
                  u.displayTime = this.getDisplayTime(u.time);
                  // if(u.name !== '' && u.name !== this.name) {
                  //   flag = true;
                  //   this.isReadUserExist[index] = true;
                  // }
                });
                // if(!flag) {
                //   this.isReadUserExist[index] = false;
                // }
                // index ++;
              }
            });

            let flag = true;
            d.readUsers.map(user => {
              // if(user.name === '' && d.name !== localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")) {
              if(user.name === '') {
                flag = false;
              } else if(user.name === localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")) {
                flag = true;
                return;
              }
            });
            if(!flag) {
              d.readUsers.push({name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"), time: new Date().getTime(), displayTime: '', photoUrl: localStorage.getItem("photo")})
              this.db.list('/messages').update(d.$key, d);
            }
          }
        });
      });
    });
  }

  send(){
    this.time = new Date().getTime();
    let message = {
      name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"),
      email: localStorage.getItem("email"),
      type: localStorage.getItem("type"),
      phone: localStorage.getItem("phone"),
      facility: localStorage.getItem("facility"),
      channel: this.title,
      message: this.newMessage,
      time: this.time,
      photoUrl: localStorage.getItem("photo"),
      channelType: this.type,
      directChannel: this.directChannel,
      readUsers: [{name: '', time: 0, displayTime: '', photoUrl: ''}],
      bot: ''
    };
    if(this.newMessage != '') {
      this.db.list('/messages').push(message).then(data => {
        this.firebaseAnalytics.logEvent('messages', {message: 'message'})
        .then((res: any) => console.log(res))
        .catch((error: any) => console.error(error));

        this.userProvider.sendTrueVault(message);
        this.analytics.sendCustomEvent("new message sent");
        if(typeof this.params.get("email") !== 'undefined') {
          if(this.params.get("email") !== '') {
            this.userProvider.directMessage(this.newMessage, [this.params.get("email")]);
          } else {
            this.userProvider.sendSMS(this.newMessage, [this.params.get("phone")]);
          }
          // this.users.map(u => {
          //   if(u.email === this.params.get("email") || u.phoneNumber === this.params.get("phone")) {
          //     this.userProvider.sendSMS(this.newMessage, [u.phoneNumber]);
          //   }
          // });
        } else {
          let emails = [];
          let phones = [];
          this.users.map(u => {
            if(this.newMessage.indexOf("@" + u.firstName + "" + u.lastName) >= 0) {
              emails.push(u.email);
              phones.push(u.phoneNumber);
              if(this.newMessage.indexOf("@" + u.firstName + "" + u.lastName + ",") >= 0) {
                this.newMessage = this.newMessage.replace("@" + u.firstName + "" + u.lastName + ",", "");                
              } else {
                this.newMessage = this.newMessage.replace("@" + u.firstName + "" + u.lastName, "");
              }
            }
          });
          this.userProvider.directMessage(this.newMessage, emails);
          this.userProvider.sendSMS(this.newMessage, phones);
        }
        this.newMessage = '';
      });
    }
  }

  getDisplayTime(time) {
    let timeDistance = new Date().getTime() - time;
    if(timeDistance / 1000 < 60) {
      return (timeDistance / 1000).toFixed() + ' seconds ago';
    } else if(timeDistance / 1000 >= 60 && timeDistance / 1000 < 3600) {
      return (timeDistance / 60000).toFixed() + ' minutes ago';
    } else if(timeDistance / 1000 >= 3600 && timeDistance / 1000 < 3600 * 24) {
      return (timeDistance / 3600000).toFixed() + ' hours ago';
    } else {
      return ((timeDistance / 3600000) / 24).toFixed() + ' days ago';
    }
  }

  showMessageModal(readers) {
    let modal = this.modal.create(MessagePage, {readers: readers});
    modal.present();
  }

  checkName(event) {
    let filterStr = event.value.substring(event.value.lastIndexOf('@') + 1, event.value.length);
    this.filteredUsers = [];
    this.users.map(u => {
      if((u.firstName + u.lastName).toLowerCase().indexOf(filterStr.toLowerCase()) >= 0) {
        this.filteredUsers.push(u);
      }
    });
    if(event.value.substring(event.value.length - 1, event.value.length) === '@' && localStorage.getItem("channelType") === "departments") {
      this.showUserList = true;
      this.atNumbers += 1;
    } else if (event.value.match(/@/gi) === null || event.value.match(/@/gi).length < this.atNumbers) {
      this.showUserList = false;
      this.atNumbers = 0;
    }
  }

  setUser(user) {
    this.username = user.firstName + user.lastName;
    if (this.newMessage.indexOf('@' + this.username) < 0) {
      this.newMessage = this.newMessage.replace(this.newMessage.substring(this.newMessage.lastIndexOf('@'), this.newMessage.length), '@' + this.username);      
    }
    this.showUserList = false;
  }
}
