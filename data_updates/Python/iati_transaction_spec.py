import pdb
import json
import os

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
        self.header = ["iati_identifier", "x_transaction_number", "reporting_org_ref", "reporting_org_narrative", "reporting_org_secondary_reporter", "reporting_org_type_code", "title_narrative", "recipient_country_code", "recipient_country_percentage", "transaction_recipient_country_code", "x_country_code", "x_country_percentage", "recipient_region_vocabulary", "recipient_region_code", "recipient_region_percentage", "transaction_recipient_region_vocabulary", "transaction_recipient_region_code", "x_region_vocabulary", "x_region_code", "x_region_percentage", "sector_vocabulary", "sector_code", "sector_percentage", "transaction_sector_vocabulary", "transaction_sector_code", "x_sector_vocabulary", "x_default_vocabulary", "x_sector_code", "x_sector_percentage", "x_dac3_sector_code", "transaction_type_code", "transaction_date_iso_date", "transaction_value_date", "x_transaction_date", "x_transaction_year", "default_currency", "transaction_value_currency", "x_currency", "transaction_value", "x_transaction_value", "x_transaction_value_usd", "default_flow_type_code", "transaction_flow_type_code", "x_flow_type_code", "default_finance_type_code", "transaction_finance_type_code", "x_finance_type_code", "default_aid_type_vocabulary", "default_aid_type_code", "transaction_aid_type_vocabulary", "transaction_aid_type_code", "x_mod_aid_type_vocabulary", "x_mod_aid_type_code", "x_dac_aid_type_code", "default_tied_status_code", "transaction_tied_status_code", "x_tied_status_code", "transaction_disbursement_channel_code", "description_narrative", "transaction_description_narrative", "humanitarian", "transaction_humanitarian", "humanitarian_scope_type", "humanitarian_scope_vocabulary", "humanitarian_scope_code", "humanitarian_scope_narrative", "x_hum_emergency_vocabulary", "x_hum_emergency_code", "x_hum_appeal_vocabulary", "x_hum_appeal_code", "transaction_provider_org_narrative", "transaction_provider_org_provider_activity_id", "transaction_provider_org_ref", "transaction_provider_org_type", "transaction_receiver_org_narrative", "transaction_receiver_org_receiver_activity_id", "transaction_receiver_org_ref", "transaction_receiver_org_type", "transaction_ref", "participating_org_narrative", "participating_org_type", "participating_org_role", "participating_org_ref", "tag_narrative", "tag_vocabulary", "tag_code"]
        self.dictionaries = {}
        # Defaults, can be overwritten with next function
        self.dictionaries["ratedf"] = ratedf

    def define_dict(self, name, dictionary):
        self.dictionaries[name] = dictionary

    # Main flattening function here. Input is the XML root of the XML document, and output is an array of arrays with flattened data.
    def flatten_activities(self, root):
        for dictionary_name in ["ratedf"]:
            assert dictionary_name in self.dictionaries, "Missing dictionary: {}".format(dictionary_name)
        output = []
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

            recipient_country_code_list = []
            recipient_country_percentage_list = []
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
            recipient_country_code = "|".join(recipient_country_code_list)
            recipient_country_percentage = "|".join(recipient_country_percentage_list)

            recipient_region_vocabulary_list = []
            recipient_region_code_list = []
            recipient_region_percentage_list = []
            recipient_countries = activity.findall("recipient-region")
            for recipient_region in recipient_countries:
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
            recipient_region_vocabulary = "|".join(recipient_region_vocabulary_list)
            recipient_region_code = "|".join(recipient_region_code_list)
            recipient_region_percentage = "|".join(recipient_region_percentage_list)

            sector_code_list = []
            sector_percentage_list = []
            sector_vocabulary_list = []
            activity_sectors = activity.findall("sector")
            for activity_sector in activity_sectors:
                attribs = activity_sector.attrib
                attrib_keys = list(attribs.keys())
                percentage = attribs['percentage'] if 'percentage' in attrib_keys else "100"
                if percentage is not None:
                    percentage = percentage.replace("%", "")
                if percentage is None:
                    percentage = ""
                vocab = attribs['vocabulary'] if 'vocabulary' in attrib_keys else None
                if vocab is None:
                    vocab = ""
                code = attribs['code'] if 'code' in attrib_keys else None
                if code is not None:
                    sector_code_list.append(code)
                    sector_percentage_list.append(percentage)
                    sector_vocabulary_list.append(vocab)
            sector_code = "|".join(sector_code_list)
            sector_percentage = "|".join(sector_percentage_list)
            sector_vocabulary = "|".join(sector_vocabulary_list)

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

            participating_org_ref_list = []
            participating_org_type_list = []
            participating_org_role_list = []
            participating_org_narrative_list = []
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
                        x_country_code = transaction_recipient_country_code
                        x_country_percentage = "100"
                    else:
                        x_country_code = recipient_country_code
                        x_country_percentage = recipient_country_percentage

                    transaction_recipient_region_code = default_first(transaction.xpath("recipient-region/@code"))
                    transaction_recipient_region_vocabulary = default_first(transaction.xpath("recipient-region/@vocabulary"))
                    if transaction_recipient_region_code:
                        x_region_code = transaction_recipient_region_code
                        x_region_vocabulary = transaction_recipient_region_vocabulary
                        x_region_percentage = "100"
                    else:
                        x_region_code = recipient_region_code
                        x_region_vocabulary = recipient_region_vocabulary
                        x_region_percentage = recipient_region_percentage
                    if recipient_country_percentage_sum >= 100 or transaction_recipient_country_code:
                        x_region_code = ""
                        x_region_vocabulary = ""
                        x_region_percentage = ""

                    transaction_sector_code = default_first(transaction.xpath("sector/@code"))
                    transaction_sector_vocabulary = default_first(transaction.xpath("sector/@vocabulary"))
                    if transaction_sector_code:
                        x_sector_code = transaction_sector_code
                        x_sector_percentage = "100"
                        x_sector_vocabulary = ""
                    else:
                        x_sector_code = sector_code
                        x_sector_percentage = sector_percentage
                        x_sector_vocabulary = sector_vocabulary
                    if x_sector_vocabulary == "" and len(x_sector_code.split("|")[0]) == 5:
                        x_sector_vocabulary = "1"
                    elif x_sector_vocabulary == "":
                        x_sector_vocabulary = "97"

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

                    transaction_value_currency = default_first(transaction.xpath("value/@currency"))
                    default_currency = defaults["default-currency"]
                    x_currency = replace_default_if_none(transaction_value_currency, default_currency)
                    if x_currency == "":
                        x_currency = None
                    if x_currency is not None:
                        x_currency = x_currency.replace(" ", "")

                    transaction_value = default_first(transaction.xpath("value/text()"))
                    try:
                        transaction_value = float(transaction_value.replace(" ", "")) if transaction_value is not None else None
                        transaction_convertable = True
                    except ValueError:
                        transaction_value = transaction_value
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

                    x_transaction_value = transaction_value
                    x_transaction_value_usd = ""
                    x_country_code_list = x_country_code.split("|")
                    x_country_percentage_list = x_country_percentage.split("|")
                    x_region_code_list = x_region_code.split("|")
                    x_region_percentage_list = x_region_percentage.split("|")

                    x_sector_vocabulary_list = x_sector_vocabulary.split("|")
                    x_default_vocabulary = max(set(x_sector_vocabulary_list), key=x_sector_vocabulary_list.count)
                    x_sector_code_list = x_sector_code.split("|")
                    x_sector_percentage_list = x_sector_percentage.split("|")
                    if len(x_sector_vocabulary_list) > 0:
                        for k in range(0, len(x_sector_vocabulary_list)):
                            x_sector_code = x_sector_code_list[k]
                            x_sector_vocabulary = x_sector_vocabulary_list[k]
                            if x_default_vocabulary != x_sector_vocabulary:
                                x_default_vocabulary = ""
                            x_sector_percentage = x_sector_percentage_list[k]
                            try:
                                float_x_sector_percentage = float(x_sector_percentage)
                            except ValueError:
                                float_x_sector_percentage = 100
                            x_dac3_sector_code = ""
                            if x_sector_vocabulary == "1":
                                x_dac3_sector_code = x_sector_code[:3]
                            elif x_sector_vocabulary == "2":
                                x_dac3_sector_code = x_sector_code
                            if len(x_country_code_list) > 0:
                                for j in range(0, len(x_country_code_list)):
                                    x_country_code = x_country_code_list[j]
                                    x_country_percentage = x_country_percentage_list[j]
                                    try:
                                        float_x_country_percentage = float(x_country_percentage)
                                    except ValueError:
                                        float_x_country_percentage = 100
                                    if transaction_convertable:
                                        x_transaction_value = transaction_value * (float_x_country_percentage/100) * (float_x_sector_percentage/100)
                                        if x_transaction_value and x_currency:
                                            if x_currency in self.dictionaries["ratedf"]:
                                                x_transaction_value_usd = convert_usd(x_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                            else:
                                                pdb.set_trace()
                                    row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, recipient_country_code, recipient_country_percentage, transaction_recipient_country_code, x_country_code, x_country_percentage, recipient_region_vocabulary, recipient_region_code, recipient_region_percentage, transaction_recipient_region_vocabulary, transaction_recipient_region_code, x_region_vocabulary, x_region_code, x_region_percentage, sector_vocabulary, sector_code, sector_percentage, transaction_sector_vocabulary, transaction_sector_code, x_sector_vocabulary, x_default_vocabulary, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, transaction_date_iso_date, transaction_value_date, x_transaction_date, x_transaction_year, default_currency, transaction_value_currency, x_currency, transaction_value, x_transaction_value, x_transaction_value_usd, default_flow_type_code, transaction_flow_type_code, x_flow_type_code, default_finance_type_code, transaction_finance_type_code, x_finance_type_code, default_aid_type_vocabulary, default_aid_type_code, transaction_aid_type_vocabulary, transaction_aid_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, default_tied_status_code, transaction_tied_status_code, x_tied_status_code, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_type, humanitarian_scope_vocabulary, humanitarian_scope_code, humanitarian_scope_narrative, x_hum_emergency_vocabulary, x_hum_emergency_code, x_hum_appeal_vocabulary, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code]
                                    output.append(row)
                            elif len(x_region_code_list) > 0:
                                for j in range(0, len(x_region_code_list)):
                                    x_region_code = x_region_code_list[j]
                                    x_region_percentage = x_region_percentage_list[j]
                                    try:
                                        float_x_region_percentage = float(x_region_percentage)
                                    except ValueError:
                                        float_x_region_percentage = 100
                                    if transaction_convertable:
                                        x_transaction_value = transaction_value * (float_x_region_percentage/100) * (float_x_sector_percentage/100)
                                        if x_transaction_value and x_currency:
                                            if x_currency in self.dictionaries["ratedf"]:
                                                x_transaction_value_usd = convert_usd(x_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                            else:
                                                pdb.set_trace()
                                    row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, recipient_country_code, recipient_country_percentage, transaction_recipient_country_code, x_country_code, x_country_percentage, recipient_region_vocabulary, recipient_region_code, recipient_region_percentage, transaction_recipient_region_vocabulary, transaction_recipient_region_code, x_region_vocabulary, x_region_code, x_region_percentage, sector_vocabulary, sector_code, sector_percentage, transaction_sector_vocabulary, transaction_sector_code, x_sector_vocabulary, x_default_vocabulary, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, transaction_date_iso_date, transaction_value_date, x_transaction_date, x_transaction_year, default_currency, transaction_value_currency, x_currency, transaction_value, x_transaction_value, x_transaction_value_usd, default_flow_type_code, transaction_flow_type_code, x_flow_type_code, default_finance_type_code, transaction_finance_type_code, x_finance_type_code, default_aid_type_vocabulary, default_aid_type_code, transaction_aid_type_vocabulary, transaction_aid_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, default_tied_status_code, transaction_tied_status_code, x_tied_status_code, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_type, humanitarian_scope_vocabulary, humanitarian_scope_code, humanitarian_scope_narrative, x_hum_emergency_vocabulary, x_hum_emergency_code, x_hum_appeal_vocabulary, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code]
                                    output.append(row)
                            else:
                                if transaction_convertable:
                                    x_transaction_value = transaction_value * (float_x_sector_percentage/100)
                                    if x_transaction_value and x_currency:
                                        if x_currency in self.dictionaries["ratedf"]:
                                            x_transaction_value_usd = convert_usd(x_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                        else:
                                            pdb.set_trace()
                                row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, recipient_country_code, recipient_country_percentage, transaction_recipient_country_code, x_country_code, x_country_percentage, recipient_region_vocabulary, recipient_region_code, recipient_region_percentage, transaction_recipient_region_vocabulary, transaction_recipient_region_code, x_region_vocabulary, x_region_code, x_region_percentage, sector_vocabulary, sector_code, sector_percentage, transaction_sector_vocabulary, transaction_sector_code, x_sector_vocabulary, x_default_vocabulary, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, transaction_date_iso_date, transaction_value_date, x_transaction_date, x_transaction_year, default_currency, transaction_value_currency, x_currency, transaction_value, x_transaction_value, x_transaction_value_usd, default_flow_type_code, transaction_flow_type_code, x_flow_type_code, default_finance_type_code, transaction_finance_type_code, x_finance_type_code, default_aid_type_vocabulary, default_aid_type_code, transaction_aid_type_vocabulary, transaction_aid_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, default_tied_status_code, transaction_tied_status_code, x_tied_status_code, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_type, humanitarian_scope_vocabulary, humanitarian_scope_code, humanitarian_scope_narrative, x_hum_emergency_vocabulary, x_hum_emergency_code, x_hum_appeal_vocabulary, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code]
                                output.append(row)
                    else:
                        if x_default_vocabulary != x_sector_vocabulary:
                            x_default_vocabulary = ""
                        if transaction_convertable:
                            if x_transaction_value and x_currency:
                                if x_currency in self.dictionaries["ratedf"]:
                                    x_transaction_value_usd = convert_usd(x_transaction_value, year, x_currency, self.dictionaries["ratedf"])
                                else:
                                    pdb.set_trace()
                        row = [iati_identifier, x_transaction_number, reporting_org_ref, reporting_org_narrative, reporting_org_secondary_reporter, reporting_org_type_code, title_narrative, recipient_country_code, recipient_country_percentage, transaction_recipient_country_code, x_country_code, x_country_percentage, recipient_region_vocabulary, recipient_region_code, recipient_region_percentage, transaction_recipient_region_vocabulary, transaction_recipient_region_code, x_region_vocabulary, x_region_code, x_region_percentage, sector_vocabulary, sector_code, sector_percentage, transaction_sector_vocabulary, transaction_sector_code, x_sector_vocabulary, x_default_vocabulary, x_sector_code, x_sector_percentage, x_dac3_sector_code, transaction_type_code, transaction_date_iso_date, transaction_value_date, x_transaction_date, x_transaction_year, default_currency, transaction_value_currency, x_currency, transaction_value, x_transaction_value, x_transaction_value_usd, default_flow_type_code, transaction_flow_type_code, x_flow_type_code, default_finance_type_code, transaction_finance_type_code, x_finance_type_code, default_aid_type_vocabulary, default_aid_type_code, transaction_aid_type_vocabulary, transaction_aid_type_code, x_mod_aid_type_vocabulary, x_mod_aid_type_code, x_dac_aid_type_code, default_tied_status_code, transaction_tied_status_code, x_tied_status_code, transaction_disbursement_channel_code, description_narrative, transaction_description_narrative, humanitarian, transaction_humanitarian, humanitarian_scope_type, humanitarian_scope_vocabulary, humanitarian_scope_code, humanitarian_scope_narrative, x_hum_emergency_vocabulary, x_hum_emergency_code, x_hum_appeal_vocabulary, x_hum_appeal_code, transaction_provider_org_narrative, transaction_provider_org_provider_activity_id, transaction_provider_org_ref, transaction_provider_org_type, transaction_receiver_org_narrative, transaction_receiver_org_receiver_activity_id, transaction_receiver_org_ref, transaction_receiver_org_type, transaction_ref, participating_org_narrative, participating_org_type, participating_org_role, participating_org_ref, tag_narrative, tag_vocabulary, tag_code]
                        output.append(row)

        return output
