# transformer_crypto
This transformer is used to invoice in bitcoin 


 > ## Folders and Files  
  + Controller
    - tansactionController.js
  + Helpers
    - db.js
  + Middleware
    - error-handler.js
    - validate-request.js
  + Model
    - transactionModel.js
  + notifier
    - notifier.js ( path should be added in bitcoin.conf file section walletnotify eg node < path/to/file/notifier.js>)
  + Service
    - transactionService.js 
  - Config.json
  - package-lock.json
  - package.json
  - btc-gw-server.js
  - .env

> ## To Run the code 

 1. Clone the repository into the server
 2. Change the database details in the ` config.json ` file 
   
   ```json
  "database": {
        "host": "localhost",
        "port": 3306,
        "user": "<DATABASE USERNAME>",
        "password": "<DATABASE PASSWORD>",
        "database": "<DATABASE NAME>"
    },
   ```
 3. In the repository folder, run ` npm install ` to install all the necessary packages to run 
 4. Run ` npm run dev ` to start the application 

 Databases will be created and the application will be be running on a specified port in `server.js  ` file 

 > ### To change the port, 
``` js
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : `${SPECIFIED PORT }`;
app.listen(port, () => console.log('Server listening on port ' + port));

```
 > ## Flows 

These are function found in the ` transactionService.js ` file. 
| Function             | Description                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Initiate Transaction | Initiate a transaction and new data is created into the database table ` transactions ` in return of the transaction details. |
| statuscheck             | search for the details of a transaction based on the refNo
---


 <!-- > ## Api Routed 

  1.  ### Initiate Transaction
   | Function | Details                                                                                          |
   | -------- | ------------------------------------------------------------------------------------------------ |
   | Post     | ` http://url/api/initiate`                                                                     |
   | Request  | `{"merchantRef": "<Reference from merchant>",  "amount": <Amount in Ghana Cedis>}  `       |
   | Response | SUCCESS : `{ "name": "<NAME>",  "msisdn": "233<9-DIGIT-MoMoNumber"}` FAILURE: `statusCode: 404 ` |
---


  2.  ### Initiate Transaction 
   | Function | Details                    |
   | -------- | -------------------------- |
   | Post     | ` http://url/api/initiate` |

> Request 
``` json 
{
  "destination": "<10-DIGIT-MOMONUMBER>",
  "network": "VODAFONE" OR "MTN" OR "ARTLTIGO", 
  "txType": "debit" or "credit"
  }  
```
 > Response 
```json
{
    "newTx": {
        "isExpired": false,
        "isActive": true,
        "id": 160,
        "msisdn": "<msisdn of destination>",
        "network": "VODAFONE",
        "txType": "debit",
        "refNo": "tp-debit-1648205414573",
        "status": "initiated",
        "expires": "2022-03-25T11:05:14.574Z",
        "updatedAt": "2022-03-25T10:50:14.574Z",
        "createdAt": "2022-03-25T10:50:14.574Z"
    },
    "name": "<NAME>"
}
``` 


---
 3.  ### Execute Transaction 
   | Function | Details                    |
   | -------- | -------------------------- |
   | Post     | ` http://url/api/transact` |

> Request 
``` json 
{
    "refNo" : "{{refNo}}",
    "amount": "0.01",
    "narration": "TrustPay"
} 
```
 > Response 
```json
{
    "isExpired": false,
    "isActive": true,
    "id": 160,
    "refNo": "tp-debit-1648205414573",
    "responseCode": null,
    "productId": "1",
    "msisdn": "233209016565",
    "amount": "0.01",
    "network": "VODAFONE",
    "txType": "debit",
    "status": "processing",
    "narration": "TrustPay",
    "uniwalletTransactionId": "1648205444789PO",
    "networkTransactionId": null,
    "responseMessage": null,
    "balance": null,
    "expires": "2022-03-25T11:05:14.000Z",
    "doneAt": null,
    "createdAt": "2022-03-25T10:50:14.000Z",
    "updatedAt": "2022-03-25T10:50:44.291Z"
}
``` 


---

 3.  ### Status Check 
   | Function | Details                    |
   | -------- | -------------------------- |
   | Get     | ` http://url/api/status/{{refNo}}` |

 > Response 
```json
{
    "isExpired": true,
    "isActive": false,
    "id": 159,
    "refNo": "tp-debit-1647249753832",
    "responseCode": "01",
    "productId": "1",
    "msisdn": "233209016565",
    "amount": "0.01",
    "network": "VODAFONE",
    "txType": "debit",
    "status": "completed",
    "narration": "Payment for transaction",
    "uniwalletTransactionId": "1647249761274PO",
    "networkTransactionId": "0000002663148081",
    "responseMessage": "Successfully processed transaction.|Payment for transaction",
    "balance": null,
    "expires": "2022-03-14T09:37:33.000Z",
    "doneAt": "2022-03-14T09:22:41.000Z",
    "createdAt": "2022-03-14T09:22:33.000Z",
    "updatedAt": "2022-03-14T09:23:13.000Z"
}
``` 
---

 *** Please note debit can be done to all networks ***  -->

 


