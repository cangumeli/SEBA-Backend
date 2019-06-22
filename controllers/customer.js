const {auth: authService, api: apiService} = require('../services');
const { Customer } = require('../models');

function createCustomerToken(customer) {
    return authService.createJwt({
        id: customer.id,
        email: customer.email,
        username: customer.username
    })
}

const register = {
    validation: {
        fields: [
            {name: 'username', type: 'string', required: true},
            // TODO: validate email using a regexp
            {name: 'email', type: 'string', required: true},
            {   
                name: 'password', type: 'string', required: true, 
                pred: password=>password.length>=6, 
                predDesc: 'Password must have at least 6 characters'
            },
        ]
    },
    async endpoint(req, res) {
        const {email, username, password} = req.body;
        const customer = new Customer({email, username})
        await customer.setPassword(password);
        const savedCustomer = apiService.refineMongooseObject(
            await customer.save()
        );
        const token = await createCustomerToken(savedCustomer);
        res.status(200).json({token});
    }
}

const login = {
    validation: {
        fields: [
            {name: 'email', type: 'string', required: true},
            {name: 'password', type: 'string', required: true}
        ]
    },
    async endpoint(req, res) {
        const {email, password} = req.body;
        const user = await Customer.findOne({ email });
        if (!user) {
            res.status(404).json({message: 'no such user'});
            return;
        }
        if (!(await user.verifyPassword(password))) {
            res.status(401).json({message: 'wrong password'});
            return;
        }
        const userObj = apiService.refineMongooseObject(user);
        const token = await createCustomerToken(userObj);
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