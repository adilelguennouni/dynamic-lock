# 🔒 Dynamic Lock (Verrouillage Dynamique Bluetooth)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux%20%2F%20GNOME%20%2F%20Pop!__OS-orange.svg)]()
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-brightgreen.svg)]()
[![UI: GTK3](https://img.shields.io/badge/UI-GTK%203%20%2F%20Libadwaita%20Style-purple.svg)]()

Un équivalent moderne, ultra-réactif et open source de **Windows Hello Dynamic Lock** pour Linux (**GNOME, Pop!_OS, Ubuntu, Debian, Fedora**).

Il surveille en temps réel le signal Bluetooth (RSSI et Link Quality) de votre smartphone, montre connectée ou écouteurs, et **verrouille automatiquement votre session dès que vous vous éloignez de votre bureau**.

---

## ✨ Fonctionnalités

* 📱 **Sélection de n'importe quel appareil Bluetooth** : Fonctionne avec smartphones (Android, iPhone), montres connectées ou écouteurs.
* 📡 **Moniteur de signal en direct** : Visualisation en temps réel de la puissance du signal (**RSSI en dBm** et **Qualité de liaison en %**).
* 🎚️ **Sensibilité personnalisable au millimètre** :
  * **Curseur de Distance / Sensibilité (Seuil %)** : De ultra-strict (verrouille dès les premiers pas) à tolérant (permet de bouger dans la pièce).
  * **Curseur de Délai (Secondes)** : De 0.5s à 8s pour une réaction instantanée.
* 🛡️ **Protection Anti-Boucle (*Smart Grace Period*)** : Si vous déverrouillez manuellement votre PC avec votre mot de passe alors que le téléphone est éteint ou hors ligne, le système vous accorde un délai de grâce pour travailler sans vous reverrouiller en boucle.
* 🌓 **Thème Sombre / Clair dynamique** : L'interface GTK s'adapte instantanément au thème du système.
* ⚡ **Ultra-léger & Économe en batterie** : 
  * Consomme **0% de CPU** en arrière-plan (~1.5 Mo de RAM).
  * Se met en veille automatique quand la session est déjà verrouillée.
  * Gestionnaire d'arrière-plan via `systemd --user`.

---

## 🚀 Installation rapide (1 clic)

```bash
git clone https://github.com/adilelguennouni/dynamic-lock.git
cd dynamic-lock
./install.sh
```

Lancez ensuite **« Verrouillage Dynamique »** depuis votre lanceur d'applications ou en tapant `dynamic-lock-gui` dans un terminal.

---

## ⚙️ Prérequis

* Linux avec environnement de bureau GNOME / Pop Shell / Freedesktop.
* Python 3 avec `python3-gi` (inclus par défaut sur Ubuntu / Pop!_OS / Debian / Fedora).
* `bluez` / `bluetoothctl` / `hcitool`.

---

## 📦 Désinstallation

```bash
./uninstall.sh
```

---

## 📄 Licence

Distribué sous licence **MIT**. Développé par [Adil El Guennouni](https://github.com/adilelguennouni).
