function AssetCopy() {
 
}
 
AssetCopy.prototype.copy = function(asset, target, overwrite, win, fail) {
	if(overwrite==false) overwrite="false";
	else overwrite="true";
	PhoneGap.exec(win, fail, "AssetCopy", "copy", [asset, target, overwrite]);
};
 
PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin("assetcopy", new AssetCopy());
	PluginManager.addService("AssetCopy","pl.org.nowoczesnapolska.wlmobi.AssetCopy");
});