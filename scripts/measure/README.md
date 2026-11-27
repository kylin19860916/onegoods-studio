# OGS R2 verification

The baseline is the static `public/` tree from commit `d2191a3ae05d4249fd994f735ec53610901a02b7`. Serve that tree on 5174 and the current build on 5175 with `serve.py`. Pass both servers the same recorded public catalog and store-payment config. Their only API responses are those fixtures. They have no order creation, payment, or shipping implementation.

Install Playwright outside the project, or use an existing installation. From the repository root run:

    PLAYWRIGHT_MODULE=/path/to/playwright-core \
    CHROME="/path/to/Google Chrome" \
    node scripts/measure/r2.mjs http://127.0.0.1:5174 http://127.0.0.1:5175 /path/to/results /path/to/public-fixtures

Use the same Lighthouse version and default simulated mobile throttling for both sides. Measurements store section content edges, rendered font sizes, hit target bounds, footer text, purchase URLs and preview lifecycles. The browser test samples `renderer.info.memory.geometries` from a temporary instrumented copy of the built JavaScript.
