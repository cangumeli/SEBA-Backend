const {auth: authService, api: apiService} = require('../services');
const { Customer } = require('../models');

const passwordPred = {
    pred: password=>password.length>=6, 
    predDesc: 'Password must have at least 6 characters'
};

function createCustomerToken(customer) {
    return authService.createJwt({
        id: customer.id,
        email: customer.email,
        name: customer.name,
        surname: customer.surname,
        addressLine1: customer.addressLine1,
        addressLine2: customer.addressLine2,
        zipCode: customer.zipCode,
        city: customer.city,
        country: customer.country,
        phone: customer.phone
    });
};

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
            {name: 'email', type: 'string', required: true},
            {
                name: 'password', type: 'string', required: true, 
                ...passwordPred
            },
        ]
    },
    async endpoint({body: {email, password, name, surname}}) {
        const customer = new Customer({email, name, surname})
        await customer.setPassword(password);
        const savedCustomer = apiService.refineMongooseObject(
            await customer.save()
        );
        const token = await createCustomerToken(savedCustomer);
        return {token};
    },
    data: {token: 'string'}
};

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
    },
    data: {
        token: 'string'
    }
};

const changePassword = {
    validation: {
        fields: [
            {name: 'oldPassword', type: 'string', required: true},
            {name: 'newPassword', type: 'string', required: true, ...passwordPred}
        ]
    },
    async endpoint({body, payload}) {
        const user = await Customer.findById(payload.id);
        apiService.errorIf(!user, apiService.errors.NOT_FOUND, 'NoSuchCustomer');
        apiService.errorIf(
            !(await user.verifyPassword(body.oldPassword)), 
            apiService.errors.UNAUTHORIZED,
            'WrongPassword'
        );
        await user.setPassword(body.newPassword);
        await user.save();
        return {success: true};
    },
    data: {
        success: 'boolean'
    }
};

const info = { 
    endpoint: ({payload}) => payload, 
    data: apiService.refinedMongooseSchema(Customer) 
};

module.exports = {
    register,
    login,
    info,
    changePassword
};