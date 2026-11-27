/* Add a type here, then register its workspace mode in nameplate.js. */
window.OGSCustomTypes = [
  { id:'nameplate', style:'name-tag', text:['名牌款','名牌款','Name tag'], action:['客製','客制','Customize'], image:'custom/render/nameplate_face-1024.webp',
    play:['掛包包、鑰匙','挂包包、钥匙','Hang it on a bag or keys'], description:['名字、輪廓與配色','名字、轮廓与配色','Name, outline, colors'], dispatchDays:3 },
  { id:'press', style:'name-clicker', text:['按壓款','按压款','Clicker'], action:['客製','客制','Customize'], image:'custom/render/press_face-1024.webp',
    play:['按著玩','按着玩','Press it'], description:['名字、字型與配色','名字、字体与配色','Name, font, colors'], dispatchDays:3, startingPrice:80, priceLabel:['按壓款 NT$80 起','按压款 NT$80 起','From NT$80'] },
  { id:'articulated', style:'name-articulated', text:['關節字塊','关节字块','Articulated letters'], action:['客製','客制','Customize'], image:'custom/render/articulated_face-1024.webp',
    description:['名字、字型與配色','名字、字体与配色','Name, font, colors'], dispatchDays:3, price:'articulated-estimate', startingPrice:80, play:['扭來扭去','扭来扭去','Twist it'] },
];
