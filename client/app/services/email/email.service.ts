import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class EmailService {
    constructor(private _http:Http) {

    }

    sendEmail(subject:string, recipient:string, message:string) {
        
    }
}