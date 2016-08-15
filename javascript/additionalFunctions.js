/**
 * Created by Dmitry Khramov on 14.06.2016.
 */

// Default routing mode
var selectedMode = 'WALK';

$(document).ready(function () {
    console.log($(window).height());
    console.log($(document).height());
    console.log($(document).width());
    console.log($(document).width());
    // Setting up datePicker plugin
    $("#dateId").datepicker({
        changeMonth: true,
        changeYear: true
    });
    // Setting up timrPicker plugin
    $('#timeId').timepicker({
        timeFormat: 'HH:mm',
        defaultTime: 'now',
        dynamic: true
    });

    // If NOW mode selected, changing date/time disabled
    $("#depID, #arrID").click(function() {
        $("#dateId, #timeId").prop("disabled", false);
    });
    $("#nowID").click(function() {
        $("#dateId, #timeId").prop("disabled", true);
    });

    $(".time-options").buttonset();

    // Displaying time settings for bus/park&ride mode
    $('#bus, #park-and-ride').click(function() {
        $(".walkDistance, .walkSpeed, .bikeSpeed, .carbonDioxide").hide('fast');
        $(".now-later").insertAfter(".leaflet-routing-geocoders").show('slow');
        // Setting current date
        $("#dateId").datepicker('setDate', "11/11/2015");


    });

    // Time settings disappear if other modes selected
    $("#walk, #bicycle, #car" ).click(function(){
        $(".now-later, .walkDistance, .walkSpeed, .bikeSpeed, .carbonDioxide").hide('fast');
    });

    //***************WALK MODE***************
    // If some mode is clicked var selectedMode changes to the appopriate
    // value and calling the route function
    $("#walk").click(function () {
        selectedMode = "WALK";
        route.route();
        // changing the color(background img) of the clicked button to gray
        // if button is not clicked - it's white
        $(this).addClass("walkIconClicked").removeClass("walkIcon");
        $("#bicycle").addClass("bikeIcon").removeClass("bikeIconClicked");
        $("#car").addClass("carIcon").removeClass("carIconClicked");
        $("#bus").addClass("busIcon").removeClass("busIconClicked");
        $("#park-and-ride").addClass("parkRideIcon").removeClass("parkRideIconClicked");
        $("#settings").addClass("settingsIcon").removeClass("settingsIconClicked");
    });
    // displaying tips above the mode icons on hover
    $("#walk").hover(function () {
        var offset = $("#walk").offset();
        $("#tipMode").find("p").text("Walk");
        $("#tipMode").css({
            top: offset.top -30,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});

    });

    //***************BICYCLE MODE***************
    $("#bicycle").click(function () {
        selectedMode = "BICYCLE";
        route.route();

        $(this).addClass("bikeIconClicked").removeClass("bikeIcon");
        $("#walk").addClass("walkIcon").removeClass("walkIconClicked");
        $("#car").addClass("carIcon").removeClass("carIconClicked");
        $("#bus").addClass("busIcon").removeClass("busIconClicked");
        $("#park-and-ride").addClass("parkRideIcon").removeClass("parkRideIconClicked");
        $("#settings").addClass("settingsIcon").removeClass("settingsIconClicked");
    });

    $("#bicycle").hover(function () {
        var offset = $("#bicycle").offset();
        $("#tipMode").find("p").text("Bicycle");
        $("#tipMode").css({
            top: offset.top -30,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});

    });

    //***************CAR MODE***************
    $("#car").click(function () {
        selectedMode = "CAR";
        route.route();

        $(this).addClass("carIconClicked").removeClass("carIcon");
        $("#walk").addClass("walkIcon").removeClass("walkIconClicked");
        $("#bicycle").addClass("bikeIcon").removeClass("bikeIconClicked");
        $("#bus").addClass("busIcon").removeClass("busIconClicked");
        $("#park-and-ride").addClass("parkRideIcon").removeClass("parkRideIconClicked");
        $("#settings").addClass("settingsIcon").removeClass("settingsIconClicked");
    });

    $("#car").hover(function () {
        var offset = $("#car").offset();
        $("#tipMode").find("p").text("Car");
        $("#tipMode").css({
            top: offset.top -20,
            left: offset.left +17,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});

    });

    //***************BUS MODE***************
    $("#bus").click(function () {
        selectedMode = "BUSISH%2CWALK";
        route.route();

        $(this).addClass("busIconClicked").removeClass("busIcon");
        $("#walk").addClass("walkIcon").removeClass("walkIconClicked");
        $("#bicycle").addClass("bikeIcon").removeClass("bikeIconClicked");
        $("#car").addClass("carIcon").removeClass("carIconClicked");
        $("#park-and-ride").addClass("parkRideIcon").removeClass("parkRideIconClicked");
        $("#settings").addClass("settingsIcon").removeClass("settingsIconClicked");
    });

    $("#bus").hover(function () {
        var offset = $("#bus").offset();
        $("#tipMode").find("p").text("Bus");
        $("#tipMode").css({
            top: offset.top -35,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});

    });

    //***************PARK&RIDE MODE***************
    $("#park-and-ride").click(function () {
        selectedMode = "CAR_PARK%2CWALK%2CTRANSIT";
        route.route();

        $(this).addClass("parkRideIconClicked").removeClass("parkRideIcon");
        $("#walk").addClass("walkIcon").removeClass("walkIconClicked");
        $("#bicycle").addClass("bikeIcon").removeClass("bikeIconClicked");
        $("#car").addClass("carIcon").removeClass("carIconClicked");
        $("#bus").addClass("busIcon").removeClass("busIconClicked");
        $("#settings").addClass("settingsIcon").removeClass("settingsIconClicked");
    });

    $("#park-and-ride").hover(function () {
        var offset = $("#park-and-ride").offset();
        $("#tipMode").find("p").text("Car&Bus");
        $("#tipMode").css({
            top: offset.top -35,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});

    });

    //***************SETTINGS***************
    $("#settings").click(function () {
        // Changing color of the icon
        if ($(this).hasClass("settingsIcon")){
            $(this).addClass("settingsIconClicked").removeClass("settingsIcon");
        }
        else
            $(this).addClass("settingsIcon").removeClass("settingsIconClicked");

        //Displaying/hiding the settings for the current routing mode
        switch (selectedMode) {
            case 'CAR':
                if ($(".carbonDioxide").is(':hidden'))
                    $(".carbonDioxide").insertAfter(".leaflet-routing-geocoders").show('slow');
                else
                    $(".carbonDioxide").hide('fast');
                break;

            case 'WALK':
                if ($(".walkSpeed").is(':hidden'))
                    $(".walkSpeed").insertAfter(".leaflet-routing-geocoders").show('slow');
                else
                    $(".walkSpeed").hide('fast');
                break;

            case 'BICYCLE':
                if ($(".bikeSpeed").is(':hidden'))
                    $(".bikeSpeed").insertAfter(".leaflet-routing-geocoders").show('slow');
                else
                    $(".bikeSpeed").hide('fast');
                break;

            case 'BUSISH%2CWALK':
                if ($(".now-later, .walkSpeed, .walkDistance").is(':hidden'))
                    $(".now-later, .walkSpeed, .walkDistance").insertAfter(".leaflet-routing-geocoders").show('slow');
                else
                    $(".now-later, .walkSpeed, .walkDistance").hide('fast');
                break;
            case 'CAR_PARK%2CWALK%2CTRANSIT':
                if ($(".now-later, .carbonDioxide").is(':hidden'))
                    $(".now-later, .carbonDioxide").insertAfter(".leaflet-routing-geocoders").show('slow');
                else
                    $(".now-later, .carbonDioxide").hide('fast');
                break;
        }
    });

    $("#settings").hover(function () {
        var offset = $("#settings").offset();
        $("#tipMode").find("p").text("Settings");
        $("#tipMode").css({
            top: offset.top -30,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});

    });
});


/**
 * This function called from LRM
 * Depending on the current mode it
 * @returns {String} the path to the mode image
 */
function iconBySelectedMode() {
    if (selectedMode === "WALK")
        return "'css/images/Walk-gray.png'";
    else if (selectedMode === "CAR")
        return "'css/images/Car-gray.png'";
    else if (selectedMode === "BICYCLE")
        return "'css/images/Biking-gray.png'";
    else if (selectedMode === "BUSISH%2CWALK")
        return "'css/images/Bus-gray.png'";
    else if (selectedMode === "CAR_PARK%2CWALK%2CTRANSIT")
        return "'css/images/PPlusBus-gray.png'";
}


/**
 * Calculates CO2 emission depending on the distance and inputs
 * of emission provided by the user (gasoline-2325g/L, diesel-2660g/L)
 * @param carDistance
 * @param busDistance
 * @returns {number} CO2 emission
 * @constructor
 */
function CO2calculation(carDistance, busDistance) {
    var totalCO2;
    var carDistanceKm = Math.round(carDistance) / 1000;
    var busDistanceKm = Math.round(busDistance) / 1000;

    // Average CO2 emission by bus per km
    var busCO2_per_km = 65;
    var busEmission = busDistanceKm * busCO2_per_km;

    // Getting inputs from the user: co2/km or fuel consumption and fuel type
    var co2_per_km = $('#emissionInput').val();
    var fuelConsumption = $('#consumptionInput').val();
    var fuelType = $('#fuelTypeInput').val();

    // CO2 for walk and bicycle = 0
    if (selectedMode == 'WALK' || selectedMode == 'BICYCLE')
        totalCO2 = 0;
    else {
        // If car is electric, co2/km = 43g.
        if($('#fuelTypeInput').val() == 0) {
            totalCO2 = 43 * carDistanceKm + busEmission;
        }
        else if (co2_per_km != "")
            totalCO2 = co2_per_km * carDistanceKm + busEmission;
        else if (fuelConsumption != "" && fuelType != "")
            totalCO2 = fuelConsumption / 100 * fuelType * carDistanceKm + busEmission;
        else
            // Default CO2 emission/km = 130g.
            totalCO2 = 130 * carDistanceKm + busEmission;
    }
    totalCO2 = Math.round(totalCO2);
    return totalCO2;
}


/**
 * Depending on the emission the appopriate number of
 * trees needed to offset the emission will be shown
 * (offset 60g CO2 per tree per day)
 * @param emission
 * @returns {String} path to the trees image
 * @constructor
 */
function OffsetByTree(emission) {
    var trees = Math.round(emission / 60);
    switch (trees) {
        case 0:
            return '"css/images/smile.png"';
            break;
        case 1:
            return '"css/images/1tree.png"';
            break;
        case 2:
            return '"css/images/2trees.png"';
            break;
        case 3:
            return '"css/images/3trees.png"';
            break;
        case 4:
            return '"css/images/4trees.png"';
            break;
        case 5:
            return '"css/images/5trees.png"';
            break;
        case 6:
            return '"css/images/6trees.png"';
            break;
        case 7:
            return '"css/images/7trees.png"';
            break;
        case 8:
            return '"css/images/8trees.png"';
            break;
        case 9:
            return '"css/images/9trees.png"';
            break;
        case 10:
            return '"css/images/10trees.png"';
            break;
        default:
            return '"css/images/10trees.png"';
    }
}
















