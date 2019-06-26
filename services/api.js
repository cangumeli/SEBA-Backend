/**
 * Use handle with every controller to properly check errors
 */
module.exports.handle = ({endpoint}) => async (req, res) => {
    try {
        if ((!req.body || !Object.keys(req.body).length)) {
            req.body = req.query;  // 'GET' requests don't have a body
        }
        const response = module.exports.refineMongooseObject(await endpoint(req));
        res.status(200).json(response);
    } catch (err) {
        if (!err.responseCode) {  // Error is not deliberately created
            let message = 'internal-error';
            // TODO: This should probably be somewhere else
            // it is necessary because it can happen when saving mail and phone etc.
            // and user should be notified by the client
            if (err.errmsg && err.errmsg.indexOf('duplicate') > -1) {
                message = 'duplicate-key';
            }
            // TODO: use a non-blocking error logger, check winston
            console.error(err);
            res.status(500).json({message});
        } else {
            res.status(err.responseCode).json({message: err.message});
        }
    }
}

/**
 * Each controller must have a validation field of the form {fields:[], pred:fn(body)->bool, predDesc: string}.
 * fields must be of the form {name:string, type:datatype, required:bool, pred:fn(field)->bool, predDesc: string }}
 * 
 * Array Arguments:
 * If you add {...arrayOf: true, arrayPred, arrayPredDesc} to a field, 
 * it is assumed that the field is an array that satisfies this specification.
 * 
 * Object Arguments:
 * You can use recursive validators of the form fields: {}
 * 
 * This procedure shouldn't be used for validation where security is an issue (like password check etc)
 * or async checks that require database/auth services
 */
module.exports.validateBody = ({validation}) => (req, res, next) => {
    // Cases where validation is not necessary
    if (req.query.help) { // return spec 
        res.status(200).json({inputSpec: validation});
        return;
    }
    if (!validation) {
        next();
        return;
    }

    const validateBodyRecursive = (validation, body) => {  // returns whether or not to call next
        const errorCode = 403;
        const {fields, pred} = validation;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            let fieldValues = body[field.name];
            // This makes when you require an array field, you must provide an empty array
            if (field.arrayOf && !Array.isArray(fieldValues)) {
                res.status(errorCode).json({'mustBeArray': field.name});
                return false;
            }
            if (field.arrayPred && !field.arrayPred(fieldValues)) {
                res.status(errorCode).json({
                    'invalidArrayField': field.name,
                    'info': field.arrayPredDesc
                });
                return false;
            }
            // Convert the field to array of values to generalize
            if (!field.arrayOf) {
                fieldValues = [fieldValues];
            }
            for (let j = 0; j < fieldValues.length; j++) {
                const fieldValue = fieldValues[j];
                if (field.required && (fieldValue == null || fieldValue == undefined)) {
                    res.status(errorCode).json({'missingField': field.name});
                    return false;
                }
                if (field.type && fieldValue && !((typeof fieldValue) == field.type)) {
                    res.status(errorCode).json({'wrongType': field.name});
                    return false;
                }
                if (field.pred && !field.pred(fieldValue)) {
                    res.status(errorCode).json({
                        'invalidField': field.name, 
                        'info': field.predDesc
                    });
                    return false;
                }
                // Handle the nested validation with a recursive call
                if (field.validation && !validateBodyRecursive(field.validation, fieldValue)) {
                    return false;
                }
            }
        }
        if (pred && !pred(body)) {
            res.status(errorCode).json({
                'invalidBody': validation.predDesc
            });
            return false;
        }
        return true;
    };

    let body = req.body;
    if ((!body || !Object.keys(body).length)) {
        body = req.query;  // 'GET' requests don't have a body
    }
    if (validateBodyRecursive(validation, body)) {
        next();
    }
}

/**
 * Remove private fields from mongoose objects
 * for api to return
 */
module.exports.refineMongooseObject = function refineMongooseObject(mobj) {
    if (Array.isArray(mobj)) {
        return mobj.map(refineMongooseObject);
    }
    //https://stackoverflow.com/questions/10827108/mongoose-check-if-object-is-mongoose-object
    if (mobj.constructor.name !== 'model') {
        return mobj;
    }
    const obj = mobj.toObject();
    const refinedObj = { id: obj._id };
    Object.keys(obj).forEach(key => {
        if (!key.startsWith('_')) {
            refinedObj[key] = obj[key];
        }
    });
    return refinedObj;
}

module.exports.errors = {
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL: 500,
    INVALID_BODY: 403
};

module.exports.errorIf = (cond, errorCode, message) => {
    if (cond) {
        const err = new Error(message);
        err.responseCode = errorCode;
        throw err;
    }
}