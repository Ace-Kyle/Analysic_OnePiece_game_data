class Observer {
    constructor() {
    }
    //support Observer pattern
    update(data) {
        // This method should be overridden by subclasses
        console.warn('Observer update method not implemented.');
    }
}