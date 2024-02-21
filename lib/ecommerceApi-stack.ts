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
    this.createProductsService(props, api);
    
    this.createOrdersService(props, api);
    }

    private createProductsService(props: ECommerceApiStackProps, api: apigateway.RestApi) {
        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler);
        // "/products"
        const productsResource = api.root.addResource('products');
        productsResource.addMethod('GET', productsFetchIntegration);

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

    private createOrdersService(props: ECommerceApiStackProps, api: apigateway.RestApi) {
        const ordersIntegration = new apigateway.LambdaIntegration(props.ordersHandler);

        //resource "/orders"
        const ordersResource = api.root.addResource('orders');
        //GET "/orders"
        ordersResource.addMethod('GET', ordersIntegration);
        //GET "/orders?email={email}"

        //DELETE "/orders/{id}"
        const orderDeletionValidator = new apigateway.RequestValidator(this, 'OrderDeletionValidator', {
            restApi: api,
            requestValidatorName: 'OrderDeletionValidator',
            validateRequestParameters: true
        })

        ordersResource.addMethod('DELETE', ordersIntegration, {
            requestParameters: {
                'method.request.querystring.email': true,
                'method.request.querystring.orderId': true
            },
            requestValidator: orderDeletionValidator
        
        });


        //POST "/orders"
        ordersResource.addMethod('POST', ordersIntegration);
    }
}