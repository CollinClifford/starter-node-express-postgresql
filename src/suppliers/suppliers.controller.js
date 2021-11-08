const supplierService = require("./suppliers.service");

const hasProperties = require("../errors/hasProperties");

const hasRequiredProperties = hasProperties("supplier_name", "supplier_email");

const VALID_PROPERTIES = [
  "supplier_name",
  "supplier_address_line_1",
  "supplier_address_line_2",
  "supplier_city",
  "supplier_state",
  "supplier_zip",
  "supplier_phone",
  "supplier_email",
  "supplier_notes",
  "supplier_type_of_goods",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function supplierExists(req, res, next) {
  supplierService
    .read(req.params.supplierId)
    .then((supplier) => {
      if (supplier) {
        res.locals.supplier = supplier;
        return next();
      }
      next({ status: 404, message: `Supplier cannot be found.` });
    })
    .catch(next);
}

function create(req, res, next) {
  supplierService
    .create(req.body.data)
    .then((data) => res.status(201).json({ data }))
    .catch(next);
}

async function update(req, res, next) {
  const updatedSupplier = {
    ...req.body.supplier,
    supplier_id: res.locals.supplier.supplierId,
  };
  supplierService
    .update(updatedSupplier)
    .then((data) => res.json({ data }))
    .catch(next);
}

async function destroy(req, res, next) {
  supplierService
    .delete(res.locals.supplier.supplier_id)
    .then(() => res.sendStatus(204))
    .catch(next);
}

module.exports = {
  create: [hasOnlyValidProperties, hasRequiredProperties, create],
  update: [
    supplierExists,
    hasOnlyValidProperties,
    hasRequiredProperties,
    update,
  ],
  delete: [supplierExists, destroy],
};
