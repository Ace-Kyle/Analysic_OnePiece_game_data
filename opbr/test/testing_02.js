import ExportPatten from "../export/export_patten.js";
import MedalSet from "../modal/medal/medal_set.js";

//let text = "img_icon_medal_310110082\timg_icon_medal_310110148\timg_icon_medal_310200096"
//console.log(Number.isInteger(text));

//console.log(MEDAL_SET.effect_tags)
//console.log(filterPattern.damage_inc.test("When attacking an enemy inflicted with Stun: Increase damage dealt by 3%."));

let data = []
for (let i = 0; i < 5; i++) {
    let chara = {
        id: i,
        name: `A${i}`,
    }
    data.push(chara);
}
console.log(data)
let after = data.map(({id, ...name}) => ({id,name}))
console.log(after)