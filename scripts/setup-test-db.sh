#!/bin/bash

# Script to set up the test database for e2e tests

set -e

DB_NAME="social_project_test_db"

echo "🔧 Setting up test database: $DB_NAME"

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "✅ Test database '$DB_NAME' already exists"

    read -p "Do you want to reset the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping existing database..."
        dropdb $DB_NAME
        echo "📦 Creating fresh database..."
        createdb $DB_NAME
        echo "✅ Database reset complete"
    fi
else
    echo "📦 Creating test database '$DB_NAME'..."
    createdb $DB_NAME
    echo "✅ Database created"
fi

# Run migrations
echo "🔄 Running database migrations..."
cd packages/backend
DATABASE_URL="postgres://localhost:5432/$DB_NAME" npm run db:push
cd ../..

echo "✅ Test database setup complete!"
echo ""
echo "You can now run e2e tests with:"
echo "  npm run test:e2e"
