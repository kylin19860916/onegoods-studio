declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ASSETS?: Fetcher;
  }
}

declare namespace Cloudflare {
 interface Env { OGS_ADMIN_EMAILS?: string; }
}
