import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import { Product } from 'model/products';
import {v4 as uuid} from 'uuid';

export class ProductsRepository {
    private ddbClient: DocumentClient
    private productsDdb: string
    
    constructor(ddbClient: DocumentClient, productsDdb: string){
        this.ddbClient = ddbClient
        this.productsDdb = productsDdb
    }

    public async getAllProducts(): Promise<Product[]>{
        const data = await this.ddbClient.scan({
            TableName: this.productsDdb
            
        }).promise()
        return data.Items as Product[]
    }

    public async getProductById(productId: string): Promise<Product>{
        try{
            const data = await this.ddbClient.get({
                TableName: this.productsDdb,
                Key: {
                    id: productId
                }

            }).promise()

            if(data.Item){
                return data.Item as Product
            }else {
                throw new Error("Product not found")
            }

        }catch(err){
            throw err
        }
    }

    public async createProduct(product: Product): Promise<Product> {
        product.id = uuid()
        await this.ddbClient.put({
            TableName: this.productsDdb,
            Item: product
        }).promise()
        return product
    }

    public async deleteProductByID(productId: string): Promise<Product>{
        const data = await this.ddbClient.delete({
            TableName: this.productsDdb,
            Key: {
                id: productId
            },
            ReturnValues: "ALL_OLD"
        }).promise()
        if(data.Attributes){
            return data.Attributes as Product
        }else{
            throw new Error("Product not found")
        }
    }

    public async updateProductById(productId: string, product: Product): Promise<Product>{
        const data = await this.ddbClient.update({
            TableName: this.productsDdb,
            Key: {
                id: productId
            },
            ConditionExpression: "attribute_exists(id)",
            ReturnValues: "UPDATED_NEW",
            UpdateExpression: "set productName = :productName, code = :code, price = :price, model = :model, productUrl = :productUrl",
            ExpressionAttributeValues: {
                ":productName": product.productName,
                ":code": product.code,
                ":price": product.price,
                ":model": product.model,
                ":productUrl": product.productUrl
            }
        }).promise()
        data.Attributes!.id = productId
        return data.Attributes as Product 
    }

    async getProductsByIds(productsIds: string[]): Promise<Product[]>{
        const keys: {id: string}[] = []
        productsIds.forEach(productId => {
            keys.push({
                id: productId
            })
        })
        const data = await this.ddbClient.batchGet({
            RequestItems: {
                [this.productsDdb]: {
                    Keys: keys
                }
            }
        }).promise()
        return data.Responses![this.productsDdb] as Product[]
        
    }
}