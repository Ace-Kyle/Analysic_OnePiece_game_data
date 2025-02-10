import Local_JSON from "../data/local_JSON.js";
import ExportPatten from "./export_patten.js";

export default class CharacterInfo{
    static Type = Object.freeze({
        ID:             'profile_id',
        Birthday:       'Birthday',
        Age:            'Age',
        Height:         'Height',
        PlaceOfOrigin:  'Place of Origin',
        Bounty:         'Bounty',
        VA:             'VA',
    })
    constructor(character_info_id){
        let profile = CharacterInfo.findInstance(character_info_id);
        if (profile){
            this.profile_data    = profile;
            this.profile_id      = profile[CharacterInfo.Type.ID];
            this.birthday        = this.valueOf(CharacterInfo.Type.Birthday)
            this.age             = this.valueOf(CharacterInfo.Type.Age)
            this.height          = this.valueOf(CharacterInfo.Type.Height)
            this.place_of_origin = this.valueOf(CharacterInfo.Type.PlaceOfOrigin)
            this.va              = this.valueOf(CharacterInfo.Type.VA)

        }

    }

    valueOf(find_field){
        let info_list = this.profile_data['profile_list']
        for (let info of info_list){
            if (info['title'] === find_field) return info['body_text']
        }
        //if not found
        return ''
    }

    static all_Profile(){
        let list = [], id
        let raw = Local_JSON.listOf(Local_JSON.TYPE.CHARACTER_PROFILE)
        for (let profile of raw){
            id = profile[CharacterInfo.Type.ID]
            list.push(ExportPatten.of( new CharacterInfo(id),ExportPatten.Patten.CHARACTER_PROFILE))
        }
        return list
    }
    static findInstance(profile_id){
        let list = Local_JSON.listOf(Local_JSON.TYPE.CHARACTER_PROFILE)
        for (let profile of list){
            if (profile['profile_id'] === profile_id){return profile;}
        }
        console.error('Can find profile with profile_id', profile_id);
        return null;
    }
}