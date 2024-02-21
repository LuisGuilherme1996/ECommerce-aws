import { Callback, Context } from "aws-lambda";
import { ProductEvent } from "./layers/productEventsLayers/nodejs/productEvent";
import { DynamoDB } from "aws-sdk";
import * as AWSXRAY from "aws-xray-sdk-core";

AWSXRAY.captureAWS(require('aws-sdk'))
const eventsDdb = process.env.EVENTS_DDB
const ddbClient = new DynamoDB.DocumentClient();
export async function handler(event: ProductEvent, context: Context, callBack: Callback): Promise<void>{
    console.log(event, 'EVENTO QUE CHEGOU') 
    console.log(`Lambda id:, ${context.awsRequestId})`) 
    await createEvent(event)
    callBack(null, JSON.stringify({
        productEventCreated: true,
        message: 'Product event created with success'
    }))

}

  function createEvent(event: ProductEvent) {
    const timestamp = Date.now()
    const ttl = ~~(timestamp / 1000) + 5 * 60
    return ddbClient.put({
        TableName: eventsDdb,
        Item: {
            pk: `#product_${event.productCode}`,
            sk: `${event.eventType}#${timestamp}`,
            email: event.email,
            createdAt: timestamp,
            requestId: event.requestId,
            eventType: event.eventType,
            info: {
                productId: event.productId,
                price: event.productPrice
            },
            ttl: ttl
        }
    }).promise()
  }