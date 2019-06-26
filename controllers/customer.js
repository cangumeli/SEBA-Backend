const {auth: authService, api: apiService} = require('../services');
const { Customer } = require('../models');

function createCustomerToken(customer) {
    return authService.createJwt({
        id: customer.id,
        email: customer.email,
        username: customer.username
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
            {name: 'email', type: 'string', required: true},
            {
                name: 'password', type: 'string', required: true, 
                pred: password=>password.length>=6, 
                predDesc: 'Password must have at least 6 characters'
            },
        ]
    },
    async endpoint({body: {email, username, password}}) {
        const customer = new Customer({email, username})
        await customer.setPassword(password);
        const savedCustomer = apiService.refineMongooseObject(
            await customer.save()
        );
        const token = await createCustomerToken(savedCustomer);
        return {token};
    }
}

const login = {
    validation: {
        fields: [
            {name: 'email', type: 'string', required: true},
            {name: 'password', type: 'string', required: true}
        ]
    },
    async endpoint({body: {email, password}}) {
        const user = await Customer.findOne({ email });
        apiService.errorIf(!user, apiService.errors.NOT_FOUND, 'no-such-user');
        const wrongPass = !(await user.verifyPassword(password));
        apiService.errorIf(
            wrongPass, apiService.errors.UNAUTHORIZED, 'wrong-password');
        const userObj = apiService.refineMongooseObject(user);
        const token = await createCustomerToken(userObj);
        return {token}
    }
}

const info = { endpoint: ({payload}) => payload };

module.exports = {
    register,
    login,
    info
};