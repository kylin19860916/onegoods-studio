# OGS connected-name clicker changes

For changes to connected-name clicker geometry, preview, manufacturing export, or print settings, first read `docs/NAME_CLICKER_GENERATION_CONTRACT.md` and `docs/MX_P2S_STANDARD.md`.

Preserve the complete closed cap perimeter and the local enclosed switch pocket with at least 1 mm wall. Never cut the outside cap wall to clear a switch seat. Preview and export must consume the validated shared `capBack` section from `nameClickerContours()`. Invalid geometry must stop preview/export rather than produce a customer download. Retain the four-wall seat, local latch relief, travel clearance, adopted printable eyelet and P2S standard. Run the regression checks specified in the contract before handing off.

A source change or successful digital check does not authorize production deployment, production payment/shipping changes, or a claim of physical acceptance. Follow the adopted Codex/Alpha development branch workflow; Ken confirms production deployment separately.
