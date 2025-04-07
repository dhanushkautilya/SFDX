# 🔷 Lightning Datatable with Picklist Inline Editing & Color Disposition

## 📘 Overview

This Salesforce project provides a Lightning Web Component (LWC) solution to manage **Customer SKU Heatmap** records efficiently through a dynamic and interactive data table. The core features include:

- **Inline editing** for picklist and lookup fields  
- **Color disposition** to visually represent SKU statuses  
- **Custom data types** to extend standard `lightning-datatable` functionality  
- **Apex integration** for backend record retrieval and updates  

This component allows users to view and edit multiple Customer SKU records on a single screen, significantly improving user experience and productivity.

---

## 🧩 Features

- ✅ **Inline Editing**: Edit picklist and text fields directly within the table  
- 🎨 **Color Disposition**: Dynamic CSS classes to color-code rows based on SKU status  
- 🔄 **Real-time Updates**: Changes are reflected immediately in the UI and persisted via Apex  
- 🧩 **Custom LWC Column Types**: Extend the standard datatable with custom cell behavior  
- 🔍 **Filtered Data Fetching**: Apex query ensures only relevant data is fetched  

---

## 📊 Displayed Fields

The datatable displays the following fields from the `Customer_SKU_Heatmap__c` object:

- `Product_Name__c`
- `Sales_Disposition__c` (Picklist with inline editing + color-coded status)
- `New_Potential_ACV__c` (Currency field)
- `Status__c` (used internally for filtering)

---

## 🧠 Use Case

Imagine managing a large volume of customer SKU data. Users can:

- Quickly identify SKUs that are "Available", "Low Stock", or "Discontinued"
- Edit Sales Disposition values on the fly via picklists
- Instantly see the changes in color-coded format
- Save multiple changes with a single click

---

## 🛠️ Technical Architecture

### LWC Components

- **`customDatatable`**: Base LWC using `lightning-datatable`, extended with custom column types  
- **`picklistColumnType`**: Custom data type for inline editable picklist fields  
- **`colorStatusCell`**: Adds color styling based on status field  
- **`lookupColumnType`** *(optional)*: To be used for lookup fields (if required)

### Apex Controller

- **`CustomerSKUController.cls`**
  - Method: `@AuraEnabled cacheable`  
  - Query:
    ```sql
    SELECT Id, Product_Name__c, Sales_Disposition__c, New_Potential_ACV__c 
    FROM Customer_SKU_Heatmap__c 
    WHERE Account__c = :accountId 
    OR Sales_Disposition__c != null 
    OR Status__c = 'Available' 
    WITH SYSTEM_MODE
    ```

  - Update method handles batch save of modified records

---

## 🎨 Color Disposition Rules

| Status         | Display Color |
|----------------|---------------|
| Available      | ✅ Green       |
| Low Stock      | ⚠️ Red         |
| Discontinued   | ❌ Gray        |
| Other/Null     | ⚪ Default     |

Color is dynamically applied using a custom CSS class inside the cell template.

---

## 📦 Installation

1. **Clone the repository** or pull metadata using SFDX  
2. Deploy LWC and Apex classes to your Salesforce org  
3. Add the component to a Lightning page or app  
4. Ensure the required fields exist in `Customer_SKU_Heatmap__c`  
5. Provide appropriate FLS (Field-Level Security) permissions  

---

## 🚀 How to Use

1. Navigate to the Lightning page where the component is placed  
2. Inline edit any picklist or text field  
3. Visual feedback (color) updates instantly  
4. Click "Save" to persist changes via Apex  

---

