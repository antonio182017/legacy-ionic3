import {Injectable} from "@angular/core";
import {Analytics} from "./analytics";
import {IonicErrorHandler } from 'ionic-angular';
import * as stacktrace from 'stacktrace-js';

@Injectable()
export class FabricErrorHandler extends IonicErrorHandler {
    constructor (public analytics: Analytics) {
        super();
    }

    handleError(error) {
        // do something with the exception
        this.analytics.addLog('crash triggered');
        stacktrace.get().then(
            trace => this.analytics.sendNonFatalCrash(error.message, trace)
        );

        super.handleError(error);
    }
}