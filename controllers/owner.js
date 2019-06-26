const {auth: authService, api: apiService} = require('../services');
const { Owner } = require('../models');

function createOwnerToken(owner) {
    return authService.createJwt({
        id: owner.id,
        email: owner.email,
        username: owner.username,
        phone: owner.phone,
        owner: true
    });
}

const register = {
    validation: {
        fields: [
            {
                name: 'username', type: 'string', required: true, 
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
        const {email, username, password, phone} = body;
        const owner = new Owner({email, username, phone})
        await owner.setPassword(password);
        const saved = apiService.refineMongooseObject(
            await owner.save()
        );
        const token = await createOwnerToken(saved);
        return {token};
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
    }
}

const info = { endpoint: ({payload}) => payload }

module.exports = {
    register,
    login,
    info
}