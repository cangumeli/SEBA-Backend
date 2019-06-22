/**
 * Use handle with every controller to properly check errors
 */
module.exports.handle = ({endpoint}) => async (req, res) => {
    try {
        await endpoint(req, res);
    } catch (err) {
        let message = 'internal error';
        // TODO: This should probably be somewhere else
        if (err.errmsg && err.errmsg.indexOf('duplicate') > -1) {
            message = 'duplicate key';
        }
        // TODO: use a non-blocking error logger, check winston
        console.error(err);
        res.status(500).json({message});
    }
}

/**
 * Each controller must have a validation field of the form {fields:[], pred:fn(body)->bool, predDesc: string}.
 * fields must be of the form {name:string, type:datatype, required:bool, pred:fn(field)->bool, predDesc: string }}
 * 
 * This procedure shouldn't be used for validation where security is an issue (like password check etc)
 * or async checks that require database/auth services
 */
module.exports.validateBody = ({validation}, httpMethod) => (req, res, next) => {
    if (!validation) {
        next();
        return;
    }
    if (req.params.help) { // return spec 
        return res.status(200).json(validation)
    }
    const errorCode = 401;
    const {fields, pred} = validation;
    const body = (httpMethod && (httpMethod.toUpperCase() == 'GET')) ? req.params : req.body;
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const fieldValue = body[field.name];
        if (field.required && (fieldValue == null || fieldValue == undefined)) {
            return res.status(errorCode).json({'missingField': field.name});
        }
        if (field.type && fieldValue && !((typeof fieldValue) == field.type)) {
            return res.status(errorCode).json({'wrongType': field.name});
        }
        if (field.pred && !field.pred(fieldValue)) {
            return res.status(errorCode).json({
                'invalidField': field.name, 
                'info': field.predDesc
            });
        }
    }
    if (pred && !pred(req.body)) {
        return res.status(errorCode).json({
            'invalidBody': validation,
            'info': validation.predDesc
        });
    }
    next();
}

/**
 * Remove private fields from mongoose objects
 * for api to return
 */
module.exports.refineMongooseObject = mobj => {
    const obj = mobj.toObject();
    const refinedObj = { id: obj._id };
    Object.keys(obj).forEach(key => {
        if (!key.startsWith('_')) {
            refinedObj[key] = obj[key];
        }
    })
    return refinedObj;
}