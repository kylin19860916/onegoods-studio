# OneGoods Studio 产品管理与上架流程

这个网站的商品由 `content/products/*.mdx` 管理。每个 `.mdx` 文件就是一个商品页，首页和 Shop 会自动读取这些商品。

现在有一个 OneGoods CMS 后台：

- `/admin`
- `/admin/products`

打开后台中心后，可以进入商品库新增或编辑商品。保存后，它会在 `content/products/` 写入对应的 `.mdx` 商品文件。

注意：Vercel 线上环境不能像 Shopify 那样直接保存仓库文件。要做完整线上 CMS，需要继续接数据库、GitHub 写入或第三方 CMS。当前 CMS 已经可以承担商品资料管理、商品页生成和发布前内容整理。

## 登录

CMS 使用单管理员登录，不开放公众注册。

本地登录配置在 `.env.local`，不会提交到 GitHub：

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

线上启用 CMS 登录时，需要在 Vercel 环境变量里配置同样三项。

## 上新步骤

### 方式 A：用商品管理台

1. 启动本地网站
   - `npm run dev`

2. 打开商品管理台
   - `http://127.0.0.1:3000/admin/products`

3. 点击“新建”
   - 填商品名、slug、分类、标签、价格、描述、图片路径和正文

4. 点击“保存商品”
   - 系统会生成 `content/products/<slug>.mdx`

5. 检查前台页面
   - `/shop`
   - `/shop/<slug>`

6. 提交并推到 main
   - Vercel 自动上线

### 方式 B：手动编辑文件

1. 准备商品图片
   - 放到 `public/images/products/`
   - 建议文件名用英文短横线，例如 `strawberry-button-fidget.png`
   - 首图会用在首页、Shop 卡片和商品页主图

2. 新建商品文件
   - 在 `content/products/` 新建一个 `.mdx`
   - 文件名可以用内部名称，例如 `strawberry-button-fidget.mdx`
   - `slug` 是网址路径，例如 `/shop/strawberry-button-fidget`

3. 填商品资料
   - `name`: 商品名
   - `category`: 商品类型
   - `family`: 分类，可用 `fruit`、`food`、`nature`、`studio`
   - `badges`: 商品标签
   - `mood`: 情绪价值标签
   - `motion`: 解压动作标签
   - `salesStatus`: 上架状态
   - `priceLabel`: 前台显示价格，例如 `预计 NT$280 起`
   - `purchaseLinks`: 购买渠道链接
   - `images`: 商品图片列表
   - `order`: 排序，数字越小越靠前

4. 写商品正文
   - 用简短段落说明适合谁、手感、材料、注意事项
   - 不需要写长品牌故事

5. 检查与上线
   - 跑 `npm run lint`
   - 跑 `npm run build`
   - 推到 `main` 后，Vercel 会自动上线

## 上架状态

- `idea`: 候选款，不进入首页主卖区
- `testing`: 首批测试
- `sample-ready`: 样品完成
- `listed`: 已上架
- `sold-out`: 补货中
- `retired`: 已下架

## 分类建议

首页分类参考两个方向：

- 像商品店一样分类：`Best Sellers`、`New Arrivals`、`Desk Buddies`、`Mini Cases`
- 像用户需求一样分类：`按一下`、`转一下`、`推一下`、`摆桌上`、`送朋友`

未来 SKU 变多后，可以把分类抽成独立配置文件，再做真正的筛选和集合页。

## 商品文件模板

```mdx
---
slug: product-slug
name: 商品名称
category: Stress Relief
family: fruit
sourceType: 热门精选
badges: ['解压', '可爱', '桌面小物']
mood: ['解压', '桌面陪伴']
motion: ['按一下']
salesStatus: testing
purchaseLinks:
  shopee:
  xiaohongshu:
  instagram:
  direct:
priceUSD: 0
priceLabel: 预计 NT$280 起
shortDesc: 一句话说清楚这个商品是什么、有什么手感、适合什么场景。
materials: PLA / PETG 3D printed body
dimensions: 约 58 x 52 x 24 mm
weight: 约 38 g
shipFrom: AU
shipTo: ['CN', 'AU', 'HK', 'MO', 'TW']
images:
  - /images/products/product-image.png
status: published
order: 10
---

## 它适合谁

写给消费者看的使用场景。

## 手感

- 动作反馈
- 触感特点
- 适合拍摄的点

## 下单前知道

说明 3D 打印层纹、温度、使用年龄、批次差异等。
```
