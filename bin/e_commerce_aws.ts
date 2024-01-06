#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductStack } from 'aws-cdk-lib/aws-servicecatalog';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';

const app = new cdk.App();
  const env: cdk.Environment =  {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }

  const tags = {
    cost: "ECommerce",
    team: "LuisGuilherme"
  }

  const productsAppLayersStack = new ProductsAppLayersStack(app, 'ProductsAppLayers', {
    tags: tags,
    env: env
  })
  
  const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
    tags: tags,
    env: env
  })

  productsAppStack.addDependency(productsAppLayersStack)
const ecommerceApi = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
})





ecommerceApi.addDependency(productsAppStack)