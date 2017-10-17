import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user';

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {
  title = '';
  feedback = '';
  feedbackList = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserProvider) {
    this.title = this.navParams.get('title');
    this.userService.getFeedbacks().then((res: any) => {
      res.map(r => {
        if ((r.email !== '' && r.email === localStorage.getItem('email')) || (r.email === '' && r.phone === localStorage.getItem('phone'))) {
          this.feedbackList.push(r);
        }
      });
    });
  }

  ionViewDidLoad() {
    
  }

  sendFeedback() {
    if(this.feedback !== '') {
      this.userService.sendFeedback(this.feedback).then((res: any) => {
        this.feedbackList = [];
        res.map(r => {
          if ((r.email !== '' && r.email === localStorage.getItem('email')) || (r.email === '' && r.phone === localStorage.getItem('phone'))) {
            this.feedbackList.push(r);
          }
        });
      });
      this.feedback = '';      
    }
  }
}
