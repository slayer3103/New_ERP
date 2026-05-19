# 🚀 ERP Software - Friend के System में Setup

## आपके Friend को क्या करना है:

### 1️⃣ Docker Desktop Install करें
- https://www.docker.com/products/docker-desktop से download करें
- Install करें और computer restart करें
- Docker Desktop को open करें और running होने का wait करें

### 2️⃣ Project Folder Copy करें
- आपसे पूरा `ERP-Software` folder ले लें
- अपने computer में कहीं भी रख सकते हैं (जैसे Desktop पर)

### 3️⃣ Application Run करें

#### Option A: Easy Way (Recommended)
1. `ERP-Software` folder में जाएं
2. `start-docker.bat` file पर double-click करें
3. Wait करें जब तक सब कुछ download और setup हो जाए (पहली बार 5-10 minutes लग सकते हैं)

#### Option B: Command Line Way
1. Command Prompt या PowerShell open करें
2. ERP-Software folder में navigate करें:
   ```
   cd path\to\ERP-Software
   ```
3. यह command run करें:
   ```
   docker-compose -f docker-compose.dev.yml up --build
   ```

### 4️⃣ Application Access करें
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000
- **Database**: localhost:3307 (MySQL container)

## ⚠️ Important Notes:

1. **पहली बार slow होगा**: Docker images download होंगी (internet connection चाहिए)
2. **बाद में fast होगा**: सब कुछ cached रहेगा
3. **कोई Node.js/MySQL install नहीं करना**: सब कुछ Docker containers में चलेगा
4. **Port conflicts**: अगर 3000 या 5000 ports busy हैं तो docker-compose.yml में ports change कर सकते हैं

## 🛠️ Troubleshooting:

### Docker Desktop not running:
```
Error: Cannot connect to the Docker daemon
```
**Solution**: Docker Desktop को start करें

### Port already in use:
```
Error: Port 3000 is already allocated
```
**Solution**: docker-compose.yml में ports change करें या running applications को stop करें

### Build failed:
```
Error: Build failed
```
**Solution**: Internet connection check करें और फिर से try करें

## 🔄 Stop करने के लिए:
- Command Prompt में `Ctrl+C` press करें
- या Docker Desktop में containers को stop करें

## 📞 Help:
अगर कोई problem आए तो आपको message करें!