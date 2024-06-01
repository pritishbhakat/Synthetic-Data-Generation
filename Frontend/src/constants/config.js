const URL = "https://synthetic-data-generation.onrender.com"

const DataType = [
    {
        sdtype : "boolean",
        pii : true
    },
    {
        sdtype: "categorical",
        pii: false
    },
    {
        sdtype: "datetime",
        pii: false
    },
    {
        sdtype: "numerical",
        pii: false
    },
    {
        sdtype: "address",
        pii: true
    },
    {
        sdtype:"name",
        pii:true
    },
    {
        sdtype:"phone_number",
        pii:true
    },
    {
        sdtype:"email",
        pii:true
    },
    {
        sdtype: "first_name",
        pii:false
    },
    {
        sdtype: "last_name",
        pii:false
    },
    {
        sdtype: "credit_card_number",
        pii:true
    }
]

export {URL,DataType}