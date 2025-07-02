import { ABILITY_MANAGER } from '../manager/ability-manager.js';
import {DATA_MANAGER} from "../manager/data-manager.js";
import { ABILITY_INSTANCE } from "../model/Ability.js";
import ReadFromJson from "../../../opbr/io/read_from_json.js";
import {Utils2} from "../util/utils2.js";

// // Initialize the data manager
// DATA_MANAGER.loadDataSync();
//
// //TEST
// let testAbility = ABILITY_MANAGER.getAbilityById(20197);
// console.log(ABILITY_INSTANCE.getDescriptionTest());
//
// //console.log(ReadFromJson.getJsonFileName('../../data'));

let map1 = new Map();
let map2 = new Map();
map1.set(10, 1);
map1.set(20, 2);

map2.set(10, 1);
map2.set(20, 2);
map2.set(30, 3);
map2.set(40, 4);

const mergeMap = Utils2.merge2Maps(map1, map2);
console.log('Merged Map:', mergeMap);