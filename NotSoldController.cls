public without sharing class NotSoldController {
    @AuraEnabled(cacheable=true)
    public static List<Customer_SKU_Heatmap__c> getUnsoldSkus(Id accountId) {
        if (accountId == null) {
            return new List<Customer_SKU_Heatmap__c>();  
        }
        
        // Filter records based on the provided AccountId
        return [
            SELECT Id, Product_Name__c, Sales_Disposition__c, New_Potential_ACV__c 
            FROM Customer_SKU_Heatmap__c 
            WHERE Account__c = :accountId  
            OR Sales_Disposition__c != null
            OR Status__c = 'Available' WITH SYSTEM_MODE
        ];
    }

}