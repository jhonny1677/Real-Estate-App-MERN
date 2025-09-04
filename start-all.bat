@echo off
echo Starting Real Estate Application...
echo.

echo Starting API server...
start "API Server" cmd /c "cd api && npm start"

timeout /t 2 /nobreak >nul

echo Starting Socket server...
start "Socket Server" cmd /c "cd socket && npm start"

timeout /t 2 /nobreak >nul

echo Starting Client application...
start "Client" cmd /c "cd client && npm run dev"

echo.
echo All services are starting up!
echo.
echo API Server: http://localhost:8800
echo Socket Server: http://localhost:4000  
echo Client App: http://localhost:5174
echo.
echo Press any key to continue...
pause >nul