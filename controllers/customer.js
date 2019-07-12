const {
  auth: authService,
  api: apiService,
  file: fileService
} = require("../services");
const { Customer } = require("../models");

const passwordPred = {
  pred: password => password.length >= 6,
  predDesc: "Password must have at least 6 characters"
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
}

const register = {
  validation: {
    fields: [
      {
        name: "name",
        type: "string",
        required: true,
        pred: u => u.length >= 1,
        predDesc: "Empty strings not allowed"
      },
      {
        name: "surname",
        type: "string",
        required: true,
        pred: u => u.length >= 1,
        predDesc: "Empty strings not allowed"
      },
      // TODO: validate email using a regexp
      { name: "email", type: "string", required: true },
      {
        name: "password",
        type: "string",
        required: true,
        ...passwordPred
      }
    ]
  },
  async endpoint({ body: { email, password, name, surname } }) {
    const customer = new Customer({ email, name, surname });
    await customer.setPassword(password);
    const savedCustomer = apiService.refineMongooseObject(
      await customer.save()
    );
    const token = await createCustomerToken(savedCustomer);
    return { token };
  },
  data: { token: "string" }
};

const login = {
  validation: {
    fields: [
      { name: "email", type: "string", required: true },
      { name: "password", type: "string", required: true }
    ]
  },
  async endpoint({ body: { email, password } }) {
    const user = await Customer.findOne({ email });
    apiService.errorIf(!user, apiService.errors.NOT_FOUND, "no-such-user");
    const wrongPass = !(await user.verifyPassword(password));
    apiService.errorIf(
      wrongPass,
      apiService.errors.UNAUTHORIZED,
      "wrong-password"
    );
    const userObj = apiService.refineMongooseObject(user);
    const token = await createCustomerToken(userObj);
    return { token };
  },
  data: {
    token: "string"
  }
};

const changePassword = {
  validation: {
    fields: [
      { name: "oldPassword", type: "string", required: true },
      { name: "newPassword", type: "string", required: true, ...passwordPred }
    ]
  },
  async endpoint({ body, payload }) {
    const user = await Customer.findById(payload.id);
    apiService.errorIf(!user, apiService.errors.NOT_FOUND, "NoSuchCustomer");
    apiService.errorIf(
      !(await user.verifyPassword(body.oldPassword)),
      apiService.errors.UNAUTHORIZED,
      "WrongPassword"
    );
    await user.setPassword(body.newPassword);
    await user.save();
    return { success: true };
  },
  data: {
    success: "boolean"
  }
};

const update = {
  validation: {
    fields: [
      { name: "email", type: "string" },
      { name: "name", type: "string" },
      { name: "surname", type: "string" },
      { name: "addressLine1", type: "string" },
      { name: "addressLine2", type: "string" },
      { name: "zipCode", type: "number" },
      { name: "city", type: "string" },
      { name: "country", type: "string" },
      { name: "phone", type: "string" }
    ]
  },
  async endpoint({ body, payload }) {
    const user = await Customer.findById(payload.id);
    apiService.errorIf(!user, apiService.errors.NOT_FOUND, "NoSuchCustomer");
    Object.keys(body).forEach(field => {
      if (body[field]) {
        const type = typeof body[field];
        if (type == "number") {
          user[field] = body[field];
        } else if (type == "string" && body[field].trim() != "") {
          user[field] = body[field];
        }
      }
    });
    return user.save();
  },
  data: apiService.refinedMongooseSchema(Customer)
};

const remove = {
  validation: {
    fields: [
      {
        name: "fields",
        arrayOf: true,
        pred: el =>
          [
            "addressLine1",
            "addressLine2",
            "zipCode",
            "city",
            "country",
            "phone"
          ].includes(el),
        predDesc:
          "Must be one of the followings: addressLine1, addressLine2, zipCode, city, country, phone"
      }
    ]
  },
  async endpoint({ body, payload }) {
    const user = await Customer.findById(payload.id);
    apiService.errorIf(!user, apiService.errors.NOT_FOUND, "NoSuchCustomer");
    body.fields.forEach(field => {
      user[field] = undefined;
    });
    return user.save();
  },
  data: apiService.refinedMongooseSchema(Customer)
};

const info = {
  endpoint: ({ payload }) => payload,
  data: apiService.refinedMongooseSchema(Customer)
};

const uploadPic = {
  async endpoint({ payload: { id }, tempDir, fileFormat }) {
    apiService.errorIf(
      !tempDir,
      apiService.errors.INVALID_BODY,
      "NoProfileImage"
    );
    const user = await Customer.findById(id);
    apiService.errorIf(!user, apiService.errors.NOT_FOUND, "NoSuchUser");
    const targetDir = fileService.getDir(
      fileService.dirs.CUSTOMER_PROFILE_PICTURES,
      id,
      fileFormat
    );
    const { path } = await fileService.copyFile(tempDir, targetDir);
    const toRemoves = [tempDir];
    user.image = path;
    await user.save();
    // Do not wait for file removal, it can be done after sending the response
    fileService.removeFilesAsync(toRemoves);
    return { path: id + "." + fileFormat };
  },
  data: { path: "string" }
};

module.exports = {
  register,
  login,
  info,
  changePassword,
  update,
  remove,
  uploadPic
};
