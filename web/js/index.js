var socket = io();

var acc_flag = false;

var cooldown_interval = 500;
var cooldown = true;

var higher_threshold = 75.0;
var lower_threshold = 10.0;

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
    }else{
        $('#shakeImage').css('display', 'none');
        $('.slidecontainer').css('display', 'block');
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
        // var data = Math.sqrt(raw_data.x * raw_data.x + raw_data.y * raw_data.y + raw_data.z * raw_data.z);
        // console.log(data);
        // if(data > higher_threshold){
        //     data = higher_threshold;
        // }
        // else if(data < lower_threshold){
        //     data = lower_threshold;
        // }
        cooldown = false;
        setTimeout(clear_cooldown, cooldown_interval);

        socket.emit("Acceleration", [raw_data.x, raw_data.y, raw_data.z]);
    }
}

function showVal(index, newVal){
    $('#'+index+'_o').text(index + ": " + newVal);
    socket.emit("poll", index, newVal);
  }

$(document).ready(function(){
    get_sensor_data();

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
