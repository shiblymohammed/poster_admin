@echo off
echo ========================================
echo   LAPOAITOOLS ADMIN PANEL - LOCAL DEV
echo ========================================
echo.

echo Checking environment...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo .env file created!
    echo Default API URL: http://localhost:8000
    echo.
)

echo Installing dependencies...
call npm install
echo.

echo ========================================
echo   Starting Vite dev server...
echo ========================================
echo.
echo Admin panel will be available at: http://localhost:5174
echo Make sure backend is running at: http://localhost:8000
echo.
echo Admin credentials:
echo Username: aseeb
echo Password: Dr.aseeb123
echo.
call npm run dev
