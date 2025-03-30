export default class HarRequest {
    #REQUEST_DATA;

    constructor(request) {
        this.#REQUEST_DATA = request;
    }
    url(){ return this.#REQUEST_DATA['url']}
}