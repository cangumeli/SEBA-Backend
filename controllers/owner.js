const {auth: authService, api: apiService} = require('../services');
const { Owner } = require('../models');

function createOwnerToken(owner) {
    return authService.createJwt({
        id: owner.id,
        email: owner.email,
        username: owner.username,
        phone: owner.phone
    })
}

const register = {
    validation: {
        fields: [
            {name: 'username', type: 'string', required: true},
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
    async endpoint(req, res) {
        const {email, username, password, phone} = req.body;
        const owner = new Owner({email, username, phone})
        await owner.setPassword(password);
        const saved = apiService.refineMongooseObject(
            await owner.save()
        );
        const token = await createOwnerToken(saved);
        res.status(200).json({token});
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
    async endpoint(req, res) {
        const {email, phone, password} = req.body;
        const user = email ? (await Owner.findOne({email})) : (await Owner.findOne({phone}));
        if (!user) {
            res.status(404).json({message: 'no such user'});
            return;
        }
        if (!(await user.verifyPassword(password))) {
            res.status(401).json({message: 'wrong password'});
            return;
        }
        const userObj = apiService.refineMongooseObject(user);
        const token = await createOwnerToken(userObj);
        res.status(200).json({token});
    }
}

const info = {
    async endpoint(req, res) {
        res.status(200).json(req.payload);
    }
}

module.exports = {
    register,
    login,
    info
}