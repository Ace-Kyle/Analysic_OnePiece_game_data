import ExportPatten from "../extract/export_patten.js";
import MedalSet from "../extract/medal_set.js";

let medal1 = 310110133;
let medal2 = 310110081;
let medal3 = 310110245;

let MEDAL_SET = new MedalSet(medal1, medal2, medal3);
console.log(ExportPatten.of(MEDAL_SET ,ExportPatten.Patten.MEDAL_SET))

//console.log(MEDAL_SET.effect_tags)
//console.log(filterPattern.damage_inc.test("When attacking an enemy inflicted with Stun: Increase damage dealt by 3%."));
