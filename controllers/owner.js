const {auth: authService, api: apiService} = require('../services');
const { Owner } = require('../models');

function createOwnerToken(owner) {
    return authService.createJwt({
        id: owner.id,
        email: owner.email,
        name: owner.name,
        surname: owner.surname,
        phone: owner.phone,
        owner: true
    });
}

const register = {
    validation: {
        fields: [
            {
                name: 'name', type: 'string', required: true, 
                pred: u=>u.length>=1, predDesc: 'Empty strings not allowed'
            },
            {
                name: 'surname', type: 'string', required: true, 
                pred: u=>u.length>=1, predDesc: 'Empty strings not allowed'
            },
            // TODO: validate email using a regexp
            {name: 'email', type: 'string'},
            // TODO: validate phone using a regexp
            {name: 'phone', type: 'string'},
            {   
                name: 'password', type: 'string', required: true, 
                pred: password=>password.length>=6, 
                predDesc: 'Password must have at least 6 characters'
            },
        ],
        pred: ({phone, email}) => phone || email,
        predDesc: 'Either phone or email must exist'
    },
    async endpoint({body}) {
        const {email, name, surname, password, phone} = body;
        const owner = new Owner({email, name, surname, phone})
        await owner.setPassword(password);
        const saved = apiService.refineMongooseObject(
            await owner.save()
        );
        const token = await createOwnerToken(saved);
        return {token};
    },
    data: {
        token: 'string'
    }
}

const login = {
    validation: {
        fields: [
            {name: 'email', type: 'string'},
            {name: 'phone', type: 'string'},
            {name: 'password', type: 'string', required: true}
        ],
        pred: ({phone, email}) => phone || email,
        predDesc: 'Phone or email must be provided'
    },
    async endpoint({body}) {
        const {email, phone, password} = body;
        let user;
        if(email) {
            user = await Owner.findOne({email});
        } else {
            user = await Owner.findOne({phone});
        }
        apiService.errorIf(!user, apiService.errors.NOT_FOUND, 'no-such-user');
        const wrongPass = !(await user.verifyPassword(password));
        apiService.errorIf(wrongPass, apiService.errors.UNAUTHORIZED, 'wrong-password');
        const userObj = apiService.refineMongooseObject(user);
        const token = await createOwnerToken(userObj);
        return {token};
    },
    data: {
       token: 'string' 
    }
}

const info = { endpoint: ({payload}) => payload, data: apiService.refinedMongooseSchema(Owner) }

module.exports = {
    register,
    login,
    info
}