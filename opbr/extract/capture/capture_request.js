import HarRequest from "./har_request.js";
import HarEntry from "./har_entry.js";

export  default class CaptureRequest {
    //capture request object from HAR file
    constructor(rawHAR={}) {
        this.rawHAR = rawHAR;
        this.captureRequests = this.getEntries(rawHAR);
    }

    /**
     * Filter valid ranking requests from HAR getData
     * @param {Object} raw HAR getData
     * @returns {Array} Valid ranking requests
     */
    getEntries(raw) {
        try {
            let entries = raw['log']['entries'];
            //convert array of raw data to array of HarRequest objects
            let entryList = entries.map(entry => new HarEntry(entry));

            console.log(`Complete | Found ${entries.length} valid ranking requests`);
            return entryList;
        } catch (e) {
            console.error(e);
            return []
        }
    }
    //filter capture request that url matches the pattern
    filter(pattern){ return this.captureRequests.filter( entry => entry.isMatchPattern(pattern));}
}