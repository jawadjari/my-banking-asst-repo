import { Component, OnInit } from '@angular/core';

import { FormsModule }   from '@angular/forms';
import { ConversationService } from '../../services/conversation.service';
import { EmailService } from '../../services/email/email.service';
declare var $:any;


@Component({
    moduleId:module.id,
    selector: 'conversation',
    templateUrl: 'conversation.component.html',
    providers: [ EmailService ]
})

export class ConversationComponent implements OnInit { 
    conversation:any = [];
    parsed_convo:any = [];
    FormVariables = false;
    ButtonVariables = false;
    TextVariables = false;
    StepVariables = false;
    MapVariables = false;
    CarouselVariables = false;
    CheckboxVariables = false;
    ConversationAction = false;
    ExtraParams = false;
    ResponseMessage = false;

    constructor(private _conversationService: ConversationService, private _emailService: EmailService) {
        
    }
    
    ngOnInit() {
        var width = $("#offcanvas-width").data("width");
        $("#widthControl").attr("data-width", width).css("width", width+"px");

        $('[data-toggle="tooltip"]').tooltip();
       
        if(typeof(Storage) !== "undefined") {
            localStorage.removeItem('curr_convo');
            var retrieved_convo = localStorage.getItem('curr_convo');
            
            this.parsed_convo = JSON.parse(retrieved_convo);

            // this._conversationService.saveFormParams("new_user", {firstname:"Adewumi", lastname:"lastname"})
            //     .subscribe(formParams => {
            //         console.log(formParams)
            //     })

            if(this.parsed_convo != null) {
                this.scrollToBottom();
                this.conversation = this.parsed_convo;
                //check if last class was capabilities if yes skip the welcome back message
                if(this.parsed_convo[this.parsed_convo.length - 1].class == 'capabilities') {
                    this.updateChatState("Text", false, "watson", "Just let me know how i may be of assistance to you by typing below");
                } else {
                    //send a welcome back message                
                    this.updateChatState("Text", false, "watson", "Welcome back, how else may i be of assistance to you?");
                    setTimeout(() => {
                        this.updateConversationUi("", "watson", "capabilities");
                        this.updateChatState("form", false, "watson", "Thank you Mr Adewumi Please upload support documents", "account_supporting_docs");
                    }, 1500);
                    
                }
            } else {
                this._conversationService.startConversation()
                    .subscribe(conversation => {
                        //this.updateChatState("Text", false, "watson", conversation.output.text[0], null, null);
                        this.updateConversationUi(conversation.output.text[0], "watson", "chat-left", conversation.context);
                        setTimeout(() => {
                            this.updateConversationUi("", "watson", "capabilities");
                            //this.updateChatState("form", false, "watson", "Thank you Mr Adewumi Please upload support documents", "account_scheduler");
                            
                        }, 1500)
                })
            }
        }
        this.scrollToBottom();
        
    }

    sendConversationMessage(message:any, moreConvo:any = null) {
        var result:any;
       
        var conversation_length = this.parsed_convo.length;
        var lastContext = this.parsed_convo[conversation_length - 1].context;

        var newMessage = { message : message, sender : "user", class:"cui__user" };
        var messageToSend = { message : message, sender : "user", class:"cui__user", context:lastContext};

        this.updateChatState("Text", false, "user", message);
        message = "";
        $("#conversationMessage").val("").attr("placeholder", "HB padie is typing...").attr("disabled", "disabled");
        result = this._conversationService.sendMessage(messageToSend);
        result.subscribe(response => {
            var ui_type = "text";
            var action = false;
            var extra_params = false;
            var to_alert = null;
            

            console.log(response)
            if(response.output.data != undefined) {
                if (response.output.data.ui_type != undefined) {
                    ui_type = response.output.data.ui_type;
                }

                if(response.output.data.action != undefined) {
                    action = response.output.data.action;
                }

                if(response.output.data.to_alert != undefined) {
                    var to_alert = response.output.data.to_alert;
                    
                }

                if(response.output.data.extra_params != undefined) {
                    extra_params = response.output.data.extra_params;
                }
            }

            this.updateChatState(ui_type, true, "watson", response.output.text[response.output.text.length - 1], action, extra_params, to_alert);

            if(moreConvo != null) {
                 setTimeout(() => {
                     this.updateChatState(ui_type, false, "watson", moreConvo, action, extra_params);
                 }, 4000);
            }
            $("#conversationMessage").val("").attr("placeholder", "Type something").removeAttr("disabled");
        });
        
    }

    sendSystemConversationMessage(message:string, context:any, extraparams:boolean = null) {
        console.log(message)
    }

    updateChatState(paramType:string, toLoad = true, sender:string, output:any,action:any = null, extraParams:any = false, to_alert:any = false) {
        //Reset all variable types to false
        this.FormVariables = this.ButtonVariables = this.CarouselVariables = this.MapVariables = this.CheckboxVariables = this.StepVariables =  false;
        this.TextVariables = true;
        this.ConversationAction = false;
        

        var class_name:string = "";
        if(sender == "watson") {
            class_name = "chat-left";
        }

        switch(paramType.toLowerCase()) {
            case "form": 
                this.loadingElements(action);
                setTimeout(() => {
                    this.FormVariables = true;
                    this.ConversationAction = action;

                    if(to_alert) {
                        this.triggerSweetAlert(to_alert);
                    } else {
                        $('#formModal').modal('show');
                    }
                    if(extraParams) {
                        this.ExtraParams = extraParams;
                    }

                    $("a.btn-raised").click();
                    this.scrollToBottom();
                },4000);
            break;
            case "buttons":
                setTimeout(() => {
                    this.ButtonVariables = true;
                    this.ConversationAction = action;
                    
                    if(extraParams) {
                        this.ExtraParams = extraParams;
                    }
                    this.scrollToBottom();
                },3000);
            break;
            case "text":
                this.TextVariables = true;
            break;
            case "carousel":
                this.loadingElements(action);
                setTimeout(() => {
                    this.CarouselVariables = true;
                    this.ConversationAction = action;
                    this.scrollToBottom();
                },3000);
            break;
            case "maps":
                this.loadingElements(action);
                setTimeout(() => {
                    this.MapVariables = true;
                    this.ConversationAction = action;
                    if(extraParams) {
                        this.ExtraParams = extraParams;
                    }
                    this.scrollToBottom();
                },3000);
            break;
            case "checkboxes":
                 this.loadingElements(action);
                setTimeout(() => {
                    this.CheckboxVariables = true;
                    this.ConversationAction = action;
                    if(extraParams) {
                        this.ExtraParams = extraParams;
                    }
                    this.scrollToBottom();
                },2000);
            break;
            case "steps":
                //class_name = "steps"
                setTimeout(() => {
                    this.StepVariables = true;
                    this.ConversationAction = action;
                    
                    if(extraParams) {
                        this.ExtraParams = extraParams;
                    }
                    this.scrollToBottom();
                },3000);
            break;
            default:
                this.TextVariables = true;
                if(sender == "watson") {
                    class_name = "chat-left";
                }
            break;
        }

        if(toLoad == true) {
            //display loading message
            this.updateConversationUi("", sender, "loading");
            setTimeout(() => {
                this.conversation.pop();//remove last conversation
                this.updateConversationUi(output, sender, class_name);
            }, 1000 + (Math.random() * 20) * 100)
        } else {
            this.updateConversationUi(output, sender, class_name);
        }
    }

    updateConversationUi(message:string, sender:string, class_name:string, context:any = false) {
        var curr_time = this.getSystemTime();

        if(this.parsed_convo == null) {
            var context = context;
        } else {    
            var conversation_length = this.parsed_convo.length;
            var context = this.parsed_convo[conversation_length - 1].context;
        }

        var curr_convo = {message:message, time:curr_time, sender: sender, class:class_name, context:context}
        
        this.conversation.push(curr_convo);
        if(typeof(Storage) !== "undefined") {
            localStorage.setItem('curr_convo', JSON.stringify(this.conversation));

            var retrieved_convo = localStorage.getItem('curr_convo');
            this.parsed_convo = JSON.parse(retrieved_convo);
        } else {
            
        }

        this.scrollToBottom(); 
    }

    /** Create a new bank account **/
    CreateAccount(message:string, account_type:string) {
        var response = "Fantastic selection, You can create a new "+ account_type +" account by completing the form below";
        var chatState = "form";
        var action:any = "fetch_account_form";
        if(account_type == 'savings') {
            this.updateChatState(chatState, false, "user", message, action, account_type, 'account_form_alert');
        } else if(account_type == 'current') {
            action = "fetch_account_form";
            this.updateChatState(chatState, false, "user", message, action, account_type, 'account_form_alert');
        } else {
            //user want to be helped to decide
            chatState = "checkboxes";
            action = "fetch_account_types";
            this.updateChatState(chatState, false,"user", message, action);
            response = "Alright i'll sure help you get the best account to suit your need, select whats important to you when creating an account";
        }

        this.updateChatState(chatState, true, "watson", response, action, account_type, 'account_form_alert');
    }
    /** End Creating a new bank account */


    /** Topping up airtime function */
    topUpAirtime(message:string, netWorkProvider:string) {

    }

    sendEmail() {
        this.updateChatState("Text", false, "user", "Send a mail");
        setTimeout(() => {
            this.updateChatState("form", true, "watson", "Alright kindly fill out the complaint form and we will be in touch in 24hours","sendMail");
        }, 1500);
    }
    /** Done topping up airtime */

    SearchForAccount() {
        //search for appropriate account based on system parameters
        this.updateChatState("carousel",false,"user", "Find matching account", "fetch_account_types");
        setTimeout(() => {
            this.updateChatState("carousel",false,"watson","Perfect, We found 2 account types matching your requirements, select one to get started", "fetch_account_types")
        },1500)
    }

    SearchForCards() {
       this.updateChatState("carousel",false,"user", "Find matching card types", "fetch_card_types");
        setTimeout(() => {
            this.updateChatState("carousel",false,"watson","We found 3 card types matching your requirements, select one to get started", "fetch_card_types")
        },1500)
    }

    getSystemTime() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var sysTime = hours + ':' + minutes + ' ' + ampm;

        return sysTime;
    }

    loadingElements(message:string) {
        
    }

    helpDecide(decider:string) {
        switch(decider) {
            case 'card_type':
                //this.updateChatState("carousel",false,"user", "Find matching card types", context, "fetch_card_types");
                this.updateChatState("checkboxes", false,"user", "Help me decide card type to get", "fetch_card_types");  
                setTimeout(() => {
                     this.updateChatState("checkboxes",false,"watson","Sure i can recommend to you, Just let me know what matters to you while getting a new card", "fetch_card_types")
                },1500)
            break;
            default:
            break;
        }
    }

    cancelOperation(message:string) {
        var sentMsg = this.sendConversationMessage(message, "I can help you pay bills, request a new atm, open a new account or locate the nearest atm");
    }

    scrollToBottom() {
        $("#scroll-main").animate({ scrollTop: $('#scroll-main').prop("scrollHeight")}, "slow");
    }

    closeModal(modal_id:string, modal_name:string) {
        var confirm_close = confirm("Are you sure?")
    
        if(confirm_close) {
            $("#"+modal_id).modal('hide');
            this.updateChatState("Text", false, "user", "You closed the "+modal_name+" form");
            
            this.updateConversationUi("", "watson", "loading");
            setTimeout(() => {
                this.conversation.pop();//remove last conversation
                this.updateConversationUi("So how else may i be of assistance to you? I can help you pay bills, request a new atm, top up your mobile open a new account or locate the nearest atm", "watson", "chat-left" );
            }, 1000 + (Math.random() * 20) * 100)
        }
    }

    submitForm() {
        var params = this.argumentsToArray(arguments);
        var form_type = params[0];
        params.shift();

        if(form_type == 'account_documents' || form_type == 'complete_account_opening') {
            var title = localStorage.getItem("title");
            var firstname = localStorage.getItem("firstname");
            $("#formModal").modal('hide');

            if(form_type == 'account_documents') {
                this.updateChatState("Text", false, "user", "Documents successfully uploaded");
                this.updateConversationUi("", "watson", "loading");
                setTimeout(() => {
                    this.conversation.pop();//remove last conversation
                    this.updateChatState("form", false, "watson", "Great! Thanks for completing the online account opening process. Kindly select a convenient date you would like to walk in and complete your application.", "account_scheduler");
                    //this.updateConversationUi("Thank you "+title+" "+firstname+". Please upload support documents", "watson", "chat-left" );

                    $('#demo-date-inline').datepicker({todayHighlight: true});
                }, 800 + (Math.random() * 20) * 100);
            } else {
                var scheduledDate = params[0];
                var convertedDate = this.convertDate(scheduledDate);
                var scheduleSplit = scheduledDate.split("-");

                
                this.updateChatState("Text", false, "user", "I'll like to schedule an appointment for " + scheduleSplit[2]+ "-"+ scheduleSplit[1]+"-"+scheduleSplit[0]);
                this.updateConversationUi("", "watson", "loading");
                setTimeout(() => {
                    this.conversation.pop();//remove last conversation
                    this.updateChatState("buttons", false, "watson", "Please confirm your appointment for the "+convertedDate, "confirm_appointment", convertedDate);                
                }, 100 + (Math.random() * 20) * 100);
               
               this
            }
        } else {
            var saveForm = this._conversationService.saveFormParams(form_type, params);

            saveForm.subscribe(formParams => {
                if(formParams.ok != undefined){
                    $("#formModal").modal('hide');
                    this.updateChatState("Text", false, "user", "Form successfully processed");
                    if(form_type == 'savings' || form_type == 'current') {
                        localStorage.setItem("title", params[0]);
                        localStorage.setItem("surname", params[1]);
                        localStorage.setItem("firstname", params[2]);                        
                        localStorage.setItem("email", params[4]);                        


                        var title = params[0];
                        var firstname = params[1];
                        this.updateConversationUi("", "watson", "loading");
                        setTimeout(() => {
                            this.conversation.pop();//remove last conversation
                            this.updateChatState("form", false, "watson", "Thank you "+title+" "+firstname+". Please upload support documents", "account_supporting_docs");
                            //this.updateConversationUi("Thank you "+title+" "+firstname+". Please upload support documents", "watson", "chat-left" );
                        }, 3000 + (Math.random() * 20) * 100);
                    } else {
                        
                        setTimeout(() => {
                            this.updateConversationUi("", "watson", "loading");
                        }, 2000);

                        setTimeout(() => {
                            this.conversation.pop();//remove last conversation
                            this.updateConversationUi("I'm glad i was able to help you, what else would you like to do?", "watson", "chat-left" );
                        }, 3000 + (Math.random() * 20) * 100);
                    }
                } else {

                }
            });
        }
    }

    convertDate(params:string) {
        var scheduledDate = params;
        
        var from = scheduledDate.split("-");
        var f = new Date(from[2], from[1], from[0]);
        var day = this.getOrdinal(from[2]);
        var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        var month = months[Number(from[1]) - 1];

        var date_string = day+" of "+month+" "+ from[0];
        return date_string;
    }

    confirmAppointment(to_confirm:boolean, message:string, date:any)
    {
        if(to_confirm) {
            var scheduleCode = Math.floor(Math.random() * (99999 - 10001) + 10000);

            this.updateChatState("Text", false, "user", "Confirm appointment");

            setTimeout(() => {
                this.updateConversationUi("", "watson", "loading");
            }, 1000);

            setTimeout(() => {
                this.conversation.pop();//remove last conversation
                this.updateConversationUi("Alright then, A bank staff has been assigned to you and will be in touch in the next 24hrs. Use the code "+scheduleCode+" to reschedule your appointment", "watson", "chat-left");
            }, 2000 + (Math.random() * 20) * 100);

            setTimeout(() => {
                this.updateConversationUi("I hope i've been able to assist you. Just let me know if there's anything else i can help you with", "watson", "chat-left");
            }, 4000 + (Math.random() * 20) * 100);

            var sendEmail = this._emailService.sendEmail(subject, recipient, message);
        } else {
            this.updateChatState("Text", false, "user", "I'll like to reschedule");
             setTimeout(() => {
                //this.updateConversationUi("", "watson", "chat-left", "Alright select another convenient time to come around");
                this.updateChatState("form", false, "watson", "Alright select a convenient time you would like to walk in and complete your application.", "account_scheduler");
                    
            }, 1000);
        }
    }

    getOrdinal(n) {
        if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
            var s=["th","st","nd","rd"],
            v=n%100;
            return n+(s[(v-20)%10]||s[v]||s[0]);
        }
        return n;     
    }

    triggerSweetAlert(params:string) {
        switch(params) {
            case "account_form_alert":
                $("a.triggerswal").click();
            break;

            default:
            break;
        }
    }

    argumentsToArray(args:any) {
        return [].slice.apply(args);
    }

}