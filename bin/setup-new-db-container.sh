#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw

echo "# Exit immediately if a command exits with a non-zero status."
set -e

echo '# establishing valportaal_mariadb_user_password'
if [ -f valportaal_mariadb_user_password ]; then
	echo "#    valportaal_mariadb_user_password file exists"
else
	echo "#    creating new password from /dev/urandom"
	cat /dev/urandom \
		| tr --delete --complement 'a-zA-Z0-9' \
		| fold --width=32 \
		| head --lines=1 \
		> valportaal_mariadb_user_password
fi
DB_USER_PASSWORD=`cat valportaal_mariadb_user_password | xargs`

if [ -f valportaal.my.cnf ]; then
	echo "#    valportaal.my.cnf file exists"
else
	echo "#    creating valportaal.my.cnf"
	cat > valportaal.my.cnf << EOF
# for use with:
# mysql --defaults-file=./valportaal.my.cnf
[client-server]
host=127.0.0.1
port=23306

[client]
user=valportaal
password=$DB_USER_PASSWORD
EOF
fi

echo '# establishing valportaal_mariadb_root_password'
if [ -f valportaal_mariadb_root_password ]; then
	echo "#    valportaal_mariadb_root_password file exists"
else
	echo "#    creating new password from /dev/urandom"
	cat /dev/urandom \
		| tr --delete --complement 'a-zA-Z0-9' \
		| fold --width=32 \
		| head --lines=1 \
		> valportaal_mariadb_root_password
fi
DB_ROOT_PASSWORD=`cat valportaal_mariadb_root_password | xargs`

if [ -f root.my.cnf ]; then
	echo "#    root.my.cnf file exists"
else
	echo "#    creating root.my.cnf"
	cat > root.my.cnf << EOF
# for use with:
# mysql --defaults-file=./root.my.cnf
[client]
user=root
password=$DB_ROOT_PASSWORD
EOF
fi

echo "# check user '$USER' for group 'docker' membership"
if groups | grep -q docker; then
	echo "#    user '$USER' is member of 'docker' group (ok)"
else
	echo
	echo '# ------------------------------------------'
	echo "# user $USER not in group 'docker'"
	echo "# groups are: $(groups | sed -e's/\s/\n\t/g')"
	echo '# consider:'
	echo "    sudo usermod -a -G docker $USER"
	echo '# ------------------------------------------'
	echo
fi

echo '# ensure db container is not already running'
docker stop valportaal_mariadb || true

echo '# start db container'
docker run -d \
	-p 127.0.0.1:23306:3306 \
	--name valportaal_mariadb \
	--env MYSQL_DATABASE=valportaal \
	--env MYSQL_USER=valportaal \
	--env MYSQL_PASSWORD=$DB_USER_PASSWORD \
	--env MYSQL_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
	--rm \
	mariadb:10.5

echo '# copy DB config files to container'
docker cp valportaal.my.cnf valportaal_mariadb:/etc/
docker cp root.my.cnf valportaal_mariadb:/etc/
echo '# copy SQL configuration scripts to container'
for SQL_FILE in sql/*sql; do
	docker cp $SQL_FILE valportaal_mariadb:/
done
echo "# done copying configuration scripts"

i=0
while [ $i -lt 10 ]; do
	echo "waiting for db $i"
	if node ping-db.js ; then
		echo 'db available'
		break
	else
		i=$(( $i + 1 ))
	fi
done

echo "# Ensure DB Grants"
docker exec valportaal_mariadb mariadb \
	--defaults-file=/etc/root.my.cnf \
	--host=127.0.0.1 \
	--port=3306 \
	mysql \
	-e "/* ensure valportaal db user grants */
GRANT ALL PRIVILEGES ON \`valportaal\`.* TO \`valportaal\`@\`%\`;
GRANT ALL PRIVILEGES ON \`valportaal_test_%\`.* TO \`valportaal\`@\`%\`;
/* save the changes */
FLUSH PRIVILEGES;
"

echo "# Show DB Grants"
docker exec valportaal_mariadb mariadb \
	--defaults-file=/etc/valportaal.my.cnf \
	--host=127.0.0.1 \
	--port=3306 \
	valportaal \
	-e "SHOW GRANTS;"

echo '# db container is up and running'
echo '# stop the instance with:'
echo '    docker stop valportaal_mariadb'
