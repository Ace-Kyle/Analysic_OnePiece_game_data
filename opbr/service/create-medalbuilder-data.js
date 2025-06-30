//Create data for MedalBuilder
import Export2JSON from "../io/write_to_json.js";
import Medal from "../model/medal/medal.js"
import JSON_DATA from "../io/json_data.js";

function createMedalBuilderData() {
    let TAG = '::Create MedalBuilder Data in: ';
    console.time(TAG)

    //medal
    let MEDALS = Medal.filterByTypeOf(
        Medal.TYPE.EVENT,  // Event medals
        Medal.TYPE.COLORED // Colored medals
    )
    let medalData = MEDALS.map(medal => {
        return {
            medal_id:   medal.medal_id,
            name:       medal.name,
            is_event:   medal.is_event,
            icon_name:  medal.icon_name,
            ability_id: medal.ability_id, // Unique trait ID
            tag_ids:    medal.tag_ids, // Array of tag IDs
        }
    });


    //medal_tag
    //{"set3_ability_id":50001,"set2_ability_id":40001,"name":"East Blue","tag_category":1,"medal_tag_id":1,"sort_id":1001}
    let medalTags = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL_TAG).map(tag => {
        return {
            medal_tag_id:    tag.medal_tag_id,
            name:            tag.name,
            name_vi:         '',
            tag_category:    tag.tag_category,
            sort_id:         tag.sort_id,
            set2_ability_id: tag.set2_ability_id ?? null, // Pair affect ability ID
            set3_ability_id: tag.set3_ability_id ?? null, // Trio affect ability ID
        }
    });
    //medal_ability_affect_limit
    //{"affect_type":4,"affect_limit_msg":"Increase damage dealt. Max: 30%","affect_limit":30}
    let medalAbilityAffectLimits = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL_ABILITY_AFFECT_LIMIT)
        .filter(limit => limit.affect_limit_msg) // Filter out limits without messages
        .map(limit => {
        return {
            affect_type:        limit.affect_type,
            affect_limit_msg:   limit.affect_limit_msg,
            affect_limit_msg_vi:'', // Default to empty string if not provided
            affect_limit:       limit.affect_limit ?? 0,
        }
    });
    //medal_affect_type
    //{"type_ids":[5,605,606,607,609,613,619,620,621,623],"name":"Damage Reduction","id":3}
    let medalAffectTypes = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL_AFFECT_TYPE).map(type => {
        return {
            type_ids:   type.type_ids,
            name:       type.name,
            name_vi:    '', // Default to empty string if not provided
            id:         type.id,
        }
    });
    //ability
    //{"affects":[{"no":1,"affect_type":1,"cond_prob":100,"cond_type":223,"detail":"When you Knockback an enemy: Reduce the cooldown time of Skill 1 by 5%.","affect_param1":1.05}],"ability_id":21286,"icon_name":"img_icon_vivi_alab01_skill_a.png"}
    let abilities = JSON_DATA.listOf(JSON_DATA.TYPE.ABILITY)
    let listAbilityIdsFromMedals = medalData.map(medal => {return medal.ability_id});

    //only get abilities that includes in medals
    let filteredAbilities = abilities.filter(ability => listAbilityIdsFromMedals.includes(ability.ability_id));
    let abilityData = filteredAbilities.map(ability => {
        let firstAffect = ability.affects[0];
        return {
            ability_id:     ability.ability_id,
            affect_type:    firstAffect.affect_type,
            cond_type:      firstAffect.cond_type,
            detail:         firstAffect.detail,
            detail_vi:      '', // Default to empty string if not provided
            affect_param1:  firstAffect.affect_param1 ?? 0, // Default to 0 if not provided
        }
        });

    //medal_ability_category
    //TODO: Implement later

    //write data to data folder
    let data = {
        medals:                     medalData,
        medal_tag:                 medalTags,
        medal_ability_affect_limit:medalAbilityAffectLimits,
        medal_affect_type:         medalAffectTypes,
        ability:                  abilityData,
    }
    let dataRecord = {
        medals:                     medalData.length,
        medal_tag:                 medalTags.length,
        medal_ability_affect_limit:medalAbilityAffectLimits.length,
        medal_affect_type:         medalAffectTypes.length,
        ability:                  abilityData.length,
    }
    Export2JSON.saveToFile(data, "data", "../../medalset-builder/data");

    console.timeEnd(TAG);
    //Log detail after creating data
    console.table(dataRecord)
}

createMedalBuilderData();