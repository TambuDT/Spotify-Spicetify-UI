# 🎶 Spotify Spicetify UI

A **React Native** app that lets you **remotely control Spotify** via **WebSocket**, using a custom script [Spotify-Spicetify-Controller](https://github.com/TambuDT/Spotify-Spicetify-Controller) built on top of [Spicetify](https://github.com/spicetify/spicetify-cli).  
With this app, you can turn your smartphone into a **music controller** for Spotify desktop.  
*(Planned future features: shortcuts for apps, websites, quick commands, monitoring dashboard for CPU, GPU, NETWORK, SSD, RAM usage, and much more.)*

---

## ✨ Features

- 🎵 **Playback controls**: Play / Pause / Next / Previous  
- 🎚 **Volume and progress bar**  
- 🔀 Support for **Shuffle**, **Repeat**, and **Like**  
- 📡 Real-time **WebSocket connection** with the Spicetify script  
- 🖼 Synchronized state: track title, artist, album art, duration, and progress  
- 📱 **Modern UI** inspired by Apple StandBy mode  

---

## 🛠️ Architecture

- **Frontend (React Native App)**  
  - Mobile user interface  
  - WebSocket connection management  
  - Dynamic rendering of Spotify state  

- **Backend (Spicetify + Custom Script)**  
  - Node.js script integrating Spicetify commands and WebScraping  
  - Exposes Spotify through a WebSocket server  
  - Receives commands from the app and updates the state in real-time  

---

## 🚀 Installation & Usage

### 1 Requirements
- [Node.js](https://nodejs.org/)  
- [Spicetify](https://github.com/spicetify/spicetify-cli) installed and configured  
- Spotify Desktop installed

### 2 Start the Python Server
```bash
import asyncio
import json
import websockets
import subprocess

clients = []

# Stato handshake: [appMobile, Spotify]
handshake = [0, 0]
handshake_completed = False  # Nuova variabile per evitare messaggi infiniti

def handle_open_app(app_name):
    match app_name.lower():
        case "steam":
            subprocess.Popen("C:\\Program Files (x86)\\Steam\\Steam.exe")
        case "vscode":
            subprocess.Popen("C:\\Users\\tambu\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe")
        case "chatgpt":
            subprocess.Popen(["C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", "https://chatgpt.com/"])
        case "streamingcommunity":
            subprocess.Popen(["C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", "https://streamingcommunity.lu/"])
        case "youtube":
            subprocess.Popen(["C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", "https://www.youtube.com/"])
        case _:
            print(f"App {app_name} non riconosciuta")

def handle_desktop_commands(data):
    command = data.get("command")
    if command == "OPEN-APP":
        app_name = data.get("app")
        if app_name:
            handle_open_app(app_name)

async def websocket_handler(websocket):
    """Gestisce la connessione WebSocket e inoltra i messaggi."""
    global handshake_completed
    clients.append(websocket)
    client_type = None  # "app" o "spotify"
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                print("Errore nel parsing del messaggio JSON:", message)
                continue

            msg_type = data.get("type")

            # Gestione comandi desktop
            if msg_type == "DESKTOP":
                handle_desktop_commands(data)

            # Handshake
            elif msg_type == "SPOTIFYCONTROLLERREADY":
                handshake[0] = 1
                client_type = "app"
                print("App mobile pronta")
            elif msg_type == "SPOTIFYREADY":
                handshake[1] = 1
                client_type = "spotify"
                print("Spotify pronto")

            # Se entrambi pronti e handshake non completato, invia BOTHREADY
            if handshake == [1, 1] and not handshake_completed:
                both_ready_msg = {"type": "BOTHREADY", "data": {"state": True}}
                await asyncio.gather(*[client.send(json.dumps(both_ready_msg)) for client in clients])
                handshake_completed = True
                print("Handshake completato, entrambi i client pronti")

            # Inoltra tutti gli altri messaggi ai client tranne chi li ha inviati
            elif msg_type not in ["SPOTIFYREADY", "SPOTIFYCONTROLLERREADY"]:
                for client in clients:
                    if client != websocket:
                        await client.send(message)

    except websockets.ConnectionClosed:
        print(f"Client disconnesso: {websocket.remote_address}")
    finally:
        clients.remove(websocket)
        # Aggiorna lo stato handshake se un client si disconnette
        if client_type == "app":
            handshake[0] = 0
            print("App mobile non pronta (disconnessa)")
        elif client_type == "spotify":
            handshake[1] = 0
            print("Spotify non pronto (disconnesso)")
        handshake_completed = False  # resetta handshake quando qualcuno si disconnette

async def main():
    """Avvia il server WebSocket"""
    server_app = await websockets.serve(websocket_handler, "0.0.0.0", 8765)
    server_spotify = await websockets.serve(websocket_handler, "0.0.0.0", 8766)
    print("WebSocket server avviato su porte 8765 (app) e 8766 (Spotify)")
    await asyncio.Future()  # Mantiene il server attivo

if __name__ == "__main__":
    asyncio.run(main())

```

### 3 Start the Spicetify script
The script starts automatically once properly added to Spicetify.

### 4 Start the React Native app
```bash
npm run start
```

Open the app on your device, update the IP address inside the Spicetify script with the address of the PC running Spotify.

Then apply the modification in the Spotify-Spicetify-Controller script:
```bash
spicetify apply
```

---

## 📱 Screenshots
![photo_2025-09-10_17-05-01](https://github.com/user-attachments/assets/29315abb-7111-480f-aed6-d8e62d778249)
<img width="1280" height="591" alt="image" src="https://github.com/user-attachments/assets/b5f0925c-1051-4745-8485-5e434021e4e0" />

---

## 👨‍💻 Author
Project developed by **[TambuDT](https://github.com/TambuDT)** 🚀
