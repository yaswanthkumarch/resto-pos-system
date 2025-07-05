@echo off
echo Restaurant POS System - Database Setup
echo ======================================

echo.
echo This script will help you set up the database for the Restaurant POS System.
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo After installation, make sure to add the PostgreSQL bin directory to your PATH
    pause
    exit /b 1
)

echo PostgreSQL found. Proceeding with database setup...
echo.

REM Check if database exists
psql -U postgres -lqt | findstr /i "resto_pos" >nul
if %errorlevel% equ 0 (
    echo Database 'resto_pos' already exists.
    set /p choice="Do you want to recreate it? (y/N): "
    if /i "%choice%"=="y" (
        echo Dropping existing database...
        psql -U postgres -c "DROP DATABASE IF EXISTS resto_pos;"
    ) else (
        echo Skipping database creation.
        goto :schema
    )
)

echo Creating database 'resto_pos'...
psql -U postgres -c "CREATE DATABASE resto_pos;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

:schema
echo.
echo Running database schema...
psql -U postgres -d resto_pos -f database\schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to run schema
    pause
    exit /b 1
)

echo.
echo Seeding initial data...
psql -U postgres -d resto_pos -f database\seed.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed data
    pause
    exit /b 1
)

echo.
echo Database setup completed successfully!
echo.
echo Default login credentials:
echo - Username: admin
echo - Password: admin123
echo.
pause 