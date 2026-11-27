/* Add a type here, then register its workspace mode in nameplate.js. */
window.OGSCustomTypes = [
  { id:'nameplate', style:'name-tag', text:['名牌款','名牌款','Name tag'], action:['客製名牌款','客制名牌款','Customize a name tag'], image:'custom/render/nameplate_face-1024.webp',
    play:['掛在日常小物上','挂在日常小物上','Clip it onto everyday items'], description:['名字、輪廓與配色','名字、轮廓与配色','Name, outline and colors'], dispatchDays:3 },
  { id:'press', style:'name-clicker', text:['按壓款','按压款','Clicker'], action:['客製按壓款','客制按压款','Customize a clicker'], image:'custom/render/press_face-1024.webp',
    play:['點按鍵帽','点按键帽','Press the keys'], description:['名字、字型與配色','名字、字体与配色','Name, typeface and colors'], dispatchDays:3, startingPrice:80, priceLabel:['按壓款 NT$80 起','按压款 NT$80 起','From NT$80'] },
  { id:'articulated', style:'name-articulated', text:['關節字塊','关节字块','Articulated letters'], action:['客製關節字塊','客制关节字块','Customize articulated letters'], image:'custom/render/articulated_face-1024.webp',
    description:['名字、字型與配色','名字、字体与配色','Name, typeface and colors'], dispatchDays:3, price:'articulated-estimate', startingPrice:80, play:['扭動關節字塊','扭动关节字块','Bend the connected letters'] },
];
