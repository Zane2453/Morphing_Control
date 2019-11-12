var socket = io();

var Amplitude = 0.1,
    Vibration = 0.005,
    Rotation = 0.001,
    Shape = 9;

var acc_flag = false;
var cooldown_interval = 500;
var cooldown = true;

var higher_threshold = 75.0;
var lower_threshold = 10.0;
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
        }else if(data < lower_threshold){
            data = lower_threshold;
        }
        data = ((data - 10.0) * 10.0) / 65.0;
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
        socket.emit("Rotation", Rotation)
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

    $('#shakeBtn').on('click', function(){
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
