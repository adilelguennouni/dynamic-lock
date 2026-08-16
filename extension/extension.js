/*
 * Dynamic Lock Indicator - GNOME Shell Extension
 * Native Pop!_OS / GNOME Top Bar Menu for Bluetooth Proximity Lock
 */

const { GObject, St, Clutter, GLib, Gio } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const CONFIG_PATH = GLib.build_filenamev([GLib.get_home_dir(), '.config', 'dynamic-lock', 'config.json']);

const PRESETS = {
    'strict': { name: '🎯 Bureau Strict (0-1m)', lq: 95, rssi: -2, delay: 1.0 },
    'comfort': { name: '🛋️ Pièce / Confort (2-3m)', lq: 80, rssi: -6, delay: 2.5 },
    'exit': { name: '🚪 Sortie de Pièce (+4m)', lq: 60, rssi: -12, delay: 4.0 },
    'custom': { name: '🎛️ Personnalisé', lq: null, rssi: null, delay: null }
};

const DynamicLockMenu = GObject.registerClass(
class DynamicLockMenu extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Dynamic Lock Indicator', false);

        // Top bar icon
        this._icon = new St.Icon({
            icon_name: 'system-lock-screen-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        this._config = this._loadConfig();
        this._buildMenu();

        // Timer for periodic telemetry updates
        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
            this._updateTelemetry();
            return GLib.SOURCE_CONTINUE;
        });

        this._updateTelemetry();
    }

    _loadConfig() {
        try {
            if (GLib.file_test(CONFIG_PATH, GLib.FileTest.EXISTS)) {
                let [ok, contents] = GLib.file_get_contents(CONFIG_PATH);
                if (ok) {
                    return JSON.parse(imports.byteArray.toString(contents));
                }
            }
        } catch (e) {
            log('Error loading dynamic-lock config: ' + e);
        }
        return {
            enabled: true,
            preset: 'strict',
            device_mac: '3C:B0:ED:DC:A2:39',
            device_name: 'Nothing Phone (3)',
            lq_threshold: 95,
            delay_seconds: 1.0
        };
    }

    _saveConfig() {
        try {
            let dir = GLib.build_filenamev([GLib.get_home_dir(), '.config', 'dynamic-lock']);
            GLib.mkdir_with_parents(dir, 0o755);
            GLib.file_set_contents(CONFIG_PATH, JSON.stringify(this._config, null, 2));
        } catch (e) {
            log('Error saving dynamic-lock config: ' + e);
        }
    }

    _buildMenu() {
        this.menu.removeAll();

        // 1. Device Info Header
        this._deviceHeaderItem = new PopupMenu.PopupMenuItem(
            this._config.device_name || 'Appareil Bluetooth',
            { reactive: false, style_class: 'popup-subtitle-menu-item' }
        );
        this.menu.addMenuItem(this._deviceHeaderItem);

        // 2. Telemetry & Battery row
        this._telemetryItem = new PopupMenu.PopupMenuItem('📡 Signal: -- | 🔋 Batterie: --', { reactive: false });
        this.menu.addMenuItem(this._telemetryItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 3. Switch ON / OFF
        this._switchItem = new PopupMenu.PopupSwitchMenuItem('Verrouillage actif', this._config.enabled !== false);
        this._switchItem.connect('toggled', (item, state) => {
            this._config.enabled = state;
            this._saveConfig();
            this._updateIconState();
        });
        this.menu.addMenuItem(this._switchItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 4. Proximity Presets Submenu
        this._presetSubMenu = new PopupMenu.PopupSubMenuMenuItem('Bande de sensibilité');
        let currentPreset = this._config.preset || 'strict';

        this._presetItems = {};
        for (let key in PRESETS) {
            let pinfo = PRESETS[key];
            let item = new PopupMenu.PopupMenuItem(pinfo.name);
            if (key === currentPreset) {
                item.setOrnament(PopupMenu.Ornament.DOT);
            }
            item.connect('activate', () => {
                this._selectPreset(key);
            });
            this._presetItems[key] = item;
            this._presetSubMenu.menu.addMenuItem(item);
        }
        this.menu.addMenuItem(this._presetSubMenu);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // 5. Actions: Open GUI & Lock Now
        let lockItem = new PopupMenu.PopupMenuItem('🔒 Verrouiller la session maintenant');
        lockItem.connect('activate', () => {
            try {
                GLib.spawn_command_line_async('loginctl lock-session');
            } catch (e) {}
        });
        this.menu.addMenuItem(lockItem);

        let settingsItem = new PopupMenu.PopupMenuItem('⚙️ Réglages complets...');
        settingsItem.connect('activate', () => {
            try {
                GLib.spawn_command_line_async('/home/adil/.local/bin/dynamic-lock-gui');
            } catch (e) {}
        });
        this.menu.addMenuItem(settingsItem);
    }

    _selectPreset(presetKey) {
        this._config.preset = presetKey;
        if (presetKey !== 'custom' && PRESETS[presetKey]) {
            let p = PRESETS[presetKey];
            this._config.lq_threshold = p.lq;
            this._config.rssi_threshold = p.rssi;
            this._config.delay_seconds = p.delay;
        }
        this._saveConfig();

        for (let k in this._presetItems) {
            this._presetItems[k].setOrnament(k === presetKey ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
        }
    }

    _updateTelemetry() {
        this._config = this._loadConfig();

        let mac = this._config.device_mac;
        if (!mac) return;

        let devName = this._config.device_name || 'Appareil Bluetooth';
        this._deviceHeaderItem.label.text = `📱 ${devName}`;

        // Get signal metrics
        let lq = null;
        let rssi = null;
        let connected = false;

        try {
            let [ok, out] = GLib.spawn_command_line_sync(`bluetoothctl info ${mac}`);
            if (ok) {
                let s = imports.byteArray.toString(out);
                connected = s.includes('Connected: yes');
            }
        } catch (e) {}

        if (connected) {
            try {
                let [ok, out] = GLib.spawn_command_line_sync(`hcitool lq ${mac}`);
                if (ok) {
                    let s = imports.byteArray.toString(out);
                    if (s.includes('Link quality:')) {
                        lq = parseInt(s.split(':')[1].trim());
                    }
                }
            } catch (e) {}

            try {
                let [ok, out] = GLib.spawn_command_line_sync(`hcitool rssi ${mac}`);
                if (ok) {
                    let s = imports.byteArray.toString(out);
                    if (s.includes('RSSI return value:')) {
                        rssi = parseInt(s.split(':')[1].trim());
                    }
                }
            } catch (e) {}
        }

        // Get battery level (via adb or bluez)
        let batteryStr = '--';
        try {
            let [ok, out] = GLib.spawn_command_line_sync('adb shell dumpsys battery');
            if (ok) {
                let s = imports.byteArray.toString(out);
                let match = s.match(/level:\s*(\d+)/i);
                if (match) {
                    batteryStr = `${match[1]}%`;
                }
            }
        } catch (e) {}

        if (!connected) {
            this._telemetryItem.label.text = `📡 Hors de portée | 🔋 ${batteryStr}`;
        } else if (lq !== null) {
            let rssiStr = rssi !== null ? `${rssi} dBm` : '';
            this._telemetryItem.label.text = `📡 ${lq}% (${rssiStr}) | 🔋 ${batteryStr}`;
        } else {
            this._telemetryItem.label.text = `📡 Connecté | 🔋 ${batteryStr}`;
        }

        this._updateIconState(connected);
    }

    _updateIconState(connected) {
        if (!this._config.enabled) {
            this._icon.opacity = 120;
        } else {
            this._icon.opacity = 255;
        }
    }

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
        super.destroy();
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new DynamicLockMenu();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
