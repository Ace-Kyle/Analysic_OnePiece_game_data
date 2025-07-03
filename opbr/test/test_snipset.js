function invalidFrom(reason){
    //INP: array of reasons
    //OUT: string
    let invalid_from = [];
    reason.forEach(function(value){
        if(INVALID_FROM_CUSTOMER.includes(value) && !invalid_from.includes(INVALID_FROM.customer)){
            invalid_from.push(INVALID_FROM.customer);
        } else
        if(INVALID_FROM_SYSTEM.includes(value) && !invalid_from.includes(INVALID_FROM.system)){
            invalid_from.push(INVALID_FROM.system)
        }
    });
    if(reason.length <= 0 || reason == null){ return INVALID_FROM.undefine;
    } else                                  { return invalid_from.join('\n')}
}