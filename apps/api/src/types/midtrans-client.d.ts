declare module 'midtrans-client' {
    interface SnapConfig {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    interface CoreApiConfig {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    interface ItemDetail {
        id: string;
        price: number;
        quantity: number;
        name: string;
    }

    interface CustomerDetails {
        first_name?: string;
        last_name?: string;
        email: string;
        phone?: string;
    }

    interface Callbacks {
        finish?: string;
        error?: string;
        pending?: string;
    }

    interface SnapTransactionParameter {
        transaction_details: TransactionDetails;
        item_details?: ItemDetail[];
        customer_details?: CustomerDetails;
        callbacks?: Callbacks;
        metadata?: Record<string, any>;
    }

    interface SnapTransaction {
        token: string;
        redirect_url: string;
    }

    interface TransactionStatus {
        order_id: string;
        transaction_status: string;
        fraud_status?: string;
        gross_amount: string;
        payment_type: string;
    }

    class Snap {
        constructor(config: SnapConfig);
        createTransaction(parameter: SnapTransactionParameter): Promise<SnapTransaction>;
    }

    class CoreApi {
        constructor(config: CoreApiConfig);
        transaction: {
            notification(notification: any): Promise<TransactionStatus>;
            status(orderId: string): Promise<TransactionStatus>;
        };
    }

    export { Snap, CoreApi };
}
