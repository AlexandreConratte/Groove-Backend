function checkBody(body, keys) {
    let valida = true ; 
    
    for (const field of keys ) {
        if (!body[field] || body[field] === "" )
        valida = false; 
    }
    return valida; 
    }
    
    module.exports = {checkBody } 