#!/bin/bash
set -e

echo "=== Installation de Dynamic Lock pour Linux ==="

# Directories
mkdir -p ~/.local/bin
mkdir -p ~/.local/share/applications
mkdir -p ~/.local/share/icons/hicolor/scalable/apps
mkdir -p ~/.local/share/gnome-shell/extensions/dynamic-lock@adilelguennouni
mkdir -p ~/.config/systemd/user
mkdir -p ~/.config/dynamic-lock

# 1. Install binaries
cp bin/dynamic-lock ~/.local/bin/
cp bin/dynamic-lock-gui ~/.local/bin/
chmod +x ~/.local/bin/dynamic-lock ~/.local/bin/dynamic-lock-gui

# 2. Install icon
cp desktop/dynamic-lock.svg ~/.local/share/icons/hicolor/scalable/apps/

# 3. Install desktop launcher
cp desktop/dynamic-lock.desktop ~/.local/share/applications/
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true

# 4. Install GNOME Shell Extension
cp -r extension/* ~/.local/share/gnome-shell/extensions/dynamic-lock@adilelguennouni/

# 5. Install and enable systemd user service
cp systemd/dynamic-lock.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now dynamic-lock.service

echo ""
echo "✅ Installation réussie !"
echo "👉 Activez l'extension 'Dynamic Lock Indicator' et lancez 'dynamic-lock-gui' !"
