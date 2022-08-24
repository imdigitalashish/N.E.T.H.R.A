class Nethra {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.videoElem = document.querySelector("video");

        this.canvas.style.position = "absolute";


        navigator.mediaDevices.getUserMedia({ video: true })
            .then(this.handleCameraFeed)


        this.prepareTheScreen();

    }

    startLabellingModel() {}

    handleCameraFeed = (stream) => {
        this.videoElem.srcObject = stream;
        this.canvas.style.opacity = "1";
        setTimeout(() => {
            this.makeSetup();


        }, 2600);
    }

    makeSetup() {

        this.canvas.height = this.videoElem.videoHeight;
        this.canvas.width = this.videoElem.videoWidth;



        document.querySelector("#AiFrame").style.display = "inline";

        requestAnimationFrame(this.render.bind(this))

    }

    render(ts) {
        /** Setting up the frame */
        let canvasPos = this.canvas.getBoundingClientRect();
        let frame = document.querySelector("#AiFrame");
        frame.style.left = canvasPos.left - 50 + "px";
        frame.style.top = canvasPos.top - 60 + "px";
        frame.style.width = this.canvas.width + 90 + "px";
        frame.style.height = this.canvas.height + 90 + "px";

        this.ctx.drawImage(this.videoElem, 0, 0, this.videoElem.videoWidth, this.videoElem.videoHeight);
        requestAnimationFrame(this.render.bind(this));
    }

    prepareTheScreen() {
        setTimeout(() => {
            document.querySelector(".introScreen").style.display = 'none';

            this.canvas.style.display = "flex";
        }, 3000)
    }


    getPointerPosition = (x, y) => {
        let canvasPos = this.canvas.getBoundingClientRect();
        let currentXAndY = {
            x: x - canvasPos.x,
            y: y - canvasPos.y
        }
        return currentXAndY;
    }


}


async function main() {
    await faceapi.nets.faceRecognitionNet.loadFromUri('/web/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/web/models');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/web/models');
    window.nethra = new Nethra();
}

window.onload = () => {
    main();
}

let eelRunning = false;

if (eelRunning) {

    eel.returnResponse()((res) => {
        console.log(res);
    })
}
