var utils = require('./lib/utils');
var FontminRunner = require('./lib/FontminRunner');
var BosUploader = require('./lib/BosUploader');
var CssProcessor = require('./lib/CssProcessor');

var PLUGIN_MAP = {
    fontmin : FontminRunner,
    bos     : BosUploader,
    css     : CssProcessor
};

function BosFontmin() {
    this._plugins = [];
}

BosFontmin.prototype._validatePluginStream = function (plugin) {
    if (!this._plugins.length && plugin !== 'fontmin') {
        throw 'fontmin must be register firstly!';
    }
};

BosFontmin.prototype.register = function (plugin, config) {
    if (!plugin || !utils.isString(plugin)) {
        return;
    }

    plugin = plugin.toLowerCase();
    var Plugin = PLUGIN_MAP[plugin];

    if (!Plugin) {
        return;
    }

    this._validatePluginStream(plugin);

    this._plugins.push({
        name: plugin,
        plugin: new Plugin(config)
    });
};

BosFontmin.prototype.run = function () {
    var fontmin = this._plugins[0].plugin;

    return this._plugins.slice(1).reduce(function (chain, target) {
        return chain.then(target.plugin.run.bind(target.plugin));
    }, fontmin.run());
};

module.exports = BosFontmin;
