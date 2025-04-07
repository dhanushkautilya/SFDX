
import LightningDatatable from 'lightning/datatable';
import picklistNotEditable from './picklistNotEditable.html';
import picklistEditable from './pickListEditable.html';



export default class CustomTypeDatatable extends LightningDatatable  {
    
     static customTypes = {
        picklist: {
            template: picklistNotEditable,
            editTemplate: picklistEditable,
            standardCellLayout: true,
            typeAttributes : ['label', 'placeholder', 'options', 'value', 'context', 'variant','name']
        }
        
    };
   
}