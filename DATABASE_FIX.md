# Database Connection Fix Instructions

The error "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string" indicates PostgreSQL is configured to require password authentication, but we don't have the correct password.

## Option 1: Set PostgreSQL Password (Recommended)

1. **Set password for postgres user:**
   ```bash
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'your_new_password';
   \q
   ```

2. **Update .env file with your password:**
   ```
   DATABASE_URL=postgresql://postgres:your_new_password@localhost:5432/family_expense_tracker
   ```

## Option 2: Configure PostgreSQL for Trust Authentication (Development Only)

1. **Edit PostgreSQL config:**
   ```bash
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```

2. **Find and change this line:**
   ```
   # Change "peer" to "trust" for local connections
   local   all             postgres                                peer
   # To:
   local   all             postgres                                trust
   ```

3. **Restart PostgreSQL:**
   ```bash
   sudo systemctl restart postgresql
   ```

4. **Update .env file:**
   ```
   DATABASE_URL=postgresql://postgres@localhost:5432/family_expense_tracker
   ```

## Option 3: Create New Database User

1. **Connect as postgres user and create new user:**
   ```bash
   sudo -u postgres psql
   CREATE USER app_user WITH PASSWORD 'app_password';
   CREATE DATABASE family_expense_tracker OWNER app_user;
   GRANT ALL PRIVILEGES ON DATABASE family_expense_tracker TO app_user;
   \q
   ```

2. **Update .env file:**
   ```
   DATABASE_URL=postgresql://app_user:app_password@localhost:5432/family_expense_tracker
   ```

## After Fixing Database

1. **Test connection:**
   ```bash
   cd backend
   node setup-database.js
   ```

2. **Restart the backend server:**
   ```bash
   npm run dev
   ```

3. **Test income addition in the web app**

Choose the option that works best for your setup. Option 1 is most secure for production.