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

    const productsResource = api.root.addResource('products')
    productsResource.addMethod('GET', productsFetchIntegration) 
    }
}