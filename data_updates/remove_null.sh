#!/bin/bash

sed -i "s/\x00/ /g" "$1"
