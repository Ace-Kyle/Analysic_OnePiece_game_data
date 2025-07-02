import {DATA_MANAGER} from "../manager/data-manager.js";
import MedalSetDisplay from "../model/MedalSetDisplay.js";
import MedalSet from "../model/medal-set.js";

class DemoApp {
    constructor() {
        this.medalSet = null;
        this.myApp = null;
        this.init();
    }

    init() {
        // Initialize the application
        console.log('DemoApp initialized');

        // Load data
        DATA_MANAGER.loadDataSync();

        // Set up observers
        this.medalSet = new MedalSet();
        this.myApp = new MedalSetDisplay(this.medalSet);
    }
    displayMedalSet() {
        //this.myApp.showCurrentSetInfo()
        //Jack medal=310200211
        //Kaido medal=310200210
        //King medal=310110234
        this.medalSet.addMedal(310200211, 0); // Jack
        this.medalSet.addMedal(310200210, 1); // Kaido
        this.medalSet.addMedal(310110234, 2); // King

        // Display the current set information
        console.log('::Displaying current MedalSet information::');
        console.log('- TAG:', Array.from(this.medalSet.getTagOfCurrentSet()))
        console.log('- ABILITY:', Array.from(this.medalSet.getAbilityOfCurrentSet()))

        this.myApp.showCurrentSetInfo()

    }
}

//test the DemoApp
const demoApp = new DemoApp();
demoApp.displayMedalSet();