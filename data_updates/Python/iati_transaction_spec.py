import json
import os


DTYPES = {
    'iati_identifier': 'object',
    'x_transaction_number': 'float64',
    'reporting_org_ref': 'object',
    'reporting_org_narrative': 'object',
    'reporting_org_secondary_reporter': 'object',
    'reporting_org_type_code': 'object',
    'title_narrative': 'object',
    'x_original_transaction_value': 'float64',
    'x_original_transaction_value_usd': 'float64',
    'x_country_code': 'object',  # For compatibility with older queries
    'x_country': 'object',  # For compatibility with older queries
    'x_country_percentage': 'object',  # For compatibility with older queries
    'x_recipient_number': 'float64',
    'x_recipient_code': 'object',
    'x_recipient': 'object',
    'x_recipient_percentage': 'object',
    'x_recipient_type': 'object',
    'x_recipient_transaction_value': 'float64',
    'x_recipient_transaction_value_usd': 'float64',
    'x_sector_number': 'float64',
    'x_sector_vocabulary': 'object',
    'x_vocabulary_number': 'float64',
    'x_sector_code': 'object',
    'x_sector_percentage': 'object',
    'x_dac3_sector_code': 'object',
    'transaction_type_code': 'object',
    'x_transaction_date': 'object',
    'x_transaction_year': 'float64',
    'x_currency': 'object',
    'x_transaction_value': 'float64',
    'x_transaction_value_usd': 'float64',
    'x_flow_type_code': 'object',
    'x_finance_type_code': 'object',
    'x_mod_aid_type_vocabulary': 'object',
    'x_mod_aid_type_code': 'object',
    'x_dac_aid_type_code': 'object',
    'x_tied_status_code': 'object',
    'collaboration_type': 'object',
    'transaction_disbursement_channel_code': 'object',
    'description_narrative': 'object',
    'transaction_description_narrative': 'object',
    'humanitarian': 'object',
    'transaction_humanitarian': 'object',
    'humanitarian_scope_narrative': 'object',
    'x_hum_emergency_code': 'object',
    'x_hum_appeal_code': 'object',
    'transaction_provider_org_narrative': 'object',
    'transaction_provider_org_provider_activity_id': 'object',
    'transaction_provider_org_ref': 'object',
    'transaction_provider_org_type': 'object',
    'transaction_receiver_org_narrative': 'object',
    'transaction_receiver_org_receiver_activity_id': 'object',
    'transaction_receiver_org_ref': 'object',
    'transaction_receiver_org_type': 'object',
    'transaction_ref': 'object',
    'participating_org_narrative': 'object',
    'participating_org_type': 'object',
    'participating_org_role': 'object',
    'participating_org_ref': 'object',
    'tag_narrative': 'object',
    'tag_vocabulary': 'object',
    'tag_code': 'object',
    'x_reporting_org_type': 'object',
    'x_transaction_type': 'object',
    'x_finance_type': 'object',
    'x_aid_type': 'object',
    'x_dac3_sector': 'object',
    'x_di_sector': 'object',
    'x_yyyymm': 'object',
    'x_covid': 'bool_',
    'dac_policy_marker_code': 'object',
    'dac_policy_marker_significance': 'object',
    'package_id': 'object',
    'last_modified': 'object'
}
NUMERIC_DTYPES = [column_name for column_name, dtype in DTYPES.items() if dtype not in ["object", "bool_"]]


dir_path = os.path.dirname(os.path.realpath(__file__))
json_path = os.path.join(dir_path, 'iati_exchange_rates.json')

# Two dimension exchange rate dictionary. Access exchange rates by currency and year like ratedf[currencyCode][year]
with open(json_path) as f:
    ratedf = json.load(f)

ratedf["GPB"] = ratedf["GBP"]
ratedf["gbp"] = ratedf["GBP"]
ratedf["EURO"] = ratedf["EUR"]
ratedf["Euro"] = ratedf["EUR"]
ratedf["Eur"] = ratedf["EUR"]
ratedf["CDN"] = ratedf["CAD"]
ratedf["usd"] = ratedf["USD"]
ratedf["GHC"] = ratedf["GHS"]
ratedf["ZMK"] = ratedf["ZMW"]
ratedf["USS"] = ratedf["USD"]
ratedf["USN"] = ratedf["USD"]
ratedf["BEF"] = ratedf["EUR"]
ratedf["FIM"] = ratedf["EUR"]
ratedf["KSH"] = ratedf["KES"]
ratedf["GIP"] = ratedf["GBP"]
ratedf["FKP"] = ratedf["GBP"]
ratedf["AON"] = ratedf["AOA"]
ratedf["UYI"] = ratedf["UYU"]
ratedf["NUL"] = {"2000": 0}


# Used for ambiguously structed arrays resulting from XML queries. If an array has any entries, take the first one.
def default_first(array):
    # If an array isn't empty, give us the first element
    return array[0] if array is not None and len(array) > 0 else None


# Used for ambiguous result default replacement. If value doesn't exist, replace it with the default.
def replace_default_if_none(value, default):
    if value is None:
        return default
    elif str.strip(value) == "":
        return default
    else:
        return value


# Used for ambiguous recoding. If code exists, try and use the dictionary to look up the result.
def recode_if_not_none(code, dictionary):
    if code is None:
        return None
    elif str.strip(code) == "":
        return None
    else:
        try:
            return dictionary[code]
        except KeyError:
            return None


# Used for currency conversion. Works like recode_if_not_none but for our 2-dimension exchange rate dictionary
def convert_usd(value, year, currency, ratedf):
    if value == 0:
        return 0
    elif value is None or year is None or currency is None:
        return None
    try:
        conversion_factor = ratedf[currency][str(year)]
        if conversion_factor > 0:
            return value*conversion_factor
        else:
            return None
    except KeyError:
        return None


# A class that will hold the flattening function and dictionary definitions
class IatiFlat(object):
    def __init__(self):
        self.header = ["iati_identifier", "x_transaction_number", "reporting_org_ref", "reporting_org_narrative", "reporting_org_secondary_reporter", "reporting_org_type_code", "title_narrative", "x_original_transaction_value", "x_original_transaction_value_usd", "x_country_code", "x_country", "x_country_percentage", "x_recipient_number", "x_recipient_code", "x_recipient", "x_recipient_percentage", "x_recipient_type", "x_recipient_transaction_value", "x_recipient_transaction_value_usd", "x_sector_number", "x_sector_vocabulary", "x_vocabulary_number", "x_sector_code", "x_sector_percentage", "x_dac3_sector_code", "transaction_type_code", "x_transaction_date", "x_transaction_year", "x_currency", "x_transaction_value", "x_transaction_value_usd", "x_flow_type_code", "x_finance_type_code", "x_mod_aid_type_vocabulary", "x_mod_aid_type_code", "x_dac_aid_type_code", "x_tied_status_code", "collaboration_type", "transaction_disbursement_channel_code", "description_narrative", "transaction_description_narrative", "humanitarian", "transaction_humanitarian", "humanitarian_scope_narrative", "x_hum_emergency_code", "x_hum_appeal_code", "transaction_provider_org_narrative", "transaction_provider_org_provider_activity_id", "transaction_provider_org_ref", "transaction_provider_org_type", "transaction_receiver_org_narrative", "transaction_receiver_org_receiver_activity_id", "transaction_receiver_org_ref", "transaction_receiver_org_type", "transaction_ref", "participating_org_narrative", "participating_org_type", "participating_org_role", "participating_org_ref", "tag_narrative", "tag_vocabulary", "tag_code", "x_reporting_org_type", "x_transaction_type", "x_finance_type", "x_aid_type", "x_dac3_sector", "x_di_sector", "x_yyyymm", "x_covid", "dac_policy_marker_code", "dac_policy_marker_significance"]
        self.dictionaries = {}
        # Defaults, can be overwritten with next function
        self.dictionaries["ratedf"] = ratedf
        self.dictionaries["organisation_type"] = {
            "10": "Government",
            "11": "Local Government",
            "15": "Other Public Sector",
            "21": "International NGO",
            "22": "National NGO",
            "23": "Regional NGO",
            "24": "Partner Country based NGO",
            "30": "Public Private Partnership",
            "40": "Multilateral",
            "60": "Foundation",
            "70": "Private Sector",
            "71": "Private Sector in Provider Country",
            "72": "Private Sector in Aid Recipient Country",
            "73": "Private Sector in Third Country",
            "80": "Academic, Training and Research",
            "90": "Other"
        }
        self.dictionaries["transaction_type"] = {
            "1": "Incoming Funds",
            "2": "Outgoing Commitment",
            "3": "Disbursement",
            "4": "Expenditure",
            "5": "Interest Payment",
            "6": "Loan Repayment",
            "7": "Reimbursement",
            "8": "Purchase of Equity",
            "9": "Sale of Equity",
            "10": "Credit Guarantee",
            "11": "Incoming Commitment",
            "12": "Outgoing Pledge",
            "13": "Incoming Pledge"
        }
        self.dictionaries["country"] = {
            "AF": "Afghanistan",
            "AX": "Åland Islands",
            "AL": "Albania",
            "DZ": "Algeria",
            "AS": "American Samoa",
            "AD": "Andorra",
            "AO": "Angola",
            "AI": "Anguilla",
            "AQ": "Antarctica",
            "AG": "Antigua and Barbuda",
            "AR": "Argentina",
            "AM": "Armenia",
            "AW": "Aruba",
            "AU": "Australia",
            "AT": "Austria",
            "AZ": "Azerbaijan",
            "BS": "Bahamas (the)",
            "BH": "Bahrain",
            "BD": "Bangladesh",
            "BB": "Barbados",
            "BY": "Belarus",
            "BE": "Belgium",
            "BZ": "Belize",
            "BJ": "Benin",
            "BM": "Bermuda",
            "BT": "Bhutan",
            "BO": "Bolivia (Plurinational State of)",
            "BQ": "Bonaire, Sint Eustatius and Saba",
            "BA": "Bosnia and Herzegovina",
            "BW": "Botswana",
            "BV": "Bouvet Island",
            "BR": "Brazil",
            "IO": "British Indian Ocean Territory (the)",
            "BN": "Brunei Darussalam",
            "BG": "Bulgaria",
            "BF": "Burkina Faso",
            "BI": "Burundi",
            "KH": "Cambodia",
            "CM": "Cameroon",
            "CA": "Canada",
            "CV": "Cabo Verde",
            "KY": "Cayman Islands (the)",
            "CF": "Central African Republic (the)",
            "TD": "Chad",
            "CL": "Chile",
            "CN": "China",
            "CX": "Christmas Island",
            "CC": "Cocos (Keeling) Islands (the)",
            "CO": "Colombia",
            "KM": "Comoros (the)",
            "CG": "Congo (the)",
            "CD": "Congo (the Democratic Republic of the)",
            "CK": "Cook Islands (the)",
            "CR": "Costa Rica",
            "CI": "Côte d'Ivoire",
            "HR": "Croatia",
            "CU": "Cuba",
            "CW": "Curaçao",
            "CY": "Cyprus",
            "CZ": "Czechia",
            "DK": "Denmark",
            "DJ": "Djibouti",
            "DM": "Dominica",
            "DO": "Dominican Republic (the)",
            "EC": "Ecuador",
            "EG": "Egypt",
            "SV": "El Salvador",
            "GQ": "Equatorial Guinea",
            "ER": "Eritrea",
            "EE": "Estonia",
            "ET": "Ethiopia",
            "FK": "Falkland Islands (the) [Malvinas]",
            "FO": "Faroe Islands (the)",
            "FJ": "Fiji",
            "FI": "Finland",
            "FR": "France",
            "GF": "French Guiana",
            "PF": "French Polynesia",
            "TF": "French Southern Territories (the)",
            "GA": "Gabon",
            "GM": "Gambia (the)",
            "GE": "Georgia",
            "DE": "Germany",
            "GH": "Ghana",
            "GI": "Gibraltar",
            "GR": "Greece",
            "GL": "Greenland",
            "GD": "Grenada",
            "GP": "Guadeloupe",
            "GU": "Guam",
            "GT": "Guatemala",
            "GG": "Guernsey",
            "GN": "Guinea",
            "GW": "Guinea-Bissau",
            "GY": "Guyana",
            "HT": "Haiti",
            "HM": "Heard Island and McDonald Islands",
            "VA": "Holy See (the)",
            "HN": "Honduras",
            "HK": "Hong Kong",
            "HU": "Hungary",
            "IS": "Iceland",
            "IN": "India",
            "ID": "Indonesia",
            "IR": "Iran (Islamic Republic of)",
            "IQ": "Iraq",
            "IE": "Ireland",
            "IM": "Isle of Man",
            "IL": "Israel",
            "IT": "Italy",
            "JM": "Jamaica",
            "JP": "Japan",
            "JE": "Jersey",
            "JO": "Jordan",
            "KZ": "Kazakhstan",
            "KE": "Kenya",
            "KI": "Kiribati",
            "KP": "Korea (the Democratic People's Republic of)",
            "KR": "Korea (the Republic of)",
            "XK": "Kosovo",
            "KW": "Kuwait",
            "KG": "Kyrgyzstan",
            "LA": "Lao People's Democratic Republic (the)",
            "LV": "Latvia",
            "LB": "Lebanon",
            "LS": "Lesotho",
            "LR": "Liberia",
            "LY": "Libya",
            "LI": "Liechtenstein",
            "LT": "Lithuania",
            "LU": "Luxembourg",
            "MO": "Macao",
            "MK": "North Macedonia",
            "MG": "Madagascar",
            "MW": "Malawi",
            "MY": "Malaysia",
            "MV": "Maldives",
            "ML": "Mali",
            "MT": "Malta",
            "MH": "Marshall Islands (the)",
            "MQ": "Martinique",
            "MR": "Mauritania",
            "MU": "Mauritius",
            "YT": "Mayotte",
            "MX": "Mexico",
            "FM": "Micronesia (Federated States of)",
            "MD": "Moldova (the Republic of)",
            "MC": "Monaco",
            "MN": "Mongolia",
            "ME": "Montenegro",
            "MS": "Montserrat",
            "MA": "Morocco",
            "MZ": "Mozambique",
            "MM": "Myanmar",
            "NA": "Namibia",
            "NR": "Nauru",
            "NP": "Nepal",
            "NL": "Netherlands (the)",
            "AN": "NETHERLAND ANTILLES",
            "NC": "New Caledonia",
            "NZ": "New Zealand",
            "NI": "Nicaragua",
            "NE": "Niger (the)",
            "NG": "Nigeria",
            "NU": "Niue",
            "NF": "Norfolk Island",
            "MP": "Northern Mariana Islands (the)",
            "NO": "Norway",
            "OM": "Oman",
            "PK": "Pakistan",
            "PW": "Palau",
            "PS": "Palestine, State of",
            "PA": "Panama",
            "PG": "Papua New Guinea",
            "PY": "Paraguay",
            "PE": "Peru",
            "PH": "Philippines (the)",
            "PN": "Pitcairn",
            "PL": "Poland",
            "PT": "Portugal",
            "PR": "Puerto Rico",
            "QA": "Qatar",
            "RE": "Réunion",
            "RO": "Romania",
            "RU": "Russian Federation (the)",
            "RW": "Rwanda",
            "BL": "Saint Barthélemy",
            "SH": "Saint Helena, Ascension and Tristan da Cunha",
            "KN": "Saint Kitts and Nevis",
            "LC": "Saint Lucia",
            "MF": "Saint Martin (French part)",
            "PM": "Saint Pierre and Miquelon",
            "VC": "Saint Vincent and the Grenadines",
            "WS": "Samoa",
            "SM": "San Marino",
            "ST": "Sao Tome and Principe",
            "SA": "Saudi Arabia",
            "SN": "Senegal",
            "RS": "Serbia",
            "SC": "Seychelles",
            "SL": "Sierra Leone",
            "SG": "Singapore",
            "SX": "Sint Maarten (Dutch part)",
            "SK": "Slovakia",
            "SI": "Slovenia",
            "SB": "Solomon Islands",
            "SO": "Somalia",
            "ZA": "South Africa",
            "GS": "South Georgia and the South Sandwich Islands",
            "SS": "South Sudan",
            "ES": "Spain",
            "LK": "Sri Lanka",
            "SD": "Sudan (the)",
            "SR": "Suriname",
            "SJ": "Svalbard and Jan Mayen",
            "SZ": "Eswatini",
            "SE": "Sweden",
            "CH": "Switzerland",
            "SY": "Syrian Arab Republic",
            "TW": "Taiwan (Province of China)",
            "TJ": "Tajikistan",
            "TZ": "Tanzania, United Republic of",
            "TH": "Thailand",
            "TL": "Timor-Leste",
            "TG": "Togo",
            "TK": "Tokelau",
            "TO": "Tonga",
            "TT": "Trinidad and Tobago",
            "TN": "Tunisia",
            "TR": "Turkey",
            "TM": "Turkmenistan",
            "TC": "Turks and Caicos Islands (the)",
            "TV": "Tuvalu",
            "UG": "Uganda",
            "UA": "Ukraine",
            "AE": "United Arab Emirates (the)",
            "GB": "United Kingdom of Great Britain and Northern Ireland (the)",
            "US": "United States of America (the)",
            "UM": "United States Minor Outlying Islands (the)",
            "UY": "Uruguay",
            "UZ": "Uzbekistan",
            "VU": "Vanuatu",
            "VE": "Venezuela (Bolivarian Republic of)",
            "VN": "Viet Nam",
            "VG": "Virgin Islands (British)",
            "VI": "Virgin Islands (U.S.)",
            "WF": "Wallis and Futuna",
            "EH": "Western Sahara",
            "YE": "Yemen",
            "ZM": "Zambia",
            "ZW": "Zimbabwe"
        }
        self.dictionaries["region"] = {
            "88": "States Ex-Yugoslavia unspecified",
            "89": "Europe, regional",
            "189": "North of Sahara, regional",
            "289": "South of Sahara, regional",
            "298": "Africa, regional",
            "380": "West Indies, regional",
            "389": "North & Central America, regional",
            "489": "South America, regional",
            "498": "America, regional",
            "589": "Middle East, regional",
            "619": "Central Asia, regional",
            "679": "South Asia, regional",
            "689": "South & Central Asia, regional",
            "789": "Far East Asia, regional",
            "798": "Asia, regional",
            "889": "Oceania, regional",
            "998": "Developing countries, unspecified",
            "1027": "Eastern Africa, regional",
            "1028": "Middle Africa, regional",
            "1029": "Southern Africa, regional",
            "1030": "Western Africa, regional",
            "1031": "Caribbean, regional",
            "1032": "Central America, regional",
            "1033": "Melanesia, regional",
            "1034": "Micronesia, regional",
            "1035": "Polynesia, regional"
        }
        self.dictionaries["finance_type"] = {
            "1": "GNI: Gross National Income",
            "110": "Standard grant",
            "1100": "Guarantees/insurance",
            "111": "Subsidies to national private investors",
            "2": "ODA % GNI",
            "210": "Interest subsidy",
            "211": "Interest subsidy to national private exporters",
            "3": "Total Flows % GNI",
            "310": "Capital subscription on deposit basis",
            "311": "Capital subscription on encashment basis",
            "4": "Population",
            "410": "Aid loan excluding debt reorganisation",
            "411": "Investment-related loan to developing countries",
            "412": "Loan in a joint venture with the recipient",
            "413": "Loan to national private investor",
            "414": "Loan to national private exporter",
            "421": "Standard loan",
            "422": "Reimbursable grant",
            "423": "Bonds",
            "424": "Asset-backed securities",
            "425": "Other debt securities",
            "431": "Subordinated loan",
            "432": "Preferred equity",
            "433": "Other hybrid instruments",
            "451": "Non-banks guaranteed export credits",
            "452": "Non-banks non-guaranteed portions of guaranteed export credits",
            "453": "Bank export credits",
            "510": "Common equity",
            "511": "Acquisition of equity not part of joint venture in developing countries",
            "512": "Other acquisition of equity",
            "520": "Shares in collective investment vehicles",
            "530": "Reinvested earnings",
            "610": "Debt forgiveness: ODA claims (P)",
            "611": "Debt forgiveness: ODA claims (I)",
            "612": "Debt forgiveness: OOF claims (P)",
            "613": "Debt forgiveness: OOF claims (I)",
            "614": "Debt forgiveness: Private claims (P)",
            "615": "Debt forgiveness: Private claims (I)",
            "616": "Debt forgiveness: OOF claims (DSR)",
            "617": "Debt forgiveness: Private claims (DSR)",
            "618": "Debt forgiveness: Other",
            "620": "Debt rescheduling: ODA claims (P)",
            "621": "Debt rescheduling: ODA claims (I)",
            "622": "Debt rescheduling: OOF claims (P)",
            "623": "Debt rescheduling: OOF claims (I)",
            "624": "Debt rescheduling: Private claims (P)",
            "625": "Debt rescheduling: Private claims (I)",
            "626": "Debt rescheduling: OOF claims (DSR)",
            "627": "Debt rescheduling: Private claims (DSR)",
            "630": "Debt rescheduling: OOF claim (DSR – original loan principal)",
            "631": "Debt rescheduling: OOF claim (DSR – original loan interest)",
            "632": "Debt rescheduling: Private claim (DSR – original loan principal)",
            "633": "Debt forgiveness/conversion: export credit claims (P)",
            "634": "Debt forgiveness/conversion: export credit claims (I)",
            "635": "Debt forgiveness: export credit claims (DSR)",
            "636": "Debt rescheduling: export credit claims (P)",
            "637": "Debt rescheduling: export credit claims (I)",
            "638": "Debt rescheduling: export credit claims (DSR)",
            "639": "Debt rescheduling: export credit claim (DSR – original loan principal)",
            "710": "Foreign direct investment, new capital outflow (includes reinvested earnings if separate identification not available)",
            "711": "Other foreign direct investment, including reinvested earnings",
            "712": "Foreign direct investment, reinvested earnings",
            "810": "Bank bonds",
            "811": "Non-bank bonds",
            "910": "Other bank securities/claims",
            "911": "Other non-bank securities/claims",
            "912": "Purchase of securities from issuing agencies",
            "913": "Securities and other instruments originally issued by multilateral agencies"
        }
        self.dictionaries["aid_type"] = {
            "A01": "General budget support",
            "A02": "Sector budget support",
            "B01": "Core support to NGOs, other private bodies, PPPs and research institutes",
            "B02": "Core contributions to multilateral institutions",
            "B03": "Contributions to specific-purpose programmes and funds managed by implementing partners",
            "B04": "Basket funds/pooled funding",
            "C01": "Project-type interventions",
            "D01": "Donor country personnel",
            "D02": "Other technical assistance",
            "E01": "Scholarships/training in donor country",
            "E02": "Imputed student costs",
            "F01": "Debt relief",
            "G01": "Administrative costs not included elsewhere",
            "H01": "Development awareness",
            "H02": "Refugees/asylum seekers in donor countries",
            "H03": "Asylum-seekers ultimately accepted",
            "H04": "Asylum-seekers ultimately rejected",
            "H05": "Recognised refugees"
        }
        self.dictionaries["dac_3_sector"] = {
            "111": "Education, Level Unspecified",
            "112": "Basic Education",
            "113": "Secondary Education",
            "114": "Post-Secondary Education",
            "121": "Health, General",
            "122": "Basic Health",
            "123": "Non-communicable diseases (NCDs)",
            "130": "Population Policies/Programmes & Reproductive Health",
            "140": "Water Supply & Sanitation",
            "151": "Government & Civil Society-general",
            "152": "Conflict, Peace & Security",
            "160": "Other Social Infrastructure & Services",
            "210": "Transport & Storage",
            "220": "Communications",
            "230": "ENERGY GENERATION AND SUPPLY",
            "231": "Energy Policy",
            "232": "Energy generation, renewable sources",
            "233": "Energy generation, non-renewable sources",
            "234": "Hybrid energy plants",
            "235": "Nuclear energy plants",
            "236": "Energy distribution",
            "240": "Banking & Financial Services",
            "250": "Business & Other Services",
            "311": "Agriculture",
            "312": "Forestry",
            "313": "Fishing",
            "321": "Industry",
            "322": "Mineral Resources & Mining",
            "323": "Construction",
            "331": "Trade Policies & Regulations",
            "332": "Tourism",
            "410": "General Environment Protection",
            "430": "Other Multisector",
            "510": "General Budget Support",
            "520": "Development Food Assistance",
            "530": "Other Commodity Assistance",
            "600": "Action Relating to Debt",
            "720": "Emergency Response",
            "730": "Reconstruction Relief & Rehabilitation",
            "740": "Disaster Prevention & Preparedness",
            "910": "Administrative Costs of Donors",
            "920": "SUPPORT TO NON- GOVERNMENTAL ORGANISATIONS (NGOs)",
            "930": "Refugees in Donor Countries",
            "998": "Unallocated / Unspecified"
        }
        self.dictionaries["di_sector"] = {
            "111": "Education",
            "112": "Education",
            "113": "Education",
            "114": "Education",
            "121": "Health",
            "122": "Health",
            "123": "Health",
            "130": "Health",
            "140": "Water and sanitation",
            "151": "Governance and security",
            "152": "Governance and security",
            "160": "Other social services",
            "210": "Infrastructure",
            "220": "Infrastructure",
            "230": "Infrastructure",
            "231": "Infrastructure",
            "232": "Infrastructure",
            "233": "Infrastructure",
            "234": "Infrastructure",
            "235": "Infrastructure",
            "236": "Infrastructure",
            "240": "Banking and business",
            "250": "Banking and business",
            "311": "Agriculture and food security",
            "312": "Agriculture and food security",
            "313": "Agriculture and food security",
            "321": "Industry and trade",
            "322": "Industry and trade",
            "323": "Industry and trade",
            "331": "Industry and trade",
            "332": "Industry and trade",
            "410": "Environment",
            "430": "Other",
            "510": "General Budget Support",
            "520": "Agriculture and food security",
            "530": "Other",
            "600": "Debt relief",
            "720": "Humanitarian",
            "730": "Humanitarian",
            "740": "Humanitarian",
            "910": "Other",
            "920": "Other",
            "930": "Other",
            "998": "Other"
        }
        self.dictionaries["collaboration_type"] = {
            "1": "Bilateral",
            "2": "Multilateral (inflows)",
            "3": "Bilateral, core contributions to NGOs and other private bodies / PPPs",
            "4": "Multilateral outflows",
            "6": "Private Sector Outflows",
            "7": "Bilateral, ex-post reporting on NGOs’ activities funded through core contributions",
            "8": "Bilateral, triangular co-operation"
        }

    def define_dict(self, name, dictionary):
        self.dictionaries[name] = dictionary

    # Main flattening function here. Input is the XML root of the XML document, and output is an array of arrays with flattened data.
    def flatten_activities(self, root):
        for dictionary_name in ["ratedf"]:
            assert dictionary_name in self.dictionaries, "Missing dictionary: {}".format(dictionary_name)
        output = list()
        try:
            version = root.attrib["version"]
        except KeyError:
            # Defaults to 2.02 if  the document happens to be missing an IATI version
            version = '2.02'

        # Find all activities
        activity_len = len(root.findall("iati-activity"))

        # Set up a quick progress bar for tracking processing; iterate through every activity
        for i in range(0, activity_len):
            activity = root.xpath('iati-activity[%s]' % (i + 1))[0]
            # Capture iati identifier
            iati_identifier = default_first(activity.xpath("iati-identifier/text()"))

            reporting_org_ref = default_first(activity.xpath("reporting-org/@ref"))
            reporting_org_narrative = default_first(activity.xpath("reporting-org/narrative/text()"))
            reporting_org_secondary_reporter = default_first(activity.xpath("reporting-org/@secondary-reporter"))
            reporting_org_secondary_reporter = replace_default_if_none(reporting_org_secondary_reporter, "0")
            reporting_org_type_code = default_first(activity.xpath("reporting-org/@type"))

            recipient_country_code_list = list()
            recipient_country_percentage_list = list()
            recipient_country_percentage_sum = 0
            recipient_countries = activity.findall("recipient-country")
            for recipient_country in recipient_countries:
                attribs = recipient_country.attrib
                attrib_keys = list(attribs.keys())
                percentage = attribs['percentage'] if 'percentage' in attrib_keys else "100"
                if percentage is not None:
                    percentage = percentage.replace("%", "")
                    try:
                        recipient_country_percentage_sum += float(percentage)
                    except ValueError:
                        pass
                code = attribs['code'] if 'code' in attrib_keys else None
                if code is not None:
                    recipient_country_code_list.append(code)
                    recipient_country_percentage_list.append(percentage)

            recipient_region_vocabulary_list = list()
            recipient_region_code_list = list()
            recipient_region_percentage_list = list()
            recipient_regions = activity.findall("recipient-region")
            for recipient_region in recipient_regions:
                attribs = recipient_region.attrib
                attrib_keys = list(attribs.keys())
                percentage = attribs['percentage'] if 'percentage' in attrib_keys else "100"
                if percentage is not None:
                    percentage = percentage.replace("%", "")
                vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else None
                if vocab is None:
                    vocab = ""
                code = attribs['code'] if 'code' in attrib_keys else None
                if code is not None:
                    recipient_region_vocabulary_list.append(vocab)
                    recipient_region_code_list.append(code)
                    recipient_region_percentage_list.append(percentage)

            sector_code_list = list()
            sector_percentage_list = list()
            sector_vocabulary_list = list()
            activity_sectors = activity.findall("sector")
            for activity_sector in activity_sectors:
                attribs = activity_sector.attrib
                attrib_keys = list(attribs.keys())
                percentage = attribs['percentage'] if 'percentage' in attrib_keys else "100"
                if percentage is not None:
                    percentage = percentage.replace("%", "")
                if percentage is None:
                    percentage = ""
                code = attribs['code'] if 'code' in attrib_keys else ""
                if len(code) == 5:
                    vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else "1"
                else:
                    vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else "99"
                sector_code_list.append(code)
                sector_percentage_list.append(percentage)
                sector_vocabulary_list.append(vocab)

            humanitarian = default_first(activity.xpath("@humanitarian"))
            humanitarian_scope_narrative = default_first(activity.xpath("humanitarian-scope/narrative/text()"))
            humanitarian_scope_type = default_first(activity.xpath("humanitarian-scope/@type"))
            humanitarian_scope_vocabulary = default_first(activity.xpath("humanitarian-scope/@vocabulary"))
            humanitarian_scope_code = default_first(activity.xpath("humanitarian-scope/@code"))

            x_hum_emergency_vocabulary = humanitarian_scope_vocabulary if humanitarian_scope_type == "1" else ""
            x_hum_emergency_code = humanitarian_scope_code if humanitarian_scope_type == "1" else ""
            x_hum_appeal_vocabulary = humanitarian_scope_vocabulary if humanitarian_scope_type == "2" else ""
            x_hum_appeal_code = humanitarian_scope_code if humanitarian_scope_type == "2" else ""

            title_narrative = default_first(activity.xpath("title/narrative/text()"))
            description_narrative = default_first(activity.xpath("description/narrative/text()"))
            tag_code = default_first(activity.xpath("tag/@code"))
            tag_vocabulary = default_first(activity.xpath("tag/@vocabulary"))
            tag_narrative = default_first(activity.xpath("tag/narrative/text()"))

            participating_org_ref_list = list()
            participating_org_type_list = list()
            participating_org_role_list = list()
            participating_org_narrative_list = list()
            participating_orgs = activity.findall("participating-org")
            for participating_org in participating_orgs:
                attribs = participating_org.attrib
                attrib_keys = list(attribs.keys())
                ref = attribs['ref'] if 'ref' in attrib_keys else ""
                participating_org_ref_list.append(ref)
                p_type = attribs['type'] if 'type' in attrib_keys else ""
                participating_org_type_list.append(p_type)
                role = attribs['role'] if 'role' in attrib_keys else ""
                participating_org_role_list.append(role)
                p_name = default_first(participating_org.xpath("narrative/text()"))
                p_name = p_name if p_name else ""
                participating_org_narrative_list.append(p_name)
            participating_org_ref = "|".join(participating_org_ref_list)
            participating_org_type = "|".join(participating_org_type_list)
            participating_org_role = "|".join(participating_org_role_list)
            participating_org_narrative = "|".join(participating_org_narrative_list)
            collaboration_type_code =  default_first(activity.xpath("collaboration-type/@code"))
            collaboration_type = recode_if_not_none(collaboration_type_code, self.dictionaries["collaboration_type"])

            dac_policy_marker_code_list = list()
            dac_policy_marker_significance_list = list()
            policy_markers = activity.findall("policy-marker")
            for policy_marker in policy_markers:
                attribs = policy_marker.attrib
                attrib_keys = list(attribs.keys())
                vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else "1"
                if vocab == "1" or vocab == "":
                    code = attribs['code'] if 'code' in attrib_keys else ""
                    if code != "":
                        dac_policy_marker_code_list.append(code)
                        sig = attribs['significance'] if 'significance' in attrib_keys else ""
                        dac_policy_marker_significance_list.append(sig)
            dac_policy_marker_code = "|".join(dac_policy_marker_code_list)
            dac_policy_marker_significance = "|".join(dac_policy_marker_significance_list)

            child_tags = [child.tag for child in activity.getchildren()]

            defaults = {}
            default_tags = ["default-currency", "default-flow-type", "default-finance-type", "default-aid-type", "default-tied-status"]
            for tag in default_tags:
                if tag in activity.attrib.keys():
                    defaults[tag] = activity.attrib[tag]
                    defaults[tag+"-code"] = None
                    defaults[tag+"-vocabulary"] = None
                elif tag in child_tags:
                    defaults[tag] = None
                    defaults[tag+"-code"] = default_first(activity.xpath("{}/@code".format(tag)))
                    defaults[tag+"-vocabulary"] = default_first(activity.xpath("{}/@vocabulary".format(tag)))
                else:
                    defaults[tag] = None
                    defaults[tag+"-code"] = None
                    defaults[tag+"-vocabulary"] = None

            has_transactions = "transaction" in child_tags
            if has_transactions:
                transactions = activity.findall("transaction")
                x_transaction_number = 0
                for transaction in transactions:
                    x_transaction_number += 1

                    transaction_recipient_country_code = default_first(transaction.xpath("recipient-country/@code"))
                    if transaction_recipient_country_code:
                        x_country_code_list = [transaction_recipient_country_code]
                        x_country_percentage_list = ["100"]
                    else:
                        x_country_code_list = recipient_country_code_list.copy()
                        x_country_percentage_list = recipient_country_percentage_list.copy()

                    transaction_recipient_region_code = default_first(transaction.xpath("recipient-region/@code"))
                    transaction_recipient_region_vocabulary = default_first(transaction.xpath("recipient-region/@vocabulary"))
                    if transaction_recipient_region_code:
                        x_region_code_list = [transaction_recipient_region_code]
                        x_region_vocabulary_list = [transaction_recipient_region_vocabulary]
                        x_region_percentage_list = ["100"]
                    else:
                        x_region_code_list = recipient_region_code_list.copy()
                        x_region_vocabulary_list = recipient_region_vocabulary_list.copy()
                        x_region_percentage_list = recipient_region_percentage_list.copy()

                    transaction_sector_code_list = list()
                    transaction_sector_percentage_list = list()
                    transaction_sector_vocabulary_list = list()
                    transaction_sectors = transaction.findall("sector")
                    for transaction_sector in transaction_sectors:
                        attribs = transaction_sector.attrib
                        attrib_keys = list(attribs.keys())
                        percentage = attribs['percentage'] if 'percentage' in attrib_keys else "100"
                        if percentage is not None:
                            percentage = percentage.replace("%", "")
                        if percentage is None:
                            percentage = ""
                        code = attribs['code'] if 'code' in attrib_keys else ""
                        if len(code) == 5:
                            vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else "1"
                        else:
                            vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else "99"
                        transaction_sector_code_list.append(code)
                        transaction_sector_percentage_list.append(percentage)
                        transaction_sector_vocabulary_list.append(vocab)
                    if len(transaction_sector_code_list) > 0:
                        x_sector_code_list = transaction_sector_code_list.copy()
                        x_sector_percentage_list = transaction_sector_percentage_list.copy()
                        x_sector_vocabulary_list = transaction_sector_vocabulary_list.copy()
                    else:
                        x_sector_code_list = sector_code_list.copy()
                        x_sector_percentage_list = sector_percentage_list.copy()
                        x_sector_vocabulary_list = sector_vocabulary_list.copy()

                    transaction_type_code = default_first(transaction.xpath("transaction-type/@code"))
                    transaction_date_iso_date = default_first(transaction.xpath("transaction-date/@iso-date"))
                    transaction_value_date = default_first(transaction.xpath("value/@value-date"))
                    x_transaction_date = replace_default_if_none(transaction_date_iso_date, transaction_value_date)
                    x_transaction_year = ""
                    try:
                        year = int(x_transaction_date[:4]) if x_transaction_date is not None else None
                        x_transaction_year = year if year is not None else ""
                    except ValueError:
                        year = None

                    x_yyyymm = ""
                    if x_transaction_year != "":
                        try:
                            month_str = x_transaction_date[5:7]
                            month = int(month_str)
                            x_yyyymm = str(x_transaction_year) + month_str
                        except ValueError:
                            pass

                    transaction_value_currency = default_first(transaction.xpath("value/@currency"))
                    default_currency = defaults["default-currency"]
                    x_currency = replace_default_if_none(transaction_value_currency, default_currency)
                    if x_currency == "":
                        x_currency = None
                    if x_currency is not None:
                        x_currency = x_currency.replace(" ", "")

                    transaction_value = default_first(transaction.xpath("value/text()"))
                    try:
                        transaction_value = float(transaction_value.replace(" ", "").replace(",", "")) if transaction_value is not None else None
                        transaction_convertable = True
                    except ValueError:
                        transaction_convertable = False
                    if not transaction_value:
                        transaction_convertable = False

                    default_flow_type_code = defaults["default-flow-type-code"]
                    transaction_flow_type_code = default_first(transaction.xpath("flow-type/@code"))
                    x_flow_type_code = replace_default_if_none(transaction_flow_type_code, default_flow_type_code)

                    default_finance_type_code = defaults["default-finance-type-code"]
                    transaction_finance_type_code = default_first(transaction.xpath("finance-type/@code"))
                    x_finance_type_code = replace_default_if_none(transaction_finance_type_code, default_finance_type_code)

                    default_aid_type_vocabulary = defaults["default-aid-type-vocabulary"]
                    default_aid_type_code = defaults["default-aid-type-code"]
                    transaction_aid_type_vocabulary = default_first(transaction.xpath("aid-type/@vocabulary"))
                    transaction_aid_type_code = default_first(transaction.xpath("aid-type/@code"))

                    x_mod_aid_type_vocabulary = ""
                    x_mod_aid_type_code = ""
                    x_dac_aid_type_code = ""
                    if transaction_aid_type_code:
                        if transaction_aid_type_vocabulary in ["2", "3", "4"]:
                            x_mod_aid_type_vocabulary = transaction_aid_type_vocabulary
                            x_mod_aid_type_code = transaction_aid_type_code
                        else:
                            x_dac_aid_type_code = transaction_aid_type_code
                    elif default_aid_type_code:
                        if default_aid_type_vocabulary in ["2", "3", "4"]:
                            x_mod_aid_type_vocabulary = default_aid_type_vocabulary
                            x_mod_aid_type_code = default_aid_type_code
                        else:
                            x_dac_aid_type_code = default_aid_type_code

                    default_tied_status_code = defaults["default-tied-status-code"]
                    transaction_tied_status_code = default_first(transaction.xpath("tied-status/@code"))
                    x_tied_status_code = replace_default_if_none(transaction_tied_status_code, default_tied_status_code)

                    transaction_disbursement_channel_code = default_first(transaction.xpath("disbursment-channel/@code"))

                    transaction_description_narrative = default_first(transaction.xpath("description/narrative/text()"))

                    transaction_humanitarian = default_first(transaction.xpath("@humanitarian"))

                    transaction_provider_org_narrative = default_first(transaction.xpath("provider-org/narrative/text()"))
                    transaction_provider_org_provider_activity_id = default_first(transaction.xpath("provider-org/@provider-activity-id"))
                    transaction_provider_org_ref = default_first(transaction.xpath("provider-org/@ref"))
                    transaction_provider_org_type = default_first(transaction.xpath("provider-org/@type"))
                    transaction_receiver_org_narrative = default_first(transaction.xpath("receiver-org/narrative/text()"))
                    transaction_receiver_org_receiver_activity_id = default_first(transaction.xpath("receiver-org/@receiver-activity-id"))
                    transaction_receiver_org_ref = default_first(transaction.xpath("receiver-org/@ref"))
                    transaction_receiver_org_type = default_first(transaction.xpath("receiver-org/@type"))
                    transaction_ref = default_first(transaction.xpath("@ref"))

                    x_covid = False
                    if title_narrative is not None and "covid-19" in title_narrative.lower():
                        x_covid = True
                    elif title_narrative is not None and "covid" in title_narrative.lower():
                        x_covid = True
                    elif title_narrative is not None and "coronavirus" in title_narrative.lower():
                        x_covid = True
                    elif description_narrative is not None and "covid-19" in description_narrative.lower():
                        x_covid = True
                    elif description_narrative is not None and "covid" in description_narrative.lower():
                        x_covid = True
                    elif description_narrative is not None and "coronavirus" in description_narrative.lower():
                        x_covid = True
                    elif transaction_description_narrative is not None and "covid-19" in transaction_description_narrative.lower():
                        x_covid = True
                    elif transaction_description_narrative is not None and "covid" in transaction_description_narrative.lower():
                        x_covid = True
                    elif transaction_description_narrative is not None and "coronavirus" in transaction_description_narrative.lower():
                        x_covid = True
                    elif humanitarian_scope_code == "EP-2020-000012-001":
                        x_covid = True
                    elif humanitarian_scope_code == "HCOVD20":
                        x_covid = True
                    elif tag_code == "COVID-19":
                        x_covid = True

                    x_recipient_code_list = list()
                    x_recipient_percentage_list = list()
                    x_recipient_type_list = list()
                    if len(x_country_code_list) > 0:
                        x_recipient_code_list = x_country_code_list.copy()
                        x_recipient_percentage_list = x_country_percentage_list.copy()
                        x_recipient_type_list = ["Country"] * len(x_country_code_list)
                        country_percentage_sum = 0
                        for country_percentage in x_country_percentage_list:
                            try:
                                country_percentage_sum += float(country_percentage)
                            except ValueError:
                                pass
                        if country_percentage_sum < 100:
                            x_recipient_code_list += x_region_code_list.copy()
                            x_recipient_percentage_list += x_region_percentage_list.copy()
                            x_recipient_type_list += ["Region"] * len(x_region_code_list)
                    else:
                        x_recipient_code_list = x_region_code_list.copy()
                        x_recipient_percentage_list = x_region_percentage_list.copy()
                        x_recipient_type_list = ["Region"] * len(x_region_code_list)

                    x_reporting_org_type = ""
                    x_transaction_type = ""
                    x_finance_type = ""
                    x_aid_type = ""
                    x_recipient_number = 1
                    x_recipient_code = ""
                    x_recipient = ""
                    x_recipient_percentage = ""
                    x_recipient_type = ""
                    x_recipient_transaction_value = transaction_value
                    x_recipient_transaction_value_usd = ""
                    x_sector_number = 1
                    x_sector_code = ""
                    x_sector_vocabulary = ""
                    x_vocabulary_number = ""
                    x_sector_percentage = ""
                    x_dac3_sector = ""
                    x_dac3_sector_code = ""
                    x_di_sector = ""
                    x_transaction_value = transaction_value
                    x_transaction_value_usd = ""
                    x_reporting_org_type = recode_if_not_none(reporting_org_type_code, self.dictionaries["organisation_type"])
                    x_transaction_type = recode_if_not_none(transaction_type_code, self.dictionaries["transaction_type"])
                    x_finance_type = recode_if_not_none(x_finance_type_code, self.dictionaries["finance_type"])
                    x_aid_type = recode_if_not_none(transaction_aid_type_code, self.dictionaries["aid_type"])

                    x_original_transaction_value = x_transaction_value
                    x_original_transaction_value_usd = ""
                    if transaction_convertable and x_currency:
                        if x_currency in self.dictionaries["ratedf"]:
                            x_original_transaction_value_usd = convert_usd(x_original_transaction_value, year, x_currency, self.dictionaries["ratedf"])

                    x_sector_priority_order = ["1", "2"]
                    if len(x_sector_vocabulary_list) > 0:
                        x_sector_vocabulary_mode = max(set(x_sector_vocabulary_list), key=x_sector_vocabulary_list.count)
                        unique_sector_vocabularies = sorted(set(x_sector_vocabulary_list))
                        if "1" in unique_sector_vocabularies:
                            unique_sector_vocabularies.remove("1")
                        else:
                            x_sector_priority_order.remove("1")

                        if "2" in unique_sector_vocabularies:
                            unique_sector_vocabularies.remove("2")
                        else:
                            x_sector_priority_order.remove("2")

                        if x_sector_vocabulary_mode in unique_sector_vocabularies:
                            unique_sector_vocabularies.remove(x_sector_vocabulary_mode)

                        if x_sector_vocabulary_mode not in x_sector_priority_order:
                            x_sector_priority_order.append(x_sector_vocabulary_mode)

                        x_sector_priority_order += unique_sector_vocabularies

                    if len(x_recipient_code_list) > 0:  # Has recipients
                        for k in range(0, len(x_recipient_code_list)):
                            x_recipient_number = k + 1
                            x_recipient_code = x_recipient_code_list[k]
                            x_recipient_percentage = x_recipient_percentage_list[k]
                            x_recipient_type = x_recipient_type_list[k]
                            if x_recipient_type == "Country":
                                x_recipient = recode_if_not_none(x_recipient_code, self.dictionaries["country"])
                            else:
                                x_recipient = recode_if_not_none(x_recipient_code, self.dictionaries["region"])
                            try:
                                float_x_recipient_percentage = float(x_recipient_percentage)
                            except ValueError:
                                float_x_recipient_percentage = 100
                            if transaction_convertable:
                                x_recipient_transaction_value = transaction_value * (float_x_recipient_percentage/100)
                                if x_recipient_transaction_value and x_currency:
                                    if x_currency in self.dictionaries["ratedf"]:
                                        x_recipient_transaction_value_usd = convert_usd(x_recipient_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                    else:
                                        pass
                            if len(x_sector_vocabulary_list) > 0:  # Has recipients and sectors
                                for j in range(0, len(x_sector_vocabulary_list)):
                                    x_sector_number = j + 1
                                    x_sector_code = x_sector_code_list[j]
                                    x_sector_vocabulary = x_sector_vocabulary_list[j]
                                    x_vocabulary_number = x_sector_priority_order.index(x_sector_vocabulary) + 1
                                    x_sector_percentage = x_sector_percentage_list[j]
                                    try:
                                        float_x_sector_percentage = float(x_sector_percentage)
                                    except ValueError:
                                        float_x_sector_percentage = 100
                                    x_dac3_sector_code = ""
                                    if x_sector_vocabulary == "1":
                                        x_dac3_sector_code = x_sector_code[:3]
                                    elif x_sector_vocabulary == "2":
                                        x_dac3_sector_code = x_sector_code
                                    x_dac3_sector = recode_if_not_none(x_dac3_sector_code, self.dictionaries["dac_3_sector"])
                                    x_di_sector = recode_if_not_none(x_dac3_sector_code, self.dictionaries["di_sector"])
                                    if transaction_convertable:
                                        x_transaction_value = transaction_value * (float_x_recipient_percentage/100) * (float_x_sector_percentage/100)
                                        if x_transaction_value and x_currency:
                                            if x_currency in self.dictionaries["ratedf"]:
                                                x_transaction_value_usd = convert_usd(x_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                            else:
                                                pass
                                    x_country_code = x_recipient_code
                                    x_country = x_recipient
                                    x_country_percentage = x_recipient_percentage
                                    row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, x_original_transaction_value, x_original_transaction_value_usd, x_country_code, x_country, x_country_percentage, x_recipient_number, x_recipient_code, x_recipient, x_recipient_percentage, x_recipient_type, x_recipient_transaction_value, x_recipient_transaction_value_usd, x_sector_number, x_sector_vocabulary, x_vocabulary_number, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, x_transaction_date, x_transaction_year, x_currency, x_transaction_value, x_transaction_value_usd, x_flow_type_code, x_finance_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, x_tied_status_code, collaboration_type, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_narrative,  x_hum_emergency_code, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code, x_reporting_org_type, x_transaction_type, x_finance_type, x_aid_type, x_dac3_sector, x_di_sector, x_yyyymm, x_covid, dac_policy_marker_code, dac_policy_marker_significance]
                                    output.append(row)
                                    # Reset sector-split specific defaults
                                    x_sector_number = 1
                                    x_sector_code = ""
                                    x_sector_vocabulary = ""
                                    x_vocabulary_number = ""
                                    x_sector_percentage = ""
                                    x_dac3_sector = ""
                                    x_dac3_sector_code = ""
                                    x_di_sector = ""
                                    x_transaction_value = transaction_value
                                    x_transaction_value_usd = ""
                            else:  # Has recipients, no sectors
                                x_transaction_value = x_recipient_transaction_value
                                x_transaction_value_usd = x_recipient_transaction_value_usd
                                x_country_code = x_recipient_code
                                x_country = x_recipient
                                x_country_percentage = x_recipient_percentage
                                row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, x_original_transaction_value, x_original_transaction_value_usd, x_country_code, x_country, x_country_percentage, x_recipient_number, x_recipient_code, x_recipient, x_recipient_percentage, x_recipient_type, x_recipient_transaction_value, x_recipient_transaction_value_usd, x_sector_number, x_sector_vocabulary, x_vocabulary_number, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, x_transaction_date, x_transaction_year, x_currency, x_transaction_value, x_transaction_value_usd, x_flow_type_code, x_finance_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, x_tied_status_code, collaboration_type, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_narrative,  x_hum_emergency_code, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code, x_reporting_org_type, x_transaction_type, x_finance_type, x_aid_type, x_dac3_sector, x_di_sector, x_yyyymm, x_covid, dac_policy_marker_code, dac_policy_marker_significance]
                                output.append(row)
                                # Reset missing sector-split specific defaults
                                x_transaction_value = transaction_value
                                x_transaction_value_usd = ""
                            # Reset recipient-split specific defaults
                            x_recipient_number = 1
                            x_recipient_code = ""
                            x_recipient = ""
                            x_recipient_percentage = ""
                            x_recipient_type = ""
                            x_recipient_transaction_value = transaction_value
                            x_recipient_transaction_value_usd = ""
                    else:  # No recipients
                        if transaction_convertable:
                            if x_recipient_transaction_value and x_currency:
                                if x_currency in self.dictionaries["ratedf"]:
                                    x_recipient_transaction_value_usd = convert_usd(x_recipient_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                else:
                                    pass
                        if len(x_sector_vocabulary_list) > 0:  # No recipients, but sectors
                            for j in range(0, len(x_sector_vocabulary_list)):
                                x_sector_number = j + 1
                                x_sector_code = x_sector_code_list[j]
                                x_sector_vocabulary = x_sector_vocabulary_list[j]
                                x_vocabulary_number = x_sector_priority_order.index(x_sector_vocabulary) + 1
                                x_sector_percentage = x_sector_percentage_list[j]
                                try:
                                    float_x_sector_percentage = float(x_sector_percentage)
                                except ValueError:
                                    float_x_sector_percentage = 100
                                x_dac3_sector_code = ""
                                if x_sector_vocabulary == "1":
                                    x_dac3_sector_code = x_sector_code[:3]
                                elif x_sector_vocabulary == "2":
                                    x_dac3_sector_code = x_sector_code
                                x_dac3_sector = recode_if_not_none(x_dac3_sector_code, self.dictionaries["dac_3_sector"])
                                x_di_sector = recode_if_not_none(x_dac3_sector_code, self.dictionaries["di_sector"])
                                if transaction_convertable:
                                    x_transaction_value = transaction_value * (float_x_sector_percentage/100)
                                    if x_transaction_value and x_currency:
                                        if x_currency in self.dictionaries["ratedf"]:
                                            x_transaction_value_usd = convert_usd(x_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                        else:
                                            pass
                                x_country_code = x_recipient_code
                                x_country = x_recipient
                                x_country_percentage = x_recipient_percentage
                                row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, x_original_transaction_value, x_original_transaction_value_usd, x_country_code, x_country, x_country_percentage, x_recipient_number, x_recipient_code, x_recipient, x_recipient_percentage, x_recipient_type, x_recipient_transaction_value, x_recipient_transaction_value_usd, x_sector_number, x_sector_vocabulary, x_vocabulary_number, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, x_transaction_date, x_transaction_year, x_currency, x_transaction_value, x_transaction_value_usd, x_flow_type_code, x_finance_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, x_tied_status_code, collaboration_type, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_narrative,  x_hum_emergency_code, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code, x_reporting_org_type, x_transaction_type, x_finance_type, x_aid_type, x_dac3_sector, x_di_sector, x_yyyymm, x_covid, dac_policy_marker_code, dac_policy_marker_significance]
                                output.append(row)
                                # Reset sector-split specific defaults
                                x_sector_number = 1
                                x_sector_code = ""
                                x_sector_vocabulary = ""
                                x_vocabulary_number = ""
                                x_sector_percentage = ""
                                x_dac3_sector = ""
                                x_dac3_sector_code = ""
                                x_di_sector = ""
                                x_transaction_value = transaction_value
                                x_transaction_value_usd = ""
                        else:  # No recipients, no sectors
                            x_transaction_value = x_recipient_transaction_value
                            x_transaction_value_usd = x_recipient_transaction_value_usd
                            x_country_code = x_recipient_code
                            x_country = x_recipient
                            x_country_percentage = x_recipient_percentage
                            row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, x_original_transaction_value, x_original_transaction_value_usd, x_country_code, x_country, x_country_percentage, x_recipient_number, x_recipient_code, x_recipient, x_recipient_percentage, x_recipient_type, x_recipient_transaction_value, x_recipient_transaction_value_usd, x_sector_number, x_sector_vocabulary, x_vocabulary_number, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, x_transaction_date, x_transaction_year, x_currency, x_transaction_value, x_transaction_value_usd, x_flow_type_code, x_finance_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, x_tied_status_code, collaboration_type, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_narrative,  x_hum_emergency_code, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code, x_reporting_org_type, x_transaction_type, x_finance_type, x_aid_type, x_dac3_sector, x_di_sector, x_yyyymm, x_covid, dac_policy_marker_code, dac_policy_marker_significance]
                            output.append(row)
                            # Reset missing sector-split specific defaults
                            x_transaction_value = transaction_value
                            x_transaction_value_usd = ""
                            x_recipient_transaction_value = transaction_value
                            x_recipient_transaction_value_usd = ""

        return output
