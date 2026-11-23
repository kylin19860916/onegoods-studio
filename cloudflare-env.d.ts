declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ASSETS?: Fetcher;
    OGS_ECPAY_STAGE_RETURN_URL?: string;
    OGS_GOOGLE_PLACES_KEY?: string;
    OGS_GOOGLE_PLACES_ENABLED?: string;
    OGS_ECPAY_PAYMENT_ENABLED?: string;
    OGS_ECPAY_PAYMENT_MERCHANT_ID?: string;
    OGS_ECPAY_PAYMENT_HASH_KEY?: string;
    OGS_ECPAY_PAYMENT_HASH_IV?: string;
    OGS_STORE_HOME_SHIPPING_FEE?: string;
  }
}

declare namespace Cloudflare {
 interface Env { OGS_ADMIN_EMAILS?: string; }
}
