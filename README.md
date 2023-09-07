# accounting-node.js

## File-Structure

- **auth**
- **customers**
- **inventory-managerment**
- **invoices**
- **middleware**
- **postgreSQL**

**_Each directories inside the features directory consists of the following_:**

- **controller** : Contains the API route of the feature
- **<feature_name>Model**: Contains the Object Models of the said feature containg assosiated methods and properties
- **ctrlFunc/controlfunction** : Contains functions that are global but are relatedd to that particular feature.
