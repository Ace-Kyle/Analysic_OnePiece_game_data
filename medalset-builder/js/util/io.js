function getMedalIdFromImageName(image_name){
    if(image_name.length < 5 || !image_name.includes('img')){
        console.error("Invalid images name.")
    }
    //images pattern = "img_icon_medal_310110217.png"
    return image_name.substring(image_name.lastIndexOf('_'), image_name.lastIndexOf('.'))
}
function loadInitData(path='medalset-builder/assets/data/data.json'){

}