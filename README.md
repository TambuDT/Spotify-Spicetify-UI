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

### 1️⃣ Requirements
- [Node.js](https://nodejs.org/)  
- [Spicetify](https://github.com/spicetify/spicetify-cli) installed and configured  
- Spotify Desktop installed  

### 2️⃣ Start the Spicetify script
The script starts automatically once properly added to Spicetify.

### 3️⃣ Start the React Native app
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
---

## 👨‍💻 Author
Project developed by **[TambuDT](https://github.com/TambuDT)** 🚀
