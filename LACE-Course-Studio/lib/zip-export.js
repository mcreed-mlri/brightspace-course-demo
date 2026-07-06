/**
 * ZIP export for LACE course packages (requires JSZip global).
 */
(function (global) {
  async function downloadZip(files, zipName) {
    if (typeof JSZip === "undefined") {
      throw new Error("JSZip is not loaded.");
    }
    var zip = new JSZip();
    Object.keys(files).forEach(function (name) {
      zip.file(name, files[name]);
    });
    var blob = await zip.generateAsync({ type: "blob" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = zipName || "lace-course.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function filesFromFolderInput(fileList) {
    var files = {};
    Array.from(fileList || []).forEach(function (file) {
      files[file.name] = file;
    });
    return files;
  }

  async function readFolderAsTextMap(fileList) {
    var map = {};
    var files = Array.from(fileList || []);
    for (var i = 0; i < files.length; i++) {
      map[files[i].name] = await files[i].text();
    }
    return map;
  }

  global.LaceZipExport = {
    downloadZip: downloadZip,
    readFolderAsTextMap: readFolderAsTextMap,
    filesFromFolderInput: filesFromFolderInput
  };
})(typeof window !== "undefined" ? window : globalThis);
