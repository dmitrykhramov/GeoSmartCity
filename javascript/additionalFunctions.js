/**
 * Created by Dmitry Khramov on 14.06.2016.
 */

// Default routing mode
var selectedMode = 'WALK';

var screenWidth = $(window).width();

$(document).ready(function () {
    // Setting up datePicker plugin
    $("#dateId").datepicker({
        changeMonth: true,
        changeYear: true
    });

    // Setting up timrPicker plugin
    $('#timeId').timepicker({
        timeFormat: 'HH:mm',
        defaultTime: 'now',
        dynamic: true,
        change: function (time) {
            var $this = $(this),
                val   = $this.val(),
                prev  = $this.data("prevValue");
            if (val !== prev) {
                try {
                    route.route();
                }
                catch (e) {
                    // do nothing
                }
                $this.data("prevValue", val);
            }
        }
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
        $(".applyDiv").insertAfter(".now-later").show('slow');
        // Setting current date
        if ($(".time-options").find("input[value='Now']").prop("checked")) {
            $("#dateId").datepicker('setDate', new Date());
        }

    });

    $('#dateId').change(function(){
        var $this = $(this),
            val   = $this.val(),
            prev  = $this.data("prevValue");
        if (val !== prev) {
            try {
                route.route();
            }
            catch (e) {

            }
            $this.data("prevValue", val);
        }
    });


    // Time settings disappear if other modes selected
    $("#walk, #bicycle, #car" ).click(function(){
        $(".now-later, .walkDistance, .walkSpeed, .bikeSpeed, .carbonDioxide, .applyDiv").hide('fast');
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
        $("#tipWalk").show();
        $("#tipMode").css({
            top: offset.top -30,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});
        $("#tipWalk").hide();

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
        $("#tipBike").show();
        $("#tipMode").css({
            top: offset.top -30,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});
        $("#tipBike").hide()

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
        $("#tipCar").show();
        $("#tipMode").css({
            top: offset.top -20,
            left: offset.left +17,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});
        $("#tipCar").hide();

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
        $("#tipBus").show();
        $("#tipMode").css({
            top: offset.top -35,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});
        $("#tipBus").hide();

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
        $("#tipPR").show();
        $("#tipMode").css({
            top: offset.top -35,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});
        $("#tipPR").hide();

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
                if ($(".carbonDioxide").is(':hidden')) {
                    $(".carbonDioxide").insertAfter(".leaflet-routing-geocoders").show('slow');
                    $(".applyDiv").insertAfter(".carbonDioxide").show('slow');
                }
                else
                    $(".carbonDioxide, .applyDiv").hide('fast');
                break;

            case 'WALK':
                if ($(".walkSpeed").is(':hidden')) {
                    $(".walkSpeed").insertAfter(".leaflet-routing-geocoders").show('slow');
                    $(".applyDiv").insertAfter(".walkSpeed").show('slow');
                }
                else
                    $(".walkSpeed, .applyDiv").hide('fast');
                break;

            case 'BICYCLE':
                if ($(".bikeSpeed").is(':hidden')) {
                    $(".bikeSpeed").insertAfter(".leaflet-routing-geocoders").show('slow');
                    $(".applyDiv").insertAfter(".bikeSpeed").show('slow');
                }
                else
                    $(".bikeSpeed, .applyDiv").hide('fast');
                break;

            case 'BUSISH%2CWALK':
                if ($(".now-later, .walkSpeed, .walkDistance").is(':hidden')) {
                    $(".now-later, .walkSpeed, .walkDistance").insertAfter(".leaflet-routing-geocoders").show('slow');
                    $(".applyDiv").insertAfter(".walkDistance").show('slow');
                }
                else
                    $(".now-later, .walkSpeed, .walkDistance, .applyDiv").hide('fast');
                break;
            case 'CAR_PARK%2CWALK%2CTRANSIT':
                if ($(".now-later, .carbonDioxide").is(':hidden')) {
                    $(".now-later, .carbonDioxide").insertAfter(".leaflet-routing-geocoders").show('slow');
                    $(".applyDiv").insertAfter(".carbonDioxide").show('slow');
                }
                else
                    $(".now-later, .carbonDioxide, .applyDiv").hide('fast');
                break;
        }
    });

    $("#settings").hover(function () {
        var offset = $("#settings").offset();
        $("#tipSettings").show();
        $("#tipMode").css({
            top: offset.top -30,
            left: offset.left +20,
            display: "block"
        });
        $("#tipMode").animate({opacity: 1.0}, 200);
    }, function () {
        $("#tipMode").animate({opacity: 0.0}, 200).css({display: "none"});
        $("#tipSettings").hide();

    });

    // Builds route after changing settings
    $(".applyBtn").click(function () {
       route.route();
    });

    // Showing/hiding languge buttons for mobile screen
    $(".langButton").click(function () {
        if ($("#myNavbar").is(":hidden")) {
            $("#myNavbar").show("fast");
            $("#langArrow").addClass("arrow-down").removeClass("arrow-up");
        }
        else {
            $("#myNavbar").hide("fast");
            $("#langArrow").addClass("arrow-up").removeClass("arrow-down");
        }
    });

    // Showing/hiding alternatives for mobile screen
    $(".hideAlternative").click(function () {
        if ($(".single-alternative").is(":visible")) {
            $(".single-alternative").hide("fast");
            $("#altArrow").addClass("arrow-down").removeClass("arrow-up");
        }
        else {
            $(".single-alternative").show("fast");
            if ($(".panel-group").is(":visible")) {
                $(".single-alternative.leaflet-routing-alt-minimized").hide();
            }
            $("#altArrow").addClass("arrow-up").removeClass("arrow-down");
        }
    });

    // Back to cgange the route (mobile screen)
    $(".changeRoute").click(function () {
        $(".single-alternative, #mobileButtons").hide("fast");
        $(".logo, .leaflet-routing-geocoders").show("fast");
        if(selectedMode == 'BUSISH%2CWALK' || selectedMode == 'CAR_PARK%2CWALK%2CTRANSIT') {
            $(".now-later, .applyDiv").show("fast");
        }
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
















