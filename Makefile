# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
#
# Makefile cheat-sheet:
#
# $@ : target label
# $< : the first prerequisite after the colon
# $^ : all of the prerequisite files
# $* : wildcard matched part
#
# Target-specific Variable syntax:
# https://www.gnu.org/software/make/manual/html_node/Target_002dspecific.html
#
# patsubst : $(patsubst pattern,replacement,text)
#       https://www.gnu.org/software/make/manual/html_node/Text-Functions.html

SHELL=/bin/bash

default: check

node_modules/ws/lib/websocket-server.js:
	npm install
	@echo "$@ complete"

update:
	npm update

npmsetup: node_modules/ws/lib/websocket-server.js
	@echo "$@ complete"

dbsetup: npmsetup
	bin/setup-new-db-container.sh
	bin/db-create-tables.sh

check: dbsetup
	./valportaal-acceptance-test.sh
	@echo "SUCCESS $@"

tidy:
	js-beautify --replace --end-with-newline \
		valportaal-acceptance-test.js \
		ValPortaal.js
