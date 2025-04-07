
import { LightningElement, wire, track, api } from 'lwc';
import getUnsoldSkus from '@salesforce/apex/SKUController.getUnsoldSkus';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import {loadStyle} from 'lightning/platformResourceLoader';
import COLORS from '@salesforce/resourceUrl/colors'
import { getObjectInfo} from 'lightning/uiObjectInfoApi';
import {getPicklistValues} from 'lightning/uiObjectInfoApi';
import CUSTOMER_OBJECT from '@salesforce/schema/Customer_SKU_Heatmap__c';
import SALESD_FIELD from '@salesforce/schema/Customer_SKU_Heatmap__c.Sales_Disposition__c';


export default class Customer360notsold extends NavigationMixin(LightningElement) {
    @api recordId;//getting record id of the account object on which we placed this lwc component
    @api dontShow=false; //determining whether we need to show View all or first 10 records.This input we are getting from NavigateToLWC Aura Cmp.
    @track visibleData = [];
    @track error;
    @track showViewAllButton = false;
    @track wiredResult;
    itemlength;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy = 'Product_Name__c'; // Default sorted by Product Name
    sby = 'Product Name';
    intervalId;
    draftValues = [];
    saveDraftValues=[];
     isCssLoaded = false;
     isLoading=false;
     showsearchbar=true;


    connectedCallback() {
        console.log('recordId',this.recordId);
        this.startInterval();
    }

     renderedCallback(){ 
        if(this.isCssLoaded) return
        this.isCssLoaded = true
        loadStyle(this, COLORS).then(()=>{
            console.log("Loaded Successfully")
        }).catch(error=>{ 
            console.error("Error in loading the colors")
        })
       
    }

    @track columns = [
        { label: 'Product Name', fieldName: 'Product_Name__c', type: 'text', sortable: true, editable: false},
        {
            label: 'Sales Disposition',
            fieldName: 'Sales_Disposition__c',
            type: 'picklist',
            sortable: true,
            editable: true,
            wrapText: true,
            typeAttributes: {
                options: { fieldName : 'picklistOptions' },
                value: { fieldName : 'Sales_Disposition__c' },
                placeholder: 'choose value',
                context: { fieldName: 'Id' } 
            },
            cellAttributes: { 
                class: { fieldName: 'colorClass' }
            }
        },
       
        { label: 'Potential ACV', fieldName: 'New_Potential_ACV__c', type: 'currency', sortable: true, editable: false, 
        cellAttributes: { alignment: 'left' } },
        
    ];





      
picklistOptions;
skus=[];
lastSavedData=[];

@wire(getObjectInfo, { objectApiName: CUSTOMER_OBJECT })
caseObjectMetadata;

@wire(getPicklistValues, { recordTypeId: '$caseObjectMetadata.data.defaultRecordTypeId', fieldApiName: SALESD_FIELD })
getPicklist({ data, error }) {
    if (data) {
        this.picklistOptions = data.values;
    }
    else if (error) {
        console.log(result);         
    }
}


fetchCases() {      
    getUnsoldSkus ({ accountId: this.recordId })
        .then((result) => {                     
 this.skus = result;
 this.skus.forEach(ele => {
                ele.picklistOptions=this.picklistOptions;
            }); 
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            this.skus = undefined;
        });
}


    
    // Capture the wired result
    @wire(getUnsoldSkus, { accountId: '$recordId',pickList:'$picklistOptions' })
    wiredSkus(result) {
        this.wiredResult = result;
        if (result.data) {
            // Clone the result data to avoid mutating the original wired data
            this.data = JSON.parse(JSON.stringify(result.data));
            this.lastSavedData=this.data;
            console.log('data:',this.data);
            console.log('data:',this.data.length);
            if(this.data.length==0)
                this.showsearchbar=false;
                    // Update colorClass for each item in visibleData
            this.data = this.data.map(record => {
                let colorClass; // Initialize the colorClass variable
                switch (record.Sales_Disposition__c) {
                    //case 'Immediate':
                    case 'Immediate':
                        colorClass = 'green-'; // Green for Immediate / Open Opportunity
                        break;
                    case 'Open opportunity':
                        colorClass = 'green-'; // Green for Immediate / Open Opportunity
                        break;    
                    case 'Future':
                        colorClass = 'blue-disposition'; // Blue for Future
                        break;
                    case 'Not a Target':
                        colorClass = 'red-disposition'; // Red for Not a Target
                        break;
                //  case 'Determining':
                    default:
                        colorClass = ''; // No color for Determining or other undefined values
                }

                return { ...record, colorClass:colorClass }; 
            });
            this.lastUpdated = new Date();
            this.updateTimeAgo();
            
            this.processDataForDisplay(); 
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

   @track searchQuery = '';


handleSearch(event) {
    this.searchQuery = event.target.value.toLowerCase();
    this.processDataForDisplay();
}


processDataForDisplay() {
    if (this.searchQuery) {
    this.visibleData = this.data.filter(item => {
        const productName = item.Product_Name__c ? item.Product_Name__c.toLowerCase() : ''; 
        return productName.includes(this.searchQuery);
    }).slice(0, 10); // Show only first 10 records
    this.itemlength = this.visibleData.length < 20 ? this.visibleData.length.toString() : '20+';
} else {
    if (this.dontShow == false) {
        this.visibleData = this.data.slice(0, 10);
        this.showViewAllButton = this.data.length > 10;
        this.itemlength = this.data.length > 20 ? '20+' : this.data.length.toString();
    } else {
        this.visibleData = this.data;
        this.itemlength = this.data.length.toString();
    }
}
 this.visibleData.forEach(ele => {
                ele.picklistOptions=this.picklistOptions;
            });
if (this.data.length === 0) {
        this.itemlength = '0'; 
    }
     this.lastSavedData=this.visibleData;
}


get showItems() {
    return this.itemlength !== '0'; 
}
 

sortData(fieldName, direction) {
    this.visibleData.sort((a, b) => {
        const valueA = a[fieldName] != null ? a[fieldName] : ''; 
        const valueB = b[fieldName] != null ? b[fieldName] : '';

        // Handle numeric fields
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return direction * (valueA - valueB);
        }
        const strA = valueA.toString();
        const strB = valueB.toString();
        return direction * strA.localeCompare(strB, undefined, { sensitivity: 'base' });
    });
}


onHandleSort(event) {
    
    const { fieldName: sortedBy, sortDirection } = event.detail;

    // Set the sortedBy and sortDirection properties
    this.sortedBy = sortedBy;
    this.sortDirection = sortDirection;

    // Dynamically update the display text for sortedBy
    switch (sortedBy) {
        case 'Sales_Disposition__c':
            this.sby = 'Sales Disposition';
            break;
        case 'New_Potential_ACV__c':
            this.sby = 'Potential ACV';
            break;
        case 'Product_Name__c':
        default:
            this.sby = 'Product Name';
            break;
    }

    
    this.sortData(sortedBy, sortDirection === 'asc' ? 1 : -1);

    
    this.visibleData = [...this.visibleData];
}

    // Handle scroll event to check if 'View All' should be shown
        handleScroll(event) {
            const container = event.target;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
                
                this.showViewAllButton = true;
            }
        }

    // Handle 'View All' button click
    handleViewAll() {
       
         // Navigate to the list view
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__NavigateToLWC' // API name of the target LWC
            },
            state:{
                c__recordId:this.recordId
            }
        });
    }

    // Timer logic for timeAgo
    startInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => {
            this.updateTimeAgo();
        }, 1000);
    }

    updateTimeAgo() {
        if (!this.lastUpdated) return;
        const now = new Date();
        const diff = now - this.lastUpdated;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        this.timeAgo = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : 'a few seconds ago';
    }


    // Handle refresh
    handleRefresh() {
        this.isLoading=true;
        refreshApex(this.wiredResult);
        this.isLoading=false;
    }



    //update SKUs with changed data
    updateColumnData(updatedItem)
    {
        let copyData = JSON.parse(JSON.stringify(this.visibleData));
 
        copyData.forEach(item => {
            if (item.Id === updatedItem.Id) {
                for (let field in updatedItem) {
                    item[field] = updatedItem[field];
                }
            }
        });
 
        this.visibleData = [...copyData];
    }

//update draft values to enable edit mode
    updateDraftValuesAndData(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.saveDraftValues];

       copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
 
        if (draftValueChanged) {
            this.saveDraftValues = [...copyDraftValues];
        } else {
            this.saveDraftValues = [...copyDraftValues, updateItem];
        }
    }

  //if cell vlue is changed then update draft values and column list
 handleCellChange(event) {
        let draftValues = event.detail.draftValues;
        draftValues.forEach(ele=>{
            this.updateDraftValuesAndData(ele);
            this.updateColumnData(ele);
        })
        
    }
uniqueValue=0;
activatesave(){

    const fakeEvent = {
        detail: {
            draftValues: [
                {
                    Id: 'dummyId',
                    fieldName: 'exampleField',
                    value: this.uniqueValue
                }
            ]
        }
    };
    this.handleCellChange(fakeEvent);
    this.uniqueValue=this.uniqueValue+1;
}
  

    handleSave(event) {
    this.saveDraftValues = event.detail.draftValues;
    const recordInputs = this.saveDraftValues.map(draft => {
        const fields = Object.assign({}, draft);
        return { fields };
    });
    // Update the records using the UI Record API
    Promise.all(recordInputs.map(recordInput => updateRecord(recordInput)))
        .then(() => {
            this.ShowToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.draftValues = [];
            this.saveDraftValues = [];
            
            // Update lastSavedData after a successful save
            this.lastSavedData = JSON.parse(JSON.stringify(this.data));
            this.handleRefresh();
        })
        .catch(error => {
            this.ShowToast('Error', 'An Error Occurred!', 'error', 'dismissable');
        });
}

handleChange(){
     this.activatesave();
}


   handleCancel() {
    this.visibleData = JSON.parse(JSON.stringify(this.lastSavedData));
    this.visibleData = this.visibleData.map(record => {
        let colorClass;
        switch (record.Sales_Disposition__c) {
            case 'Immediate':
            case 'Open opportunity':
                colorClass = 'green-';
                break;
            case 'Future':
                colorClass = 'blue-disposition';
                break;
            case 'Not a Target':
                colorClass = 'red-disposition';
                break;
            default:
                colorClass = '';
        }
        return { ...record, colorClass };
    }); 
    this.draftValues = [];
    this.saveDraftValues = [];
}


    ShowToast(title, message, variant, mode){
        const evt = new ShowToastEvent({
                title: title,
                message:message,
                variant: variant,
                mode: mode
            });
            this.dispatchEvent(evt);
    }
 

    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.visibleData);
    }

 
    @track isSaving = false;  // Track whether the save operation is in progress
   


 

}
