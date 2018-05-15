var _types = [
    ["text_first_name", "first_name"],
    ["text_last_name", "last_name"],
    ["text_gender", "gender"],
    ["text_language", "language"],
    ["text_username", "username"],
    ["text_phone_number", "phone_number"],
    ["text_email", "email"],
    ["text_password", "password"],

    ["text_guid", "guid"],

    ["text_zip_code", "zip_code"],
    ["text_city", "city"],
    ["text_country", "country"],
    ["text_street_name", "street_name"],
    ["text_street_name_number", "street_name_number"],

    ["text_color", "color"],
    ["text_department", "color"],
    ["text_product_name", "product_name"],
    ["text_product_price", "product_price"],
    ["text_product_material", "product_material"],
    ["text_product", "product"],

    ["text_company_name", "company_name"],
    ["text_company_catch_phrase", "company_catch_phrase"],

    ["text_data_type", "data_type"],
    ["text_domain_name", "domain_name"],
    ["text_mac_address", "mac_address"],
    ["text_hex_color", "hex_color"],

    ["text_transaction_type", "transaction_type"],
    ["text_currency_code", "currency_code"],
    ["text_currency_name", "currency_name"],
    ["text_bitcoin_address", "bitcoin_address"],
    ["text_iban", "iban"],
    ["text_bic", "bic"],

    ["text_random_image", "random_image"],
    ["text_avatar", "avatar"],

    ["text_job_title", "job_title"],
    ["text_job_type", "job_type"]
];

const Types = new Map(_types);

module.exports = function(dataType) {
    return Types.get(dataType);
};
