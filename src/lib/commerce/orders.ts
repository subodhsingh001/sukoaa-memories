/** Server-side order contracts. Never trust client-supplied totals or payment status. */
export type OrderStatus='draft'|'quoted'|'awaiting_payment'|'paid'|'preflight_passed'|'submitted_to_printer'|'in_production'|'shipped'|'delivered'|'failed'|'refunded';
export interface OrderDraft {id:string;albumId:string;albumRevision:string;country:string;currency:'INR'|'USD';productId:string;quantity:number;status:OrderStatus;providerOrderId?:string;paymentOrderId?:string;}
export interface PrinterAdapter {
  getQuote(input:{productId:string;quantity:number;country:string}):Promise<{amountMinor:number;currency:string;shippingMinor:number}>;
  validateFiles(input:{interiorUrl:string;coverUrl:string;productId:string}):Promise<{ok:boolean;messages:string[]}>;
  submit(input:{orderId:string;productId:string;quantity:number;shippingAddress:Record<string,string>;interiorUrl:string;coverUrl:string}):Promise<{providerOrderId:string}>;
  status(providerOrderId:string):Promise<{status:string;trackingUrl?:string}>;
}
export function canTransition(from:OrderStatus,to:OrderStatus){const allowed:Record<OrderStatus,OrderStatus[]>={draft:['quoted','failed'],quoted:['awaiting_payment','failed'],awaiting_payment:['paid','failed'],paid:['preflight_passed','refunded','failed'],preflight_passed:['submitted_to_printer','refunded','failed'],submitted_to_printer:['in_production','failed'],in_production:['shipped','failed'],shipped:['delivered','failed'],delivered:[],failed:[],refunded:[]};return allowed[from].includes(to)}
export function requireServerConfig(){const missing=['DATABASE_URL','OBJECT_STORAGE_BUCKET','PRINT_PROVIDER_API_KEY','PAYMENT_GATEWAY_KEY','PAYMENT_WEBHOOK_SECRET'].filter(k=>!process.env[k]);if(missing.length)throw Error('Commerce unavailable: missing server configuration: '+missing.join(', '));}
