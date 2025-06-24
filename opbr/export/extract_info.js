
import Character from "../model/character/character.js";

function findCharaBy_CharaId(id){
    let chara = new Character(id);
    const CHARA = chara.getCharaById(id)

    let found = {}

    found.name      = CHARA['name']
    found.nickname  = CHARA['nickname']
    found.filename  = CHARA['filename']
    found.class     = chara.getClassOf()
    found.element   = chara.getElementOf()
    found.tag       = chara.getTagDescription(CHARA)
    found.id        = id
    found.traits    = chara.getTraits()

    //end
    console.log(found)
    console.log("Done!")
}


//test
const findId = 400000767 //Jabra
findCharaBy_CharaId(findId)