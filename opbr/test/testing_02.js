import ExportPatten from "../extract/export_patten.js";
import MedalSet from "../extract/medal_set.js";

let medal1 = 310200237;
let medal2 = 310200037;
let medal3 = 310200011;

let MEDAL_SET = new MedalSet(medal1, medal2, medal3);
console.log(ExportPatten.of(MEDAL_SET ,ExportPatten.Patten.MEDAL_SET))
//console.log(MEDAL_SET.effect_tags)