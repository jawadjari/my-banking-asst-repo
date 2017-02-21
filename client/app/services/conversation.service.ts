import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConversationService {
    constructor(private _http:Http) {

    }

    startConversation() {
        return this._http.get('/api/v1/conversation')
            .map(res => res.json())
    }

    sendMessage(message) {
        var headers = new Headers();
        headers.append('content-type', 'application/json');

        return this._http.post('/api/v1/postConversation', JSON.stringify(message), {headers : headers})
            .map(res => res.json());
    }

    saveFormParams(form_type:string, params:any[]) {
        var headers = new Headers();
        headers.append('content-type', 'application/json');
        var billParams = {};

        switch (form_type.toLowerCase()) {
            case 'water':
                billParams = this.saveWaterBill(params);
                break;
                
            case 'savings':
            case 'current':
                billParams = this.saveNewAccount(params, form_type);
                break;
            default:
                console.log(form_type)
                break;
        }
        
        return this._http.post('/api/v1/saveParams', JSON.stringify(billParams), {headers : headers})
            .map(res => res.json());
    }

    
    
    /**
     * Saving Forms into cloudant Database
     * All forms area
     */

    saveWaterBill(data) {
        var property_ref = data[0];
        var email = data[1];
        var phone = data[2];
        var amount = data[3];

        var water_params = {table_name:'water_bill', data:{ property_ref:property_ref, email: email, phone:phone, amount:amount }}
        return water_params;
    }

    saveNewAccount(data, acct_type:string) {        
        var account_params = {
            title:data[0], surname:data[1], firstname: data[2], othername: data[3], email:data[4], marital_status: data[5],
            phone_no: data[6], gender: data[7], maiden_name: data[8], house_no: data[9], street: data[10], busstop: data[11],
            city: data[12], lga: data[13], state: data[14], address: data[15], identification: data[16], card_verve: data[17],
            card_master: data[18], card_visa: data[19], statement_email: data[20], statement_post:data[21], statement_branch: data[22],
            ebanking_internet: data[23], ebanking_mobile: data[24], ebanking_atm: data[25], bvn: data[26], account_type:acct_type
        }
        return {table_name:'accounts', data:account_params};

    }

    /**
     * End of forms saving area
     */


}