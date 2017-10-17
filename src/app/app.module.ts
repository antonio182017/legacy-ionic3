import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { ChatPage } from '../pages/chat/chat';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { FacilitysignupPage } from '../pages/facilitysignup/facilitysignup';
import { DirectoryPage } from '../pages/directory/directory';
import { ModalPage } from '../pages/modal/modal';
import { MessagePage } from '../pages/message/message';
import { SettingsPage } from '../pages/settings/settings';
import { HomePage } from '../pages/home/home';
import { FeedbackPage } from '../pages/feedback/feedback';

import { UserProvider } from '../providers/user';
import { Analytics } from '../providers/analytics';
import { FabricErrorHandler } from '../providers/fabric';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { Firebase } from '@ionic-native/firebase';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { HttpModule } from '@angular/http';

export const config = {
  apiKey: "AIzaSyBW5Hn3GzzCWLkoAjYwoeuipNd_EmmBPSM",
  authDomain: "legacy-f1a71.firebaseapp.com",
  databaseURL: "https://legacy-f1a71.firebaseio.com",
  projectId: "legacy-f1a71",
  storageBucket: "legacy-f1a71.appspot.com",
  messagingSenderId: "954500088643"
};

@NgModule({
  declarations: [
    MyApp,
    ChatPage,
    LoginPage,
    SignupPage,
    DirectoryPage,
    ModalPage,
    FacilitysignupPage,
    MessagePage,
    SettingsPage,
    HomePage,
    FeedbackPage
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      scrollAssist: true,
      autoFocusAssist: false,
      backButtonText: '',
      iconMode: 'ios',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition'
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ChatPage,
    LoginPage,
    SignupPage,
    DirectoryPage,
    ModalPage,
    FacilitysignupPage,
    MessagePage,
    SettingsPage,
    HomePage,
    FeedbackPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: FabricErrorHandler},
    UserProvider,
    FirebaseAnalytics,
    Firebase,
    Analytics,
    FabricErrorHandler
  ]
})
export class AppModule {}
