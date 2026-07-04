# OneGoods Studio 产品管理与上架流程

这个网站的商品由 `content/products/*.mdx` 管理。每个 `.mdx` 文件就是一个商品页，首页和 Shop 会自动读取这些商品。

## 上新步骤

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
