import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, Config } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireDatabase } from 'angularfire2/database';

import { ChatPage } from '../pages/chat/chat';
import { SettingsPage } from '../pages/settings/settings';
import { LoginPage } from '../pages/login/login';
import { DirectoryPage } from '../pages/directory/directory';
import { ModalPage } from '../pages/modal/modal';
import { HomePage } from '../pages/home/home';
import { FeedbackPage } from '../pages/feedback/feedback';
import { UserProvider } from '../providers/user';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  facility: string = '';
  username: string = '';
  photoUrl: string = '';
  userType: string = 'facility';

  departments: any[];
  directs = [];
  patients = [];
  settings: any[];
  directNewStatus = [];
  colors = ['#005aff', '#86d59b', '#00c0ff', '#7200ff'];
  
  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    private modalCtrl: ModalController,
    private user: UserProvider,
    private config: Config,
    private db: AngularFireDatabase
  ) {
    // all platforms
    this.config.set( 'scrollPadding', false );
    this.config.set( 'scrollAssist', false );
    this.config.set( 'autoFocusAssist', false );
    // android
    this.config.set( 'android', 'scrollAssist', true );
    this.config.set( 'android', 'autoFocusAssist', 'delay' );

    this.initializeApp();
    this.rootPage = HomePage;
    this.departments = [
      { title: '#General', component: ChatPage, channel: "departments", selected: true },
      { title: '#Activities', component: ChatPage, channel: "departments", selected: false },
      { title: '#Dietary', component: ChatPage, channel: "departments", selected: false },
      { title: '#Nursing', component: ChatPage, channel: "departments", selected: false },
      { title: '#BusinessOffice', component: ChatPage, channel: "departments", selected: false },
      { title: '#DSD', component: ChatPage, channel: "departments", selected: false },
      { title: '#MDS', component: ChatPage, channel: "departments", selected: false },
    ];

    this.settings = [
      { title: 'Settings', component: SettingsPage, channel: "settings" },
      { title: 'Directory', component: DirectoryPage, channel: "settings" },
      { title: 'Invite Facility Workers', component: ModalPage, channel: "settings", type: "modal", inviteType: 'facility' },
      { title: 'Invite Family Member', component: ModalPage, channel: "settings", type: "modal", inviteType: 'family' },
      { title: 'Add a Patient', component: ModalPage, channel: "settings", type: "modal", inviteType: 'patient' },
      { title: 'Feedback', component: FeedbackPage, channel: "settings" },
      { title: 'Log out', component: ChatPage, channel: "settings" }
    ];

    this.user.directUsers.subscribe(data => {
      this.directs = [];
      if(localStorage.getItem("type") === "facility") {
        data.map(d => {
          this.directs.push({title: d.name, component: ChatPage, email: d.email, phone: d.phone, type: "direct", receiver: d.name, sender: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"), selected: false});
        });
      }
    });

    this.user.patients.subscribe(data => {
      this.patients = [];
      if(typeof data !== 'undefined' && localStorage.getItem("patientId") !== '') {
        data.map(d => {
          if(localStorage.getItem("type") == "facility") {
            let isAlready = false;
            this.patients.map(page => {
              if(page.title === d) {
                isAlready = true;
              }
            });
            if(data.indexOf(d) >= 0 && !isAlready) {
              this.patients.push({title: d, component: ChatPage, channel: "patients", selected: false});
            }
          } else {
            this.patients = [{title: localStorage.getItem("channel"), component: ChatPage, channel: "patients", selected: false}];
          }
        });
      }

      this.db.list("userList").subscribe(data => {
        this.directNewStatus = [];      
        data.map(d => {
          this.directs.map(dir => {
            if ((d.email !== '' && d.email === dir.email) || (d.email === '' && d.phoneNumber === dir.phoneNumber)) {
              this.directNewStatus.push(d.isLogin ? true : false);
            }
          });
        });
      });  

      this.db.list('messages').subscribe(data => {
        data.map(d => {
          if (d.type === localStorage.getItem("type") && d.facility === localStorage.getItem("facility") && (d.bot === '' || d.bot === localStorage.getItem('email') || d.bot === localStorage.getItem('phone')) && d.directChannel === '') {
            let flag = false;
            d.readUsers.map(user => {
              if (user.name === localStorage.getItem("firstName") + ' ' + localStorage.getItem('lastName')) {
                flag = true;
              } else {
                flag = false;
              }
            });
            if (!flag) {
              this.departments.map(channel => {
                if (channel.title === d.channel) {
                  channel.new = true;
                }
              });
              this.patients.map(channel => {
                if (channel.title === d.channel) {
                  channel.new = true;
                }
              });
            } else {
              this.departments.map(channel => {
                if (channel.title === d.channel) {
                  channel.new = false;
                }
              });
              this.patients.map(channel => {
                if (channel.title === d.channel) {
                  channel.new = false;
                }
              });
            }
          } else if (d.type === localStorage.getItem("type") && d.facility === localStorage.getItem("facility") && (d.bot === '' || d.bot === localStorage.getItem('email') || d.bot === localStorage.getItem('phone')) && d.directChannel.indexOf(localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName')) >= 0) {
            let flag = false;
            d.readUsers.map(user => {
              if (user.name === localStorage.getItem("firstName") + ' ' + localStorage.getItem('lastName')) {
                flag = true;
              } else {
                flag = false;
              }
            });
            if (!flag) {
              this.directs.map(channel => {
                if (channel.title === d.channel) {
                  channel.new = true;
                }
              });
            } else {
              this.directs.map(channel => {
                if (channel.title === d.channel) {
                  channel.new = false;
                }
              });
            }
          }
        });
      });
    });

    this.user.isSetUser.subscribe(d => {
      this.username = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName");
      this.facility = localStorage.getItem("facility");
      this.photoUrl = localStorage.getItem("photo");
      this.userType = localStorage.getItem("type");
    });

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    localStorage.setItem("channelType", page.channel);
    this.departments.map(page => {
      page.selected = false;
    });
    if (page.component === ChatPage) {
      this.user.isSeletedChannel.next(true);
    }

    page.selected = true;

    if(page.type) {
      this.nav.setRoot(page.component, {title: page.title, type: page.type, sender: page.sender, receiver: page.receiver, email: page.email, phone: page.phone});
    } else {
      this.nav.setRoot(page.component, {title: page.title});      
    }
  }

  signOut() {
    this.nav.setRoot(HomePage);
    this.user.logout();
  }

  presentModal(page) {
    let modal = this.modalCtrl.create(ModalPage, {title: page.title, type: page.inviteType});
    modal.present();
  }
}
