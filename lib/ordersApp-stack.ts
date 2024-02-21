import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { OrdersAppStackProps } from 'model/ecommerceApiStackProps';

export class OrdersAppStack extends cdk.Stack {
    readonly ordersHandler: NodejsFunction
    constructor(scope: Construct, id: string, props: OrdersAppStackProps) {
        super(scope, id, props);

        const orderTable = new dynamodb.Table(this, "OrdersDdb", {
            tableName: "orders",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "pk",
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: "sk",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })

        //ORDERS LAYER
        const ordersLayersArn = ssm.StringParameter.valueForStringParameter(this, 'OrdersLayerVersionArn')
        const orderslayer = lambda.LayerVersion.fromLayerVersionArn(this, "OrdersLayerVersionArn", ordersLayersArn)

        const ordersApiLayersArn = ssm.StringParameter.valueForStringParameter(this, 'OrdersApiLayerVersionArn')
        const ordersApilayer = lambda.LayerVersion.fromLayerVersionArn(this, "OrdersApiLayerVersionArn", ordersApiLayersArn)

        //PRODUCTS LAYER
        const productsLayersArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerVersionArn')
        const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayersArn)

        this.ordersHandler = new NodejsFunction(this, 'OrdersFunction', {
            depsLockFilePath: 'pnpm-lock.yaml',
            runtime: lambda.Runtime.NODEJS_16_X,
            functionName: "OrdersFunction",
            entry: 'lambda/orders/ordersFunction.ts',
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(2),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                PRODUCTS_DDB: props.productsDdb.tableName,
                ORDERS_DDB: orderTable.tableName
            },
            layers: [orderslayer, productsLayer, ordersApilayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
        });

        orderTable.grantReadWriteData(this.ordersHandler)
        props.productsDdb.grantReadData(this.ordersHandler)
    }
}