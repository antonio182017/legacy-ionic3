import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { Http, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs';

const serverUrl = 'https://us-central1-legacy-f1a71.cloudfunctions.net/';
// const serverUrl = 'http://localhost:5000/legacy-f1a71/us-central1/';

@Injectable()
export class UserProvider {
  user: any = {};
  userList: any;
  firestore = firebase.storage();
  headers = new Headers({ 'Content-Type': 'application/json' });
  options = new RequestOptions({headers: this.headers});
  facilityList: any;
  patientList: any;
  confirmDataList: any;
  facilities = [];
  isLogout = false;
  subscribes = [];

  public truevaultToken = new BehaviorSubject('');  
  public isSetUser = new BehaviorSubject(false);
  public isConfirmedCode = new BehaviorSubject(false);
  public patients = new BehaviorSubject(<any>[]);
  public directUsers = new BehaviorSubject(<any>[]);
  public invitationData = new BehaviorSubject(<any>{});
  public isSeletedChannel = new BehaviorSubject(false);
  
  constructor(
    public auth: AngularFireAuth,
    private db: AngularFireDatabase,
    private zone: NgZone,
    private http: Http
  ) {
    this.userList = this.db.list("/userList");
    this.confirmDataList = this.db.list("/confirmData");
    this.patientList = this.db.list("/patients");
    this.facilityList = this.db.list("/facilities");
    this.subscribes[0] = this.facilityList.subscribe(data => {
      this.facilities = data;
    });

    let authUrl = 'https://api.truevault.com/v1/auth/login';
    let formData = new FormData();
    formData.append("username", "test");
    formData.append("password", "test");
    formData.append("account_id", "562ad185-5324-4abb-be69-f017c9a6954a");
    this.http.post(authUrl, formData).subscribe(data => {
      this.truevaultToken.next(data.json().user.access_token);
    });
  }

  adduser(newuser) {
    return new Promise((resolve, reject) => {
        if(newuser.phone !== '') {
          newuser.phone = this.getPhoneNumber(newuser.phone);          
        }
        newuser.email = newuser.email.toLowerCase();
          this.userList.push({
            firstName: newuser.firstName,
            lastName: newuser.lastName,
            email: newuser.email,
            password: newuser.password,
            phoneNumber: newuser.phone,
            facility: newuser.facilityName,
            type: newuser.type,
            patient: newuser.patient,
            photo: '',
            photoUrl: '',
            status: 'online'
          }).then(data => {
            this.setCurrentUser(newuser);
            this.createBotMessage(newuser);
            this.sendWelcomeEmail(newuser);
            this.sendWelcomeSMS(newuser);
            resolve(data);
          }).catch(err => {
            console.log(err);
            reject(err);
          });
        this.subscribes[1] = this.facilityList.subscribe(data => {
          let flag = false;
          data.map(d => {
            if(d.$value === newuser.facilityName) {
              flag = true;
            }
          });
          if(!flag) {
            this.facilityList.push(newuser.facilityName);            
          }
        });
    });
  }

  login(user) {
    this.isLogout = false;
    user.email = user.email.toLowerCase();
    return new Promise((resolve, reject) => {
      let isExist = false;
      this.subscribes[2] = this.userList.subscribe(data => {
        data.map(d => {
          if(((d.email === user.email && d.email !== '') || (d.phoneNumber === user.phone && d.phoneNumber.length === 10)) && d.password === user.password && !this.isLogout) {
            d.isLogin = true;
            this.userList.update(d.$key, d);
            isExist = true;
            this.setCurrentUser(user);
            resolve(true);
          }
        });

        if(!isExist || data.length === 0) {
          reject({message: "User doesn't exist or Email(or Phone Number) / Password is wrong."});
        }
      });
    });
  }

  getImageUrl(photo) {
    let image = '';
    image = photo != '' ? photo : 'person-flat.png';
    return new Promise((resolve, reject) => {
      this.firestore.ref().child(image).getDownloadURL().then((url) => {
        this.zone.run(() => {
          resolve(url);
        })
      }).catch(err => {
        reject('');
      });
    });
  }

  sendInvitation(inviteUser) {
    if(inviteUser.number !== '') {
      inviteUser.number = this.getPhoneNumber(inviteUser.number);      
    }
    inviteUser.key = localStorage.getItem("inviteKey") ? localStorage.getItem("inviteKey") : '';

    let url = serverUrl + "sendEmail";
    return new Promise((resolve, reject) => {
      this.http.post(url, {user: inviteUser, type: 'sendInvite'}, this.options).subscribe(data => {
        resolve(data);
      }, err => {
        reject(err);
      });
    });
  }

  getCurrentUser() {
    let user = {
      email: localStorage.getItem("email") ? localStorage.getItem("email") : '',
      firstName: localStorage.getItem("firstName") ? localStorage.getItem("firstName") : '',
      lastName: localStorage.getItem("lastName") ? localStorage.getItem("lastName") : '',
      type: localStorage.getItem("type") ? localStorage.getItem("type") : '',
      facility: localStorage.getItem("facility") ? localStorage.getItem("facility") : '',
      photo: localStorage.getItem("photo") ? localStorage.getItem("photo") : '',
    };

    return user;
  }

  setCurrentUser(user) {
    this.subscribes[3] = this.userList.subscribe(data => {
      let users = [];
      let phone = user.phone !== '' ? this.getPhoneNumber(user.phone) : user.phone;
      let facility = '';
      data.map(d => {
        if((d.email == user.email && user.email != '') || (d.phoneNumber == phone && user.email == '')) {
          facility = d.facility;
        }
      });
      data.map(d => {
        if((d.email == user.email && user.email != '') || (d.phoneNumber == phone && user.email == '')) {
          localStorage.setItem("facility", d.facility);
          localStorage.setItem("firstName", d.firstName);
          localStorage.setItem("lastName", d.lastName);
          localStorage.setItem("type", d.type);
          localStorage.setItem("email", d.email);
          localStorage.setItem("photo", d.photoUrl);
          localStorage.setItem("channel", d.patient);
          localStorage.setItem("phone", d.phoneNumber);
          localStorage.setItem("userid", d.$key);
          this.isSetUser.next(true);
          if(d.type === "facility") {
            localStorage.setItem("channelType", "departments");
          } else {
            localStorage.setItem("channelType", "");
          }
          return;
        } else {
          if(d.type === "facility" && d.facility === facility) {
            users.push({email: d.email, name: d.firstName + " " + d.lastName, phone: d.phoneNumber});
          }
        }
      });
      this.directUsers.next(users);
    });
  }

  confirmInvitation(inviteCode) {
    let url = serverUrl + "sendEmail";
    return new Promise((resolve, reject) => {    
      this.http.post(url, {code: inviteCode, email: localStorage.getItem("email"), type: 'confirmInvite'}, this.options).subscribe(data => {
        resolve(data.json());
      }, err => {
        reject(err);
      });
    });
  }

  setPatients() {
    return new Promise((resolve, reject) => {    
      this.subscribes[4] = this.patientList.subscribe(data => {
        let flag = false;
        data.map(d => {
          if(d.facility === localStorage.getItem("facility")) {
            flag = true;
            localStorage.setItem("patientId", d.$key);
            this.patients.next(d.patients);
            resolve(data);
          }
        });
        if(!flag || data.length === 0) {
          localStorage.setItem("patientId", '');
          this.patients.next([]);
          resolve(false);
        }
      });
    });
  }

  getPatients() {
    return new Promise((resolve, reject) => { 
      this.subscribes[5] = this.patientList.subscribe(data => {
        data.map(d => {
          if(d.facility == localStorage.getItem("facility")) {
            resolve(d.patients);
          }
        });
      });
    });
  }

  isInvited(signupData) {
    if(signupData.phone !== '') {
      signupData.phone = this.getPhoneNumber(signupData.phone);
    }
    return new Promise((resolve, reject) => {
      this.subscribes[6] = this.userList.subscribe(data => {
        data.map(d => {
          if(((d.email === signupData.email && d.email !== '') || (d.phoneNumber === signupData.phone && d.email === '')) && d.facility !== signupData.facility) {
            reject({message: "Email or Phone Number is already registered in other facility."});
            return;
          }
        });
      });

      this.subscribes[7] = this.confirmDataList.subscribe(data => {
        let flagEmail = false;
        data.map(d => {
          if(((d.email === signupData.email && d.email !== '') || (d.number === signupData.phone && d.number !== '')) && d.facilityName === signupData.facility) {
            resolve(d);
          } else if(((d.email === signupData.email && d.email !== '') || (d.phoneNumber === signupData.phone && d.email === '')) && d.facilityName !== signupData.facility) {
            reject({message: "Email or Phone Number is already registered in other facility."});
          } else {
            this.facilities.map(d => {
              if(d.$value === signupData.facility) {
                flagEmail = true;                
              }
            });
          }
        });

        if(!flagEmail) {
          resolve(flagEmail);
        } else {
          reject({message: "Please use invited Email or Phone Number for this facility."});
        }
      }, err => {
        reject(err);
      });
    });
  }

  sendTrueVault(message) {
    this.truevaultToken.subscribe(token => {
      let url = 'https://api.truevault.com/v1/vaults/a8f0106b-da4e-41e4-a8f6-fa666ddbad93/documents';
      let option = new RequestOptions({
        headers: new Headers({'Authorization': 'Basic ' + btoa(token + ':""')})
      });
      let formData = new FormData();
      formData.append('document', new Buffer(JSON.stringify(message)).toString("base64"));
      formData.append('schema_id', 'cf4f4dcb-7913-4d0f-82b7-60e5e8dc5841');
      formData.append('owner_id', 'a3478cc8-386c-4e62-ba65-939520be5fc1');
      this.http.post(url, formData, option).subscribe(data => {
        console.log(data);
      })
    });
  }

  getTrueVault() {
    this.truevaultToken.subscribe(token => {
      let docUrl = 'https://api.truevault.com/v1/vaults/a8f0106b-da4e-41e4-a8f6-fa666ddbad93/schemas/cf4f4dcb-7913-4d0f-82b7-60e5e8dc5841/documents';
      let option = new RequestOptions({
        headers: new Headers({'Authorization': 'Basic ' + btoa(token + ':""')})
      });
      this.http.get(docUrl, option).subscribe(data => {
      })
    });
  }

  directMessage(message, emails) {
    let url = serverUrl + 'directMessage';
    if(emails.length > 0) {
      this.http.post(url, {emails: emails, message: message}, this.options).subscribe(data => {
      });
    }
  }

  sendSMS(message, phones) {
    let url = serverUrl + 'sendSMS';
    if(phones.length > 0) {
      this.http.post(url, {phones: phones, message: message}, this.options).subscribe(data => {
        console.log(data);
      });
    }
  }

  logout() {
    this.isLogout = true;
    let sub = this.userList.subscribe(data => {
      data.map(d => {
        if((d.email !== '' && d.email === localStorage.getItem('email')) || (d.phoneNumber === localStorage.getItem("phone") && d.email === '') && this.isLogout) {
          d.isLogin = false;
          this.userList.update(d.$key, d);
        }
      });
    });
    sub.unsubscribe();

    this.subscribes.map(sub => {
      sub.unsubscribe();
    });

    localStorage.setItem("patientId", '');
  }

  sendWelcomeEmail(user) {
    let url = serverUrl + 'welcomeMessage';
    this.http.post(url, {email: user.email, name: user.firstName + " " + user.lastName}, this.options).subscribe(data => {
      console.log(data);
    });
  }

  sendWelcomeSMS(user) {
    let url = serverUrl + 'welcomeSMS';
    this.http.post(url, {phone: user.phoneNumber, name: user.firstName + " " + user.lastName}, this.options).subscribe(data => {
      console.log(data);
    });
  }

  createBotMessage(user) {
    let msgContent = 'Welcome to Legacy!To get started, click on the menu icon in the upper lefthand corner.You can: 1. Leave messages for #Departments 2. Invite other facility staff 3. Add patients 4. Invite family members of patients 5. @Tag staff members 6. See who has read your messages & when they read them. Enjoy!';
    let message = {channel: "#General", channelType: '', directChannel: '', email: user.email, phone: user.phone, facility: user.facilityName, name: 'Legacy Bot', photoUrl: '', time: new Date().getTime(), type: user.type, message: msgContent, bot: user.email === '' ? user.phone : user.email, readUsers: [{name: '', time: 0, displayTime: '', photoUrl: 'https://firebasestorage.googleapis.com/v0/b/legacy-f1a71.appspot.com/o/person-flat.png?alt=media&token=2ddd322f-02fe-4b25-a960-5f14e6112a8e'}]};
    this.db.list("/messages").push(message);
  }

  getPhoneNumber(phoneStr) {
    let phone = '';
    let numlist = phoneStr.match(/\d+/g);
    numlist.map(num => {
      phone += num;
    });
    phone = phone.substr(phone.length - 10);
    return phone;
  }

  updateUser(user) {
    let firstName = user.firstname !== '' ? user.firstname : localStorage.getItem("firstName");
    let lastName = user.lastname !== '' ? user.lastname : localStorage.getItem("lastName");
    setTimeout(function() {
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);
    }, 5000);
    return new Promise((resolve, reject) => { 
      this.subscribes[8] = this.userList.subscribe(data => {
        data.map(d => {
          if((d.email !== '' && d.email === localStorage.getItem('email')) || (d.phoneNumber === localStorage.getItem("phone") && d.email === '')) {
            d.firstName = user.firstname !== '' ? user.firstname : d.firstName;
            d.lastName = user.lastname !== '' ? user.lastname : d.lastName;
            d.title = user.title !== '' ? user.title : (typeof d.title === 'undefined' ? '' : d.title);
            d.password = user.password !== '' ? user.password : d.password;
            this.userList.update(d.$key, d);
            localStorage.setItem("title", d.title);
            resolve('success');
          }
        });
      });
      this.subscribes[9] = this.db.list('messages').subscribe(data => {
        data.map(d => {
          if((d.email !== '' && d.email === localStorage.getItem('email') && d.bot === '') || (d.phoneNumber === localStorage.getItem("phone") && d.email === '' && d.bot === '')) {
            d.title = user.title !== '' ? user.title : (typeof d.title === 'undefined' ? '' : d.title);
            d.name = firstName + ' ' + lastName;
            d.readUsers.map(u => {
              if (u.name === localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName')) {
                u.name = firstName + ' ' + lastName;
              }
            });
            d.directChannel.replace(localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'), d.name);
            this.db.list('messages').update(d.$key, d);
          }
        });
      });
    });
  }

  sendFeedback(feedback) {
    let date = new Date();
    return new Promise((resolve, reject) => {
      this.subscribes[9] = this.db.list("feedbackList").push({description: feedback, email: localStorage.getItem('email'), phone: localStorage.getItem('phone'), name: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'), date: date.toString().substring(4, 15)}).then(res => {
        this.db.list("feedbackList").subscribe(data => {
          resolve(data);
        });
      });
    });
  }

  getFeedbacks() {
    return new Promise((resolve, reject) => {
      this.subscribes[10] = this.db.list("feedbackList").subscribe(data => {
        resolve(data);
      });
    });
  }
}