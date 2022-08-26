class Nethra {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.videoElem = document.querySelector("video");

        this.canvas.style.position = "absolute";


        navigator.mediaDevices.getUserMedia({ video: true })
            .then(this.handleCameraFeed)


        this.prepareTheScreen();
        this.startLabellingModel();

        this.currentFace = "";

    }

    writer(text) {
        document.querySelector("#writerBuffer").innerHTML = text
    }

    labaledFaceDescriptor = "";
    faceMatcher = "";
    faceDetectorReady = false

    async startLabellingModel() {
        this.writer("Started Labelling")
        this.labaledFaceDescriptor = await this.loadLabledImages();
        this.faceMatcher = new faceapi.FaceMatcher(this.labaledFaceDescriptor, 0.6);
        this.faceDetectorReady = true;

        console.log(this.labaledFaceDescriptor);
        this.writer("Labelling Done.. Starting Camera")

    }


    loadLabledImages() {
        const labels = ["1140", "1141"];
        return Promise.all(
            labels.map(async label => {
                const decriptions = []
                for (let i = 1; i <= 2; i++) {
                    const img = await faceapi.fetchImage(`/labels/${label}/${i}.jpg`);
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    decriptions.push(detections.descriptor)
                }

                return new faceapi.LabeledFaceDescriptors(label, decriptions)
            })
        )
    }

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

        if (this.faceDetectorReady) {
            this.startDetecting();
        }

        this.ctx.drawImage(this.videoElem, 0, 0, this.videoElem.videoWidth, this.videoElem.videoHeight);
        this.ctx.strokeStyle = this.currentFace === "" ? "red" : "blue";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath()
        this.ctx.rect(this.detectionBox.x, this.detectionBox.y, this.detectionBox.width, this.detectionBox.heigh);
        this.ctx.stroke();


        requestAnimationFrame(this.render.bind(this));
    }

    detectionBox = {
        x: 0,
        y: 0,
        width: 0,
        heigh: 0,
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async startDetecting() {
        let image = new Image();
        image.src = this.canvas.toDataURL();

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

        if (detections.length != 0) {
            let box = detections[0].detection.box
            this.detectionBox.x = box._x;
            this.detectionBox.y = box._y;
            this.detectionBox.heigh = box._height;
            this.detectionBox.width = box.width;
            let result = detections.map(d => this.faceMatcher.findBestMatch(d.descriptor));
            result = result.toString().split(" ")[0];
            if (result.toString() === "unknown") {
                this.currentFace = "";
                this.writer("UNKOWN PERSON")
            }
            if (result.toString() != "unknown" && this.currentFace != result.toString()) {
                console.log(result.toString());
                this.currentFace = result.toString();
                eel.addThisFaceToCSV(this.currentFace)((res) => {
                    console.log(res);
                    let imageChar = `${res.name}  <br> Class: ${res.class} <br> Roll no ${res.roll_no}`
                    this.writer(this.capitalizeFirstLetter(imageChar))
                })
            }
        }

    }

    prepareTheScreen() {
        setTimeout(() => {
            // document.querySelector(".introScreen").style.display = 'none';

            this.canvas.style.display = "flex";
        }, 3600)
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
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    window.nethra = new Nethra();
}

window.onload = () => {
    setTimeout(() => {
        main();

    }, 1000)
}

let eelRunning = false;

if (eelRunning) {

    eel.returnResponse()((res) => {
        console.log(res);
    })
}
