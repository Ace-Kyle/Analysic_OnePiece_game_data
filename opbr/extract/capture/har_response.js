export default class HarResponse {
    #RESPONSE_DATA;

    constructor(response) {
        this.#RESPONSE_DATA = response;
    }

    status(){           return this.#RESPONSE_DATA['status'] ??-1}
    content(){          return this.#RESPONSE_DATA['content'] ??null}
    contentMineType(){  return this.content['mimeType'] ??null}
    contentSize(){      return this.content['size'] ??-1}
    data(){
        let text = this.content()['text'] ??''
        return this.contentMineType() === 'application/json' ? JSON.parse(text): {}
    }

}