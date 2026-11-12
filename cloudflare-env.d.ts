declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ASSETS?: Fetcher;
    OGS_ECPAY_STAGE_RETURN_URL?: string;
  }
}

declare namespace Cloudflare {
 interface Env { OGS_ADMIN_EMAILS?: string; }
}
