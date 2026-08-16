# 🤖 AI Agent & Contributor Guidelines — Dynamic Lock

Ce document définit les règles d'architecture, les normes de sécurité et les listes de contrôle (checklists) que tout **agent IA** ou **contributeur** doit impérativement suivre lors du développement, de la modification ou de la préparation d'une release publique pour ce projet.

---

## 🛡️ Règle Fondamentale : Audit de Sécurité & Confidentialité Avant Push Public

Avant **TOUT** commit ou push sur un dépôt GitHub public :

1. **Zéro Donnée Sensible (Sanitization)** :
   - ❌ **Aucun code PIN / Mot de passe** (ne jamais coder de PIN en dur).
   - ❌ **Aucune adresse IP privée** (ex: `192.168.x.x`, `10.x.x.x`).
   - ❌ **Aucune adresse MAC personnelle en dur** (ex: laisser `device_mac: ""` par défaut pour que l'outil scanne automatiquement).
   - ❌ **Aucun chemin absolu personnel** (ex: `/home/username/`). Utiliser impérativement `$HOME`, `~`, `os.path.expanduser('~')`, `GLib.get_home_dir()` ou `%h` pour systemd.

2. **Nettoyage des Métadonnées & Fichiers Locaux** :
   - Vérifier que `.gitignore` exclut :
     - Les fichiers de configuration locaux (`config.json`).
     - Les fichiers de cache (`__pycache__/`, `.cache/`).
     - Les logs d'exécution (`*.log`).
     - Les clés ou jetons d'authentification.
   - Utiliser `git status` et `git diff` pour inspecter chaque ligne modifiée avant de commiter.

3. **Commande de vérification rapide avant commit** :
   ```bash
   # Vérifier l'absence de chemins personnels ou secrets
   git diff | grep -E "(/home/|PIN|password|secret|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})"
   ```

---

## 🏗️ Architecture du Projet

Le projet est conçu de manière modulaire en 4 couches indépendantes et interconnectées :

```
dynamic-lock/
├── AGENT.md               # Directives de sécurité et d'architecture pour agents IA
├── README.md              # Documentation utilisateur & badges
├── LICENSE                # Licence MIT
├── install.sh             # Script d'installation automatique en 1 clic
├── uninstall.sh           # Script de désinstallation propre
├── bin/
│   ├── dynamic-lock       # Démon d'arrière-plan (Surveillance RSSI + Smart Cooldown)
│   └── dynamic-lock-gui   # Application GTK3 moderne avec synchronisation thème
├── desktop/
│   ├── dynamic-lock.desktop # Entrée de menu / Dock
│   └── dynamic-lock.svg   # Icône vectorielle moderne (Squircle GNOME style)
├── extension/
│   ├── extension.js       # Extension GNOME Shell native (Barre supérieure)
│   ├── metadata.json      # Métadonnées de compatibilité GNOME (42 à 47)
│   └── stylesheet.css     # Styles CSS natifs du panneau
└── systemd/
    └── dynamic-lock.service # Unité de service systemd utilisateur (%h/.local/bin)
```

---

## ⚙️ Normes de Développement & Bonnes Pratiques

### 1. Démon (`bin/dynamic-lock`)
* **Consommation minimale** : Ne jamais faire de boucles actives (`busy wait`). Toujours utiliser `time.sleep()`.
* **Smart Cooldown (Anti-boucle)** : Si l'utilisateur déverrouille manuellement la session alors que le périphérique est déconnecté/éteint, respecter impérativement un délai de grâce (`unlock_grace_period`) avant de reverrouiller.
* **Résilience** : En cas d'erreur de lecture Bluetooth ou de périphérique temporairement indisponible, gérer les exceptions proprement sans crasher le démon.

### 2. Interface Graphique (`bin/dynamic-lock-gui`)
* **GTK 3 & Libadwaita Style** : Respecter les guidelines d'interface GNOME (HeaderBar, Cards/Frames avec marges et séparateurs propres).
* **Thème dynamique** : Écouter en temps réel les changements de `org.gnome.desktop.interface` (`color-scheme` et `gtk-theme`) pour adapter instantanément l'apparence sombre/claire.
* **Sauvegarde non-bloquante** : Les modifications de curseurs doivent mettre à jour `~/.config/dynamic-lock/config.json` de manière transparente et immédiate.

### 3. Extension GNOME (`extension/`)
* **Compatibilité multi-versions** : Support des versions GNOME Shell de **42** (Pop!_OS 22.04 LTS) jusqu'aux versions récentes (**45-47**).
* **Nettoyage strict à la désactivation** : Dans `disable()` et `destroy()`, veiller à supprimer tous les `timeout_add` (`GLib.source_remove`) et les signaux DBus souscrits pour éviter les fuites de mémoire.

---

## 🧪 Checklist de Validation Avant Release

- [ ] L'application se lance sans erreur via `dynamic-lock-gui`.
- [ ] Le démon tourne proprement sous `systemctl --user status dynamic-lock.service`.
- [ ] L'extension s'affiche sans erreur dans la barre supérieure de GNOME Shell.
- [ ] La jauge de signal en direct s'actualise correctement.
- [ ] Les profils prédéfinis (*Bureau Strict*, *Pièce/Confort*, *Sortie*) s'appliquent immédiatement.
- [ ] Aucun chemin en dur `/home/username/` ni donnée personnelle n'est présent dans le code commité.
