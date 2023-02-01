import { LightningElement, api,track } from 'lwc';
import getContactPointAddress from '@salesforce/apex/B2B_AddressesController.getContactPointAddress';
import getContactPointAddressById from '@salesforce/apex/B2B_AddressesController.getContactPointAddressById';
import updateCartDeliveryGroup from '@salesforce/apex/B2B_AddressesController.updateCartDeliveryGroup';
import UpdateContactPointAddress from '@salesforce/apex/B2B_AddressesController.UpdateContactPointAddress';
import saveNewAddress from '@salesforce/apex/B2B_AddressesController.saveNewAddress';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';


export default class B2b_contractAddress extends LightningElement {
    currentCartId;
    showShipTo ;
    showBillTo;
    isModalOpen;
    @track _contactPointAddressId = '';
    @track billTo = []
    @track shipTo = []
    @track billingOption = [];
    @track shippingOption = [];
    @track billingRecord = {
        Country : '',
        Street : '',
        City : '',
        State : '',
        PostalCode : '',
    };
    @track shipRecord = {
        Country : '',
        Street : '',
        City : '',
        State : '',
        PostalCode : '',
    };
    @track saveRecord = {
        Country : '',
        Street : '',
        City : '',
        State : '',
        PostalCode : '',
    };
    @api
    get cartId() {
        return this.currentCartId;
    }
    set cartId(value) {
        this.currentCartId = value;
    }

    @api
    get contactPointAddressId() {
        return this._contactPointAddressId;
    }

    set contactPointAddressId(value) {
        this._contactPointAddressId = value;
    }

    

    handleUpdateCartDeliveryGroup(cpaId){
        let params = {
            'cartId' : this.currentCartId,
            'cpAddressId' : cpaId
        };
        updateCartDeliveryGroup({dataMap : params})
        .then((result)=>{
            console.log('update cart delivery group');
            console.log(result);
        })
        .catch((error=>{
            console.log(error);
        }))
    }
    handleUpdateContactPointAddress(cpaId){
        let params = {
            'cpAddressId' : cpaId
        };
        UpdateContactPointAddress({dataMap : params})
        .then((result)=>{
            console.log('update contact point address');
            console.log(result);
        })
        .catch((error=>{
            console.log(error);
        }))
    }

    handleBillingChange(event){
        let selectedBillingId = event.detail.value;
        console.log(selectedBillingId);
        this.handleGetContactPointAddressById(selectedBillingId);
        this.handleUpdateContactPointAddress(selectedBillingId);
        this.handleUpdateCartDeliveryGroup(selectedBillingId);
        
    }

    handleShippingChange(event){
        let selectedShippingId = event.detail.value;
        console.log(selectedShippingId);
        this.handleGetContactPointAddressById(selectedShippingId);
        this.handleUpdateCartDeliveryGroup(selectedShippingId);
        this.handleUpdateContactPointAddress(selectedShippingId);
        this._contactPointAddressId = selectedShippingId;
        const shippingAddressEvent = new FlowAttributeChangeEvent('contactPointAddressId', this._contactPointAddressId) 
        this.dispatchEvent(shippingAddressEvent);
        console.log(shippingAddressEvent);   
    }

    handleGetContactPointAddressById(selectedId){
        console.log('called');
        let params = {
            'cpAddressId' : selectedId
        };
        getContactPointAddressById({dataMap : params})
        .then((result)=>{
            console.log('contact point address called');
            console.log(result);
            if(result.AddressType == 'Billing'){
                this.billingRecord.Country = result.Country;
                this.billingRecord.City = result.City;
                this.billingRecord.PostalCode = result.PostalCode;
                this.billingRecord.State = result.State
            }
            else{
                this.shipRecord.Country = result.Country;
                this.shipRecord.City = result.City;
                this.shipRecord.PostalCode = result.PostalCode;
                this.shipRecord.State = result.State;
            }
            console.log(JSON.stringify(this.billingRecord));
            console.log(JSON.stringify(this.shipRecord));
        })
        .catch((error=>{
            console.log(error);
        }))

    }


    handleGetContactPointAddress(){
        let params = {};
        getContactPointAddress({dataMap : params})
        .then((result)=>{
            this.shippingOption = [];
            this.billingOption = [];
            console.log(result);
            for (let key in result) {
                if(result[key].AddressType == 'Shipping'){
                    //Ukiah, CA 95482 United States
                    let optionsStringTxt = `${result[key].City}, ${result[key].State} ${result[key].PostalCode} ${result[key].Country}`;
                    this.shippingOption.push({ label: optionsStringTxt, value:result[key].Id});
                    console.log(JSON.stringify(this.shippingOption));
                    // let data = {};
                    // let parsedData = JSON.parse(JSON.stringify(result[key]));
                    // console.log(optionsStringTxt);
                    // this.shipTo.push[{parsedData}];
                    // console.log(parsedData)
                    // console.log(JSON.stringify(this.shipTo));
                }
                else{
                    let optionsStringTxt = `${result[key].City}, ${result[key].State} ${result[key].PostalCode} ${result[key].Country}`;
                    this.billingOption.push({ label: optionsStringTxt, value:result[key].Id});
                    console.log(JSON.stringify(this.billingOption));
                }
            } 
            console.log('shipping ops',JSON.stringify(this.shippingOption));
            console.log('Billing ops',JSON.stringify(this.billingOption));
        })
        .catch((error=>{
            console.log(error);
        }))
    }
    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    submitDetails(){
        console.log('details Submitted');
        const isInputsCorrectInput = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        if(isInputsCorrectInput){
            console.log('if called')
            this.saveRecord.City = this.template.querySelector("[data-field='city']").value;
            this.saveRecord.State = this.template.querySelector("[data-field='State']").value;
            this.saveRecord.Country  = this.template.querySelector("[data-field='Country']").value;
            this.saveRecord.PostalCode = this.template.querySelector("[data-field='ZipCode']").value;
            this.saveRecord.Street = this.template.querySelector("[data-field='Street']").value;

            
            let params = {
                'address' : this.saveRecord,
                'cartId' : this.currentCartId,
            };
            saveNewAddress({dataMap : params})
            .then((result)=>{
                console.log('contact point address inserted');
                console.log(result);
                if(result.isSuccess == true){
                    const event = new ShowToastEvent({
                        title: 'Toast message',
                        message: 'Toast Message',
                        variant: 'success',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(event);
                    this.shipRecord.Country = result.cpaRecord.Country;
                    this.shipRecord.City = result.cpaRecord.City;
                    this.shipRecord.PostalCode = result.cpaRecord.PostalCode;
                    this.shipRecord.State = result.cpaRecord.State;
                    this.shipRecord.Street = result.cpaRecord.Street;
                    this.handleGetContactPointAddress();
                    this.handleUpdateCartDeliveryGroup(result.cpaRecord.Id);
                    this.closeModal();
                }
            })
            .catch((error=>{
                console.log(error);
            }))
        }
        console.log(JSON.stringify(this.shipRecord));
    }
    connectedCallback(){
        console.log('calleddd');
        console.log('currentCartI>>>'+ JSON.stringify(this.currentCartId));
        console.log(this._contactPointAddressId);
        this.handleGetContactPointAddress();

    }

}