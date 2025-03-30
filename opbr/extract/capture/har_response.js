export default class HarResponse {
    #RESPONSE_DATA;

    constructor(response) {
        this.#RESPONSE_DATA = response;
    }

    status(){           return this.#RESPONSE_DATA['status'] ??-1}
    content(){          return this.#RESPONSE_DATA['content'] ??null}
    contentMimeType(){  return this.content()['mimeType'] ??null}
    contentSize(){      return this.content()['size'] ??-1}
    data(){
        try {
            let text = this.content()['text'] ?? ''
            console.log("Text size: ", text.length)
            return this.contentMimeType() === 'application/json' ? JSON.parse(text) : {}
        } catch (e) {
        } finally {
        }
    }

}