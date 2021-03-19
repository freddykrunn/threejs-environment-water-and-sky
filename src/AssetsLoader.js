var THREEx	= THREEx || {};

THREEx.AssetType = {
    Scene3D: 0,
    Texture: 1,
    JSON: 2,
    0: "Scene3D",
    1: "Texture",
    2: "JSON"
}

/**
 * AssetsLoader
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.AssetsLoader = function() {

    this.loading = false;
    this.assets = {};
    this.loaders = {
        [THREEx.AssetType.Scene3D]: new THREEx.SceneFileLoader(THREEx.AssetType.Scene3D),
        [THREEx.AssetType.Texture]: new THREEx.TextureFileLoader(THREEx.AssetType.Texture),
        [THREEx.AssetType.JSON]: new THREEx.JSONFileLoader(THREEx.AssetType.JSON)
    };

    /**
     * Update progress
     * @param {number} objectsLoaded 
     * @param {number} objectsCount 
     * @param {function} onUpdate 
     * @param {function} onFinish 
     */
    this.updateProgress = function(objectsLoaded, objectsCount, onUpdate, onFinish) {
        if (onUpdate) {
            onUpdate(Math.round((objectsLoaded / objectsCount) * 100));
        }
        if (objectsLoaded === objectsCount) {
            this.loading = false;
            if (onFinish) {
                onFinish();
            }
        }
    };

    /**
     * Loas assets
     * @param {number} index 
     * @param {string} assetNames 
     */
    this.loadAsset = function(index, assets, assetNames, onUpdate, onFinish, onError) {
        if (this.loading === true) {
            if (index === assetNames.length) {
                return;
            } else {
                const asset = assets[assetNames[index]];
                // choose loader
                const loader = this.loaders[asset.type];
                if (loader != null) {
                    // load and store asset content
                    loader.load(asset.path, 
                    (content) => {
                        asset.content = content;
                        asset.loaded = true;
                        this.updateProgress(index+1, assetNames.length, onUpdate, onFinish);
                        this.loadAsset(index+1, assets, assetNames, onUpdate, onFinish, onError);
                    }, (error) => {
                        if (error && onError) {
                            onError("ERROR :: Loading asset '"+asset.path+"' of type '"+THREEx.AssetType[asset.type]+"' :: " + error);
                        }
                        this.updateProgress(index+1, assetNames.length, onUpdate, onFinish);
                        this.loadAsset(index+1, assets, assetNames, onUpdate, onFinish, onError);
                    });
                } else {
                    // file not supported
                    if (onError != null) {
                        onError("ERROR :: Loading asset '"+asset.path+"' of type '"+THREEx.AssetType[asset.type]+"' :: Asset Type not supported!");
                    }
                    this.updateProgress(index+1, assetNames.length, onUpdate, onFinish);
                    this.loadAsset(index+1, assets, assetNames, onUpdate, onFinish, onError);
                }
            }
        }
    };

    //#region public methods

    /**
     * Is loading
     */
    this.isLoading = function() {
        return this.loading;
    }

    /**
     * Add assset to load
     * @param {string} name 
     * @param {AssetType} type 
     * @param {string} path 
     */
    this.add = function(name, type, path) {
        this.assets[name] = {
            type: type,
            path: path,
            loaded: false,
            content: null
        }
    }

    /**
     * Remove asset
     * @param {string} name 
     */
    this.remove = function(name) {
        this.assets[name] = undefined;
    }

    /**
     * Get asset
     * @param {string} name 
     */
    this.get = function(name) {
        if (this.assets[name] != null && this.assets[name].loaded == true) {
            return this.assets[name].content;
        } else {
            return null;
        }
    }

    /**
     * Unload asset
     * @param {string} name 
     */
    this.unload = function(name) {
        this.assets[name].loaded = false;
        this.assets[name].content = undefined;
    }

    /**
     * Unload all assets
     */
    this.unloadAll = function() {
        for (const name in this.assets) {
            this.assets[name].loaded = false;
            this.assets[name].content = undefined;
        }
    }

    /**
     * Clear all assets
     */
    this.clear = function() {
        this.assets = {}
    }

    /**
     * Load a single asset
     */
    this.load = function(name, onFinish, onError) {
        this.loading = true;
        const asset = this.assets[name];
        if (asset.loaded === true) {
            this.updateProgress(1, 1, () => {}, onFinish);
        } else {
            this.loadAsset(0, this.assets, [name], null, onFinish, onError);
        }
    }

    /**
     * Load all assets unloaded
     * @param {function} onUpdate 
     * @param {function} onFinish 
     * @param {function} onError
     */
    this.loadAll = function(onUpdate, onFinish, onError) {
        this.loading = true;
        const assetNames = Object.keys(this.assets);

        // get assets to load
        const assetNamesToLoad = []
        for (const name in this.assets) {
            if (this.assets[name].loaded === false && this.assets[name].content == null) {
                assetNamesToLoad.push(name);
            }
        }

        // load assets
        if(assetNamesToLoad == 0) {
            this.updateProgress(1,1,onUpdate,onFinish);
        } else {
            this.loadAsset(0, this.assets, assetNamesToLoad, onUpdate, onFinish, onError);
        }
    }

    //#endregion
}
THREEx.AssetsLoader.prototype = Object.create( Object.prototype );
THREEx.AssetsLoader.prototype.constructor = THREEx.AssetsLoader;

/**
 * File Loader
 */
THREEx.FileLoader = function(type) {
    this.type = type;

    this.load = function(path, onFinish, onError) {
    }
}
THREEx.FileLoader.prototype = Object.create( Object.prototype );
THREEx.FileLoader.prototype.constructor = THREEx.FileLoader;

/**
 * Scene File Loader
 */
THREEx.SceneFileLoader = function(type) {
    THREEx.FileLoader.call( this, type );
    this.loader = new THREE.ObjectLoader();

    /**
     * Load
     * @param {string} path 
     * @param {function} onFinish 
     * @param {function} onError 
     */
    this.load = function(path, onFinish, onError) {
        // load an OBJ mesh
        this.loader.load(
            // resource URL
            path,
            // called when resource is loaded
            ( scene ) => {
                onFinish(scene);
            },
            undefined,
            // called when loading has errors
            onError
        );
    }
}
THREEx.SceneFileLoader.prototype = Object.create( THREEx.FileLoader );
THREEx.SceneFileLoader.prototype.constructor = THREEx.SceneFileLoader;

/**
 * Texture file Loader
 */
THREEx.TextureFileLoader = function(type) {
    THREEx.FileLoader.call( this, type );
    this.loader = new THREE.TextureLoader();

    /**
     * Load
     * @param {string} path 
     * @param {function} onFinish 
     * @param {function} onError 
     */
    this.load = function(path, onFinish, onError) {
        // load a texture
        this.loader.load(
            // resource URL
            path,
            // called when resource is loaded
            ( object ) => {
                onFinish(object);
            },
            undefined,
            // called when loading has errors
            onError
        );
    }
}
THREEx.TextureFileLoader.prototype = Object.create( THREEx.FileLoader );
THREEx.TextureFileLoader.prototype.constructor = THREEx.TextureFileLoader;

/**
 * JSON file Loader
 */
THREEx.JSONFileLoader = function(type) {
    THREEx.FileLoader.call( this, type );

    /**
     * Load
     * @param {string} path 
     * @param {function} onFinish 
     * @param {function} onError 
     */
    this.load = function(path, onFinish, onError) {
        var http = new XMLHttpRequest();
        http.overrideMimeType("application/json");
        http.open('GET', path, true);
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == "200") {
                try {
                    var json = JSON.parse(http.responseText);
                    onFinish(json);
                } catch(ex) {
                    onError("File is corrupted")
                }
            }
        };
        http.onerror = function(xres, err) {
            onError(err);
        };
        http.send(null); 
    }
}
THREEx.JSONFileLoader.prototype = Object.create( THREEx.FileLoader );
THREEx.JSONFileLoader.prototype.constructor = THREEx.JSONFileLoader;