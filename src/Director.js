var THREEx	= THREEx || {};

/**
 * Director
 * @author Frederico Gonçalves // github.com/freddykrunn
 */
THREEx.Director = function ( transitionDelay, aspect, near, far ) {
    var transitionDelay = transitionDelay;

    var cameras = [];
    var currentCameraIndex = 0;
    var changingCamera = false;

    var transitionPane = document.querySelector(".transition-black-pane");
    transitionPane.className = "transition-black-pane off";

    // camera
    this.camera = new THREE.PerspectiveCamera( 50, aspect, near, far );
    this.camera.position.set(0,0,0);

    /**
     * Add camera
     */
    this.addCamera = function(position, lookAt, freeLooking) {
        cameras.push({
            position: position,
            lookAt: lookAt,
            freeLooking: freeLooking
        });

        this.setCamera();
    }

    /**
     * Next camera
     */
    this.nextCamera = function() {
        if (changingCamera) {
            return;
        }
        currentCameraIndex++;
        currentCameraIndex = currentCameraIndex >= cameras.length ? 0 : currentCameraIndex;
        this.setCamera();
    }

    /**
     * Previous camera
     */
    this.previousCamera = function() {
        if (changingCamera) {
            return;
        }
        currentCameraIndex--;
        currentCameraIndex = currentCameraIndex < 0 ? cameras.length - 1 : currentCameraIndex;
        this.setCamera();
    }

    /**
     * Set camera
     */
    this.setCamera = function() {
        const currentCamera = cameras[currentCameraIndex];

        transitionPane.className = "transition-black-pane on";

        changingCamera = true;
        setTimeout(() => {
            // set camera position and look at
            this.camera.position.copy(currentCamera.position);
            this.camera.lookAt(currentCamera.lookAt);

            transitionPane.className = "transition-black-pane off";
            setTimeout(() => {
                changingCamera = false;
            }, 500);
        }, 500);
    }

    /**
     * Update aspect
     */
    this.updateAspect = function(aspect) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }
};
THREEx.Director.prototype = Object.create( Object.prototype );
THREEx.Director.prototype.constructor = THREEx.Director;