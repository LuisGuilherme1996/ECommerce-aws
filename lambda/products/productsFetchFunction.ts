import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const lambdaRequestId = context.awsRequestId;
        const apiRequestId = event.requestContext.requestId;
        console.log(`API Gateway Request ID: ${apiRequestId}, Lambda Request ID: ${lambdaRequestId}`);
        const method = event.httpMethod;
        if (event.resource === "/products") {
            if (method === "GET") {
                console.log("GET");
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "GET PRODUCTS - OK"
                    })
                };
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