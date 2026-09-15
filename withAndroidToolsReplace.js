const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAndroidToolsReplace(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Adiciona o namespace tools se não existir
    if (!androidManifest.manifest["$"]["xmlns:tools"]) {
      androidManifest.manifest["$"]["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    // Garante que <application> possua o atributo tools:replace
    const application = androidManifest.manifest.application[0];
    const existingReplace = application["$"]["tools:replace"] || "";

    const replaces = existingReplace ? existingReplace.split(",") : [];
    if (!replaces.includes("android:allowBackup")) {
      replaces.push("android:allowBackup");
    }

    application["$"]["tools:replace"] = replaces.join(",");

    return config;
  });
};
