# OG r2 fix3：首页首屏换新图（给 Codex）

> Alpha 2026-11-28。Ken 00:59 选定 v5 pick3（Keynade + 3D 列印小物堆成小山，无搅屎棍）。在 fix1、fix2 之后、同一分支 `codex/ogs-design-r2-1127` 做。这会取代 fix1 B-10「首屏保留现图」。

## 素材（本目录 hero/）
- `hero_desktop.png`（1672×941，16:9）：桌面首屏用。
- `hero_mobile.png`（1122×1065，已裁掉 4:5 原图顶部空白）：手机首屏用。
- `preview_desktop.png` / `preview_mobile.png`：Alpha 套版的样子，照这个排。

## 要求
1. 转成 WebP（必要时 AVIF），按显示尺寸输出 1x/2x（桌面约 920px 与 1840px 宽；手机 390/780px 宽），用 `<picture>` + `srcset`，文件名带内容 hash，长期缓存。首屏图 `fetchpriority="high"`、不 lazy。
2. 版式：图片放右侧约 64% 宽，左侧 14% 做到底色的渐隐遮罩，左侧标题区不压图。首屏底色用图片边缘色 **#E5D5F5**（桌面）/ **#E4D0F2**（手机），接缝不可见。
3. **不放任何「示意」「示意合成」字样。**
4. alt 文字（三语）：繁「OGS 的 3D 列印紓壓小物」／简「OGS 的 3D 打印解压小物」／英「OGS 3D-printed fidget toys」。
5. 旧首屏图文件从页面移除引用（文件可留在仓库）。
6. 验收：1440×900 与 390×844 截图对照 preview_*.png；LCP 图 < 250KB（桌面 2x）；Lighthouse 手机版首页 LCP 不比改前差。
