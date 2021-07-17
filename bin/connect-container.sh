#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
cat <<END_OF_MSG

To connect to the db as the 'root' user type:
mariadb --defaults-file=/etc/root.my.cnf --host=127.0.0.1 --port=3306

To connect to the db as the 'valportaal' user type:
mariadb --defaults-file=/etc/valportaal.my.cnf \
	--host=127.0.0.1 --port=3306 \
	valportaal

END_OF_MSG
docker exec -it valportaal_mariadb bash
