import HarResponse from "./har_response.js";
import HarRequest from "./har_request.js";

export default class HarEntry{

    constructor(entry) {
        this.entry    = entry;
        this.request  = new HarRequest(this.getRequest());
        this.response = new HarResponse(this.getResponse());
        this.status   = this.response.status()
        this.url      = this.request.url()
        this.data     = this.response.data()
        console.log(this.data)
    }

    getRequest(){    return this.entry['request'] ??null}
    getResponse(){   return this.entry['response'] ??null}
    getStatusCode(){ return this.status}
    getRequestUrl(){ return this.url}
    getBodyData(){       return this.data}

    isValidRequest(){
        return this.status >= 200 && this.status < 300 &&
            this.response.contentSize() > 100
    }
    isMatchPattern(pattern){ return this.url.includes(pattern)}
}