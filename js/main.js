//Setting up three.js

var scene, camera, renderer, controls, frog, light, ambLight;
var div = document.querySelector("#game");

var level;
var lives;

//audio
var audio = document.createElement('audio');
var source = document.createElement('source');
source.src = "sounds/jump2.wav"
audio.appendChild(source);

var audio2 = document.createElement('audio');
var source2 = document.createElement('source');
source2.src = "sounds/victory.mp3"
audio2.appendChild(source2);

var splat = document.createElement('audio');
var splatSource = document.createElement('source');
splatSource.src = "sounds/splat1.mp3"
splat.appendChild(splatSource);

var background = document.createElement('audio');
var backgroundSource = document.createElement('source');
backgroundSource.src = "sounds/background.wav"
background.loop = true;
background.appendChild(backgroundSource);
background.play();

var waterSplash = document.createElement('audio');
var waterSplashSource = document.createElement('source');
waterSplashSource.src = "sounds/watersplash.WAV"
waterSplash.appendChild(waterSplashSource);


var score = 0;
var scoreDiv = document.querySelector("#score");

var flag = false;
var logZ;

var logSpeed = [ 0.06, -0.05, 0.04, -0.04];
var carSpeeds = [-0.05, 0.07, 0.03, -0.04];

//empty arrays
var cars = [];
var logs = [];
var offSet = -0.4;
var carPosition = [
    [-4, -0.5, -4],
    [0, -0.5, -4],
    [4, -0.5, -4],

    [3, -0.5, -3],
    [0, -0.5, -3],
    [-3, -0.5, -3],
    [-6, -0.5, -3],

    [-1, -0.5, -2],
    [3, -0.5, -2],
    [7, -0.5, -2],

    [-5, -0.5, -1],
    [-1, -0.5, -1],
    [3, -0.5, -1],
    [7, -0.5, -1]
];

//frog control
document.addEventListener("keyup", keyUp);
LEFT = 37;
UP = 38;         // Key   //
RIGHT = 39;     // Codes //
DOWN = 40;
ESC = 27;
ENT = 13;
function keyUp(e)
{
    console.log(e.keyCode);
    e.preventDefault();
    flag = false;
    switch (e.keyCode)
    {
        case UP:
            //console.log(frog.position.z + '+ ' + frog.position.x);
            //audio.play();
            if(frog.position.z != 5){
                if(!treeCollision("UP")){
                    audio.play();
                    frog.position.z += 1;
                    if(frog.position.z == 5){
                        audio2.play();
                    }
                }
            }
            break;
        case DOWN:
            if(frog.position.z != -5 && !treeCollision("DOWN")){
                frog.position.z -= 1;
                audio.play();
            }
            break;
        case LEFT:
            if(frog.position.x != 7 && !treeCollision("LEFT"))
                frog.position.x += 0.5;
            break;
        case RIGHT:
            if(frog.position.x != -7 && !treeCollision("RIGHT"))
                frog.position.x -= 0.5;
            break;
        case ENT:
            score = 0;
            frog.position.set(0, -0.5, -5);
            break;
        case ESC:
            background.pause();
    }


}

init();

function init(){

    //scene setup
    scene = new THREE.Scene();
    width = window.innerWidth/16;
    height = window.innerHeight/16;

    //renderer setup
    renderer = new THREE.WebGLRenderer({
        alpha: true, antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;
    div.appendChild(renderer.domElement);


    //setting up camera
    camera = new THREE.OrthographicCamera(-width,width,height,-height, -30, 30);
    camera.position.set(0, 2.8, -2.9); // Change -1 to 0
    camera.zoom = 9;                    // for birds eye view
    camera.updateProjectionMatrix();

    //if window resize
    window.addEventListener('resize', function() {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });


    ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambLight.castShadow = true;
    scene.add(ambLight);

    light = new THREE.PointLight(0xffffff);
    light.position.set(-8, 2.8, -10);
    light.castShadow = true;
    scene.add(light);


    //orbital controls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    setUpEnvironment();

}


function setUpEnvironment() {

    //frog
    var loader = new THREE.JSONLoader();
    loader.load( "models/frog.json", function(geometry){
        var material = new THREE.MeshLambertMaterial({color: 0x1ae04c});
        frog = new THREE.Mesh(geometry, material);
        frog.scale.x = frog.scale.z = 0.005;
        frog.scale.y = 0.0024;
        frog.position.y = -0.5;
        frog.position.z = -5;
        frog.castShadow = true;
        frog.receiveShadow = true;
        scene.add(frog);

    });

    //frog stand brick
    var frogStandGrassGeometry = new THREE.PlaneGeometry(14,1);
    var sideWalkTexture = new THREE.ImageUtils.loadTexture("textures/sidewalk.jpg");
    sideWalkTexture.wrapS = THREE.RepeatWrapping;
    sideWalkTexture.wrapT = THREE.RepeatWrapping;
    sideWalkTexture.repeat.set(8,1);
    var frogStandGrassMaterial = new THREE.MeshLambertMaterial({map: sideWalkTexture, side: THREE.DoubleSide});
    var frogStandGrass = new THREE.Mesh(frogStandGrassGeometry, frogStandGrassMaterial);
    frogStandGrass.rotation.x = 270 * Math.PI/180;
    frogStandGrass.position.y = -1;
    frogStandGrass.position.z = -5;
    frogStandGrass.receiveShadow = true;
    scene.add(frogStandGrass);

    //road
    var roadGeometry = new THREE.PlaneGeometry(14,4);
    var roadTexture = new THREE.ImageUtils.loadTexture("textures/road.jpg");
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    var roadMaterial = new THREE.MeshLambertMaterial({map: roadTexture, side: THREE.DoubleSide});
    var road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = 270 * Math.PI/180;
    road.position.y = -1;
    road.position.z = -2.5;
    road.receiveShadow = true;
    scene.add(road);

    //grass
    var grassGeometry = new THREE.PlaneGeometry(14,1);
    var grassTexture = new THREE.ImageUtils.loadTexture("textures/grass.jpg");
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(8,1);
    var grassMaterial = new THREE.MeshLambertMaterial({map: grassTexture, side: THREE.DoubleSide});
    var grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = 270 * Math.PI/180;
    grass.position.y = -1;
    grass.position.z = 0;
    grass.receiveShadow = true;
    scene.add(grass);

    //water
    var waterGeom = new THREE.PlaneGeometry(14,4);
    var waterTexture = new THREE.ImageUtils.loadTexture("textures/water5.jpg");
    var waterMaterial = new THREE.MeshLambertMaterial({map: waterTexture, side: THREE.DoubleSide});
    var water = new THREE.Mesh(waterGeom, waterMaterial);
    water.rotation.x = 270 * Math.PI/180;
    water.position.y = -1;
    water.position.z = 2.5;
    water.receiveShadow = true;
    scene.add(water);

    //frog end brick
    var frogStandGrassEnd = new THREE.Mesh(frogStandGrassGeometry, frogStandGrassMaterial);
    frogStandGrassEnd.rotation.x = 270 * Math.PI/180;
    frogStandGrassEnd.position.y = -1;
    frogStandGrassEnd.position.z = 5;
    frogStandGrassEnd.receiveShadow = true;
    scene.add(frogStandGrassEnd);

    //set up trees, logs, cars
    setUpTrees();
    setUpLogs();
    setUpCars();

    //render();
}

function setUpTrees() {
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('models/Tree.mtl', function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('models/Tree.obj', function (object) {

            object.position.y = -0.5;
            object.position.z = -0.75;
            object.position.x = -2;
            object.scale.x = object.scale.y = object.scale.z = 0.018;

            object.traverse( function ( child ) {

                if ( child instanceof THREE.Mesh ) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }

            } );

            scene.add(object);
            render();

        });
    });

}

function setUpLogs()
{
    //third row
    var geometry = new THREE.CylinderGeometry( 5, 5, 30, 32 );
    var logTexture = new THREE.ImageUtils.loadTexture("textures/log.jpg");
    var material = new THREE.MeshLambertMaterial( {map: logTexture} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.scale.x = cylinder.scale.z = 0.0625;
    cylinder.scale.y = 0.050;
    cylinder.position.y = -1.15;
    cylinder.position.z = 3;
    cylinder.rotation.x = Math.PI / 2;
    cylinder.rotation.z = Math.PI / 2;
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    //logs.push(cylinder);
    scene.add(cylinder);


    row3cy2 = cylinder.clone();
    row3cy2.position.x = 4;
    //logs.push(row3cy2);
    scene.add(row3cy2);

    row3cy3 = cylinder.clone();
    row3cy3.position.x = -4;
    //logs.push(row3cy3);
    scene.add(row3cy3);

    //first row
    row1cy1 = cylinder.clone();
    row1cy1.position.x = 5.5;
    row1cy1.position.z = 1;
    //logs.push(row1cy1);
    scene.add(row1cy1);

    row1cy2 = row1cy1.clone();
    row1cy2.position.x = 2;
    //logs.push(row1cy2);
    scene.add(row1cy2);

    row1cy3 = row1cy1.clone();
    row1cy3.position.x = -1.5;
    //logs.push(row1cy3);
    scene.add(row1cy3);

    //second row
    row2cy1 = cylinder.clone();
    row2cy1.position.z = 2;
    row2cy1.position.x = -3;
    //logs.push(row2cy1);
    scene.add(row2cy1);

    row2cy2 = row2cy1.clone();
    row2cy2.position.x = 3;
    //logs.push(row2cy2);
    scene.add(row2cy2);

    //fourth row
    row4cy1 = row2cy1.clone();
    row4cy1.position.z = 4;
    row4cy1.position.x = 1.5;
    //logs.push(row4cy1);
    scene.add(row4cy1);

    logs.push(row1cy1);
    logs.push(row1cy2);
    logs.push(row1cy3);

    logs.push(row2cy1);
    logs.push(row2cy2);

    logs.push(cylinder);
    logs.push(row3cy2);
    logs.push(row3cy3);

    logs.push(row4cy1);

}

function setUpCars(){

    var geometry = new THREE.BoxGeometry( .5, .5, 1 );
    var material = [
        new THREE.MeshLambertMaterial( {color: 0x0d72dd} ),
        new THREE.MeshLambertMaterial( {color: 0xf29b10} ),
        new THREE.MeshLambertMaterial( {color: 0x18b23f} ),
        new THREE.MeshLambertMaterial( {color: 0xb21818} )
    ];

    for(var i = 0; i < carPosition.length; i++){

        var cube = new THREE.Mesh(geometry, material[i%4]);
        cube.rotation.y = Math.PI/2;
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(carPosition[i][0], carPosition[i][1], carPosition[i][2] + offSet);
        cars.push(cube);
        scene.add(cube);
    }

}


function treeCollision(x) {

    if(x == "UP"){
        if(frog.position.x == -2 && frog.position.z == -1){
            console.log("up");
            return true;
        }
    }
    else if(x == "DOWN"){
        if(frog.position.x == -2 && frog.position.z == 1){
            console.log("down");
            return true;
        }

    }
    else if(x == "LEFT"){
        if(frog.position.x == -2.5 && frog.position.z == 0){
            console.log("left");
            return true;
        }

    }
    else if(x == "RIGHT"){
        if(frog.position.x == -1.5 && frog.position.z == 0){
            console.log("right");
            return true;
        }

    }
    else{
        return false;
    }
}



function animateLogs() {

    //first row
    for( var i = 0; i < 3; i++ ){
        if(logs[i].position.x >= 7.5)
            logs[i].position.x = -7.5;
        logs[i].position.x += logSpeed[0];
    }

    //second
    for( var i = 3; i < 5; i++ ){
        if(logs[i].position.x <= -7.5)
            logs[i].position.x = 7.5;
        logs[i].position.x += logSpeed[1];
    }

    //third
    for( var i = 5; i < 8; i++ ){
        if(logs[i].position.x >= 7.5)
            logs[i].position.x = -7.5;
        logs[i].position.x += logSpeed[2];
    }

    //fourth
    for( var i = 8; i < 9; i++ ){
        if(logs[i].position.x <= -7.5)
            logs[i].position.x = 7.5;
        logs[i].position.x += logSpeed[3];
    }

}

function carCollisionDetect() {

    for(var i = 0; i < cars.length; i++){
        if(frog.position.z  == Math.round((cars[i].position.z - offSet))){
            if(frog.position.x - 0.3 < cars[i].position.x + 0.25 && frog.position.x + 0.3 > cars[i].position.x - 0.25){
                splat.play();
                score = 0;
                frog.position.set(0, -0.5, -5);
                console.log("collide");
            }
        }
    }

}


function moveWithLogs() {

    var flag2 = false;
    for (var i = 0; i < logs.length; i++) {
        if (frog.position.z == logs[i].position.z) {
            flag2 = true;
            if (frog.position.x - 0.1 < logs[i].position.x + 0.75 && frog.position.x + 0.1 > logs[i].position.x - 0.75)
            {

                flag = true;
                logZ = logs[i].position.z;
                return;
            }
        }
    }
    if (flag2){
        waterSplash.play();
        score = 0;
        frog.position.set(0, -0.5, -5);
        flag = false;
    }

}



function animateCars() {
    for(var i =0; i <cars.length;i++){
        if( i >= 0 && i <=2){
            if(cars[i].position.x <= -7.5)
                cars[i].position.x = 7.5;
            cars[i].position.x -= 0.05;
        }
        else if(i >= 3 && i <=6){
            if(cars[i].position.x >= 7.5)
                cars[i].position.x = -7.5;
            cars[i].position.x += 0.07;

        }
        else if(i >= 7 && i <=9){
            if(cars[i].position.x >= 7.5)
                cars[i].position.x = -7.5;
            cars[i].position.x += 0.03;

        }
        else if(i >= 10 && i <=13){
            if(cars[i].position.x <= -7.5)
                cars[i].position.x = 7.5;
            cars[i].position.x -= 0.04;

        }
    }
}


function render() {

    requestAnimationFrame(render);
    
    animateCars();
    animateLogs();
    carCollisionDetect();
    moveWithLogs();
    if (flag) {
        frog.position.x += logSpeed[logZ - 1];
    }
    //offset frog position
    currentPos = frog.position.z + 5;
    if (score < currentPos)
    {
        score = currentPos;
    }
    if(frog.position.z == 5){
        scoreDiv.innerHTML = "Victory!";
    }
    else{
        scoreDiv.innerHTML = score;

    }

    renderer.render(scene, camera);

}
