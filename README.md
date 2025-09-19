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

def handle_open_app(app_name):
    match app_name:
        case "Steam":
            subprocess.Popen("C:\\Program Files (x86)\\Steam\\Steam.exe")
        case _:
            print(f"App {app_name} non riconosciuta")

def handle_desktop_commands(data):
    command = data.get("command")
    
    match command:
        case "OPEN-APP":
            app_name = data.get("app")
            if app_name:
                handle_open_app(app_name)
        case "Python":
            print("You can become a Data Scientist")

async def websocket_handler(websocket):
    """Gestisce la connessione WebSocket e inoltra i messaggi."""
    clients.append(websocket)
    try:
        async for message in websocket:
            print(f"Messaggio ricevuto: {message}")
            try:
                data = json.loads(message)  # Converte la stringa JSON in dizionario
                if data.get("type") == "DESKTOP":
                    handle_desktop_commands(data)
                else:
                    # Invia il messaggio a tutti gli altri client connessi
                    for client in clients:
                        if client != websocket:
                            await client.send(message)
            except json.JSONDecodeError:
                print("Errore nel parsing del messaggio JSON")
    except websockets.ConnectionClosed:
        print("Client disconnesso")
    finally:
        clients.remove(websocket)

async def main():
    """Avvia il server WebSocket"""
    html_server = await websockets.serve(websocket_handler, "0.0.0.0", 8765)
    spicetify_server = await websockets.serve(websocket_handler, "0.0.0.0", 8766)

    print("WebSocket server avviato su 8765 e 8766")
    await asyncio.Future()  # Mantiene il server attivo

# Esegui il server WebSocket
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
