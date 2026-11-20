# OGS 开发固定流程：Codex（MacBook）× Alpha（Mac mini）

> 2026-11-20 定。适用于 onegoods.studio（OGS）所有网站改动。正式站部署另行由 Ken 确认，不在本流程内。

## 角色
- **Ken**：在 Codex 里边看边说要改哪里；决定什么时候上正式站。
- **Codex（MacBook）**：在 MacBook 本地开网站、即时改、提交并推送到自己的分支。
- **Alpha（Mac mini）**：拉取 Codex 的分支做验收（量像素、测速度、测手机版），通过后合进开发分支；Ken 的测试链接 `https://mac-mini.tailb7c066.ts.net:8443/` 显示的是 Alpha 的开发分支。

## 分支规则
| 分支 | 谁用 | 说明 |
|---|---|---|
| `live-source-20261120` | 只读 | 正式站源码快照，不在上面改 |
| `dev/ogs-local-20261120b` | Alpha | 开发主线，验收通过的改动都合进这里；测试链接跑这个 |
| `codex/ogs-<主题>-<MMDD>` | Codex | 每一段改动开一个，例如 `codex/ogs-3d-shading-1120` |
| `main`、`og-upgrade-r1` | 不碰 | 不推、不合并、不在上面开分支 |

## Codex 每一段改动的步骤
1. **开工前同步**
   ```
   git fetch origin
   git switch -c codex/ogs-<主题>-<MMDD> origin/dev/ogs-local-20261120b
   npm ci
   npm run setup:local
   npm run dev
   ```
   一定要从 `origin/dev/ogs-local-20261120b` 开分支（它已移除了误提交的 node_modules 符号链接）；不要从 `live-source-20261120` 或旧分支开。
2. **边看边改**：在 `http://localhost:5173` 预览。改了 `src/` 后重新执行 `.venv/bin/python build.py` 产生三语前台。
3. **提交前自检**
   - `.venv/bin/python build.py` 连续跑两次后 `git status` 不应再出现新的改动（构建要可重复）。
   - 繁中页没有简体字（build.py 会做 OpenCC 转换，手写进 `public/` 的文字要自己检查）。
   - 页脚与商品页的「客服信箱 / 客服電話」不动（绿界收款审核要求与绿界后台一致）。
   - 不提交 `.dev.vars`、任何金钥、`node_modules`。
4. **提交并推送**
   ```
   git add <改动的文件>
   git -c user.email=kylin1986@gmail.com commit -m "<一句话说明改了什么>"
   git push -u origin codex/ogs-<主题>-<MMDD>
   ```
   不要 force push；一段改动做完就推，不要攒很多段才推。
5. **推送后回报**（贴给 Ken，Ken 转给 Alpha，或 Alpha 自动侦测到后直接验收）：
   ```
   分支：codex/ogs-<主题>-<MMDD>
   commit：<短 hash>
   改了什么：<1–3 句>
   影响页面：<例如 nameplate.html 三语、products.html>
   需要特别看的地方：<例如手机 390 宽、长名字、3D 加载>
   ```

## Alpha 的验收与合并
1. `git fetch` 拉 Codex 的分支，在 Mac mini 本地启动后用真浏览器检查：
   - 桌面 1440 / 手机 390 截图，量像素（溢出、重叠、字号、可点区域 ≥44px）。
   - 改到的页面三语都打开一次；客制页实际输入中文、英文、长名字。
   - Lighthouse 手机版（有改性能时）。
   - 控制台无报错、无外部异常请求。
2. **通过**：合进 `dev/ogs-local-20261120b`（普通 merge，不改写历史），测试链接自动更新，Alpha 在飞书回报 Ken「已合并 + 截图」。
3. **不通过**：Alpha 列出具体问题（哪一页、哪个位置、量到多少、截图），交回 Codex 在同一个分支修，修完再推。

## 禁止事项
- 不部署正式站（不执行 Sites 正式发布、不 `wrangler deploy` 到 production）。
- 不改 `.openai/hosting.json` 与 Sites 认证相关代码。
- 不碰正式金流 / 物流设定；绿界、Google 地址搜索在拿到测试设定前保持未启用。
- 同一段代码同一时间只由一方改：Codex 改某一块时，Alpha 不在开发分支改同一块；需要时先在飞书说一声。
