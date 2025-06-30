class Subject {
    //support Observer pattern
    constructor() {
        this.observers = [];
    }
    addObserver(observer) {
        if (typeof observer.update === 'function') {
            this.observers.push(observer);
        } else {
            console.error('Observer must implement an update method.');
        }
    }
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    notifyObservers(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}