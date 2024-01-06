import {Construct} from "constructs";
import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cwlogs from 'aws-cdk-lib/aws-logs'
import {ECommerceApiStackProps} from '../model/ecommerceApiStackProps'

export class ECommerceApiStack extends cdk.Stack {
    
    constructor(scope: Construct, id: string, props: ECommerceApiStackProps){
        super(scope, id, props)
    const logGroup = new cwlogs.LogGroup(this,'ECommerceApiLogs')
    const api = new apigateway.RestApi(this, 'ECommerceApi', {
        restApiName: "ECommerceApi",
        cloudWatchRole: true,
        defaultCorsPreflightOptions: {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS
        },
        deployOptions: {
            accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
            accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                caller: true,
                httpMethod: true,
                ip: true,
                protocol: true,
                requestTime: true,
                resourcePath: true,
                responseLength: true,
                status: true,
                user: true
            }),
        
        }
    })
    const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
    // "/products"
    const productsResource = api.root.addResource('products')
    productsResource.addMethod('GET', productsFetchIntegration)

    // "/products/{id}"
    const productsIdResource = productsResource.addResource('{id}');
    productsIdResource.addMethod('GET', productsFetchIntegration);

    const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler);
    //POST "/products"
    productsResource.addMethod('POST', productsAdminIntegration);
    
    //PUT "/products/{id}"
    productsIdResource.addMethod('PUT', productsAdminIntegration);

    //DELETE "/products/{id}"
    productsIdResource.addMethod('DELETE', productsAdminIntegration);
    }
}