# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.conf import settings


class CrsCurrent(models.Model):
    row_no = models.IntegerField()
    year = models.SmallIntegerField()
    donor_code = models.SmallIntegerField()
    donor_name = models.TextField()
    agency_code = models.SmallIntegerField()
    agency_name = models.TextField(blank=True, null=True)
    crs_id = models.TextField(blank=True, null=True)
    project_number = models.TextField(blank=True, null=True)
    initial_report = models.SmallIntegerField(blank=True, null=True)
    recipient_code = models.SmallIntegerField()
    recipient_name = models.TextField()
    region_code = models.SmallIntegerField()
    region_name = models.TextField()
    income_group_code = models.SmallIntegerField()
    income_group_name = models.TextField()
    flow_code = models.SmallIntegerField()
    flow_name = models.TextField(blank=True, null=True)
    bilateral_multilateral = models.SmallIntegerField()
    category = models.SmallIntegerField()
    finance_type = models.SmallIntegerField()
    aid_type = models.TextField(blank=True, null=True)
    usd_commitment = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_disbursement = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_received = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_commitment_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_disbursement_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_received_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_adjustment = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_adjustment_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_amount_untied = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_amount_partial_tied = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_amount_tied = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_amount_untied_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_amount_partial_tied_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_amount_tied_deflated = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_irtc = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_expert_commitment = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_expert_extended = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_export_credit = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    currency_code = models.SmallIntegerField()
    commitment_national = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    disbursement_national = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    grant_equivalent = models.TextField(blank=True, null=True)
    usd_grant_equivalent = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    short_description = models.TextField()
    project_title = models.TextField(blank=True, null=True)
    purpose_code = models.IntegerField()
    purpose_name = models.TextField(blank=True, null=True)
    sector_code = models.IntegerField()
    sector_name = models.TextField(blank=True, null=True)
    channel_code = models.IntegerField(blank=True, null=True)
    channel_name = models.TextField(blank=True, null=True)
    channel_reported_name = models.TextField(blank=True, null=True)
    channel_parent_category = models.IntegerField(blank=True, null=True)
    geography = models.TextField(blank=True, null=True)
    expected_start_date = models.DateTimeField(blank=True, null=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    gender = models.SmallIntegerField(blank=True, null=True)
    environment = models.SmallIntegerField(blank=True, null=True)
    trade = models.SmallIntegerField(blank=True, null=True)
    pdgg = models.SmallIntegerField(blank=True, null=True)
    ftc = models.SmallIntegerField(blank=True, null=True)
    pba = models.SmallIntegerField(blank=True, null=True)
    investment_project = models.SmallIntegerField(blank=True, null=True)
    associated_finance = models.SmallIntegerField(blank=True, null=True)
    biodiversity = models.SmallIntegerField(blank=True, null=True)
    climate_mitigation = models.SmallIntegerField(blank=True, null=True)
    climate_adaptation = models.SmallIntegerField(blank=True, null=True)
    desertification = models.SmallIntegerField(blank=True, null=True)
    commitment_date = models.DateTimeField(blank=True, null=True)
    type_repayment = models.SmallIntegerField(blank=True, null=True)
    number_repayment = models.SmallIntegerField(blank=True, null=True)
    interest_1 = models.TextField(blank=True, null=True)
    interest_2 = models.TextField(blank=True, null=True)
    repay_date_1 = models.DateTimeField(blank=True, null=True)
    repay_date_2 = models.DateTimeField(blank=True, null=True)
    grant_element = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_interest = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_outstanding = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_arrears_principal = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_arrears_interest = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_future_debt_service_principal = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    usd_future_debt_service_interest = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    rmnch = models.SmallIntegerField(blank=True, null=True)
    budget_identifier = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    capital_expenditure = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)

    class Meta:
        managed = settings.IS_TESTING
        db_table = 'crs_current'


class CrsCurrentIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.BigIntegerField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'crs_current_isos'


class CrsCurrentRegisos(models.Model):
    region_name = models.TextField(primary_key=True)
    region_code = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'crs_current_regisos'


class Dac1Current(models.Model):
    row_id = models.AutoField(primary_key=True)
    donor_code = models.SmallIntegerField()
    donor_name = models.TextField()
    part_code = models.SmallIntegerField()
    part_name = models.TextField()
    aid_type_code = models.IntegerField()
    aid_type_name = models.TextField()
    flows = models.SmallIntegerField()
    fund_flows = models.TextField()
    amount_type_code = models.CharField(max_length=1)
    amount_type_name = models.TextField()
    time = models.SmallIntegerField()
    year = models.SmallIntegerField()
    value = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    flags = models.TextField(blank=True, null=True)

    class Meta:
        managed = settings.IS_TESTING
        db_table = 'dac1_current'


class Dac1CurrentIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.BigIntegerField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dac1_current_isos'


class Dac2ACurrent(models.Model):
    row_id = models.AutoField(primary_key=True)
    recipient_code = models.SmallIntegerField()
    recipient_name = models.TextField()
    donor_code = models.SmallIntegerField()
    donor_name = models.TextField()
    part_code = models.IntegerField()
    part_name = models.TextField()
    aid_type_code = models.SmallIntegerField()
    aid_type_name = models.TextField()
    data_type = models.CharField(max_length=1)
    amount_type = models.TextField()
    time = models.SmallIntegerField()
    year = models.SmallIntegerField()
    value = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    flags = models.TextField(blank=True, null=True)

    class Meta:
        managed = settings.IS_TESTING
        db_table = 'dac2a_current'


class Dac2ACurrentIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.BigIntegerField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dac2a_current_isos'


class Dac2BCurrent(models.Model):
    row_id = models.AutoField(primary_key=True)
    recipient_code = models.SmallIntegerField()
    recipient_name = models.TextField()
    donor_code = models.SmallIntegerField()
    donor_name = models.TextField()
    part_code = models.IntegerField()
    part_name = models.TextField()
    aid_type_code = models.SmallIntegerField()
    aid_type_name = models.TextField()
    data_type = models.CharField(max_length=1)
    amount_type = models.TextField()
    time = models.SmallIntegerField()
    year = models.SmallIntegerField()
    value = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    flags = models.TextField(blank=True, null=True)

    class Meta:
        managed = settings.IS_TESTING
        db_table = 'dac2b_current'


class Dac2BCurrentIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.BigIntegerField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dac2b_current_isos'


class Dac5Current(models.Model):
    row_id = models.AutoField(primary_key=True)
    donor_code = models.SmallIntegerField()
    donor_name = models.TextField()
    sector_code = models.SmallIntegerField()
    sector_name = models.TextField()
    aid_type_code = models.IntegerField()
    aid_type_name = models.TextField()
    amount_type_code = models.CharField(max_length=1)
    amount_type_name = models.TextField()
    time = models.SmallIntegerField()
    year = models.SmallIntegerField()
    value = models.DecimalField(max_digits=65535, decimal_places=11, blank=True, null=True)
    flags = models.TextField(blank=True, null=True)

    class Meta:
        managed = settings.IS_TESTING
        db_table = 'dac5_current'


class Dac5CurrentIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.BigIntegerField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dac5_current_isos'

class PovcalnetaggRegisos(models.Model):
    region_name = models.TextField(primary_key=True)
    region_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PovCalNetAgg_regisos'


class PovcalnetdistIsos(models.Model):
    country_name = models.FloatField(primary_key=True)
    country_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PovCalNetDist_isos'


class Povcalnetp20Isos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PovCalNetP20_isos'


class Povcalnetp20Regisos(models.Model):
    region_name = models.FloatField(primary_key=True)
    region_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PovCalNetP20_regisos'


class PovcalnetsmyIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PovCalNetSmy_isos'


class PovcalnetsmyRegisos(models.Model):
    region_name = models.FloatField(primary_key=True)
    region_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PovCalNetSmy_regisos'


class AllResourceFlows(models.Model):
    id = models.TextField(primary_key=True)
    year = models.BigIntegerField(blank=True, null=True)
    country_name = models.TextField(blank=True, null=True)
    iso2 = models.TextField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)
    flow_direction = models.TextField(blank=True, null=True)
    flow_type = models.TextField(blank=True, null=True)
    flow_name = models.TextField(blank=True, null=True)
    value_2016 = models.FloatField(blank=True, null=True)
    value_2017 = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'all_resource_flows'


class Cblb(models.Model):
    country_name = models.TextField(blank=True, null=True)
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    cblb = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cblb'


class DevelopingCountries(models.Model):
    country_name = models.TextField(blank=True, null=True)
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    developing = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'developing_countries'


class DiDeflators2016(models.Model):
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    country_name = models.TextField(blank=True, null=True)
    dac_marker = models.FloatField(blank=True, null=True)
    eu_marker = models.FloatField(blank=True, null=True)
    year = models.BigIntegerField(blank=True, null=True)
    value = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'di_deflators_2016'


class DiDeflators2017(models.Model):
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    country_name = models.TextField(blank=True, null=True)
    dac_marker = models.FloatField(blank=True, null=True)
    eu_marker = models.FloatField(blank=True, null=True)
    year = models.BigIntegerField(blank=True, null=True)
    value = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'di_deflators_2017'


class Fragility(models.Model):
    country_name = models.TextField(blank=True, null=True)
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    fragile_2018 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fragility'


class Fts(models.Model):
    id = models.IntegerField(primary_key=True)
    amountusd = models.IntegerField(db_column='amountUSD', blank=True, null=True)  # Field name made lowercase.
    budgetyear = models.IntegerField(db_column='budgetYear', blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(blank=True, null=True)
    flowtype = models.TextField(db_column='flowType', blank=True, null=True)  # Field name made lowercase.
    newmoney = models.BooleanField(db_column='newMoney', blank=True, null=True)  # Field name made lowercase.
    originalamount = models.FloatField(db_column='originalAmount', blank=True, null=True)  # Field name made lowercase.
    originalcurrency = models.TextField(db_column='originalCurrency', blank=True, null=True)  # Field name made lowercase.
    method = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    boundary = models.TextField(blank=True, null=True)
    onboundary = models.TextField(db_column='onBoundary', blank=True, null=True)  # Field name made lowercase.
    donor = models.TextField(db_column='Donor', blank=True, null=True)  # Field name made lowercase.
    source_location_name = models.TextField(db_column='source_Location_name', blank=True, null=True)  # Field name made lowercase.
    source_iso3 = models.TextField(blank=True, null=True)
    source_usageyear_name = models.TextField(db_column='source_UsageYear_name', blank=True, null=True)  # Field name made lowercase.
    recipient_organization = models.TextField(db_column='Recipient.Organization', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    destination_globalcluster_name = models.TextField(db_column='destination_GlobalCluster_name', blank=True, null=True)  # Field name made lowercase.
    destination_country = models.TextField(db_column='Destination.Country', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    destination_iso3 = models.TextField(blank=True, null=True)
    destination_usageyear_name = models.TextField(db_column='destination_UsageYear_name', blank=True, null=True)  # Field name made lowercase.
    destination_plan_name = models.TextField(db_column='destination_Plan_name', blank=True, null=True)  # Field name made lowercase.
    destination_project_name = models.TextField(db_column='destination_Project_name', blank=True, null=True)  # Field name made lowercase.
    parentflowid = models.IntegerField(db_column='parentFlowId', blank=True, null=True)  # Field name made lowercase.
    grandbargainearmarkingtype = models.TextField(db_column='grandBargainEarmarkingType', blank=True, null=True)  # Field name made lowercase.
    source_plan_id = models.TextField(db_column='source_Plan_id', blank=True, null=True)  # Field name made lowercase.
    source_plan_name = models.TextField(db_column='source_Plan_name', blank=True, null=True)  # Field name made lowercase.
    destination_cluster_name = models.TextField(db_column='destination_Cluster_name', blank=True, null=True)  # Field name made lowercase.
    destination_emergency_name = models.TextField(db_column='destination_Emergency_name', blank=True, null=True)  # Field name made lowercase.
    exchangerate = models.FloatField(db_column='exchangeRate', blank=True, null=True)  # Field name made lowercase.
    source_emergency_name = models.TextField(db_column='source_Emergency_name', blank=True, null=True)  # Field name made lowercase.
    source_globalcluster_name = models.TextField(db_column='source_GlobalCluster_name', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'fts'


class FtsCodenames(models.Model):
    donor = models.TextField(db_column='Donor', primary_key=True)  # Field name made lowercase.
    codename = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_codenames'


class FtsDacregion(models.Model):
    donor = models.TextField(db_column='Donor', primary_key=True)  # Field name made lowercase.
    region = models.TextField(db_column='Region', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'fts_dacregion'


class FtsDeflators(models.Model):
    deflatortype = models.TextField(primary_key=True)
    deflators = models.FloatField(db_column='Deflators', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'fts_deflators'


class FtsDeliverychannels(models.Model):
    recipient_organization = models.TextField(db_column='Recipient.Organization', primary_key=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    deliverychannels = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_deliverychannels'


class FtsDestinationcountryid(models.Model):
    destination_country = models.TextField(db_column='Destination.Country', primary_key=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    destinationcountryid = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_destinationcountryid'


class FtsDonorscountryid(models.Model):
    donor = models.TextField(db_column='Donor', primary_key=True)  # Field name made lowercase.
    donorcountryid = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_donorscountryid'


class FtsIncomegroups(models.Model):
    destinationcountrytype = models.TextField(primary_key=True)
    incomegroups = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_incomegroups'


class FtsIsos(models.Model):
    country_name = models.TextField(primary_key=True)
    country_code = models.BigIntegerField(blank=True, null=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_isos'


class FtsNgotype(models.Model):
    recipient_organization = models.TextField(db_column='Recipient.Organization', primary_key=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    ngotype = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_ngotype'


class FtsOdaeligible(models.Model):
    destination_country = models.TextField(db_column='Destination.Country', primary_key=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    odaeligible = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_odaeligible'


class FtsPrecoded(models.Model):
    id = models.IntegerField(primary_key=True)
    amountusd = models.IntegerField(db_column='amountUSD', blank=True, null=True)  # Field name made lowercase.
    budgetyear = models.IntegerField(db_column='budgetYear', blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(blank=True, null=True)
    flowtype = models.TextField(db_column='flowType', blank=True, null=True)  # Field name made lowercase.
    newmoney = models.BooleanField(db_column='newMoney', blank=True, null=True)  # Field name made lowercase.
    originalamount = models.FloatField(db_column='originalAmount', blank=True, null=True)  # Field name made lowercase.
    originalcurrency = models.TextField(db_column='originalCurrency', blank=True, null=True)  # Field name made lowercase.
    method = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    boundary = models.TextField(blank=True, null=True)
    onboundary = models.TextField(db_column='onBoundary', blank=True, null=True)  # Field name made lowercase.
    donor = models.TextField(db_column='Donor', blank=True, null=True)  # Field name made lowercase.
    source_location_name = models.TextField(db_column='source_Location_name', blank=True, null=True)  # Field name made lowercase.
    source_iso3 = models.TextField(blank=True, null=True)
    source_usageyear_name = models.TextField(db_column='source_UsageYear_name', blank=True, null=True)  # Field name made lowercase.
    recipient_organization = models.TextField(db_column='Recipient.Organization', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    destination_globalcluster_name = models.TextField(db_column='destination_GlobalCluster_name', blank=True, null=True)  # Field name made lowercase.
    destination_country = models.TextField(db_column='Destination.Country', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    destination_iso3 = models.TextField(blank=True, null=True)
    destination_usageyear_name = models.TextField(db_column='destination_UsageYear_name', blank=True, null=True)  # Field name made lowercase.
    destination_plan_name = models.TextField(db_column='destination_Plan_name', blank=True, null=True)  # Field name made lowercase.
    destination_project_name = models.TextField(db_column='destination_Project_name', blank=True, null=True)  # Field name made lowercase.
    parentflowid = models.IntegerField(db_column='parentFlowId', blank=True, null=True)  # Field name made lowercase.
    grandbargainearmarkingtype = models.TextField(db_column='grandBargainEarmarkingType', blank=True, null=True)  # Field name made lowercase.
    source_plan_id = models.TextField(db_column='source_Plan_id', blank=True, null=True)  # Field name made lowercase.
    source_plan_name = models.TextField(db_column='source_Plan_name', blank=True, null=True)  # Field name made lowercase.
    destination_cluster_name = models.TextField(db_column='destination_Cluster_name', blank=True, null=True)  # Field name made lowercase.
    destination_emergency_name = models.TextField(db_column='destination_Emergency_name', blank=True, null=True)  # Field name made lowercase.
    exchangerate = models.FloatField(db_column='exchangeRate', blank=True, null=True)  # Field name made lowercase.
    source_emergency_name = models.TextField(db_column='source_Emergency_name', blank=True, null=True)  # Field name made lowercase.
    source_globalcluster_name = models.TextField(db_column='source_GlobalCluster_name', blank=True, null=True)  # Field name made lowercase.
    codename = models.TextField(blank=True, null=True)
    privatemoney = models.TextField(blank=True, null=True)
    region = models.TextField(db_column='Region', blank=True, null=True)  # Field name made lowercase.
    donorcountryid = models.TextField(blank=True, null=True)
    recipientcodename = models.TextField(blank=True, null=True)
    ngotype = models.TextField(blank=True, null=True)
    deliverychannels = models.TextField(blank=True, null=True)
    recipientcountryid = models.TextField(blank=True, null=True)
    odaeligible = models.TextField(blank=True, null=True)
    destinationcountryid = models.TextField(blank=True, null=True)
    incomegroups = models.TextField(blank=True, null=True)
    domesticresponse = models.BooleanField(blank=True, null=True)
    deflators = models.FloatField(db_column='Deflators', blank=True, null=True)  # Field name made lowercase.
    amountdeflated = models.FloatField(db_column='amountDeflated', blank=True, null=True)  # Field name made lowercase.
    amountdeflatedmillions = models.FloatField(db_column='amountDeflatedMillions', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'fts_precoded'


class FtsPrivatemoney(models.Model):
    donor = models.TextField(db_column='Donor', primary_key=True)  # Field name made lowercase.
    privatemoney = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_privatemoney'


class FtsRecipientcodename(models.Model):
    recipient_organization = models.TextField(db_column='Recipient.Organization', primary_key=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    recipientcodename = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_recipientcodename'


class FtsRecipientcountryid(models.Model):
    recipient_organization = models.TextField(db_column='Recipient.Organization', primary_key=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    recipientcountryid = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fts_recipientcountryid'


class HistoricalIncomeGroupings(models.Model):
    country_name = models.TextField(blank=True, null=True)
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    year = models.BigIntegerField(blank=True, null=True)
    income_group = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historical_income_groupings'


class Ldcs(models.Model):
    country_name = models.TextField(blank=True, null=True)
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    ldc = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ldcs'


class NonGrantRevenue(models.Model):
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    country_name = models.TextField(blank=True, null=True)
    year = models.BigIntegerField(blank=True, null=True)
    budget_type = models.TextField(blank=True, null=True)
    l2 = models.TextField(blank=True, null=True)
    value_current_ncu = models.FloatField(blank=True, null=True)
    value_current_usd = models.FloatField(blank=True, null=True)
    value_usd_constant_2016 = models.FloatField(blank=True, null=True)
    value_usd_constant_2017 = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'non_grant_revenue'


class OecdCrsAidTypeRef(models.Model):
    aid_type_code = models.TextField(primary_key=True)
    aid_type_parent_code = models.TextField(blank=True, null=True)
    aid_type_parent_name = models.TextField(blank=True, null=True)
    aid_type_name = models.TextField(blank=True, null=True)
    aid_type_description = models.TextField(blank=True, null=True)
    aid_type_di_name = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oecd_crs_aid_type_ref'


class OecdCrsChannelMap(models.Model):
    channel_parent_category_code = models.BigIntegerField(blank=True, null=True)
    channel_id_code = models.BigIntegerField(primary_key=True)
    year_added = models.FloatField(blank=True, null=True)
    acronym_eng = models.TextField(blank=True, null=True)
    oecd_channel_name = models.TextField(blank=True, null=True)
    oecd_channel_parent_name = models.TextField(blank=True, null=True)
    oecd_aggregated_channel = models.TextField(blank=True, null=True)
    coefficient_for_core_contributions = models.TextField(blank=True, null=True)
    general_contributions_reported_as_type_of_aid = models.TextField(blank=True, null=True)
    mcd_major_channel_of_delivery = models.TextField(blank=True, null=True)
    references_notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oecd_crs_channel_map'


class OecdCrsDonorTypeRef(models.Model):
    donor_code = models.BigIntegerField(primary_key=True)
    donor_name = models.TextField(blank=True, null=True)
    donor_type = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oecd_crs_donor_type_ref'


class OecdCrsSectorItepMap(models.Model):
    oecd_sector_code = models.BigIntegerField(primary_key=True)
    oecd_sector_name = models.TextField(blank=True, null=True)
    itep_sector = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oecd_crs_sector_itep_map'


class OecdRegions(models.Model):
    country_name = models.TextField(blank=True, null=True)
    di_id = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)
    region_name = models.TextField(blank=True, null=True)
    region_code = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'oecd_regions'


class WdiIsos(models.Model):
    country_name = models.TextField(blank=True, null=True)
    country_code = models.TextField(primary_key=True)
    iso3 = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wdi_isos'
