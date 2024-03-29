var socket = io();

var Amplitude = 0.1,
    Vibration = 0.005,
    Rotation = 0.001,
    Shape = 9;

// var Red = 217,
//     Green = 143,
//     Blue = 221;
    
var RGB = [[217, 143, 221],// light purple
        [112, 41, 106],// purple
        [153, 141, 0],// earth color
        [227, 123, 0],// orange
        [255, 255, 102],// yellow
        [155, 51, 0],// red
        [0, 0, 255],// blue
        [53, 172, 196],// light blue
        [0, 102, 0],// green
        [0, 255,0],// light green
        [255, 255, 255]// white
    ],
    RGB_index = 0;

var acc_flag = false;
var cooldown_interval = 500;
var cooldown = true;

var higher_threshold = 75.0;
var lower_threshold = 10.0;
var color_threshold = 35.0;
var shape_threshold = 50.0;

function deviceMotionHandler(event){
    if(acc_flag){
        sendAccData(event['accelerationIncludingGravity']);
    }
}

function get_sensor_data(){
    cooldown = true;
    acc_flag = true;
}

function chnegeUI(){
    if(acc_flag){
        if (typeof DeviceMotionEvent.requestPermission === 'function'){
            DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted'){
                    window.addEventListener('devicemotion', deviceMotionHandler, false);
                }
            })
            .catch(console.error);
        }
        $('#shakeImage').css('display', 'block');
        $('.slidecontainer').css('display', 'none');
        console.log("Shake Mode");
    }else{
        $('#shakeImage').css('display', 'none');
        $('.slidecontainer').css('display', 'block');
        console.log("Slide Mode");
    }
}

// function stop_sensor_data(){
//     acc_flag = false;
//     console.log("successfully removeEventListener");
// }

function clear_cooldown(){
    cooldown = true;
}

function sendAccData(raw_data){
    if(cooldown){
        //console.log(raw_data.x, raw_data.y, raw_data.z);
        var data = Math.sqrt(raw_data.x * raw_data.x + raw_data.y * raw_data.y + raw_data.z * raw_data.z);
        // console.log(data);
        if(data > higher_threshold){
            data = higher_threshold;
        }else if(data > shape_threshold){
            Shape = (Shape + 1) % 11;
            socket.emit("Shape", Shape);
        }else if(data > color_threshold){
            RGB_index = (RGB_index + 1) % RGB.length;
            socket.emit("Color", [RGB[RGB_index][0], RGB[RGB_index][1], RGB[RGB_index][2]], RGB_index);
        }else if(data < lower_threshold){
            data = lower_threshold;
        }
        data = Math.round((((data - 10.0) * 10000.0) / 65.0))/1000;
        Amplitude = data;
        Vibration = data;

        if(raw_data.z > 0){
            Rotation = 0.01;
        }else{
            Rotation = -0.01;
        }

        cooldown = false;
        setTimeout(clear_cooldown, cooldown_interval);

        //socket.emit("Acceleration", [raw_data.x, raw_data.y, raw_data.z]);
        socket.emit("Amplitude", Amplitude);
        socket.emit("Vibration", Vibration);
        socket.emit("Rotation", Rotation);
    }
}

function showVal(index, newVal){
    //$('#'+index+'_o').text(index + ": " + newVal);
    //socket.emit("poll", index, newVal);
    socket.emit(index, newVal);
  }

$(document).ready(function(){
    socket.emit("Amplitude");
    socket.emit("Vibration");
    socket.emit("Rotation");
    socket.emit("Shape");
    socket.emit("Color");

    socket.on("Amplitude", (msg) => {
        Amplitude = msg;
        console.log("Amplitude: ", Amplitude);
        $("#Amplitude_o").text("Amplitude: " + Amplitude);
        $("#Amplitude").attr("value", Amplitude);
    });
    socket.on("Vibration", (msg) => {
        Vibration = msg;
        console.log("Vibration: ", Vibration);
        $("#Vibration_o").text("Vibration: " + Vibration);
        $("#Vibration").attr("value", Vibration);
    });
    socket.on("Rotation", (msg) => {
        Rotation = msg;
        console.log("Rotation: ", Rotation);
        $("#Rotation_o").text("Rotation: " + Rotation);
        $("#Rotation").attr("value", Rotation);
    });
    socket.on("Shape", (msg) => {
        Shape = msg;
        console.log("Shape: ", Shape);
        $("#Shape_o").text("Shape: " + Shape);
        $("#Shape").attr("value", Shape);
    });
    socket.on("Color", (msg) => {
        RGB_index = msg;
        console.log("Color: ", RGB[RGB_index]);
    });

    $('#shakeBtn').on('click', function(){
        if (typeof DeviceMotionEvent.requestPermission === 'function'){
            DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted'){
                    window.addEventListener('devicemotion', deviceMotionHandler, false);
                }
            })
            .catch(console.error);
        }
        $('#prompt').css('display', 'none');
        $('#mode_options').css('display', 'none');
        $('#shakeImage').css('display', 'block');
        $('#modeBtn').css('display', 'inline');
        get_sensor_data();
        console.log("Shake Mode");
    });

    $('#slideBtn').on('click', function(){
        $('#prompt').css('display', 'none');
        $('#mode_options').css('display', 'none');
        $('.slidecontainer').css('display', 'block');
        $('#modeBtn').css('display', 'inline');
        console.log("Slide Mode");
    });

    $('#modeBtn').on('click', function(){
        acc_flag = !acc_flag;
        chnegeUI();
    });

    // $("#shape").on("input change", function(){
    //     console.log($('#shape').val());
    // });

    // add for Acceleration
    window.addEventListener('devicemotion', deviceMotionHandler, false);
})
