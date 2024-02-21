export interface OrderProduct {
    code: number,
    price: number,
}

export interface Order {
    pk: string,
    sk?: string,
    createAt?: number,
    shipping: {
        type: "URGENTE" | "ECONOMIC",
        carrier: "CORREIOS" | "FEDEX" ,
    },
    billing: {
        payment: "CASH" | "DEBIT_CARD" | "CREDIT_CARD",
        totalPrice: number,
    }
    products: OrderProduct[],
}

export enum PaymentType {
    CASH = "CASH",
    DEBIT_CARD = "DEBIT_CARD",
    CREDIT_CARD = "CREDIT_CARD"
}

export enum ShippingType {
    ECONOMIC = "ECONOMIC",
    URGENTE = "URGENTE"
}

export enum CarrierType {
    CORREIOS = "CORREIOS",
    FEDEX = "FEDEX"
}

export interface OrderProductResponse  {
    code: number,
    price: number
}

export interface OrderRequest {
    email: string,
    productsIds: string[],
    payment: PaymentType,
    shipping: {
        type: ShippingType,
        carrier: CarrierType
    }
}

export interface OrderResponse {
    code?: number,
    email: string,
    id: string,
    createdAt: number,
    billing: {
        payment: PaymentType,
        totalPrice: number
    },
    shipping: {
        type: ShippingType,
        carrier: CarrierType
    },
    products: OrderProductResponse[]
}