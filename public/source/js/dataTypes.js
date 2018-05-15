var enumTypes = {
    HEADER: "header",
    PATTER: "pattern",
    LABEL: "label"
};

function getHeader(params) {
    return {
        type: enumTypes.HEADER,
        text: params
    };
}

function getPattern(text, patternValue) {
    return {
        type: enumTypes.PATTER,
        text: text,
        patternValue: patternValue
    };
}

function getLabel(text, example, tableName) {
    return {
        type: enumTypes.LABEL,
        text: text,
        example: example,
        tableName: tableName
    };
}

var ModelTypesList = [
    getHeader("Custom data"),
    getPattern("Empty", ""),

    getHeader("Human data"),
    getLabel("First name", "Goran", "text_first_name"),
    getLabel("Last name", "Urukalo", "text_last_name"),
    getLabel("Gender", "Male", "text_gender"),
    getLabel("Language", "English", "text_language"),
    getLabel("Username", "example99", "text_username"),
    getLabel("Phone number", "060 123 4567", "text_phone_number"),
    getLabel("Email", "example@text.com", "text_email"),
    getLabel("Password", "_kappa123", "text_password"),

    getHeader("Internet data"),
    getLabel("guid", "de0eee8a-f182-46ef-baa9-afc76ca02940", "text_guid"),

    getHeader("Addresses"),
    getLabel("Zip code", "11000", "text_zip_code"),
    getLabel("City", "London", "text_city"),
    getLabel("Country", "France", "text_country"),
    getLabel("Street Name", "Pollich Wells", "text_street_name"),
    getLabel(
        "Street Name and number",
        "Pollich Wells 69",
        "text_street_name_number"
    ),

    getHeader("Commerce"),
    getLabel("Color", "Purple", "text_color"),
    getLabel("Department", "Toys", "text_department"),
    getLabel("Product name", "Practical Plastic Soap", "text_product_name"),
    getLabel("Product price", "99.99", "text_product_price"),
    getLabel("Product material", "Plastic", "text_product_material"),
    getLabel("Product", "Keyboard", "text_product"),

    getHeader("Company"),
    getLabel("Company name", "Google", "text_company_name"),
    getLabel(
        "Company catch phrase",
        "Integrated scalable access",
        "text_company_catch_phrase"
    ),

    getHeader("Data"),
    getLabel("Data type", "Int", "text_data_type"),
    getLabel("Domain name", "google.com", "text_domain_name"),
    getLabel("Mac address", "f8:d8:3b:72:3e:47", "text_mac_address"),
    getLabel("Hex color", "#123456", "text_hex_color"),

    getHeader("Finance"),
    getLabel("Transaction type", "Deposit", "text_transaction_type"),
    getLabel("Currency code", "BTC", "text_currency_code"),
    getLabel("Currency name", "Russian Ruble", "text_currency_name"),
    getLabel(
        "Bitcoin address",
        "1IMA706SGLLH3N9S38K39QTE4PIR4NPL4Z",
        "text_bitcoin_address"
    ),
    getLabel("Iban", "RO67HWVZU7I06897250K4R1C", "text_iban"),
    getLabel("Bic", "TXWEARV1", "text_bic"),

    getHeader("Images"),
    getLabel("Random image", "[image url]", "text_random_image"),
    getLabel("Avatar", "[image url]", "text_avatar"),

    getHeader("Job"),
    getLabel("Job title", "Legacy Research Director", "text_job_title"),
    getLabel("Job type", "Developer", "text_job_type")
];

var TypesList = function(list) {
    var inputList = list || [];

    function createHeaderElement(data) {
        return `
        <b class="human-data">
            <span>${data.text}</span>
        </b>
        `;
    }

    function createLabelElement(data) {
        return `
        <div class="card">
            <span>${data.text}</span>
            <i class="pull-right">( ${data.example} )</i>
            <div class="input-group column-name">
                <span class="input-group-addon">Column name</span>
                <input type="text" class="form-control column_name">
            </div>
            <input type="hidden" class="type" value="label" />
            <input type="hidden" class="id" value="${data.tableName}" />
        </div>
        `;
    }

    function createPatternElement(data) {
        return `
        <div class="card">
            <span>${data.text}</span>
            <div class="input-group column-name">
                <span class="input-group-addon">Column name</span>
                <input type="text" class="form-control column_name">
            </div>
            <div class="input-group column-name">
                <span class="input-group-addon">Pattern</span>
                <input type="text" class="form-control pattern_value" value="${
                    data.patternValue
                }">
            </div>
            <input type="hidden" class="type" value="pattern" />
        </div>
        `;
    }

    function generate() {
        if (Array.isArray(inputList) && inputList.length <= 0) return "";
        var elements = "";

        inputList.forEach(function(item) {
            switch (item.type) {
                case enumTypes.HEADER:
                    elements += createHeaderElement(item);
                    break;

                case enumTypes.PATTER:
                    elements += createPatternElement(item);
                    break;

                case enumTypes.LABEL:
                    elements += createLabelElement(item);
                    break;
            }
        });

        return elements;
    }

    return { generate: generate };
};
