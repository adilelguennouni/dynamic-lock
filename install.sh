#!/bin/bash
set -e

echo "=== Installation de Dynamic Lock pour Linux ==="

# Directories
mkdir -p ~/.local/bin
mkdir -p ~/.local/share/applications
mkdir -p ~/.config/systemd/user
mkdir -p ~/.config/dynamic-lock

# Install binaries
cp bin/dynamic-lock ~/.local/bin/
cp bin/dynamic-lock-gui ~/.local/bin/
chmod +x ~/.local/bin/dynamic-lock ~/.local/bin/dynamic-lock-gui

# Install desktop launcher
cp desktop/dynamic-lock.desktop ~/.local/share/applications/
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true

# Install and enable systemd user service
cp systemd/dynamic-lock.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now dynamic-lock.service

echo ""
echo "✅ Installation réussie !"
echo "👉 Lancez 'dynamic-lock-gui' ou ouvrez 'Verrouillage Dynamique' depuis vos applications."
