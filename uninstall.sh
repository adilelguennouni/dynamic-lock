#!/bin/bash
echo "=== Désinstallation de Dynamic Lock ==="

systemctl --user stop dynamic-lock.service 2>/dev/null || true
systemctl --user disable dynamic-lock.service 2>/dev/null || true
rm -f ~/.config/systemd/user/dynamic-lock.service
systemctl --user daemon-reload 2>/dev/null || true

rm -f ~/.local/bin/dynamic-lock ~/.local/bin/dynamic-lock-gui
rm -f ~/.local/share/applications/dynamic-lock.desktop
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true

echo "✅ Désinstallation terminée."
