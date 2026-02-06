#!/bin/bash

echo "Setting up PostgreSQL for development..."

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';"

# Configure trust authentication for local connections  
sudo sed -i 's/local   all             all                                peer/local   all             all                                trust/g' /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

echo "PostgreSQL configured successfully!"
echo "User: postgres"
echo "Password: postgres123"
echo "Database: family_expense_tracker"