import {Platform} from "ionic-angular";
import {Injectable} from "@angular/core";

@Injectable()
export class Analytics {
    private handler:any;

    constructor (public platform: Platform) {
        platform.ready().then(
            () => this.setup()
        )
    }

    private setup() {
        if (!(<any>window).fabric) {
            return;
        }

        this.handler = (<any>window).fabric;
    }

    setUserIdentifier(id:string) {
        if (!this.handler) {
            console.warn('fabric not available: setUserIdentifier', id);
            return;
        }

        this.handler.Crashlytics.setUserIdentifier(id);
    }

    setUserName(name:string) {
        if (!this.handler) {
            console.warn('fabric not available: setUserName', name);
            return;
        }

        this.handler.Crashlytics.setUserName(name);
    }

    setUserEmail(email:string) {
        if (!this.handler) {
            console.warn('fabric not available: setUserEmail', email);
            return;
        }

        this.handler.Crashlytics.setUserEmail(email);
    }

    addLog(message:string) {
        if (!this.handler) {
            console.log('afsdfsf');
            console.warn('fabric not available: addLog', message);
            return;
        }

        this.handler.Crashlytics.addLog(message);
    }

    sendNonFatalCrash(message:string, stacktrace?: any) {
        if (!this.handler) {
            console.warn('fabric not available: sendNonFatalCrash', message, stacktrace);
            return;
        }

        this.handler.Crashlytics.sendNonFatalCrash(message, stacktrace);
    }

    sendSignUp(type:string, success:boolean, attributes?:any) {
        if (!this.handler) {
            console.warn('fabric not available: sendSignUp', type, success);
            return;
        }

        this.handler.Answers.sendSignUp(type, success, attributes);
    }
    sendLogin(type:string, success:boolean, attributes?:any) {
        if (!this.handler) {
            console.warn('fabric not available: sendLogin', type, success);
            return;
        }

        this.handler.Answers.sendLogIn(type, success, attributes);
    }

    sendCustomEvent(name:string, attributes?:any) {
        if (!this.handler) {
            console.warn('fabric not available: sendCustomEvent', name);
            return;
        }

        this.handler.Answers.sendCustomEvent(name, attributes);
    }

    sendStartCheckout(totalPrice:number, currency:string, itemCount:number, attributes?:any) {
        if (!this.handler) {
            console.warn('fabric not available: sendStartCheckout', totalPrice, currency ,itemCount);
            return;
        }

        this.handler.Answers.sendStartCheckout(totalPrice, currency, itemCount, attributes);
    }

    sendContentView(name:string, type:string, id:string, attributes?:any) {
        if (!this.handler) {
            console.warn('fabric not available: sendContentView', name, type, id);
            return;
        }

        this.handler.Answers.sendContentView(name, type, id, attributes);
    }
}