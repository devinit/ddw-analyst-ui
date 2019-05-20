#!/bin/bash

python3 data_updates/Python/povcal_agg.py  # "repo"."PovCalNetAgg"
python3 data_updates/Python/povcal_smy.py  # "repo"."PovCalNetSmy"
python3 data_updates/Python/povcal_p20.py  # "repo"."PovCalNetP20"
Rscript data_updates/R/povcal_dist.R  # "repo"."PovCalNetDist"
