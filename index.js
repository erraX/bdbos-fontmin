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
    if (!this._plugins.length && plugin.toLowerCase() !== 'fontmin') {
        throw 'fontmin must be register firstly!';
    }
};

BosFontmin.prototype.findPluginByName = function (plugin) {
    var Plugin;

    this._plugins.forEach(function (target) {
        if (target.name === plugin) {
            Plugin = target.plugin
        }
    });

    return Plugin;
};

BosFontmin.prototype._resolvePlugin = function (plugin) {
    if (utils.isString(plugin)) {
        return PLUGIN_MAP[plugin.toLowerCase()];
    }
    else if (utils.isFunction(plugin)) {
        return plugin;
    }
};

BosFontmin.prototype._resolvePluginName = function (plugin) {
    if (utils.isString(plugin)) {
        return plugin.toLowerCase();
    }
    else if (utils.isFunction(plugin)) {
        return plugin.name || 'Plugin';
    }
};

BosFontmin.prototype.register = function (plugin, config) {
    var Plugin = this._resolvePlugin(plugin);

    if (!Plugin) {
        return;
    }

    this._validatePluginStream(plugin);

    this._plugins.push({
        name: this._resolvePluginName(plugin),
        plugin: new Plugin(config)
    });

    return this;
};

BosFontmin.prototype.listFonts = function () {
    return this.findPluginByName('bos').listObjects();
};

BosFontmin.prototype.deleteFonts = function (files) {
    return this.findPluginByName('bos').deleteObject(files);
};

BosFontmin.prototype.run = function () {
    var fontmin = this._plugins[0].plugin;

    return this._plugins.slice(1).reduce(function (chain, target) {
        return chain.then(target.plugin.run.bind(target.plugin));
    }, fontmin.run());
};

module.exports = BosFontmin;
