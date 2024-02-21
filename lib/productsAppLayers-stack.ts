import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
export class ProductsAppLayersStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        const productsLayers = new lambda.LayerVersion(this, "ProductsLayers", {
            code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_LATEST],
            layerVersionName: "ProductsLayers",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })
        new ssm.StringParameter(this, "ProductsLayerVersionArn", {
            parameterName: "ProductsLayerVersionArn",
            stringValue: productsLayers.layerVersionArn
        }
        )

        const productEventsLayers = new lambda.LayerVersion(this, "productEventsLayers", {
            code: lambda.Code.fromAsset('lambda/products/layers/productEventsLayers'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_LATEST],
            layerVersionName: "productEventsLayers",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })
        new ssm.StringParameter(this, "ProductEventsLayerVersionArn", {
            parameterName: "ProductEventsLayerVersionArn",
            stringValue: productEventsLayers.layerVersionArn
        }
        )

        
    }

}