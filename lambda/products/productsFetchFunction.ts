import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import { ProductsRepository } from "./layers/productsLayer/nodejs/productsRepository";
import {DynamoDB} from "aws-sdk";

const productsDdb = process.env.PRODUCTS_DDB
const ddbClient = new DynamoDB.DocumentClient()
const productsRepository = new ProductsRepository(ddbClient, productsDdb)
export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const lambdaRequestId = context.awsRequestId;
        const apiRequestId = event.requestContext.requestId;
        console.log(`API Gateway Request ID: ${apiRequestId}, Lambda Request ID: ${lambdaRequestId}`);
        const method = event.httpMethod;
        if (event.resource === "/products") {
            if (method === "GET") {
                console.log("GET");
                const products = await productsRepository.getAllProducts();
                return {
                    statusCode: 200,
                    body: JSON.stringify(products)

                };
            }
        } else if (event.resource === "/products/{id}") {
            const id = event.pathParameters?.id as string;
            console.log(`CHAMOU GET ID::::> ${id}`)
            try{
                const productById = await productsRepository.getProductById(id);
                return {
                    statusCode: 200,
                    body: JSON.stringify(productById)
                };

            }catch(err){
               
                return {
                    statusCode: 404,
                    body: (<Error>err).message
                }
            }
        }
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "BAD REQUEST"
            })
        };
    } catch (error) {
        console.error(`Error processing request ${context.awsRequestId}. Error: ${JSON.stringify(error)}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "INTERNAL SERVER ERROR",
                error: error.message,
                requestId: context.awsRequestId
            })
        };
    }
}