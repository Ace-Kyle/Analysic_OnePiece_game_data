class DemoApp {
    constructor() {
        this.medalSet = null;
        this.myApp = null;
    }

    async init() {
        // Initialize the application
        console.log('DemoApp initialized');

        // Load data
        await DATA_MANAGER.loadData();

        // Set up observers
        this.medalSet = new MedalSet();
        this.myApp = new MedalSetDisplay(this.medalSet);
    }
    displayMedalSet() {
        this.myApp.print()
    }
}