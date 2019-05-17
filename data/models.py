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
