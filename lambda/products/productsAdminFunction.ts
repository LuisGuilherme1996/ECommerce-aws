import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DynamoDB, Lambda } from "aws-sdk";
import { ProductsRepository } from "./layers/productsLayer/nodejs/productsRepository";
import { Product } from "model/products";
import * as AWSXray from 'aws-xray-sdk'
import { ProductEvent, ProductEventType } from "./layers/productEventsLayers/nodejs/productEvent";
AWSXray.captureAWS(require('aws-sdk'))
const ddbClient = new DynamoDB.DocumentClient()
const lambda = new Lambda();
const productsDdb = process.env.PRODUCTS_DDB
const productsRepository = new ProductsRepository(ddbClient, productsDdb)
const productEventsFunctionName = process.env.PRODUCTS_EVENTS_FUNCTION_NAME

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;
    console.log(`API Gateway Request ID: ${apiRequestId}, Lambda Request ID: ${lambdaRequestId}`);

    if(event.resource === '/products') {
       console.log('Post/Products')
       const product = JSON.parse(event?.body) as Product
       const productCreated = await productsRepository.createProduct(product)
       const response = await sendProductEvent(product, ProductEventType.CREATED, 'Luis@hotmail.com', lambdaRequestId)
       console.log('response o que vem do event', response)
       return {
        statusCode: 201,
        body: JSON.stringify(productCreated)
       }
    } else if(event.resource === '/products/{id}') {
        const id = event.pathParameters?.id as string;
        if(event.httpMethod === "PUT"){

            const products = JSON.parse(event?.body) as Product
            try{
                const productsUpdated = await productsRepository.updateProductById(id, products)
                const response = await sendProductEvent(productsUpdated, ProductEventType.UPDATED, 'Luis@gmail.com', lambdaRequestId)
                console.log('response o que vem do event updated', response)
                return {
                    statusCode: 200,
                    body: JSON.stringify(productsUpdated)
                };
            }catch(err){
                return {
                    statusCode: 404,
                    body: 'Product not found'
                }
            }
            
            
        } else if(event.httpMethod === 'DELETE'){
            console.log('Delete/Products')
            try{
                const productDeleted = await productsRepository.deleteProductByID(id)
                const response = await sendProductEvent(productDeleted, ProductEventType.DELETED, 'joao@hotmail.com', lambdaRequestId)
                console.log('response o que vem do event deletou', response)
                return {
                    statusCode: 200,
                    body: JSON.stringify(productDeleted)
                };
            }catch(err){
                console.error((<Error>err).message)
                return {
                    statusCode: 404,
                    body: (<Error>err).message
                }
            }
        }
    }else {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "BAD REQUEST"
            })
        };
    }
    async function sendProductEvent(product: Product, eventTypee: ProductEventType, email: string, lambdaRequestId: string){
        const event: ProductEvent = {
            email: email,
            eventType: eventTypee,
            productCode: product.code,
            productId: product.id,
            productPrice: product.price,
            requestId: lambdaRequestId
        }

        lambda.invoke({
            FunctionName: productEventsFunctionName,
            Payload: JSON.stringify(event),
            InvocationType: "Event"
        }).promise()
    }
}