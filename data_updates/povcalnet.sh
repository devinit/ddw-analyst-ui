#!/bin/bash

# comment out below line if running outside of docker container
cd /src
python3 data_updates/Python/povcal_agg.py  # "repo"."PovCalNetAgg"
python3 manage.py update_meta PovCalNetAgg
python3 data_updates/Python/povcal_smy.py  # "repo"."PovCalNetSmy"
python3 manage.py update_meta PovCalNetSmy
python3 data_updates/Python/povcal_p20.py  # "repo"."PovCalNetP20"
python3 manage.py update_meta PovCalNetP20
Rscript data_updates/R/povcal_dist.R  # "repo"."PovCalNetDist"
python3 manage.py update_meta PovCalNetDist
